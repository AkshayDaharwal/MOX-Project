import React, { useMemo, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import { PiMicrosoftExcelLogo } from 'react-icons/pi';
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

// 📄 Dummy team data
const fullData = [
  { id: 'U101', name: 'Aarav', level: 1, plan: 'Basic', joinDate: '2025-07-21' },
  { id: 'U102', name: 'Diya', level: 2, plan: 'Premium', joinDate: '2025-07-22' },
  { id: 'U103', name: 'Kabir', level: 1, plan: 'Standard', joinDate: '2025-07-23' },
  { id: 'U104', name: 'Meera', level: 3, plan: 'Basic', joinDate: '2025-07-24' },
  { id: 'U105', name: 'Rohan', level: 2, plan: 'Premium', joinDate: '2025-07-25' },
  { id: 'U106', name: 'Tara', level: 4, plan: 'Standard', joinDate: '2025-07-26' },
  { id: 'U107', name: 'Yash', level: 1, plan: 'Basic', joinDate: '2025-07-27' },
  { id: 'U108', name: 'Zara', level: 2, plan: 'Premium', joinDate: '2025-07-28' },
];

const columnHelper = createColumnHelper();

const columns = [
  {
    id: 'sno',
    header: 'S.No',
    cell: ({ row }) => <div className="text-sm text-secondary">{row.index + 1}</div>,
  },
  columnHelper.accessor('id', {
    header: 'ID',
    cell: info => info.getValue(),
  }),
  columnHelper.accessor('name', {
    header: 'Name',
    cell: info => info.getValue(),
  }),
  columnHelper.accessor('level', {
    header: 'Level',
    cell: info => `Level ${info.getValue()}`,
  }),
  columnHelper.accessor('plan', {
    header: 'Plan',
    cell: info => info.getValue(),
  }),
  columnHelper.accessor('joinDate', {
    header: 'Join Date',
    cell: info => info.getValue(),
  }),
];

const TeamDownline = () => {
  const [globalFilter, setGlobalFilter] = useState('');
  const [planFilter, setPlanFilter] = useState('');
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const filteredData = useMemo(() => {
    return planFilter
      ? fullData.filter(row => row.plan === planFilter)
      : fullData;
  }, [planFilter]);

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
    XLSX.utils.book_append_sheet(workbook, worksheet, 'TeamDownline');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(data, 'team-downline.xlsx');
  };

  return (
    <div className="bg-[#12212154] backdrop-blur-xl border border-slate-700 border-gradient shadow-md shadow-slate-800/50 text-white p-6 rounded-md max-w-full mx-auto">
      <div className="flex justify-between mb-6 gap-4 flex-wrap-reverse">
        <h2 className="text-2xl text-primary font-bold">Team Downline</h2>
        <button
          onClick={exportToExcel}
          className="px-3 py-1 h-fit text-base border flex items-center justify-center gap-2 border-slate-600 rounded bg-slate-800 hover:bg-slate-700 transition">
          <PiMicrosoftExcelLogo className="text-green-600" />
          <span>Export</span>
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          value={globalFilter ?? ''}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Search by name or ID..."
          className="flex-1 px-4 py-2 bg-transparent border border-slate-500 rounded text-white focus:outline-none"
        />
        <select
          value={planFilter}
          onChange={(e) => setPlanFilter(e.target.value)}
          className="px-4 py-2 bg-transparent bg-slate-700 border border-slate-500 rounded focus:outline-none"
        >
          <option value="" className="bg-slate-700 text-white">All Plans</option>
          <option value="Basic" className="bg-slate-700 text-white">Basic</option>
          <option value="Standard" className="bg-slate-700 text-white">Standard</option>
          <option value="Premium" className="bg-slate-700 text-white">Premium</option>
        </select>
      </div>

      <div className="overflow-auto rounded">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-sky-950/40">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id} className="text-left px-4 py-2 border-b border-slate-700 text-primary text-nowrap">
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
            disabled={!table.getCanPreviousPage()}
            className="px-3 py-1 border text-xs md:text-sm rounded disabled:opacity-40"
          >First</button>
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="px-3 py-1 border text-xs md:text-sm rounded disabled:opacity-40"
          ><FaAngleLeft /></button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="px-3 py-1 border text-xs md:text-sm rounded disabled:opacity-40"
          ><FaAngleRight /></button>
          <button
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            className="px-3 py-1 border text-xs md:text-sm rounded disabled:opacity-40"
          >Last</button>
        </div>
      </div>
    </div>
  );
};

export default TeamDownline;
