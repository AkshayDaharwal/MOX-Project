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

const SwapManagementReport = () => {
  const [searchInput, setSearchInput] = useState("");
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const rowsPerPage = 10;

  const { data = [], isLoading, isError, error } = useQuery({
    queryKey: ["swapManagementReport"],
    queryFn: async () => {
      try {
        const res = await adminApi.getAdminReport("swap");
        console.log("Swap Report Raw Response:", res);

        const swaps = res?.data?.swaps || res?.data?.data || res?.data || [];
        
        if (!Array.isArray(swaps)) {
          console.warn("Expected swaps array, got:", swaps);
          toast.info("No swap records found");
          return [];
        }

        return swaps;
      } catch (err) {
        toast.error("Failed to load swap report");
        throw err;
      }
    },
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });

  // Safe formatters
  const formatNumber = (val) => Number(val || 0).toFixed(2);
  const formatDate = (date) =>
    date
      ? new Date(date).toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata",
          year: "numeric",
          month: "short",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
      : "N/A";

  const capitalize = (str) =>
    str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "N/A";

  const columns = useMemo(
    () => [
      {
        accessorKey: "sNo",
        header: "S.No.",
        cell: ({ row }) => row.index + 1,
      },
      {
        accessorKey: "userName",
        header: "User Name",
        cell: ({ getValue }) => getValue() || "N/A",
      },
      {
        accessorKey: "packageName",
        header: "Package Name",
        cell: ({ getValue }) => getValue() || "N/A",
      },
      {
        accessorKey: "usdtAmount",
        header: "USDT Amount",
        cell: ({ getValue }) => formatNumber(getValue()),
      },
      {
        accessorKey: "emgtAmount",
        header: "EMGT Token",
        cell: ({ getValue }) => formatNumber(getValue()),
      },
      {
        accessorKey: "tokenPrice",
        header: "Token Price",
        cell: ({ getValue }) => `$${formatNumber(getValue())}`,
      },
      {
        accessorKey: "currencyType",
        header: "Currency",
        cell: ({ getValue }) => (getValue() || "USDT").toUpperCase(),
      },
      {
        accessorKey: "remark",
        header: "Remarks",
        cell: ({ getValue }) => getValue() || "Swap Request",
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) => {
          const status = (getValue() || "pending").toLowerCase();
          return (
            <span
              className={`px-3 py-1 text-xs font-bold rounded-full ${
                status === "completed"
                  ? "bg-green-100 text-green-800"
                  : status === "rejected" || status === "failed"
                  ? "bg-red-100 text-red-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {status === "completed" ? "Completed" : capitalize(status)}
            </span>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: "Swap Date",
        cell: ({ getValue }) => formatDate(getValue()),
      },
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: { globalFilter: searchInput },
    onGlobalFilterChange: setSearchInput,

    // Custom global search across all relevant fields
    globalFilterFn: (row, columnId, filterValue) => {
      const search = filterValue.toLowerCase();
      const item = row.original;

      const values = [
        item.userName,
        item.packageName,
        item.usdtAmount?.toString(),
        item.emgtAmount?.toString(),
        item.tokenPrice?.toString(),
        item.currencyType,
        item.remark,
        item.status,
      ]
        .filter(Boolean)
        .map(v => v.toString().toLowerCase());

      return values.some(val => val.includes(search));
    },

    initialState: { pagination: { pageSize: rowsPerPage } },
  });

  // Export PDF
  const handleExportPDF = async () => {
    if (data.length === 0) {
      toast.error("No data to export");
      return;
    }

    setIsExportingPDF(true);
    try {
      const doc = new jsPDF("landscape");
      doc.setFontSize(18);
      doc.text("Swap Management Report", 14, 20);

      const tableData = data.map((item, i) => [
        i + 1,
        item.userName || "N/A",
        item.packageName || "N/A",
        formatNumber(item.usdtAmount),
        formatNumber(item.emgtAmount),
        `$${formatNumber(item.tokenPrice)}`,
        (item.currencyType || "USDT").toUpperCase(),
        item.remark || "Swap Request",
        capitalize(item.status || "pending"),
        formatDate(item.createdAt),
      ]);

      autoTable(doc, {
        head: [["S.No", "User Name", "Package", "USDT", "EMGT", "Price", "Currency", "Remark", "Status", "Date"]],
        body: tableData,
        startY: 30,
        theme: "grid",
        headStyles: { fillColor: [16, 57, 68] },
        styles: { fontSize: 9 },
      });

      doc.save("swap_management_report.pdf");
      toast.success("PDF exported successfully");
    } catch (err) {
      console.error("PDF Export Error:", err);
      toast.error("Failed to export PDF");
    } finally {
      setIsExportingPDF(false);
    }
  };

  // Export Excel
  const handleExportExcel = async () => {
    if (data.length === 0) {
      toast.error("No data to export");
      return;
    }

    setIsExportingExcel(true);
    try {
      const excelData = data.map((item, i) => ({
        "S.No": i + 1,
        "User Name": item.userName || "N/A",
        "Package Name": item.packageName || "N/A",
        "USDT Amount": formatNumber(item.usdtAmount),
        "EMGT Amount": formatNumber(item.emgtAmount),
        "Token Price": `$${formatNumber(item.tokenPrice)}`,
        Currency: (item.currencyType || "USDT").toUpperCase(),
        Remark: item.remark || "Swap Request",
        Status: capitalize(item.status || "pending"),
        "Swap Date": formatDate(item.createdAt),
      }));

      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Swaps");
      XLSX.writeFile(wb, "swap_management_report.xlsx");

      toast.success("Excel exported successfully");
    } catch (err) {
      console.error("Excel Export Error:", err);
      toast.error("Failed to export Excel");
    } finally {
      setIsExportingExcel(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-[#103944] mb-4">
          Swap Management Report
        </h2>
        <p className="text-gray-600">Loading swap records...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-[#103944] mb-4">
          Swap Management Report
        </h2>
        <p className="text-red-600">
          Error: {error?.message || "Failed to load swap data"}
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold text-[#103944] mb-6">
        Swap Management Report
      </h2>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex gap-3">
          <button
            onClick={handleExportPDF}
            disabled={isExportingPDF}
            className={`px-5 py-2 rounded-lg font-medium text-white transition ${
              isExportingPDF
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {isExportingPDF ? "Exporting PDF..." : "Export PDF"}
          </button>
          <button
            onClick={handleExportExcel}
            disabled={isExportingExcel}
            className={`px-5 py-2 rounded-lg font-medium text-white transition ${
              isExportingExcel
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {isExportingExcel ? "Exporting Excel..." : "Export Excel"}
          </button>
        </div>

        <input
          type="text"
          placeholder="Search by user, package, amount..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#103944] w-full md:w-80"
        />
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#103944] text-white">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="px-4 py-3 text-left font-semibold">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-gray-200">
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50 transition">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} className="text-center py-10 text-gray-500">
                    No swap records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t">
          <span className="text-sm text-gray-700">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="px-4 py-2 bg-[#103944] text-white rounded disabled:bg-gray-300 hover:bg-[#0e9d52] transition"
            >
              Previous
            </button>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="px-4 py-2 bg-[#103944] text-white rounded disabled:bg-gray-300 hover:bg-[#0e9d52] transition"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SwapManagementReport;