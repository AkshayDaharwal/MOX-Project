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

const ReferralIncome = () => {
  const [searchInput, setSearchInput] = useState("");
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);

  const { data: referrals = [], isLoading, isError, error } = useQuery({
    queryKey: ["referralIncome"],
    queryFn: async () => {
      const res = await adminApi.getReferralIncomeReport();
      const referralData = res?.data?.referrals;
      if (!Array.isArray(referralData)) {
        throw new Error("Invalid response: referrals array not found");
      }
      return referralData;
    },
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });

  // Set up TanStack Table
  const table = useReactTable({
    data: referrals,
    columns: useMemo(
      () => [
        {
          accessorKey: "sno",
          header: "S.No.",
          cell: ({ row }) => row.index + 1,
        },
        {
          accessorKey: "referredId.username",
          header: "Username",
          cell: ({ getValue }) => getValue() || "N/A",
        },
        {
          accessorKey: "referredId.email",
          header: "Email",
          cell: ({ getValue }) => getValue() || "N/A",
        },
        {
          accessorKey: "createdAt",
          header: "Date",
          cell: ({ getValue }) =>
            getValue() ? new Date(getValue()).toLocaleString("en-IN", {
                  timeZone: "Asia/Kolkata",
                }) : "N/A",
        },
        {
          accessorKey: "investmentAmount",
          header: "Deposit Amount (USD)",
          cell: ({ getValue }) => `$${Number(getValue() || 0).toFixed(2)}`,
        },
        {
          accessorKey: "earned",
          header: "Level Income (USD)",
          cell: ({ getValue }) => `$${Number(getValue() || 0).toFixed(2)}`,
        },
        {
          accessorKey: "level",
          header: "Level",
          cell: ({ getValue }) => getValue() || "N/A",
        },
        {
          accessorKey: "referredId.referralRewardClaimed",
          header: "Status",
          cell: ({ getValue }) => {
            const value = getValue() || false;
            return (
              <div className={value ? "text-green-500" : "text-orange-500"}>
                {value ? "Claimed" : "Unclaimed"}
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

  // Export PDF
  const handleExportPDF = () => {
    setIsExportingPDF(true);

    if (referrals.length === 0) {
      toast.error("No data to export", { position: "top-right" });
      setIsExportingPDF(false);
      return;
    }

    setTimeout(() => {
      try {
        const doc = new jsPDF("landscape");
        doc.setFontSize(16);
        doc.text("Referral Income Report", 14, 15);

        const columns = table.getAllColumns().map((col) => col.columnDef.header);
        const tableData = table
          .getPrePaginationRowModel()
          .rows.map((row) =>
            columns.map((col) => {
              const value = row.getValue(col.id);
              if (col.id.includes("createdAt")) {
                return value ? new Date(value).toLocaleString("en-IN", {
                  timeZone: "Asia/Kolkata",
                }) : "N/A";
              }
              return String(value || "N/A");
            })
          );

        autoTable(doc, {
          head: [columns],
          body: tableData,
          startY: 25,
          theme: "striped",
          headStyles: { fillColor: [16, 57, 68], textColor: [255, 255, 255] },
          styles: { fontSize: 8, cellPadding: 2 },
          margin: { top: 20 },
        });

        doc.save("referral_income.pdf");
        toast.success("PDF exported successfully", { position: "top-right" });
      } catch (err) {
        console.error("PDF Export Error:", err);
        toast.error("Failed to export PDF", { position: "top-right" });
      } finally {
        setIsExportingPDF(false);
      }
    }, 50);
  };

  // Export Excel
  const handleExportExcel = () => {
    setIsExportingExcel(true);

    if (referrals.length === 0) {
      toast.error("No data to export", { position: "top-right" });
      setIsExportingExcel(false);
      return;
    }

    setTimeout(() => {
      try {
        const excelData = table.getPrePaginationRowModel().rows.map((row) => {
          const rowData = {};
          table.getAllColumns().forEach((col) => {
            const value = row.getValue(col.id);
            if (col.id.includes("createdAt")) {
              rowData[col.columnDef.header] = value
                ? new Date(value).toLocaleString("en-IN", {
                  timeZone: "Asia/Kolkata",
                })
                : "N/A";
            } else {
              rowData[col.columnDef.header] = String(value || "N/A");
            }
          });
          return rowData;
        });

        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "ReferralIncome");
        XLSX.writeFile(workbook, "referral_income.xlsx");
        toast.success("Excel exported successfully", { position: "top-right" });
      } catch (err) {
        console.error("Excel Export Error:", err);
        toast.error("Failed to export Excel", { position: "top-right" });
      } finally {
        setIsExportingExcel(false);
      }
    }, 50);
  };

  if (isLoading) {
    return (
      <div className="p-4 max-w-[1260px] mx-auto">
        <h2 className="text-2xl font-bold mb-4 text-[#103944]">Referral Income</h2>
        <p className="text-gray-600">Loading referral income...</p>
      </div>
    );
  }

  // if (isError) {
  //   return (
  //     <div className="p-4 max-w-[1260px] mx-auto">
  //       <h2 className="text-2xl font-bold mb-4 text-[#103944]">Referral Income</h2>
  //       <p className="text-red-600">
  //         Error: {error?.message || "Failed to load referral income data."}
  //       </p>
  //     </div>
  //   );
  // }

  return (
    <div className="p-4 flex-1 text-nowrap max-w-[1260px] mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-[#103944]">Referral Income</h2>

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
            placeholder="Search referral income..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="border border-gray-300 rounded px-4 py-2 w-full max-w-xs focus:outline-none focus:ring-2 focus:ring-[#103944]"
            aria-label="Search referral income records"
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

export default ReferralIncome;