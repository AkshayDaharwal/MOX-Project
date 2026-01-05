import React, { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa';
import { PiMicrosoftExcelLogo } from 'react-icons/pi';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import axios from 'axios';
import { appConfig } from '../../config/appConfig';
import moment from 'moment';
import SkeletonLoader from '../Components/Comman/Skeletons';
import { useQuery } from '@tanstack/react-query';

const columnHelper = createColumnHelper();

const columns = [
  columnHelper.accessor('sr', {
    header: 'Sr.',
    cell: info => info.getValue(),
  }),
  columnHelper.accessor('rank', {
    header: 'Rank',
    cell: info => info.getValue() ?? '—',
  }),
  columnHelper.accessor('rewardAmount', {
    header: 'Reward Amount',
    cell: info => `$${Number(info.getValue() ?? 0).toFixed(2)}`,
  }),
  columnHelper.accessor('teamTotalRoiRewardDistributed', {
    header: 'Team ROI Distributed',
    cell: info => `$${Number(info.getValue() ?? 0).toFixed(2)}`,
  }),
  columnHelper.accessor('totalTeamInvestment', {
    header: 'Total Team Investment',
    cell: info => `$${Number(info.getValue() ?? 0)}`,
  }),
  columnHelper.accessor('stronglegInvestment', {
    header: 'Strong Leg',
    cell: info => `$${Number(info.getValue() ?? 0)}`,
  }),
  columnHelper.accessor('weakestLegInvestment', {
    header: 'Weak Leg',
    cell: info => `$${Number(info.getValue() ?? 0)}`,
  }),
  columnHelper.accessor('distributionDate', {
    header: 'Date',
    cell: info =>
      info.getValue()
        ? moment(info.getValue()).utcOffset(330).format('YYYY-MM-DD HH:mm:ss')
        : '—',
  }),
  columnHelper.accessor('status', {
    header: 'Status',
    cell: info => (
      <span
        className={`px-2 py-1 rounded text-xs font-semibold ${String(info.getValue()).toLowerCase() === 'completed'
          ? 'bg-green-800 text-green-300'
          : 'bg-yellow-800 text-yellow-300'
          }`}
      >
        {String(info.getValue() || 'N/A')}
      </span>
    ),
  }),
];

const fetchLevelIncomeRewards = async () => {
  const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  if (!token) throw new Error('No authentication token found. Please log in.');
  if (!appConfig?.baseURL) throw new Error('Base URL is not configured.');

  const response = await axios.get(`${appConfig.baseURL}/user/level-income-reward`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const root = response?.data?.data;
  if (!root || typeof root !== 'object') {
    throw new Error('Invalid API response format.');
  }

  const selfInvestment = Number(root.selfInvestment || 0);
  const teamInvestment = Number(root.teamInvestment || 0);
  const grouped = root.data || {};

  const flattened = Object.values(grouped).flatMap((dateGroup) => {
    const records = dateGroup?.records || [];
    return records.map((r) => ({
      sr: r?.sr ?? '',
      rank: r?.rank ?? '',
      rewardAmount: r?.rewardAmount ?? 0,
      teamTotalRoiRewardDistributed: r?.teamTotalRoiRewardDistributed ?? 0,
      totalTeamInvestment: r?.totalTeamInvestment ?? 0,
      stronglegInvestment: r?.stronglegInvestment ?? 0,
      weakestLegInvestment: r?.weakestLegInvestment ?? 0,
      distributionDate: r?.distributionDate ?? '',
      status: r?.status ?? 'N/A',
    }));
  });

  return { data: flattened, selfInvestment, teamInvestment };
};

const LevelIncomeReport = () => {
  const [globalFilter, setGlobalFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['levelIncomeReport'],
    queryFn: fetchLevelIncomeRewards,
    staleTime: 1000 * 60 * 2,
    cacheTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  const filteredData = useMemo(() => {
    let result = data?.data || [];
    if (statusFilter) {
      result = result.filter(
        (row) => String(row.status).toLowerCase() === String(statusFilter).toLowerCase()
      );
    }
    if (globalFilter) {
      const q = globalFilter.toLowerCase();
      result = result.filter(
        (row) =>
          String(row.rank || '').toLowerCase().includes(q) ||
          String(row.status || '').toLowerCase().includes(q)
      );
    }
    return result;
  }, [data, statusFilter, globalFilter]);

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
    const worksheet = XLSX.utils.json_to_sheet(
      filteredData.map((row) => ({
        Sr: row.sr,
        Rank: row.rank,
        'Reward Amount': row.rewardAmount,
        'Team ROI Distributed': row.teamTotalRoiRewardDistributed,
        'Total Team Investment': row.totalTeamInvestment,
        'Strong Leg': row.stronglegInvestment,
        'Weak Leg': row.weakestLegInvestment,
        Date: row.distributionDate
          ? moment(row.distributionDate).utcOffset(330).format('YYYY-MM-DD HH:mm:ss')
          : '',
        Status: row.status,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'LevelIncomeReport');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const dataBlob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(dataBlob, 'level-income-report.xlsx');
  };

  return (
    <div className="bg-[#12212154] backdrop-blur-xl border border-slate-700 border-gradient shadow-md shadow-slate-800/50 text-white p-6 rounded-md max-w-full mx-auto">
      <div className="flex justify-between mb-6 gap-4 flex-wrap-reverse">
        <h2 className="text-2xl text-primary font-bold">Level Income Report</h2>
        <button
          onClick={exportToExcel}
          disabled={isLoading || filteredData.length === 0}
          className="px-3 py-1 h-fit text-base border flex items-center justify-center gap-2 border-slate-600 rounded bg-slate-800 hover:bg-slate-700 transition disabled:opacity-50"
        >
          <PiMicrosoftExcelLogo className="text-green-600" />
          <span>Export</span>
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="rounded-2xl p-4 bg-gradient-to-br from-slate-800/60 to-slate-900/40 border border-slate-700 shadow">
          <div className="text-sm text-slate-300">Self Investment</div>
          <div className="text-2xl font-semibold mt-1">${data?.selfInvestment || 0}</div>
        </div>
        <div className="rounded-2xl p-4 bg-gradient-to-br from-slate-800/60 to-slate-900/40 border border-slate-700 shadow">
          <div className="text-sm text-slate-300">Team Investment</div>
          <div className="text-2xl font-semibold mt-1">${data?.teamInvestment || 0}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          value={globalFilter ?? ''}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Search by rank or status..."
          className="flex-1 px-4 py-2 bg-transparent border border-slate-500 rounded text-white focus:outline-none"
          disabled={isLoading}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 bg-slate-700 border border-slate-500 rounded focus:outline-none"
          disabled={isLoading}
        >
          <option value="">All Status</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-auto rounded">
        <table className="w-full border-collapse text-sm">
          {isLoading ? (
            <><SkeletonLoader variant="table" rows={6} /></>
          ) : (
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
                {isError ? (
                  <tr>
                    <td colSpan={columns.length} className="px-4 py-6 text-center text-red-300">
                      {error.message}
                    </td>
                  </tr>
                ) : table.getRowModel().rows.length ? (
                  table.getRowModel().rows.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-800/40 transition text-nowrap">
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-4 py-2 border-b border-slate-700">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={columns.length} className="px-4 py-6 text-center text-slate-400">
                      No data found.
                    </td>
                  </tr>
                )}
              </tbody>
            </>
          )}
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-6 flex md:flex-row flex-col gap-4 items-center justify-between text-sm">
        <div className="text-secondary">
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
        </div>
        <div className="space-x-2 flex">
          <button
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage() || isLoading}
            className="px-3 py-1 border text-xs rounded disabled:opacity-40"
          >
            First
          </button>
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage() || isLoading}
            className="px-3 py-1 border text-xs rounded disabled:opacity-40"
          >
            <FaAngleLeft />
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage() || isLoading}
            className="px-3 py-1 border text-xs rounded disabled:opacity-40"
          >
            <FaAngleRight />
          </button>
          <button
            onClick={() => table.setPageIndex(Math.max(table.getPageCount() - 1, 0))}
            disabled={!table.getCanNextPage() || isLoading}
            className="px-3 py-1 border text-xs rounded disabled:opacity-40"
          >
            Last
          </button>
        </div>
      </div>
    </div>
  );
};

export default LevelIncomeReport;
