import { useMemo, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "../../Service/adminApi";
import { toast } from "react-toastify";
import { Clipboard } from "lucide-react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table";

const WalletUpdateReport = () => {
  const [searchInput, setSearchInput] = useState("");

  const { data: walletUpdateLogs = [], isLoading, isError, error } = useQuery({
    queryKey: ["walletUpdateLogs"],
    queryFn: async () => {
      const res = await adminApi.getWalletUpdateLogs();
      const logs = res?.data?.walletUpdateLogs;
      if (!Array.isArray(logs)) {
        throw new Error("Invalid response: wallet update logs array not found");
      }
      return logs;
    },
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Set up TanStack Table
  const table = useReactTable({
    data: walletUpdateLogs,
    columns: useMemo(
      () => [
        {
          accessorKey: "sNo",
          header: "S.No.",
          cell: ({ row }) => row.index + 1,
        },
        {
          accessorKey: "userId.username",
          header: "Username",
          cell: ({ getValue }) => getValue() || "N/A",
        },
        {
          accessorKey: "oldWalletAddress",
          header: "Old Wallet Address",
          cell: ({ getValue }) => {
            const value = getValue() || "N/A";
            const truncatedValue = value.length > 10 && value !== "N/A" ? `${value.slice(0, 6)}...${value.slice(-4)}` : value;
            return (
              <div className="flex items-center">
                <span className="truncate max-w-[150px]">{truncatedValue}</span>
                {value !== "N/A" && (
                  <button
                    onClick={() => handleCopy(value)}
                    className="ml-2 text-blue-500 hover:text-blue-700"
                    aria-label={`Copy old wallet address ${value}`}
                    title="Copy"
                  >
                    <Clipboard size={16} />
                  </button>
                )}
              </div>
            );
          },
        },
        {
          accessorKey: "newWalletAddress",
          header: "New Wallet Address",
          cell: ({ getValue }) => {
            const value = getValue() || "N/A";
            const truncatedValue = value.length > 10 && value !== "N/A" ? `${value.slice(0, 6)}...${value.slice(-4)}` : value;
            return (
              <div className="flex items-center">
                <span className="truncate max-w-[150px]">{truncatedValue}</span>
                {value !== "N/A" && (
                  <button
                    onClick={() => handleCopy(value)}
                    className="ml-2 text-blue-500 hover:text-blue-700"
                    aria-label={`Copy new wallet address ${value}`}
                    title="Copy"
                  >
                    <Clipboard size={16} />
                  </button>
                )}
              </div>
            );
          },
        },
        {
          accessorKey: "notes",
          header: "Notes",
          cell: ({ getValue }) => getValue() || "N/A",
        },
        {
          accessorKey: "ipAddress",
          header: "IP Address",
          cell: ({ getValue }) => getValue() || "N/A",
        },
        {
          accessorKey: "updatedAt",
          header: "Date",
          cell: ({ getValue }) => (getValue() ? new Date(getValue()).toLocaleString() : "N/A"),
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

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text).then(
      () => toast.success("Copied to clipboard!", { position: "top-right", autoClose: 2000 }),
      () => toast.error("Failed to copy", { position: "top-right", autoClose: 2000 })
    );
  };

  // Export PDF
  const handleExportPDF = () => {
    if (walletUpdateLogs.length === 0) {
      toast.error("No data to export", { position: "top-right" });
      return;
    }
    const doc = new jsPDF();
    const columns = table.getAllColumns().map((col) => col.columnDef.header);
    const data = table.getPrePaginationRowModel().rows.map((row) =>
      columns.map((col) => {
        const value = row.getValue(col.id);
        return String(value || "N/A");
      })
    );

    doc.text("Wallet Update Report", 14, 10);
    autoTable(doc, {
      head: [columns],
      body: data,
      startY: 20,
      theme: "striped",
      headStyles: { fillColor: [16, 57, 68], textColor: [255, 255, 255] },
      styles: { fontSize: 8, cellPadding: 2 },
      margin: { top: 20 },
    });
    doc.save("wallet_update_report.pdf");
  };

  // Export Excel
  const handleExportExcel = () => {
    if (walletUpdateLogs.length === 0) {
      toast.error("No data to export", { position: "top-right" });
      return;
    }
    const data = table.getPrePaginationRowModel().rows.map((row) => {
      const rowData = {};
      table.getAllColumns().forEach((col) => {
        const value = row.getValue(col.id);
        rowData[col.columnDef.header] = String(value || "N/A");
      });
      return rowData;
    });
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "WalletUpdateReport");
    XLSX.writeFile(workbook, "wallet_update_report.xlsx");
  };

  // Loading / Error states
  if (isLoading) {
    return (
      <div className="p-4 max-w-[1260px] mx-auto">
        <h2 className="text-2xl font-bold mb-4 text-[#103944]">
          Wallet Update Report
        </h2>
        <p className="text-gray-600">Loading wallet update logs...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 max-w-[1260px] mx-auto">
        <h2 className="text-2xl font-bold mb-4 text-[#103944]">
          Wallet Update Report
        </h2>
        <p className="text-red-600">
          Error: {error?.message || "Failed to load wallet update logs."}
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 flex-1 text-nowrap max-w-[1260px] mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-[#103944]">
        Wallet Update Report
      </h2>

      <div className="mb-4 flex flex-col md:flex-row items-center justify-between">
        <div className="flex gap-2 mb-4 md:mb-0">
          <button
            onClick={handleExportPDF}
            className="bg-red-500 text-white px-4 py-2 rounded mr-2 hover:bg-red-600 text-sm"
          >
            Export PDF
          </button>
          <button
            onClick={handleExportExcel}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 text-sm"
          >
            Export Excel
          </button>
        </div>
        <div className="flex items-center w-full md:w-auto">
          <input
            placeholder="Search wallet updates..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="border border-gray-300 rounded px-4 py-2 w-full max-w-xs focus:outline-none focus:ring-2 focus:ring-[#103944]"
            aria-label="Search wallet update records"
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

export default WalletUpdateReport;