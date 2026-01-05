import { useMemo, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "../../Service/adminApi";
import { toast } from "react-toastify";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table";

const StakePlansReport = () => {
  const [searchInput, setSearchInput] = useState("");

  const { data: stakePlans = [], isLoading, isError, error } = useQuery({
    queryKey: ["stakePlansReport"],
    queryFn: async () => {
      const res = await adminApi.getUserStakePlans();
      const stakedPlans = res?.data?.stakedPlans || [];
      if (!Array.isArray(stakedPlans)) {
        throw new Error("Invalid response: stakedPlans array not found");
      }
      return stakedPlans;
    },
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });

  // Set up TanStack Table
  const table = useReactTable({
    data: stakePlans,
    columns: useMemo(
      () => [
        {
          accessorKey: "sNo",
          header: "S.No.",
          cell: ({ row }) => row.index + 1,
        },
        {
          accessorKey: "userId.username",
          header: "Username",
          cell: ({ getValue }) => getValue() || "N/A",
        },
        {
          accessorKey: "amount",
          header: "Amount ($)",
          cell: ({ getValue }) => Number(getValue() || 0).toFixed(2),
        },
        {
          accessorKey: "packageName",
          header: "Package Name",
          cell: ({ getValue }) => getValue() || "N/A",
        },
        {
          accessorKey: "userId.package",
          header: "Package ID",
          cell: ({ getValue }) => getValue() || "N/A",
        },
        {
          accessorKey: "investment",
          header: "Investment ($)",
          cell: ({ getValue }) => Number(getValue() || 0).toFixed(2),
        },
        {
          accessorKey: "dailyROI",
          header: "Daily ROI (%)",
          cell: ({ getValue }) => Number(getValue() || 0).toFixed(2),
        },
        {
          accessorKey: "lockingPeriodDays",
          header: "Locking Period (Days)",
          cell: ({ getValue }) => getValue() || 0,
        },
        {
          accessorKey: "createdAt",
          header: "Created At",
          cell: ({ getValue }) =>
            getValue() ? new Date(getValue()).toLocaleString("en-IN", {
                  timeZone: "Asia/Kolkata",
                }) : "N/A",
        },
        {
          accessorKey: "startDate",
          header: "Start Date / Reinvested At",
          cell: ({ getValue }) =>
            getValue() ? new Date(getValue()).toLocaleString("en-IN", {
                  timeZone: "Asia/Kolkata",
                }) : "N/A",
        },
        {
          accessorKey: "lockUntil",
          header: "Lock Until",
          cell: ({ getValue }) =>
            getValue() ? new Date(getValue()).toLocaleString("en-IN", {
                  timeZone: "Asia/Kolkata",
                }) : "N/A",
        },
        {
          accessorKey: "isLockingPeriodActive",
          header: "Lock Active",
          cell: ({ getValue }) => (getValue() ? "Yes" : "No"),
        },
        // {
        //   accessorKey: "status",
        //   header: "Status",
        //   cell: ({ getValue }) => getValue() || "N/A",
        // },
        {
          accessorKey: "isSwapped",
          header: "Swapped",
          cell: ({ getValue }) => (getValue() ? "Yes" : "No"),
        },
        {
          accessorKey: "isReinvested",
          header: "Reinvested",
          cell: ({ getValue }) => (getValue() ? "Yes" : "No"),
        },
        {
          accessorKey: "isTransferred",
          header: "Transferred",
          cell: ({ getValue }) => (getValue() ? "Yes" : "No"),
        },
      ],
      []
    ),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: { globalFilter: searchInput },
    onGlobalFilterChange: setSearchInput,
    globalFilterFn: (row, columnId, filterValue) => {
      const value = row.getValue(columnId);
      return value
        ? String(value).toLowerCase().includes(filterValue.toLowerCase())
        : false;
    },
    initialState: { pagination: { pageSize: 10 } },
  });

  // Export PDF
  const handleExportPDF = () => {
    if (stakePlans.length === 0) {
      toast.error("No data to export");
      return;
    }
    const doc = new jsPDF("landscape");
    const columns = table.getAllColumns().map((col) => col.columnDef.header);
    const data = table
      .getPrePaginationRowModel()
      .rows.map((row) =>
        columns.map((col) => {
          const value = row.getValue(col.id);
          if (col.id.includes("createdAt") || col.id.includes("lockUntil")) {
            return value ? new Date(value).toLocaleDateString() : "N/A";
          }
          if (col.id.includes("isLockingPeriodActive") || col.id.includes("isSwapped") || col.id.includes("isReinvested") || col.id.includes("isTransferred")) {
            return value ? "Yes" : "No";
          }
          return String(value || "N/A");
        })
      );

    doc.setFontSize(16);
    doc.text("Stake Plans Report", 14, 15);
    autoTable(doc, {
      head: [columns],
      body: data,
      startY: 25,
      theme: "striped",
      headStyles: { fillColor: [16, 57, 68], textColor: [255, 255, 255] },
      styles: { fontSize: 8, cellPadding: 2 },
      margin: { top: 20 },
    });
    doc.save("stake_plans_report.pdf");
  };

  // Export Excel
  const handleExportExcel = () => {
    if (stakePlans.length === 0) {
      toast.error("No data to export");
      return;
    }
    const data = table.getPrePaginationRowModel().rows.map((row) => {
      const rowData = {};
      table.getAllColumns().forEach((col) => {
        const value = row.getValue(col.id);
        if (col.id.includes("createdAt") || col.id.includes("lockUntil") || col.id.includes("packageStartDate")) {
          rowData[col.columnDef.header] = value ? new Date(value).toLocaleDateString() : "N/A";
        } else if (col.id.includes("isLockingPeriodActive") || col.id.includes("isSwapped") || col.id.includes("isReinvested") || col.id.includes("isTransferred")) {
          rowData[col.columnDef.header] = value ? "Yes" : "No";
        } else {
          rowData[col.columnDef.header] = String(value || "N/A");
        }
      });
      return rowData;
    });
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "StakePlansReport");
    XLSX.writeFile(workbook, "stake_plans_report.xlsx");
  };

  // Loading / Error states
  if (isLoading) {
    return (
      <div className="p-4 max-w-[1260px] mx-auto">
        <h2 className="text-2xl font-bold mb-4 text-[#103944]">
          Stake Plans Report
        </h2>
        <p className="text-gray-600">Loading stake plans...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 max-w-[1260px] mx-auto">
        <h2 className="text-2xl font-bold mb-4 text-[#103944]">
          Stake Plans Report
        </h2>
        <p className="text-red-600">
          Error: {error?.message || "Failed to load stake plans data."}
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 flex-1 text-nowrap max-w-[1260px] mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-[#103944]">
        Stake Plans Report
      </h2>

      <div className="mb-4 flex flex-col md:flex-row items-center justify-between">
        <div className="flex gap-2 mb-4 md:mb-0">
          <button
            onClick={handleExportPDF}
            className="bg-red-500 text-white px-4 py-2 rounded mr-2 hover:bg-red-600 text-sm"
          >
            Export PDF
          </button>
          <button
            onClick={handleExportExcel}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 text-sm"
          >
            Export Excel
          </button>
        </div>
        <div className="flex items-center w-full md:w-auto">
          <input
            placeholder="Search stake plans..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="border border-gray-300 rounded px-4 py-2 w-full max-w-xs focus:outline-none focus:ring-2 focus:ring-[#103944]"
            aria-label="Search stake plans"
          />
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded shadow-md border border-gray-200 p-4">
        <table className="min-w-[100%] w-full text-sm border" role="grid">
          <thead className="bg-[#103944] text-white sticky top-0">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="p-2 border whitespace-nowrap min-w-[100px]"
                    scope="col"
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
              <tr key={row.id} className="hover:bg-gray-100" role="row">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="p-2 border whitespace-nowrap">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-end mt-4">
        <span className="text-sm text-gray-600 mr-4">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className={`bg-[#103944] text-white px-4 py-2 rounded ${
              !table.getCanPreviousPage()
                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                : "hover:bg-[#0e9d52]"
            }`}
            aria-label="Previous page"
          >
            Prev
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className={`bg-[#103944] text-white px-4 py-2 rounded ${
              !table.getCanNextPage()
                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                : "hover:bg-[#0e9d52]"
            }`}
            aria-label="Next page"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default StakePlansReport;