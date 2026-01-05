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

const TransferManagementReport = () => {
  const [searchInput, setSearchInput] = useState("");
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const rowsPerPage = 10;

  const { data = [], isLoading, isError, error } = useQuery({
    queryKey: ["transferReport"],
    queryFn: async () => {
      try {
        const res = await adminApi.getTransferReport({
          page: 1,
          limit: 1000,
        });

        // Robust data extraction
        const transfers = 
          res?.data?.data?.transfers ||
          res?.data?.transfers ||
          res?.data?.data ||
          res?.data ||
          res ||
          [];

        if (!Array.isArray(transfers)) {
          console.warn("Transfers data is not an array:", transfers);
          return [];
        }

        return transfers;
      } catch (err) {
        toast.error("Failed to fetch transfer data");
        throw err;
      }
    },
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });

  // Helper: Safe capitalize
  const capitalize = (str) => {
    if (!str) return "N/A";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  const columns = useMemo(
    () => [
      { accessorKey: "sr", header: "S.No.", cell: ({ row }) => row.index + 1 },
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
        accessorKey: "stakeId",
        header: "Stake ID",
        cell: ({ getValue }) => getValue() || "N/A",
      },
      {
        accessorKey: "amount",
        header: "Amount (USDT)",
        cell: ({ getValue }) => `$${Number(getValue() || 0).toFixed(2)}`,
      },
      {
        accessorKey: "fromWallet",
        header: "From Wallet",
        cell: ({ getValue }) => capitalize(getValue()) || "Deposit",
      },
      {
        accessorKey: "toWallet",
        header: "To Wallet",
        cell: ({ getValue }) => capitalize(getValue()) || "Principal",
      },
      {
        accessorKey: "currencyType",
        header: "Currency",
        cell: ({ getValue }) => getValue()?.toUpperCase() || "USDT",
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
        header: "Transfer Date",
        cell: ({ getValue }) => {
          const date = getValue();
          return date
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
        },
      },
      {
        accessorKey: "remark",
        header: "Remark",
        cell: ({ getValue }) => getValue() || "Transferred to Principal",
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

    // Custom global filter for nested fields
    globalFilterFn: (row, columnId, filterValue) => {
      const search = filterValue.toLowerCase();
      const item = row.original;

      const values = [
        item.user?.email,
        item.user?.username,
        item.stakeId,
        item.amount?.toString(),
        item.fromWallet,
        item.toWallet,
        item.status,
        item.remark,
      ]
        .filter(Boolean)
        .map(v => v.toString().toLowerCase());

      return values.some(val => val.includes(search));
    },

    initialState: { pagination: { pageSize: rowsPerPage } },
  });

  // Export PDF
  const handleExportPDF = async () => {
    if (!data || data.length === 0) {
      toast.error("No data to export");
      return;
    }

    setIsExportingPDF(true);
    try {
      const doc = new jsPDF("landscape");
      doc.setFontSize(18);
      doc.text("Transfer to Principal Wallet Report", 14, 20);

      const tableData = data.map((item, i) => [
        i + 1,
        item.user?.email || "N/A",
        item.user?.username || item.user?.email?.split("@")[0] || "Unknown",
        item.stakeId || "N/A",
        `$${Number(item.amount || 0).toFixed(2)}`,
        capitalize(item.fromWallet) || "Deposit",
        capitalize(item.toWallet) || "Principal",
        (item.currencyType || "USDT").toUpperCase(),
        capitalize(item.status || "completed"),
        item.transactionDate
          ? new Date(item.transactionDate).toLocaleString("en-IN", {
              timeZone: "Asia/Kolkata",
            })
          : "N/A",
        item.remark || "Transferred",
      ]);

      autoTable(doc, {
        head: [["S.No", "Email", "Username", "Stake ID", "Amount", "From", "To", "Currency", "Status", "Date", "Remark"]],
        body: tableData,
        startY: 30,
        theme: "grid",
        headStyles: { fillColor: [16, 57, 68] },
        styles: { fontSize: 9 },
      });

      doc.save("transfer_to_principal_report.pdf");
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
    if (!data || data.length === 0) {
      toast.error("No data to export");
      return;
    }

    setIsExportingExcel(true);
    try {
      const excelData = data.map((item, i) => ({
        "S.No": i + 1,
        "User Email": item.user?.email || "N/A",
        Username: item.user?.username || item.user?.email?.split("@")[0] || "Unknown",
        "Stake ID": item.stakeId || "N/A",
        "Amount (USDT)": Number(item.amount || 0).toFixed(2),
        "From Wallet": capitalize(item.fromWallet) || "Deposit",
        "To Wallet": capitalize(item.toWallet) || "Principal",
        Currency: (item.currencyType || "USDT").toUpperCase(),
        Status: capitalize(item.status || "completed"),
        "Transfer Date": item.transactionDate
          ? new Date(item.transactionDate).toLocaleString("en-IN", {
              timeZone: "Asia/Kolkata",
            })
          : "N/A",
        Remark: item.remark || "Transferred",
      }));

      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Transfers");
      XLSX.writeFile(wb, "transfer_to_principal_report.xlsx");

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
          Transfer to Principal Wallet Report
        </h2>
        <p className="text-gray-600">Loading transfer records...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-[#103944] mb-4">
          Transfer to Principal Wallet Report
        </h2>
        <p className="text-red-600">
          Error: {error?.message || "Failed to load transfer data"}
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold text-[#103944] mb-6">
        Transfer to Principal Wallet Report
      </h2>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex gap-3">
          <button
            onClick={handleExportPDF}
            disabled={isExportingPDF || isLoading}
            className={`px-5 py-2 rounded-lg font-medium text-white transition ${
              isExportingPDF || isLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {isExportingPDF ? "Exporting PDF..." : "Export PDF"}
          </button>
          <button
            onClick={handleExportExcel}
            disabled={isExportingExcel || isLoading}
            className={`px-5 py-2 rounded-lg font-medium text-white transition ${
              isExportingExcel || isLoading
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
                  <td colSpan={11} className="text-center py-10 text-gray-500">
                    No transfer records found
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

export default TransferManagementReport;