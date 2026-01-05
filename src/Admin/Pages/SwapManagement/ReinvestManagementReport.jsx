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

const ReinvestManagementReport = () => {
  const [searchInput, setSearchInput] = useState("");
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const rowsPerPage = 10;

  // FIXED: Correct queryKey + correct API call (no params needed if no filters)
const { data = [], isLoading, isError, error } = useQuery({
  queryKey: ["reinvestReport"],
  queryFn: async () => {
    const res = await adminApi.getReinvestReport();
    console.log("Raw API Response:", res); // Keep this temporarily to debug

    let reinvestments = [];

    // Handle ALL possible response shapes safely
    if (Array.isArray(res?.data)) {
      reinvestments = res.data;
    }
    else if (Array.isArray(res?.data?.data)) {
      reinvestments = res.data.data;
    }
    else if (Array.isArray(res?.data?.reinvestments)) {
      reinvestments = res.data.reinvestments;
    }
    else if (Array.isArray(res?.reinvestments)) {
      reinvestments = res.reinvestments;
    }
    else if (Array.isArray(res)) {
      reinvestments = res;
    }
    else {
      console.warn("Unexpected reinvestment report structure:", res);
      toast.warn("No reinvestment data found");
      return [];
    }

    console.log("Parsed Reinvestments:", reinvestments);
    return reinvestments;
  },
  refetchOnWindowFocus: false,
  staleTime: 5 * 60 * 1000,
});

  const table = useReactTable({
    data,
    columns: useMemo(
      () => [
        {
          accessorKey: "sr",
          header: "S.No.",
          cell: ({ row }) => row.index + 1,
        },
        {
          accessorKey: "user.email",
          header: "User Email",
          cell: ({ row }) => row.original.user?.email || "N/A",
        },
        {
          accessorKey: "user.username",
          header: "Username",
          cell: ({ row }) =>
            row.original.user?.username ||
            row.original.user?.email?.split("@")[0] ||
            "Unknown",
        },
        {
          accessorKey: "oldStakeId",
          header: "Old Stake ID",
          cell: ({ getValue }) => getValue() || "N/A",
        },
        {
          accessorKey: "newStakeId",
          header: "New Stake ID",
          cell: ({ getValue }) => getValue() || "N/A",
        },
        {
          accessorKey: "amount",
          header: "Reinvested Amount",
          cell: ({ getValue }) => `$${Number(getValue() || 0).toFixed(2)}`,
        },
        {
          accessorKey: "lockingPeriodDays",
          header: "Locking Period (Days)",
          cell: ({ getValue }) => getValue() || "N/A",
        },
        {
          accessorKey: "status",
          header: "Status",
          cell: ({ getValue }) => {
            const status = (getValue() || "completed").toLowerCase();
            return (
              <span
                className={`px-3 py-1 text-xs font-bold rounded-full ${
                  status === "completed"
                    ? "bg-green-100 text-green-800"
                    : status === "pending"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </span>
            );
          },
        },
        {
          accessorKey: "transactionDate",
          header: "Reinvestment Date",
          cell: ({ getValue }) =>
            getValue()
              ? new Date(getValue()).toLocaleString("en-IN", {
                  timeZone: "Asia/Kolkata",
                  year: "numeric",
                  month: "short",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "N/A",
        },
        {
          accessorKey: "remark",
          header: "Remark",
          cell: ({ getValue }) => getValue() || "Reinvested",
        },
      ],
      []
    ),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: { globalFilter: searchInput },
    onGlobalFilterChange: setSearchInput,
    initialState: { pagination: { pageSize: rowsPerPage } },
  });

  // Export PDF
  const handleExportPDF = () => {
    if (data.length === 0) {
      toast.error("No data to export");
      return;
    }
    setIsExportingPDF(true);

    setTimeout(() => {
      try {
        const doc = new jsPDF("landscape");
        doc.setFontSize(18);
        doc.text("Reinvestment Management Report", 14, 20);

        const tableData = data.map((item, i) => [
          i + 1,
          item.user?.email || "N/A",
          item.user?.username || "Unknown",
          item.oldStakeId || "N/A",
          item.newStakeId || "N/A",
          `$${Number(item.amount || 0).toFixed(2)}`,
          item.lockingPeriodDays || "N/A",
          (item.status || "completed").charAt(0).toUpperCase() + (item.status || "completed").slice(1),
          new Date(item.transactionDate).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
          item.remark || "Reinvested",
        ]);

        autoTable(doc, {
          head: [["S.No", "Email", "Username", "Old Stake", "New Stake", "Amount", "Locking Days", "Status", "Date", "Remark"]],
          body: tableData,
          startY: 30,
          theme: "grid",
          headStyles: { fillColor: [16, 57, 68] },
          styles: { fontSize: 9 },
        });

        doc.save("reinvestment_management_report.pdf");
        toast.success("PDF exported successfully");
      } catch (err) {
        console.error("PDF Export Error:", err);
        toast.error("Failed to export PDF");
      } finally {
        setIsExportingPDF(false);
      }
    }, 100);
  };

  // Export Excel
  const handleExportExcel = () => {
    if (data.length === 0) {
      toast.error("No data to export");
      return;
    }
    setIsExportingExcel(true);

    setTimeout(() => {
      try {
        const excelData = data.map((item, i) => ({
          "S.No": i + 1,
          "User Email": item.user?.email || "N/A",
          Username: item.user?.username || "Unknown",
          "Old Stake ID": item.oldStakeId || "N/A",
          "New Stake ID": item.newStakeId || "N/A",
          "Reinvested Amount (USDT)": Number(item.amount || 0).toFixed(2),
          "Locking Period (Days)": item.lockingPeriodDays || "N/A",
          Status: (item.status || "completed").charAt(0).toUpperCase() + (item.status || "completed").slice(1),
          "Reinvestment Date": new Date(item.transactionDate).toLocaleString("en-IN", {
            timeZone: "Asia/Kolkata",
          }),
          Remark: item.remark || "Reinvested",
        }));

        const ws = XLSX.utils.json_to_sheet(excelData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Reinvestments");
        XLSX.writeFile(wb, "reinvestment_management_report.xlsx");

        toast.success("Excel exported successfully");
      } catch (err) {
        console.error("Excel Export Error:", err);
        toast.error("Failed to export Excel");
      } finally {
        setIsExportingExcel(false);
      }
    }, 100);
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-[#103944] mb-4">
          Reinvestment Management Report
        </h2>
        <p className="text-gray-600">Loading reinvestment records...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-[#103944] mb-4">
          Reinvestment Management Report
        </h2>
        <p className="text-red-600">
          Error: {error?.message || "Failed to load reinvestment data"}
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold text-[#103944] mb-6">
        Reinvestment Management Report
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
          placeholder="Search by email, stake ID, amount..."
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
                    No reinvestment records found
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
              className="px-4 py-2 bg-[#103944] text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-[#0e9d52] transition"
            >
              Previous
            </button>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="px-4 py-2 bg-[#103944] text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-[#0e9d52] transition"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReinvestManagementReport;