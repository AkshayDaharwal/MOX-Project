import React, { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import { useQuery } from '@tanstack/react-query';
import { FaAngleLeft, FaAngleRight, FaCopy } from 'react-icons/fa';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { PiMicrosoftExcelLogo } from 'react-icons/pi';
import axios from 'axios';
import { toast } from 'react-toastify';
import moment from 'moment';
import { appConfig } from '../../config/appConfig';
import SkeletonLoader from '../Components/Comman/Skeletons';

const columnHelper = createColumnHelper();

const columns = [
  {
    id: 'sno',
    header: 'S.No',
    cell: ({ row }) => (
      <div className="text-left text-sm text-secondary">{row.index + 1}</div>
    ),
  },
  columnHelper.accessor('transactionHash', {
    header: 'Transaction Hash',
    cell: ({ getValue }) => {
      const hash = getValue() || 'N/A';
      const shortHash =
        hash !== 'N/A' ? `${hash.slice(0, 6)}...${hash.slice(-4)}` : 'N/A';
      const fullHash = getValue() || '';

      const copyToClipboard = () => {
        navigator.clipboard.writeText(fullHash);
        toast.success('Transaction hash copied to clipboard!', {
          icon: <FaCopy className="text-primary" />,
          autoClose: 2000,
        });
      };

      return (
        <div className="flex items-center gap-2">
          <span className="text-sm truncate">{shortHash}</span>
          {hash !== 'N/A' && (
            <button
              onClick={copyToClipboard}
              className="text-sky-400 hover:text-sky-300 text-sm"
              title="Copy transaction hash"
            >
              <FaCopy />
            </button>
          )}
        </div>
      );
    },
  }),
  columnHelper.accessor('currencyType', {
    header: 'Currency Type',
    cell: (info) => info.getValue() || 'N/A',
  }),
  columnHelper.accessor('amount', {
    header: 'Amount',
    cell: (info) => `$${info.getValue() || 0}`,
  }),
  columnHelper.accessor('walletType', {
    header: 'Wallet Type',
    cell: (info) => info.getValue() || 'Unknown',
  }),
  columnHelper.accessor('date', {
    header: 'Date',
    cell: (info) => info.getValue() || 'N/A',
  }),
  columnHelper.accessor('status', {
    header: 'Status',
    cell: (info) => info.getValue() || 'N/A',
  }),
];

// 🔹 API call wrapped for React Query
const fetchDeposits = async () => {
  const token =
    localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  if (!token) {
    throw new Error('No authentication token found. Please log in.');
  }

  const response = await axios.get(`${appConfig.baseURL}/user/userDeposits`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const apiDeposits = response.data.data.deposits;

  return apiDeposits.map((deposit) => ({
    id: deposit._id,
    transactionHash: deposit.transactionHash || 'N/A',
    amount: deposit.amount,
    walletType: deposit.walletType,
    currencyType: deposit.currencyType || 'Unknown',
    date: moment(deposit.createdAt).utcOffset(330).format('YYYY-MM-DD HH:mm:ss'),
    status: deposit.status || 'Pending',
  }));
};

const DepositReport = () => {
  const [globalFilter, setGlobalFilter] = useState('');
  const [walletFilter, setWalletFilter] = useState('');
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // ✅ TanStack Query hook
  const {
    data: deposits = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['deposits'],
    queryFn: fetchDeposits,
    staleTime: 1000 * 60 * 2, // data considered fresh for 2 min
    cacheTime: 1000 * 60 * 5, // cache kept for 5 min
    refetchOnWindowFocus: false,
  });

  // 🔹 Filtered data
  const filteredData = useMemo(() => {
    let data = deposits;
    if (walletFilter) {
      data = data.filter((row) => row.walletType === walletFilter);
    }
    if (globalFilter) {
      data = data.filter(
        (row) =>
          row.transactionHash
            .toLowerCase()
            .includes(globalFilter.toLowerCase()) ||
          row.currencyType.toLowerCase().includes(globalFilter.toLowerCase()) ||
          row.walletType.toLowerCase().includes(globalFilter.toLowerCase()) ||
          row.status.toLowerCase().includes(globalFilter.toLowerCase())
      );
    }
    return data;
  }, [walletFilter, globalFilter, deposits]);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      globalFilter,
      pagination,
    },
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  // Excel export
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'DepositReport');
    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });
    const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(data, 'deposit-report.xlsx');
  };

  return (
    <div className="bg-[#12212154] backdrop-blur-xl border border-slate-700 border-gradient shadow-md shadow-slate-800/50 text-white p-6 rounded-md max-w-full mx-auto">
      <div className="flex justify-between mb-6 gap-4 flex-wrap-reverse">
        <h2 className="text-2xl text-primary font-bold">Deposit Report</h2>
        <button
          onClick={exportToExcel}
          className="px-3 py-1 h-fit text-base border flex items-center justify-center gap-2 border-slate-600 rounded bg-slate-800 hover:bg-slate-700 transition"
        >
          <PiMicrosoftExcelLogo className="text-green-600" /> <span>Export</span>
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          value={globalFilter ?? ''}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Search transaction hash, currency, wallet, or status..."
          className="flex-1 px-4 py-2 bg-transparent border border-slate-500 rounded text-white focus:outline-none"
        />
        <select
          value={walletFilter}
          onChange={(e) => setWalletFilter(e.target.value)}
          className="px-4 py-2 bg-transparent bg-slate-700 border border-slate-500 rounded focus:outline-none"
        >
          <option value="" className="bg-slate-700 text-white">
            All Wallets
          </option>
          <option value="Principle" className="bg-slate-700 text-white">
            Principle Wallet
          </option>
          <option value="My Wallet" className="bg-slate-700 text-white">
            My Wallet
          </option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-auto rounded">
        <table className="w-full border-collapse text-sm">
          {isLoading ? (
            <SkeletonLoader variant="table" />
          ) : isError ? (
            <p className="text-red-500 p-4">{error.message}</p>
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
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </>
          )}
        </table>

        {table.getRowModel().rows.length === 0 && !isLoading && (
          <p className="text-center text-sm text-slate-400 mt-4">No data found.</p>
        )}
      </div>

      {/* Pagination Controls */}
      <div className="mt-6 flex md:flex-row flex-col gap-4 items-center justify-between text-sm">
        <div className="text-secondary">
          Page {table.getState().pagination.pageIndex + 1} of{' '}
          {table.getPageCount()}
        </div>
        <div className="space-x-2 flex">
          <button
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            className="px-3 py-1 border md:text-sm text-xs rounded disabled:opacity-40"
          >
            First
          </button>
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="px-3 py-1 border md:text-sm text-xs rounded disabled:opacity-40"
          >
            <FaAngleLeft />
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="px-3 py-1 border md:text-sm text-xs rounded disabled:opacity-40"
          >
            <FaAngleRight />
          </button>
          <button
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            className="px-3 py-1 border md:text-sm text-xs rounded disabled:opacity-40"
          >
            Last
          </button>
        </div>
      </div>
    </div>
  );
};

export default DepositReport;
