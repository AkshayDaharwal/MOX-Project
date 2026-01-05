import { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import { PiMicrosoftExcelLogo } from "react-icons/pi";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import { appConfig } from "../../config/appConfig";
import SkeletonLoader from "../Components/Comman/Skeletons";

const columnHelper = createColumnHelper();

const columns = [
  {
    id: "sno",
    header: "S.No",
    cell: ({ row }) => <div className="text-sm text-secondary">{row.index + 1}</div>,
  },
  columnHelper.accessor("id", {
    header: "ID",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("userName", {
    header: "Username",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("level", {
    header: "Level",
    cell: (info) => `Level ${info.getValue()}`,
  }),
  columnHelper.accessor("plan", {
    header: "Plan",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("joinDate", {
    header: "Join Date",
    cell: (info) => info.getValue(),
  }),
];

const LevelWiseTeam = () => {
  const [globalFilter, setGlobalFilter] = useState("");
  const [levelFilter, setLevelFilter] = useState("");
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const navigate = useNavigate();

  const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");

  // Fetch data using useQuery
  const { data: fullData = [], isLoading, isError, error } = useQuery({
    queryKey: ["levelWiseTeam", token],
    queryFn: async () => {
      if (!token) {
        throw new Error("Authentication token not found. Please log in.");
      }

      const response = await fetch(`${appConfig.baseURL}/user/referral-level-wise-team`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();
      if (!result.data?.data || typeof result.data.data !== "object") {
        throw new Error("Invalid referral data received from the server");
      }

      return transformApiData(result.data.data);
    },
    enabled: !!token,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
    onError: (err) => {
      if (err.message.includes("Invalid token")) {
        navigate("/user/login");
      }
    },
  });

  // Transform API data to match fullData structure
  const transformApiData = (levelWiseData) => {
    const flattenedData = [];
    for (const level in levelWiseData) {
      const users = levelWiseData[level] || [];
      users.forEach((user) => {
        flattenedData.push({
          id: user.id || "N/A",
          userName: user.userName || "Unknown",
          level: parseInt(level) || 0,
          plan: user.plan || "N/A",
          joinDate: user.joinDate
            ? moment(user.joinDate).utcOffset(330).format("YYYY-MM-DD HH:mm:ss")
            : "N/A",
        });
      });
    }
    return flattenedData;
  };

  const filteredData = useMemo(() => {
    let data = fullData;
    if (levelFilter) {
      data = data.filter((row) => row.level === parseInt(levelFilter));
    }
    if (globalFilter) {
      data = data.filter(
        (row) =>
          row.userName.toLowerCase().includes(globalFilter.toLowerCase()) ||
          row.id.toLowerCase().includes(globalFilter.toLowerCase())
      );
    }
    return data;
  }, [fullData, levelFilter, globalFilter]);

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
    XLSX.utils.book_append_sheet(workbook, worksheet, "LevelWiseTeam");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, "level-wise-team.xlsx");
  };

  return (
    <div className="bg-[#12212154] backdrop-blur-xl border border-slate-700 border-gradient shadow-md shadow-slate-800/50 text-white p-6 rounded-md max-w-full mx-auto">
      <div className="flex justify-between mb-6 gap-4 flex-wrap-reverse">
        <h2 className="text-2xl text-primary font-bold">Level Wise Team</h2>
        <button
          onClick={exportToExcel}
          className="px-3 py-1 h-fit text-base border flex items-center justify-center gap-2 border-slate-600 rounded bg-slate-800 hover:bg-slate-700 transition"
        >
          <PiMicrosoftExcelLogo className="text-green-600" />
          <span>Export</span>
        </button>
      </div>

      {isLoading ? (
        <>
          <div className="overflow-auto rounded">
            <SkeletonLoader variant="table" rows={10} />
          </div>
        </>
      ) : isError ? (
        <p className="text-center text-sm text-red-500 py-4">
          {error?.message || "Failed to fetch referral data. Please try again later."}
        </p>
      ) : (
        <>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <input
              type="text"
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Search by username or ID..."
              className="flex-1 px-4 py-2 bg-transparent border border-slate-500 rounded text-white focus:outline-none"
            />
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="px-4 py-2 bg-transparent bg-slate-700 border border-slate-500 rounded focus:outline-none"
            >
              <option value="" className="bg-slate-700 text-white">
                All Levels
              </option>
              <option value="1" className="bg-slate-700 text-white">
                Level 1
              </option>
              <option value="2" className="bg-slate-700 text-white">
                Level 2
              </option>
              <option value="3" className="bg-slate-700 text-white">
                Level 3
              </option>
            </select>
          </div>

          <div className="overflow-auto rounded">
            <table className="w-full border-collapse text-sm">
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
            </table>

            {table.getRowModel().rows.length === 0 && (
              <p className="text-center text-sm text-slate-400 mt-4">No data found.</p>
            )}
          </div>

          <div className="mt-6 flex md:flex-row flex-col gap-4 items-center justify-between text-sm">
            <div className="text-secondary">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </div>
            <div className="space-x-2 flex">
              <button
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
                className="px-3 py-1 border text-xs md:text-sm rounded disabled:opacity-40"
              >
                First
              </button>
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="px-3 py-1 border text-xs md:text-sm rounded disabled:opacity-40"
              >
                <FaAngleLeft />
              </button>
              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="px-3 py-1 border text-xs md:text-sm rounded disabled:opacity-40"
              >
                <FaAngleRight />
              </button>
              <button
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
                className="px-3 py-1 border text-xs md:text-sm rounded disabled:opacity-40"
              >
                Last
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LevelWiseTeam;