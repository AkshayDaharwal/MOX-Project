import React, { useMemo, useState } from "react";
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

const LevelIncomeRewards = () => {
  // Move currentPage state declaration before useQuery
  const [currentPage, setCurrentPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const rowsPerPage = 10;

  // Fetch API data with server-side pagination
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["levelIncomeRewards", searchInput, currentPage, rowsPerPage],
    queryFn: async () => {
      const res = await adminApi.getLevelIncomeReport(currentPage, rowsPerPage);
      return {
        records: res?.data?.data || [],
        pagination: res?.data?.pagination || { page: 1, pages: 1, total: 0 },
      };
    },
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  });

  const levelRewards = data?.records || [];
  const pagination = data?.pagination || { page: 1, pages: 1, total: 0 };

  // Set up TanStack Table
  const table = useReactTable({
    data: levelRewards,
    columns: useMemo(
      () => [
        {
          accessorKey: "sr",
          header: "Sr No.",
          cell: ({ row }) => row.index + 1 + (currentPage - 1) * rowsPerPage,
        },
        {
          accessorKey: "username",
          header: "Username",
          cell: ({ getValue }) => getValue() || "N/A",
        },
        {
          accessorKey: "rank",
          header: "Rank",
          cell: ({ getValue }) => getValue() || "N/A",
        },
        {
          accessorKey: "rewardAmount",
          header: "Reward Amount (in $)",
          cell: ({ getValue }) => Number(getValue() || 0).toFixed(2),
        },
        {
          accessorKey: "teamTotalRoiRewardDistributed",
          header: "Team ROI Distributed (in $)",
          cell: ({ getValue }) => Number(getValue() || 0).toFixed(2),
        },
        {
          accessorKey: "totalTeamInvestment",
          header: "Total Team Investment (in $)",
          cell: ({ getValue }) => Number(getValue() || 0).toFixed(2),
        },
        {
          accessorKey: "stronglegInvestment",
          header: "Strong Leg (in $)",
          cell: ({ getValue }) => Number(getValue() || 0).toFixed(2),
        },
        {
          accessorKey: "weakestLegInvestment",
          header: "Weak Leg (in $)",
          cell: ({ getValue }) => Number(getValue() || 0).toFixed(2),
        },
        {
          accessorKey: "distributionDate",
          header: "Distribution Date",
          cell: ({ getValue }) =>
            getValue() ? new Date(getValue()).toLocaleString("en-IN", {
                  timeZone: "Asia/Kolkata",
                }) : "N/A",
        },
        {
          accessorKey: "status",
          header: "Status",
          cell: ({ getValue }) => {
            const value = getValue() || "";
            return (
              <span
                className={
                  value.toLowerCase() === "completed"
                    ? "text-green-600 font-semibold"
                    : "text-red-500"
                }
              >
                {value.charAt(0).toUpperCase() + value.slice(1)}
              </span>
            );
          },
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
    manualPagination: true,
    pageCount: pagination.pages,
    initialState: { pagination: { pageIndex: currentPage - 1, pageSize: rowsPerPage } },
  });

  // Export PDF - With Loading Delay
  const handleLevelRewardsExportPDF = () => {
    setIsExportingPDF(true);

    if (levelRewards.length === 0) {
      toast.error("No data to export", { position: "top-right" });
      setIsExportingPDF(false);
      return;
    }

    setTimeout(() => {
      try {
        const tableColumn = table.getAllColumns().map((col) => col.columnDef.header);
        const tableRows = table
          .getPrePaginationRowModel()
          .rows.map((row) =>
            tableColumn.map((col) => {
              const value = row.getValue(col.id);
              if (col.id === "distributionDate") {
                return value ? new Date(value).toLocaleString() : "N/A";
              }
              if (col.id === "status") {
                return value === "completed" ? "Completed" : "Pending";
              }
              return value ?? "N/A";
            })
          );

        const doc = new jsPDF("landscape");
        doc.setFontSize(16);
        doc.text("Level Income Rewards Report", 14, 15);

        autoTable(doc, {
          head: [tableColumn],
          body: tableRows,
          startY: 25,
          theme: "striped",
          headStyles: { fillColor: [16, 57, 68], textColor: [255, 255, 255] },
          styles: { fontSize: 8, cellPadding: 2 },
          margin: { top: 20 },
        });

        doc.save("level_income_rewards.pdf");
        toast.success("PDF exported successfully", { position: "top-right" });
      } catch (err) {
        console.error("PDF Export Error:", err);
        toast.error("Failed to export PDF", { position: "top-right" });
      } finally {
        setIsExportingPDF(false);
      }
    }, 50);
  };

  // Export Excel - With Loading Delay
  const handleLevelRewardsExportExcel = () => {
    setIsExportingExcel(true);

    if (levelRewards.length === 0) {
      toast.error("No data to export", { position: "top-right" });
      setIsExportingExcel(false);
      return;
    }

    setTimeout(() => {
      try {
        const excelData = table.getPrePaginationRowModel().rows.map((row) => {
          const rowData = {};
          table.getAllColumns().forEach((col) => {
            const value = row.getValue(col.id);
            if (col.id === "distributionDate") {
              rowData[col.columnDef.header] = value
                ? new Date(value).toLocaleString()
                : "N/A";
            } else if (col.id === "status") {
              rowData[col.columnDef.header] =
                value === "completed" ? "Completed" : "Pending";
            } else {
              rowData[col.columnDef.header] = value ?? "N/A";
            }
          });
          return rowData;
        });

        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "LevelIncomeRewards");
        XLSX.writeFile(workbook, "level_income_rewards.xlsx");
        toast.success("Excel exported successfully", { position: "top-right" });
      } catch (err) {
        console.error("Excel Export Error:", err);
        toast.error("Failed to export Excel", { position: "top-right" });
      } finally {
        setIsExportingExcel(false);
      }
    }, 50);
  };

  // Loading/Error states
  if (isLoading) {
    return (
      <div className="p-4 max-w-[1260px] mx-auto">
        <h2 className="text-2xl font-bold mb-4 text-[#103944]">
          Level Income Rewards
        </h2>
        <p className="text-gray-600">Loading level income rewards...</p>
      </div>
    );
  }

  // if (isError) {
  //   return (
  //     <div className="p-4 max-w-[1260px] mx-auto">
  //       <h2 className="text-2xl font-bold mb-4 text-[#103944]">
  //         Level Income Rewards
  //       </h2>
  //       <p className="text-red-600">
  //         Error: {error?.message || "Failed to load level income rewards data."}
  //       </p>
  //     </div>
  //   );
  // }

  return (
    <div className="p-4 flex-1 text-nowrap max-w-[1260px] mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-[#103944]">
        Level Income Rewards
      </h2>

      <div className="mb-4 flex flex-col md:flex-row items-center justify-between">
        <div className="flex gap-2 mb-4 md:mb-0">
          <button
            onClick={handleLevelRewardsExportPDF}
            disabled={isExportingPDF}
            className={`bg-red-500 text-white px-4 py-2 rounded mr-2 hover:bg-red-600 text-sm ${
              isExportingPDF ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isExportingPDF ? "Exporting..." : "Export PDF"}
          </button>
          <button
            onClick={handleLevelRewardsExportExcel}
            disabled={isExportingExcel}
            className={`bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 text-sm ${
              isExportingExcel ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isExportingExcel ? "Exporting..." : "Export Excel"}
          </button>
        </div>
        <div className="flex items-center w-full md:w-auto">
          <input
            placeholder="Search level income rewards..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="border border-gray-300 rounded px-4 py-2 w-full max-w-xs focus:outline-none focus:ring-2 focus:ring-[#103944]"
            aria-label="Search level income rewards"
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
          Page {pagination.page} of {pagination.pages}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className={`bg-[#103944] text-white px-4 py-2 rounded ${
              currentPage === 1
                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                : "hover:bg-[#0e9d52]"
            }`}
            aria-label="Previous page"
          >
            Prev
          </button>
          <button
            onClick={() =>
              setCurrentPage((p) => (p < pagination.pages ? p + 1 : p))
            }
            disabled={currentPage === pagination.pages}
            className={`bg-[#103944] text-white px-4 py-2 rounded ${
              currentPage === pagination.pages
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

export default LevelIncomeRewards;