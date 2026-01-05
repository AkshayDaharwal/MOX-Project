import { useState, useMemo, useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa";
import { PiMicrosoftExcelLogo } from "react-icons/pi";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import axios from "axios";
import { appConfig } from "../../config/appConfig";
import moment from "moment"; // Ensure moment is imported for date handling
import SkeletonLoader from "../Components/Comman/Skeletons";

const columnHelper = createColumnHelper();

const columns = [
  {
    id: "sno",
    header: "Sr.",
    cell: ({ row }) => <span>{row.index + 1}</span>,
  },
  columnHelper.accessor("date", {
    header: "Date",
    cell: (info) => moment(info.getValue()).format("YYYY-MM-DD HH:mm:ss"),
  }),
  columnHelper.accessor("from", {
    header: "From",
    cell: (info) => info.getValue() || "N/A",
  }),
  columnHelper.accessor("deposit", {
    header: "Deposit Amount",
    cell: (info) => `$${info.getValue() || 0}`,
  }),
  columnHelper.accessor("levelIncome", {
    header: "Level Income",
    cell: (info) => `$${info.getValue() || 0}`,
  }),
  columnHelper.accessor("level", {
    header: "Level",
    cell: (info) => `Level ${info.getValue() || "N/A"}`,
  }),
  columnHelper.accessor("status", {
    header: "Status",
    cell: (info) => (
      <span
        className={`px-2 py-1 rounded text-xs font-semibold ${info.getValue() === "Credited"
            ? "bg-green-800 text-green-300"
            : "bg-yellow-800 text-yellow-300"
          }`}
      >
        {info.getValue() || "N/A"}
      </span>
    ),
  }),
];

const ReferralIncomeReportGarbage = () => {
  const [globalFilter, setGlobalFilter] = useState("");
  const [levelFilter, setLevelFilter] = useState("");
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data from the getLevelWiseIncome API
  useEffect(() => {
    const fetchLevelWiseIncome = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
        if (!token) {
          throw new Error("No authentication token found");
        }

        const response = await axios.get(`${appConfig.baseURL}/user/level-wise-income`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("API Response:", response.data); // Debug: Log the full response

        const { data: apiData } = response.data;
        if (!apiData || typeof apiData !== "object" || !apiData.data) {
          throw new Error("Invalid API response: Data is missing or not an object");
        }

        // Flatten the grouped data into a row-based structure with fallback values
        const flattenedData = Object.values(apiData.data).flatMap((levelData) => {
          const level = levelData.level || "N/A";
          return (levelData.referrals || []).map((referral) => ({
            date: referral.joinDate
              ? moment(referral.joinDate).utcOffset(330).format("YYYY-MM-DD HH:mm:ss")
              : "N/A",
            from: referral.name || "N/A",
            deposit: referral.stakeData?.amount || 0,
            levelIncome: referral.earned || 0,
            level: level,
            status: referral.stakeData?.status || "N/A",
          }));
        });

        console.log("Flattened Data:", flattenedData); // Debug: Log the processed data
        setData(flattenedData);
      } catch (err) {
        console.error("Error fetching level-wise income:", err.response?.data || err.message);
        setError(
          err.response?.data?.message ||
          err.message ||
          "Failed to fetch level-wise income data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchLevelWiseIncome();
  }, []);

  const filteredData = useMemo(() => {
    let result = data;
    if (levelFilter) {
      result = result.filter((row) => row.level === levelFilter);
    }
    if (globalFilter) {
      result = result.filter((row) =>
        (row.date?.toLowerCase() || "").includes(globalFilter.toLowerCase()) ||
        (row.from?.toLowerCase() || "").includes(globalFilter.toLowerCase()) ||
        (row.status?.toLowerCase() || "").includes(globalFilter.toLowerCase())
      );
    }
    return result;
  }, [data, levelFilter, globalFilter]);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { globalFilter, pagination },
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredData.map((row) => ({
        Date: moment(row.date).format("YYYY-MM-DD HH:mm:ss"),
        From: row.from,
        "Deposit Amount": `$${row.deposit || 0}`,
        "Level Income": `$${row.levelIncome || 0}`,
        Level: `Level ${row.level}`,
        Status: row.status,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "LevelIncomeReport");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const dataBlob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(dataBlob, "level-income-report.xlsx");
  };

  return (
    <div className="bg-[#12212154] backdrop-blur-xl border border-slate-700 border-gradient shadow-md shadow-slate-800/50 text-white p-6 rounded-md max-w-full mx-auto">
      <div className="flex justify-between mb-6 gap-4 flex-wrap-reverse">
        <h2 className="text-2xl text-primary font-bold">Level Income Report</h2>
        <button
          onClick={exportToExcel}
          disabled={loading || data.length === 0}
          className="px-3 py-1 h-fit text-base border flex items-center justify-center gap-2 border-slate-600 rounded bg-slate-800 hover:bg-slate-700 transition disabled:opacity-50"
          aria-label="Export to Excel"
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
          placeholder="Search name or date..."
          className="flex-1 px-4 py-2 bg-transparent border border-slate-500 rounded text-white focus:outline-none focus:ring-2 focus:ring-primary"
          disabled={loading}
          aria-label="Search by name or date"
        />
        <select
          value={levelFilter}
          onChange={(e) => setLevelFilter(e.target.value)}
          className="px-4 py-2 bg-slate-700 border border-slate-500 rounded focus:outline-none focus:ring-2 focus:ring-primary"
          disabled={loading}
          aria-label="Filter by level"
        >
          <option value="">All Levels</option>
          <option value="1">Level 1</option>
          <option value="2">Level 2</option>
          <option value="3">Level 3</option>
        </select>
      </div>

      <div className="overflow-auto rounded">
        <table className="w-full border-collapse text-sm">

          {loading ?
            <>
              <><SkeletonLoader variant="table" rows={6} /></>
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
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.length > 0 ? (
                  table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      className="hover:bg-slate-800/40 transition text-nowrap"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className="px-4 py-2 border-b border-slate-700"
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="px-4 py-2 text-center text-slate-400"
                    >
                      No data found.
                    </td>
                  </tr>
                )}
              </tbody>
            </>
          }

        </table>
      </div>

      <div className="mt-6 flex md:flex-row flex-col gap-4 items-center justify-between text-sm">
        <div className="text-secondary">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount() || 1}
        </div>
        <div className="space-x-2 flex">
          <button
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage() || loading}
            className="px-3 py-1 border text-xs rounded disabled:opacity-40"
            aria-label="Go to first page"
          >
            First
          </button>
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage() || loading}
            className="px-3 py-1 border text-xs rounded disabled:opacity-40"
            aria-label="Previous page"
          >
            <FaAngleLeft />
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage() || loading}
            className="px-3 py-1 border text-xs rounded disabled:opacity-40"
            aria-label="Next page"
          >
            <FaAngleRight />
          </button>
          <button
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage() || loading}
            className="px-3 py-1 border text-xs rounded disabled:opacity-40"
            aria-label="Go to last page"
          >
            Last
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReferralIncomeReportGarbage;