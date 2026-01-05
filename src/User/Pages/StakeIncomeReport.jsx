import { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import { useQuery } from '@tanstack/react-query';
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa';
import { PiMicrosoftExcelLogo } from 'react-icons/pi';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import axios from 'axios';
import { appConfig } from '../../config/appConfig';
import moment from 'moment';
import SkeletonLoader from '../Components/Comman/Skeletons';

const columnHelper = createColumnHelper();

const columns = [
  {
    id: 'sno',
    header: 'S.No',
    cell: ({ row }) => <div>{row.index + 1}</div>,
  },
  columnHelper.accessor('date', {
    header: 'Date',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('packageId', {
    header: 'Package ID',
    cell: (info) => info.getValue() || 'N/A',
  }),
  columnHelper.accessor('amount1', {
    header: 'Amount',
    cell: (info) => `$${info.getValue().toFixed(2)}`,
  }),
  columnHelper.accessor('roi', {
    header: 'ROI',
    cell: (info) => `${info.getValue().toFixed(2)}%`,
  }),
  columnHelper.accessor('roiAmount', {
    header: 'ROI Amount',
    cell: (info) => `$${info.getValue().toFixed(2)}`,
  }),
  columnHelper.accessor('status', {
    header: 'Status',
    cell: (info) => (
      <span
        className={`px-2 py-1 rounded text-xs font-semibold ${info.getValue() === 'Credited'
            ? 'bg-green-800 text-green-300'
            : 'bg-yellow-800 text-yellow-300'
          }`}
      >
        {info.getValue()}
      </span>
    ),
  }),
];

// 🔹 API fetcher wrapped for React Query
const fetchDailyROI = async () => {
  const token =
    localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  if (!token) throw new Error('No authentication token found');

  const response = await axios.get(`${appConfig.baseURL}/user/daily-roi`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const { data: apiData } = response.data;
  if (!apiData || typeof apiData !== 'object') {
    throw new Error('Invalid API response: Data is missing or not an object');
  }

  // Flatten grouped response
  const flattenedData = Object.keys(apiData.data).flatMap((date) => {
    const dateRecords = apiData.data[date].records || [];
    if (!Array.isArray(dateRecords)) return [];
    return dateRecords.map((record) => ({
      date: moment(record.distributionDate)
        .utcOffset(330)
        .format('YYYY-MM-DD HH:mm:ss'),
      planName: record.planName || 'Unknown',
      packageId: record.stakeId || 'N/A',
      amount1: record.stakeAmount || 0,
      roi: record.dailyROI || 0,
      roiAmount: record.amount || 0,
      status: 'Credited', // hardcoded
    }));
  });

  return flattenedData;
};

const StakeIncomeReport = () => {
  const [globalFilter, setGlobalFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  // 🔹 React Query for fetching + caching
  const {
    data = [],
    isLoading: loading,
    isError,
    error,
  } = useQuery({
    queryKey: ['dailyROI'],
    queryFn: fetchDailyROI,
    staleTime: 1000 * 60 * 2, // 2 mins fresh
    cacheTime: 1000 * 60 * 5, // 5 mins cache
    refetchOnWindowFocus: false,
  });

  // 🔹 Filtering
  const filteredData = useMemo(() => {
    let result = data;
    if (statusFilter) {
      result = result.filter((row) => row.status === statusFilter);
    }
    if (globalFilter) {
      result = result.filter(
        (row) =>
          row.date.toLowerCase().includes(globalFilter.toLowerCase()) ||
          (row.planName &&
            row.planName.toLowerCase().includes(globalFilter.toLowerCase())) ||
          (row.packageId &&
            row.packageId.toLowerCase().includes(globalFilter.toLowerCase())) ||
          row.status.toLowerCase().includes(globalFilter.toLowerCase())
      );
    }
    return result;
  }, [data, statusFilter, globalFilter]);

  // 🔹 Table instance
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

  // 🔹 Excel Export
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'StakeIncomeReport');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, 'stake-income-report.xlsx');
  };

  return (
    <div className="bg-[#12212154] backdrop-blur-xl border shadow-md shadow-slate-800/50 text-white p-6 border-gradient max-w-full mx-auto">
      <div className="flex justify-between mb-6 gap-4 flex-wrap-reverse">
        <h2 className="text-2xl text-primary font-bold">Stake Income Report</h2>
        <button
          onClick={exportToExcel}
          disabled={loading || data.length === 0}
          className="px-3 py-1 h-fit text-base border flex items-center gap-2 border-slate-600 rounded bg-slate-800 hover:bg-slate-700 transition disabled:opacity-50"
        >
          <PiMicrosoftExcelLogo className="text-green-600" />
          <span>Export</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Search plan, package ID, or status..."
          className="flex-1 px-4 py-2 bg-transparent border border-slate-500 rounded text-white focus:outline-none"
          disabled={loading}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 bg-slate-700 border border-slate-500 rounded focus:outline-none"
          disabled={loading}
        >
          <option value="">All Status</option>
          <option value="Credited">Credited</option>
          <option value="Pending">Pending</option>
        </select>
      </div>

      {loading ? (
        <div className="overflow-auto rounded">
          <SkeletonLoader variant="table" rows={6} />
        </div>
      ) : isError ? (
        <p className="text-center text-sm text-red-400 mt-4">{error.message}</p>
      ) : (
        <>
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
                ))}
              </tbody>
            </table>

            {table.getRowModel().rows.length === 0 && (
              <p className="text-center text-sm text-slate-400 mt-4">No data found.</p>
            )}
          </div>

          {/* Pagination */}
          <div className="mt-6 flex md:flex-row flex-col gap-4 items-center justify-between text-sm">
            <div className="text-secondary">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </div>
            <div className="space-x-2 flex">
              <button
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage() || loading}
                className="px-3 py-1 border text-xs rounded disabled:opacity-40"
              >
                First
              </button>
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage() || loading}
                className="px-3 py-1 border text-xs rounded disabled:opacity-40"
              >
                <FaAngleLeft />
              </button>
              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage() || loading}
                className="px-3 py-1 border text-xs rounded disabled:opacity-40"
              >
                <FaAngleRight />
              </button>
              <button
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage() || loading}
                className="px-3 py-1 border text-xs rounded disabled:opacity-40"
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

export default StakeIncomeReport;
