import React, { useMemo, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "../../Service/adminApi";
import { toast } from "react-toastify";

const BonanzaRewards = () => {
  const [searchInput, setSearchInput] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const { data: rewards = [], isLoading, isError, error } = useQuery({
    queryKey: ["bonanzaRewards"],
    queryFn: async () => {
      const res = await adminApi.getBonanzaRewardsReport();
      const rewardsData = res?.data?.bonanzaRewards;
      if (!Array.isArray(rewardsData)) {
        throw new Error("Invalid response: bonanzaRewards array not found");
      }
      return rewardsData;
    },
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });

  // Define columns explicitly
  const columns = useMemo(
    () => [
      { Header: "S.No.", accessor: "sno" },
      { Header: "Date", accessor: "createdAt", Cell: ({ value }) => (value ? new Date(value).toLocaleDateString() : "N/A") },
      { Header: "Username", accessor: "userId.username" },
      { Header: "Email", accessor: "userId.email" },
      { Header: "From", accessor: "referredId.email" },
      { Header: "Team Business (USD)", accessor: "teamBusiness", Cell: ({ value }) => (value ? `$${Number(value).toFixed(2)}` : "N/A") },
      { Header: "Bonanza Income (USD)", accessor: "bonanzaIncome", Cell: ({ value }) => (value ? `$${Number(value).toFixed(2)}` : "N/A") },
      {
        Header: "Status",
        accessor: "status",
        Cell: ({ value }) => (
          <div className={value === "claimed" ? "text-green-500" : "text-orange-500"}>
            {value ? value.charAt(0).toUpperCase() + value.slice(1) : "N/A"}
          </div>
        ),
      },
    ],
    []
  );

  // Dynamic filtering based on columns
  const filteredRewards = useMemo(() => {
    if (!searchInput) return rewards;
    return rewards.filter((item) =>
      columns.some((col) => {
        if (col.accessor === "sno") return false; // Skip S.No. for search
        const value = col.accessor.includes(".")
          ? col.accessor.split(".").reduce((obj, k) => obj?.[k], item)
          : item[col.accessor];
        return String(value || "").toLowerCase().includes(searchInput.toLowerCase());
      })
    );
  }, [searchInput, rewards, columns]);

  // Pagination
  const totalPages = Math.ceil(filteredRewards.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentRows = filteredRewards.slice(startIndex, startIndex + rowsPerPage);

  const handlePrevious = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  // Dynamic Export PDF
  const handleExportPDF = () => {
    if (!filteredRewards.length) {
      toast.error("No data to export", { position: "top-right" });
      return;
    }
    const tableColumn = columns.map((col) => col.Header);
    const tableRows = filteredRewards.map((item, index) =>
      columns.map((col) => {
        if (col.accessor === "sno") return index + 1;
        const value = col.accessor.includes(".")
          ? col.accessor.split(".").reduce((obj, key) => obj?.[key], item)
          : item[col.accessor];
        return col.Cell ? col.Cell({ value }).props.children : value || "N/A";
      })
    );
    const doc = new jsPDF();
    doc.text("Bonanza Rewards Report", 14, 10);
    autoTable(doc, { head: [tableColumn], body: tableRows });
    doc.save("bonanza_rewards.pdf");
  };

  // Dynamic Export Excel
  const handleExportExcel = () => {
    if (!filteredRewards.length) {
      toast.error("No data to export", { position: "top-right" });
      return;
    }
    const excelData = filteredRewards.map((item, index) => {
      const row = {};
      columns.forEach((col) => {
        if (col.accessor === "sno") {
          row[col.Header] = index + 1;
        } else {
          const value = col.accessor.includes(".")
            ? col.accessor.split(".").reduce((obj, key) => obj?.[key], item)
            : item[col.accessor];
          row[col.Header] = col.Cell ? col.Cell({ value }).props.children : value || "N/A";
        }
      });
      return row;
    });
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "BonanzaRewards");
    XLSX.writeFile(workbook, "bonanza_rewards.xlsx");
  };

  // Loading / Error states
  if (isLoading) {
    return (
      <div className="p-4 max-w-[1260px] mx-auto">
        <h2 className="text-2xl font-bold mb-4 text-[#103944]">
          Bonanza Rewards
        </h2>
        <p className="text-gray-600">Loading bonanza rewards...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 max-w-[1260px] mx-auto">
        <h2 className="text-2xl font-bold mb-4 text-[#103944]">
          Bonanza Rewards
        </h2>
        <p className="text-red-600">
          Error: {error?.message || "Failed to load bonanza rewards data."}
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4 text-[#103944]">
        Bonanza Rewards
      </h2>

      {/* Export + Search Controls */}
      <div className="mb-4 flex flex-col md:flex-row justify-between items-center">
        <div className="mb-2 md:mb-0">
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
        <div className="flex items-center justify-end">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search..."
            className="border border-gray-300 rounded px-4 py-2 w-full max-w-xs"
            aria-label="Search bonanza rewards records"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 overflow-x-auto">
        <table className="min-w-full text-sm text-left text-gray-800">
          <thead className="bg-[#103944] text-white uppercase">
            <tr>
              {columns.map((col) => (
                <th key={col.accessor} className="px-4 py-2 whitespace-nowrap">
                  {col.Header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentRows.length > 0 ? (
              currentRows.map((item, index) => (
                <tr key={item._id || index} className="hover:bg-gray-50">
                  {columns.map((col) => (
                    <td key={col.accessor} className="px-4 py-2 whitespace-nowrap">
                      {col.accessor === "sno"
                        ? startIndex + index + 1
                        : col.Cell
                          ? col.Cell({
                            value: col.accessor.includes(".")
                              ? col.accessor.split(".").reduce((obj, key) => obj?.[key], item)
                              : item[col.accessor]
                          })
                          : col.accessor.includes(".")
                            ? col.accessor.split(".").reduce((obj, key) => obj?.[key], item) || "N/A"
                            : item[col.accessor] || "N/A"}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center px-6 py-8 text-gray-500 text-sm"
                >
                  No bonanza rewards records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredRewards.length > rowsPerPage && (
        <div className="flex items-center justify-end mt-4">
          <span className="mr-4 text-[16px] font-semibold text-[#103944]" aria-live="polite">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={handlePrevious}
            disabled={currentPage <= 1}
            className={`px-4 py-2 mr-2 font-semibold rounded ${currentPage > 1
                ? "bg-[#103944] text-[#FFF] hover:bg-[#0e9d52]"
                : "bg-[#103944] text-[#FFF] cursor-not-allowed"
              }`}
            aria-label="Previous page"
          >
            Prev
          </button>
          <button
            onClick={handleNext}
            disabled={currentPage >= totalPages}
            className={`px-4 py-2 font-semibold rounded ${currentPage < totalPages
                ? "bg-[#103944] text-[#FFF] hover:bg-[#0e9d52]"
                : "bg-[#103944] text-[#FFF] cursor-not-allowed"
              }`}
            aria-label="Next page"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default BonanzaRewards;