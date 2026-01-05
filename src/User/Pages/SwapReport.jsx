import { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { PiMicrosoftExcelLogo } from "react-icons/pi";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import axios from "axios";
import moment from "moment";
import { appConfig } from "../../config/appConfig";
import SkeletonLoader from "../Components/Comman/Skeletons";
import { useQuery } from "@tanstack/react-query";

const columnHelper = createColumnHelper();

const columns = [
  {
    id: "sno",
    header: "S.No",
    cell: ({ row }) => (
      <div className="text-left text-sm text-secondary">{row.index + 1}</div>
    ),
  },
  columnHelper.accessor("swapDetails.originalAmount", {
    header: "From (USDT)",
    cell: (info) => `$${Number(info.getValue() || 0).toFixed(2)}`,
  }),
  columnHelper.accessor("emgtAmount", {
    header: "EMGT Amount",
    cell: (info) => `${Number(info.getValue() || 0).toFixed(2)}`,
  }),
  columnHelper.accessor("swapDetails.fee", {
    header: "Swap Fee",
    cell: (info) => `$${Number(info.getValue() || 0).toFixed(2)}`,
  }),
  columnHelper.accessor("tokenPrice", {
    header: "Token Price",
    cell: (info) => `$${Number(info.getValue() || 0).toFixed(2)}`,
  }),
  columnHelper.accessor("createdAt", {
    header: "Date",
    cell: (info) =>
      info.getValue()
        ? moment(info.getValue()).utcOffset(330).format("YYYY-MM-DD HH:mm:ss")
        : "N/A",
  }),
  columnHelper.accessor("status", {
    header: "Status",
    cell: (info) => (
      <span
        className={`px-2 py-1 rounded text-xs font-semibold ${info.getValue() === "Completed"
            ? "bg-green-800 text-green-300"
            : "bg-yellow-800 text-yellow-300"
          }`}
      >
        {info.getValue() || "N/A"}
      </span>
    ),
  }),
];

const fetchSwaps = async () => {
  const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
  if (!token) throw new Error("No authentication token found. Please log in.");
  if (!appConfig.baseURL) throw new Error("Base URL is not configured.");

  const response = await axios.get(`${appConfig.baseURL}/user/swaps`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const swaps = response.data.data || [];
  return swaps.map((swap) => ({
    userId: swap.userId?._id || "N/A",
    emgtAmount: swap.emgtAmount || 0,
    tokenPrice: swap.tokenPrice || 0,
    walletType: swap.walletType || "N/A",
    currencyType: swap.currencyType || "EMGT",
    status: swap.status || "N/A",
    createdAt: swap.createdAt || null,
    swapDetails: {
      originalAmount: swap.usdtAmount || 0,
      fee: swap.swapDetails?.fee || 0,
    },
  }));
};

const SwapReport = () => {
  const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  const {
    data: swaps = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["swaps"],
    queryFn: fetchSwaps,
    staleTime: 1000 * 60 * 2, // 2 minutes
    cacheTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });

  const table = useReactTable({
    data: swaps,
    columns: useMemo(() => columns, []),
    state: { globalFilter, pagination },
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  const exportToExcel = () => {
    const exportData = table.getCoreRowModel().rows.map((row) => ({
      "S.No": row.index + 1,
      "From (USDT)": `$${Number(row.original.swapDetails.originalAmount || 0).toFixed(2)}`,
      "EMGT Amount": Number(row.original.emgtAmount || 0).toFixed(2),
      "Swap Fee": `$${Number(row.original.swapDetails.fee || 0).toFixed(2)}`,
      "Token Price": `$${Number(row.original.tokenPrice || 0).toFixed(2)}`,
      Date: row.original.createdAt
        ? moment(row.original.createdAt).utcOffset(330).format("YYYY-MM-DD HH:mm:ss")
        : "N/A",
      Status: row.original.status || "N/A",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "SwapReport");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const dataBlob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(dataBlob, `swap-report-${moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss")}.xlsx`);
  };

  return (
    <div className="bg-[#12212154] backdrop-blur-xl border border-slate-700 border-gradient shadow-md shadow-slate-800/50 text-white p-6 rounded-md max-w-full mx-auto">
      <div className="flex justify-between mb-6 gap-4 flex-wrap-reverse">
        <h2 className="text-xl md:text-2xl text-primary font-bold">Swap Report</h2>
        <button
          onClick={exportToExcel}
          disabled={swaps.length === 0 || isLoading}
          className="px-3 py-1 h-fit text-base border flex items-center justify-center gap-2 border-slate-600 rounded bg-slate-800 hover:bg-slate-700 transition disabled:opacity-40"
          aria-label="Export to Excel"
        >
          <PiMicrosoftExcelLogo className="text-green-600" />
          <span>Export to Excel</span>
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          value={globalFilter ?? ""}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Search swaps by date or status..."
          className="w-full px-4 py-2 bg-transparent border border-slate-500 rounded text-white focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-40"
          disabled={isLoading || swaps.length === 0}
          aria-label="Search swaps by date or status"
        />
      </div>

      {/* Loading or Error State */}
      {isLoading && (
        <div className="overflow-auto rounded">
          <SkeletonLoader variant="table" />
        </div>
      )}
      {isError && (
        <div className="text-center text-sm text-red-500 py-4">
          {error.message || "Failed to fetch swaps."}
        </div>
      )}

      {/* Table */}
      {!isLoading && !isError && (
        <div className="overflow-auto rounded">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-sky-950/40">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="text-left px-4 py-2 border-b border-slate-700 text-primary font-semibold text-nowrap"
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {swaps.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="text-center text-sm text-slate-400 py-4">
                    No records available
                  </td>
                </tr>
              ) : table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="text-center text-sm text-slate-400 py-4">
                    No data found
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-800/40 transition text-nowrap">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-2 border-b border-slate-700">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {!isLoading && !isError && swaps.length > 0 && (
        <div className="mt-6 flex md:flex-row flex-col gap-4 items-center justify-between text-sm">
          <div className="text-secondary">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
          </div>
          <div className="space-x-2 flex">
            <button
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              className="px-3 py-1 border text-xs rounded disabled:opacity-40 hover:bg-slate-700 transition"
              aria-label="Go to first page"
            >
              First
            </button>
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="px-3 py-1 border text-xs rounded disabled:opacity-40 hover:bg-slate-700 transition"
              aria-label="Previous page"
            >
              <FaAngleLeft />
            </button>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="px-3 py-1 border text-xs rounded disabled:opacity-40 hover:bg-slate-700 transition"
              aria-label="Next page"
            >
              <FaAngleRight />
            </button>
            <button
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
              className="px-3 py-1 border text-xs rounded disabled:opacity-40 hover:bg-slate-700 transition"
              aria-label="Go to last page"
            >
              Last
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SwapReport;
