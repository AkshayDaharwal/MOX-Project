import React, { useMemo, useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { FaCheck, FaTimes } from "react-icons/fa";
import { PiCopySimple } from "react-icons/pi";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table";
import { adminApi } from "../../Service/adminApi";
import { toast } from "react-toastify";

const handleCopy = (text) => {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      toast.success("Copied to clipboard!");
    })
    .catch((err) => {
      toast.error("Failed to copy to clipboard");
      console.error("Copy error:", err);
    });
};

const Withdrawals = () => {
  const [searchInput, setSearchInput] = useState("");
  const [loadingWithdrawalIds, setLoadingWithdrawalIds] = useState(new Set());
  const queryClient = useQueryClient();

  const {
    data: withdrawals = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["withdrawals"],
    queryFn: async () => {
      const res = await adminApi.getWithdrawals();
      const withdrawalsData = res?.data?.withdrawals;
      if (!Array.isArray(withdrawalsData)) {
        throw new Error("Invalid response: withdrawals array not found");
      }
      const mappedData = withdrawalsData.map((item) => {
        const email = item.userId && item.userId.email ? item.userId.email : "N/A";
        return { ...item, email };
      });
      return mappedData;
    },
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });

  // Fallback to clear stale loading states
  useEffect(() => {
    const timer = setTimeout(() => {
      if (loadingWithdrawalIds.size > 0) {
        setLoadingWithdrawalIds(new Set());
      }
    }, 10000);
    return () => clearTimeout(timer);
  }, [loadingWithdrawalIds]);

  const { mutate: approveOrRejectWithdrawal } = useMutation({
    mutationFn: async ({ withdrawalId, action }) => {
      if (!["approve", "reject"].includes(action)) {
        throw new Error("Invalid action: must be 'approve' or 'reject'");
      }
      setLoadingWithdrawalIds((prev) => new Set(prev).add(`${withdrawalId}-${action}`));
      const res = await adminApi.postWithdrawalApprovel({
        withdrawalId,
        action,
        transactionHash: "",
      });
      return { ...res.data, action, withdrawalId };
    },
    onSuccess: (data) => {
      const message =
        data.action === "approve"
          ? "Withdrawal approved successfully"
          : "Withdrawal rejected successfully";
      toast.success(message);
      queryClient.invalidateQueries(["withdrawals"]);
      setLoadingWithdrawalIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(`${data.withdrawalId}-${data.action}`);
        return newSet;
      });
    },
    onError: (error, variables) => {
      toast.error(error?.response?.data?.message || "Action failed");
      setLoadingWithdrawalIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(`${variables.withdrawalId}-${variables.action}`);
        return newSet;
      });
    },
  });

  // Define columns
  const columns = useMemo(() => {
    return [
      { accessorKey: "sno", header: "S.No.", cell: ({ row }) => row.index + 1 },
      { accessorKey: "email", header: "Email", cell: ({ getValue }) => getValue() || "N/A" },
      {
        accessorKey: "amount",
        header: "Amount (USD)",
        cell: ({ getValue }) => `$${Number(getValue() || 0).toFixed(2)}`,
      },
      {
        accessorKey: "actualPayAmount",
        header: "Amount Received (USD)",
        cell: ({ getValue }) => `$${Number(getValue() || 0).toFixed(2)}`,
      },
      {
        accessorKey: "withdrawalFeePercentage",
        header: "Withdrawal Fee (%)",
        cell: ({ getValue }) => `${Number(getValue() || 0).toFixed(2)}%`,
      },
      {
        accessorKey: "walletAddress",
        header: "Wallet Address",
        cell: ({ getValue }) => {
          const address = getValue() || "N/A";
          const truncated = address.length > 10 ? `${address.slice(0, 6)}...${address.slice(-4)}` : address;
          return (
            <div className="flex items-center gap-2">
              <span className="text-sm truncate max-w-[150px]">{truncated}</span>
              <button
                onClick={() => handleCopy(address)}
                className="text-blue-400 hover:text-blue-300"
              >
                <PiCopySimple />
              </button>
            </div>
          );
        },
      },
      {
        accessorKey: "transactionHash",
        header: "Hash",
        cell: ({ getValue }) => {
          const address = getValue() || "N/A";
          const truncated = address.length > 10 ? `${address.slice(0, 6)}...${address.slice(-4)}` : address;
          return (
            <div className="flex items-center gap-2">
              <span className="text-sm truncate max-w-[150px]">{truncated}</span>
              <button
                onClick={() => handleCopy(address)}
                className="text-blue-400 hover:text-blue-300"
              >
                <PiCopySimple />
              </button>
            </div>
          );
        },
      },
      { accessorKey: "walletType", header: "Wallet Type", cell: ({ getValue }) => getValue() || "N/A" },
      { accessorKey: "currencyType", header: "Currency Type", cell: ({ getValue }) => getValue() || "N/A" },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) => {
          const value = getValue() || "Pending";
          return (
            <span
              className={`px-2 py-1 text-xs font-semibold rounded ${value.toLowerCase() === "completed"
                  ? "bg-green-100 text-green-700"
                  : value.toLowerCase() === "rejected" || value.toLowerCase() === "failed"
                    ? "bg-red-100 text-red-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
            >
              {value.toLowerCase() === "completed"
                ? "Approved"
                : value.charAt(0).toUpperCase() + value.slice(1)}
            </span>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: "Created At",
        cell: ({ getValue }) => (getValue() ? new Date(getValue()).toLocaleString() : "N/A"),
      },
      {
        id: "action",
        header: "Action",
        cell: ({ row }) => {
          const withdrawal = row.original;
          if (withdrawal.status.toLowerCase() === "completed") {
            return (
              <span className="text-green-600 font-bold flex items-center gap-1">
                <FaCheck /> Approved
              </span>
            );
          }
          if (["rejected", "failed"].includes(withdrawal.status.toLowerCase())) {
            return (
              <span className="text-red-600 font-bold flex items-center gap-1">
                <FaTimes /> {withdrawal.status.charAt(0).toUpperCase() + withdrawal.status.slice(1)}
              </span>
            );
          }
          return (
            <div className="flex gap-2">
              <button
                onClick={() =>
                  approveOrRejectWithdrawal({ withdrawalId: withdrawal._id, action: "approve" })
                }
                disabled={loadingWithdrawalIds.has(`${withdrawal._id}-approve`)}
                className="bg-green-500 text-white px-2 py-1 rounded text-sm disabled:opacity-50"
              >
                {loadingWithdrawalIds.has(`${withdrawal._id}-approve`) ? "Processing..." : "Approve"}
              </button>
              <button
                onClick={() =>
                  approveOrRejectWithdrawal({ withdrawalId: withdrawal._id, action: "reject" })
                }
                disabled={loadingWithdrawalIds.has(`${withdrawal._id}-reject`)}
                className="bg-red-500 text-white px-2 py-1 rounded text-sm disabled:opacity-50"
              >
                {loadingWithdrawalIds.has(`${withdrawal._id}-reject`) ? "Processing..." : "Reject"}
              </button>
            </div>
          );
        },
      },
    ];
  }, [approveOrRejectWithdrawal, loadingWithdrawalIds]);

  // ✅ TanStack Table setup with all-column search
  const table = useReactTable({
    data: withdrawals,
    columns,
    state: { globalFilter: searchInput },
    onGlobalFilterChange: setSearchInput,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: (row, _columnId, filterValue) => {
      if (!filterValue) return true;
      return row.getAllCells().some((cell) => {
        const value = cell.getValue();
        return value ? String(value).toLowerCase().includes(filterValue.toLowerCase()) : false;
      });
    },
    initialState: { pagination: { pageSize: 10 } },
  });

  // ✅ Export PDF using filtered rows
  const handleExportPDF = () => {
    const filteredRows = table.getFilteredRowModel().rows;
    if (filteredRows.length === 0) {
      toast.error("No data to export");
      return;
    }
    const doc = new jsPDF();
    const headers = table.getAllColumns().filter((col) => col.id !== "action").map((col) => col.columnDef.header);
    const data = filteredRows.map((row) =>
      headers.map((header) => {
        const col = table.getAllColumns().find((c) => c.columnDef.header === header);
        const val = col ? row.getValue(col.id) : "";
        if (col?.id === "status") {
          return val.toLowerCase() === "completed" ? "Approved" : val.charAt(0).toUpperCase() + val.slice(1);
        }
        return String(val || "N/A");
      })
    );
    doc.text("Withdrawals Report", 14, 10);
    autoTable(doc, {
      head: [headers],
      body: data,
      startY: 20,
      theme: "striped",
      styles: { fontSize: 8, cellPadding: 2 },
    });
    doc.save("withdrawals_report.pdf");
  };

  // ✅ Export Excel using filtered rows
  const handleExportExcel = () => {
    const filteredRows = table.getFilteredRowModel().rows;
    if (filteredRows.length === 0) {
      toast.error("No data to export");
      return;
    }
    const data = filteredRows.map((row) => {
      const rowData = {};
      table.getAllColumns()
        .filter((col) => col.id !== "action")
        .forEach((col) => {
          const val = row.getValue(col.id);
          rowData[col.columnDef.header] =
            col.id === "status"
              ? val.toLowerCase() === "completed"
                ? "Approved"
                : val.charAt(0).toUpperCase() + val.slice(1)
              : String(val || "N/A");
        });
      return rowData;
    });
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Withdrawals");
    XLSX.writeFile(workbook, "withdrawals_report.xlsx");
  };

  if (isLoading) {
    return <p className="p-4">Loading withdrawals...</p>;
  }
  if (isError) {
    return <p className="p-4 text-red-600">Error: {error?.message || "Failed to load withdrawals."}</p>;
  }

  return (
    <div className="p-4 max-w-[1260px] mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-[#103944]">Withdrawals</h2>

      <div className="flex flex-col md:flex-row items-center justify-between mb-4">
        <div className="flex gap-2">
          <button onClick={handleExportPDF} className="bg-red-500 text-white px-4 py-2 rounded text-sm">
            Export PDF
          </button>
          <button onClick={handleExportExcel} className="bg-green-500 text-white px-4 py-2 rounded text-sm">
            Export Excel
          </button>
        </div>
        <input
          placeholder="Search withdrawals..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="border px-4 py-2 rounded w-full max-w-xs mt-2 md:mt-0"
        />
      </div>

      <div className="overflow-x-auto bg-white rounded shadow border p-4">
        <table className="min-w-full text-sm border">
          <thead className="bg-[#103944] text-white">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => (
                  <th key={header.id} className="p-2 border">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="p-2 border">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="text-center p-4">
                  No results found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end items-center mt-4 gap-4">
        <span className="text-sm text-gray-600">
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="px-4 py-2 rounded bg-[#103944] text-white disabled:bg-gray-300 disabled:text-gray-600"
          >
            Prev
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="px-4 py-2 rounded bg-[#103944] text-white disabled:bg-gray-300 disabled:text-gray-600"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default Withdrawals;
