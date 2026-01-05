import { useMemo, useState, useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa";
import { PiMicrosoftExcelLogo, PiCopySimple } from "react-icons/pi";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import axios from "axios";
import moment from "moment";
import { appConfig } from "../../config/appConfig";
import { toast } from "react-toastify"; // Assuming toast is used for feedback
import SkeletonLoader from "../Components/Comman/Skeletons";
 

const columnHelper = createColumnHelper();

const handleCopy = (text) => {
  navigator.clipboard.writeText(text).then(() => {
    toast.success("Copied to clipboard!");
  }).catch((err) => {
    toast.error("Failed to copy to clipboard");
    console.error("Copy error:", err);
  });
};

const columns = [
  {
    id: "sno",
    header: "Sr.",
    cell: ({ row }) => <span>{row.index + 1}</span>,
  },
  columnHelper.accessor("date", {
    header: "Date",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("amount", {
    header: "Amount",
    cell: (info) => `$${info.getValue()}`,
  }),
  columnHelper.accessor("actualPayAmount", {
    header: "Amount Received",
    cell: (info) => `$${info.getValue()}`,
  }),
  columnHelper.accessor("withdrawalFeePercentage", {
    header: "Withdrawal Fee (%)",
    cell: (info) => `${info.getValue()}%`,
  }),
  columnHelper.accessor("fromWallet", {
    header: "From Wallet",
    cell: (info) => info.getValue(),
  }),
  // columnHelper.accessor("toWallet", {
  //   header: "To Wallet",
  //   cell: (info) => info.getValue(),
  // }),
  
  columnHelper.accessor("walletAddress", {
    header: "Wallet Address",
    cell: (info) => (
      <div className="flex items-center gap-2">
        <span className="text-sm truncate max-w-[150px]">
          {info.getValue() || "N/A"}
        </span>
        <button
          onClick={() => handleCopy(info.getValue() || "N/A")}
          className="text-blue-400 hover:text-blue-300 transition"
          title="Copy to clipboard"
        >
          <PiCopySimple />
        </button>
      </div>
    ),
  }),
  columnHelper.accessor("transactionHash", {
    header: "Transaction Hash",
    cell: (info) => (
      <div className="flex items-center gap-2">
        <span className="text-sm truncate max-w-[150px]">
          {info.getValue() || "N/A"}
        </span>
        <button
          onClick={() => handleCopy(info.getValue() || "N/A")}
          className="text-blue-400 hover:text-blue-300 transition"
          title="Copy to clipboard"
        >
          <PiCopySimple />
        </button>
      </div>
    ),
  }),
  columnHelper.accessor("status", {
    header: "Status",
    cell: (info) => (
      <span
        className={`px-2 py-1 rounded text-xs font-semibold ${info.getValue() === "Approved"
            ? "bg-green-800 text-green-300"
            : "bg-yellow-800 text-yellow-300"
          }`}
      >
        {info.getValue()}
      </span>
    ),
  }),
];

const WithdrawReport = () => {
  const [data, setData] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch withdrawal data from API
  useEffect(() => {
    const fetchWithdrawals = async () => {
      try {
        setLoading(true);
        const token =
          localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
        if (!token) {
          setError("No authentication token found. Please log in.");
          return;
        }

        const response = await axios.get(`${appConfig.baseURL}/user/withdrawal-history`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const withdrawals = response.data.data.withdrawals || []; // Adjust based on API response structure
        // Transform API data to match table structure
        const transformedData = withdrawals.map((withdrawal) => ({
          date: moment(withdrawal.createdAt).utcOffset(330).format('YYYY-MM-DD HH:mm:ss'), // Format date
          amount: withdrawal.amount,
          actualPayAmount: withdrawal.actualPayAmount,
          withdrawalFeePercentage: withdrawal.withdrawalFeePercentage,
          fromWallet: withdrawal.walletType,
          // toWallet: withdrawal.walletAddress || "Admin Approval", // Use walletAddress if available
          status: withdrawal.status.charAt(0).toUpperCase() + withdrawal.status.slice(1), // Capitalize status
          walletAddress: withdrawal.walletAddress || "N/A",
          transactionHash: withdrawal.transactionHash || "N/A",
        }));
        setData(transformedData);
      } catch (error) {
        console.error("Error fetching withdrawal data:", error);
        setError("Failed to load withdrawal report. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchWithdrawals();
  }, []);

  const filteredData = useMemo(() => {
    return data.filter((row) => {
      const matchesSearch =
        row.fromWallet.toLowerCase().includes(globalFilter.toLowerCase()) ||
        row.toWallet.toLowerCase().includes(globalFilter.toLowerCase()) ||
        row.walletAddress.toLowerCase().includes(globalFilter.toLowerCase()) ||
        row.transactionHash.toLowerCase().includes(globalFilter.toLowerCase());
      const matchesStatus = statusFilter ? row.status === statusFilter : true;
      return matchesSearch && matchesStatus;
    });
  }, [globalFilter, statusFilter, data]);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { globalFilter, pagination },
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "WithdrawReport");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, "withdraw-report.xlsx");
  };

  return (
    <div className="bg-[#12212154] backdrop-blur-xl border border-slate-700 border-gradient shadow-md shadow-slate-800/50 text-white p-6 rounded-md max-w-full mx-auto">
      <div className="flex justify-between mb-6 gap-4 flex-wrap-reverse">
        <h2 className="text-2xl text-primary font-bold">Withdraw Report</h2>
        <button
          onClick={exportToExcel}
          className="px-3 py-1 h-fit text-base border flex items-center justify-center gap-2 border-slate-600 rounded bg-slate-800 hover:bg-slate-700 transition"
        >
          <PiMicrosoftExcelLogo className="text-green-600" />
          <span>Export</span>
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          value={globalFilter ?? ""}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Search wallet, address, or hash..."
          className="flex-1 px-4 py-2 bg-transparent border border-slate-500 rounded text-white focus:outline-none"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 bg-slate-700 border border-slate-500 rounded text-white focus:outline-none"
        >
          <option value="">All Status</option>
          <option value="Requested">Requested</option>
          <option value="Approved">Approved</option>
        </select>
      </div>

      <div className="overflow-auto rounded">
        <table className="w-full border-collapse text-sm">

          {loading ?
            <>
              <div className="overflow-auto rounded">
                <SkeletonLoader variant="table" />
              </div>
            </>
            :
            <>
              <thead className="bg-sky-950/40">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="text-left px-4 py-2 border-b border-slate-700 text-primary text-nowrap"
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
                  <tr key={row.id} className="hover:bg-slate-800/40 transition text-nowrap">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-2 border-b border-slate-700">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </>
          }

        </table>

        {table.getRowModel().rows.length === 0 && (
          <p className="text-center text-sm text-slate-400 mt-4">No data found.</p>
        )}
      </div>

      <div className="mt-6 flex md:flex-row flex-col gap-4 items-center justify-between text-sm">
        <div className="text-secondary">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
        </div>
        <div className="space-x-2 flex">
          <button
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            className="px-3 py-1 border text-xs rounded disabled:opacity-40"
          >
            First
          </button>
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="px-3 py-1 border text-xs rounded disabled:opacity-40"
          >
            <FaAngleLeft />
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="px-3 py-1 border text-xs rounded disabled:opacity-40"
          >
            <FaAngleRight />
          </button>
          <button
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            className="px-3 py-1 border text-xs rounded disabled:opacity-40"
          >
            Last
          </button>
        </div>
      </div>
    </div>
  );
};

export default WithdrawReport;