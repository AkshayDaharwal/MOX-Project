import React, { useMemo, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "../../Service/adminApi";
import { toast } from "react-toastify";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table";

const DailyRoiIncome = () => {
  const [searchInput, setSearchInput] = useState("");
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);

  const { data: roiDistributions = [], isLoading, isError, error } = useQuery({
    queryKey: ["perDayIncome"],
    queryFn: async () => {
      const res = await adminApi.getPerDayIncomeReport();
      const distributionData = res?.data?.roiDistributions;
      if (!Array.isArray(distributionData)) {
        throw new Error("Invalid response: roiDistributions array not found");
      }
      return distributionData;
    },
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });

  // Set up TanStack Table
  const table = useReactTable({
    data: roiDistributions,
    columns: useMemo(
      () => [
        {
          accessorKey: "sno",
          header: "S.No.",
          cell: ({ row }) => row.index + 1,
        },
        {
          accessorKey: "userId.username",
          header: "Username",
          cell: ({ getValue }) => getValue() || "",
        },
        {
          accessorKey: "userId.email",
          header: "Email",
          cell: ({ getValue }) => getValue() || "",
        },
        {
          accessorKey: "distributionDate",
          header: "Date",
          cell: ({ getValue }) =>
            getValue() ? new Date(getValue()).toLocaleString("en-IN", {
                  timeZone: "Asia/Kolkata",
                }) : "N/A",
        },
        {
          accessorKey: "stakeId",
          header: "Package ID",
          cell: ({ getValue }) => getValue() || "",
        },
        {
          accessorKey: "stakeAmount",
          header: "Amount (USD)",
          cell: ({ getValue }) => `$${Number(getValue() || 0).toFixed(2)}`,
        },
        {
          accessorKey: "dailyROI",
          header: "ROI (%)",
          cell: ({ getValue }) => `${Number(getValue() || 0).toFixed(2)}%`,
        },
        {
          accessorKey: "amount",
          header: "ROI Amount (USD)",
          cell: ({ getValue }) => `$${Number(getValue() || 0).toFixed(2)}`,
        },
        {
          accessorKey: "userId.roiEnabled",
          header: "Status",
          cell: ({ getValue }) => {
            const value = getValue() || false;
            return (
              <div className={value ? "text-green-500" : "text-orange-500"}>
                {value ? "Enabled" : "Disabled"}
              </div>
            );
          },
        },
      ],
      []
    ),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: { globalFilter: searchInput },
    onGlobalFilterChange: setSearchInput,
    globalFilterFn: (row, columnId, filterValue) => {
      const value = row.getValue(columnId);
      return value
        ? String(value).toLowerCase().includes(filterValue.toLowerCase())
        : false;
    },
    initialState: { pagination: { pageSize: 10 } },
  });

  // Export PDF (full filtered dataset)
  const handleExportPDF = async () => {
    setIsExportingPDF(true);

    setTimeout(async () => {
      if (roiDistributions.length === 0) {
        toast.error("No data to export", { position: "top-right" });
        setIsExportingPDF(false);
        return;
      }
      try {
        const doc = new jsPDF({ orientation: "portrait", unit: "pt" });
        doc.setFontSize(12);
        doc.text("Daily ROI Income Report", 14, 10);

        const chunkSize = 1000;
        const columns = table.getAllColumns().map((col) => col.columnDef.header);
        for (let i = 0; i < roiDistributions.length; i += chunkSize) {
          const chunk = roiDistributions.slice(i, i + chunkSize);
          const tableRows = chunk.map((item, index) =>
            columns.map((col) => {
              const value = table.getCoreRowModel().rows[i + index].getValue(col.id);
              return String(value || "N/A");
            })
          );
          autoTable(doc, {
            head: i === 0 ? [columns] : undefined,
            body: tableRows,
            startY: i === 0 ? 20 : doc.lastAutoTable.finalY,
            styles: { fontSize: 8, cellPadding: 2, overflow: "linebreak" },
            headStyles: { fillColor: [16, 57, 68], textColor: [255, 255, 255] },
          });
        }
        doc.save("daily-roi-income-full.pdf");
      } catch (err) {
        toast.error("Failed to export PDF", { position: "top-right" });
        console.error("PDF Export Error:", err);
      } finally {
        setIsExportingPDF(false);
      }
    }, 50); // Allows React to paint "Exporting..." first
  };

  // Export Excel (full filtered dataset)
  const handleExportExcel = () => {
    setIsExportingExcel(true);

    setTimeout(async () => {
      if (roiDistributions.length === 0) {
        toast.error("No data to export", { position: "top-right" });
        setIsExportingExcel(false);
        return;
      }
      try {
        const chunkSize = 1000;
        const worksheet = XLSX.utils.json_to_sheet([], { skipHeader: true });
        for (let i = 0; i < roiDistributions.length; i += chunkSize) {
          const chunk = roiDistributions.slice(i, i + chunkSize);
          const excelData = chunk.map((item, index) => {
            const row = { "S.No.": i + index + 1 };
            table.getAllColumns().forEach((col) => {
              if (col.id !== "sno") {
                row[col.columnDef.header] = table
                  .getCoreRowModel()
                  .rows[i + index].getValue(col.id);
              }
            });
            return row;
          });
          XLSX.utils.sheet_add_json(worksheet, excelData, {
            skipHeader: i !== 0,
            origin: i === 0 ? "A1" : -1,
          });
        }
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "DailyROIIncome");
        XLSX.writeFile(workbook, "daily-roi-income.xlsx", { compression: true });
      } catch (err) {
        toast.error("Failed to export Excel", { position: "top-right" });
        console.error("Excel Export Error:", err);
      } finally {
        setIsExportingExcel(false);
      }
    }, 50);
  };

  if (isLoading) {
    return (
      <div className="p-4 max-w-[1260px] mx-auto">
        <h2 className="text-2xl font-bold mb-4 text-[#103944]">
          Daily ROI Income
        </h2>
        <p className="text-gray-600">Loading Daily ROI Income...</p>
      </div>
    );
  }

  // if (isError) {
  //   return (
  //     <div className="p-4 max-w-[1260px] mx-auto">
  //       <h2 className="text-2xl font-bold mb-4 text-[#103944]">
  //         Daily ROI Income
  //       </h2>
  //       <p className="text-red-600">
  //         Error: {error?.message || "Failed to load Daily ROI Income data."}
  //       </p>
  //     </div>
  //   );
  // }

  return (
    <div className="p-4 flex-1 text-nowrap max-w-[1260px] mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-[#103944]">
        Daily ROI Income
      </h2>

      <div className="mb-4 flex flex-col md:flex-row items-center justify-between">
        <div className="flex gap-2 mb-4 md:mb-0">
          <button
            onClick={handleExportPDF}
            disabled={isExportingPDF}
            className={`bg-red-500 text-white px-4 py-2 rounded mr-2 text-sm ${
              isExportingPDF ? "opacity-50 cursor-not-allowed" : "hover:bg-red-600"
            }`}
          >
            {isExportingPDF ? "Exporting..." : "Export PDF"}
          </button>
          <button
            onClick={handleExportExcel}
            disabled={isExportingExcel}
            className={`bg-green-500 text-white px-4 py-2 rounded text-sm ${
              isExportingExcel ? "opacity-50 cursor-not-allowed" : "hover:bg-green-600"
            }`}
          >
            {isExportingExcel ? "Exporting..." : "Export Excel"}
          </button>
        </div>
        <div className="flex items-center w-full md:w-auto">
          <input
            placeholder="Search Daily ROI Income..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="border border-gray-300 rounded px-4 py-2 w-full max-w-xs focus:outline-none focus:ring-2 focus:ring-[#103944]"
            aria-label="Search Daily ROI Income records"
          />
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded shadow-md border border-gray-200 p-4">
        <table className="min-w-[100%] w-full text-sm border" role="grid">
          <thead className="bg-[#103944] text-white sticky top-0">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="p-2 border whitespace-nowrap min-w-[100px]"
                    scope="col"
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-gray-100" role="row">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="p-2 border whitespace-nowrap">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-end mt-4">
        <span className="text-sm text-gray-600 mr-4">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className={`bg-[#103944] text-white px-4 py-2 rounded ${
              !table.getCanPreviousPage()
                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                : "hover:bg-[#0e9d52]"
            }`}
            aria-label="Previous page"
          >
            Prev
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className={`bg-[#103944] text-white px-4 py-2 rounded ${
              !table.getCanNextPage()
                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                : "hover:bg-[#0e9d52]"
            }`}
            aria-label="Next page"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default DailyRoiIncome;