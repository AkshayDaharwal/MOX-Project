import React, { useState, useMemo, useEffect } from 'react';
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
import moment from 'moment'; // Ensure moment is imported for date handling

const columnHelper = createColumnHelper();

const columns = [
  {
    id: 'sno',
    header: 'Sr.',
    cell: ({ row }) => <span>{row.index + 1}</span>,
  },
  columnHelper.accessor('date', {
    header: 'Date',
    cell: info => info.getValue(),
  }),
  columnHelper.accessor('from', {
    header: 'From',
    cell: info => info.getValue() || 'Unknown', // Placeholder until derived
  }),
  columnHelper.accessor('teamBusiness', {
    header: 'Team Business',
    cell: info => `$${info.getValue()}`,
  }),
  columnHelper.accessor('bonanzaIncome', {
    header: 'Bonanza Income',
    cell: info => `$${info.getValue()}`,
  }),
  columnHelper.accessor('status', {
    header: 'Status',
    cell: info => (
      <span
        className={`px-2 py-1 rounded text-xs font-semibold ${
          info.getValue() === 'Approved'
            ? 'bg-green-800 text-green-300'
            : 'bg-yellow-800 text-yellow-300'
        }`}
      >
        {info.getValue()}
      </span>
    ),
  }),
];

const BonanzaIncomeReport = () => {
  const [globalFilter, setGlobalFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data from the getBonanzaRewards API
  useEffect(() => {
    const fetchBonanzaRewards = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await axios.get(`${appConfig.baseURL}/user/bonanza-rewards`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log('API Response:', response.data); // Debug: Log the full response

        const { data: apiData } = response.data;
        if (!apiData || typeof apiData !== 'object' || !apiData.data) {
          throw new Error('Invalid API response: Data is missing or not an object');
        }

        // Flatten the grouped data into a row-based structure
        const flattenedData = Object.values(apiData.data).flatMap(dateData => {
          return dateData.records.map(record => ({
            date: moment(record.distributionDate).format('YYYY-MM-DD'),
            from: `User-${record.rank || 'N/A'}`, // Placeholder using rank; adjust if username is available
            teamBusiness: record.totalDownlineInvestment || 0,
            bonanzaIncome: record.rewardAmount || 0,
            status: 'Approved', // Default status; adjust if API provides it
          }));
        });

        console.log('Flattened Data:', flattenedData); // Debug: Log the processed data
        setData(flattenedData);
      } catch (err) {
        console.error('Error fetching Bonanza rewards:', err.response?.data || err.message);
        setError(err.message || 'Failed to fetch Bonanza rewards data');
      } finally {
        setLoading(false);
      }
    };

    fetchBonanzaRewards();
  }, []);

  const filteredData = useMemo(() => {
    let result = data;
    if (statusFilter) {
      result = result.filter(row => row.status === statusFilter);
    }
    if (globalFilter) {
      result = result.filter(row =>
        row.date.toLowerCase().includes(globalFilter.toLowerCase()) ||
        (row.from && row.from.toLowerCase().includes(globalFilter.toLowerCase()))
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
    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'BonanzaIncomeReport');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const dataBlob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(dataBlob, 'bonanza-income-report.xlsx');
  };

  return (
    <div className="bg-[#12212154] backdrop-blur-xl border border-slate-700 border-gradient shadow-md shadow-slate-800/50 text-white p-6 rounded-md max-w-full mx-auto">
      <div className="flex justify-between mb-6 gap-4 flex-wrap-reverse">
        <h2 className="text-2xl text-primary font-bold">Level Income Report</h2> {/* Updated title */}
        <button
          onClick={exportToExcel}
          disabled={loading || data.length === 0}
          className="px-3 py-1 h-fit text-base border flex items-center justify-center gap-2 border-slate-600 rounded bg-slate-800 hover:bg-slate-700 transition disabled:opacity-50"
        >
          <PiMicrosoftExcelLogo className="text-green-600" />
          <span>Export</span>
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          value={globalFilter ?? ''}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Search by name..."
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
          <option value="Approved">Approved</option>
          <option value="Pending">Pending</option>
        </select>
      </div>

      <div className="overflow-auto rounded">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-sky-950/40">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
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
            {table.getRowModel().rows.map(row => (
              <tr key={row.id} className="hover:bg-slate-800/40 transition text-nowrap">
                {row.getVisibleCells().map(cell => (
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
    </div>
  );
};

export default BonanzaIncomeReport;