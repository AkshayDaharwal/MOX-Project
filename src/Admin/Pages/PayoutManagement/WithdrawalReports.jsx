import { useMemo, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "../../Service/adminApi";
import { toast } from "react-toastify";

const WithdrawalReport = () => {
  const adminReportType = "withdrawals"; // changed here

  const { data: withdrawalReport = [], isLoading, isError, error } = useQuery({
    queryKey: ["withdrawalReport", adminReportType], // changed key
    queryFn: async () => {
      const res = await adminApi.getAdminReport(adminReportType);
      const reportData = res?.data?.reportData; // fixed path
      if (!Array.isArray(reportData)) {
        throw new Error("Invalid response: reportData array not found");
      }
      return reportData; // keep full dynamic data
    },
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });

  // States for search + pagination
  const [searchInput, setSearchInput] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  // Filtering
  const filteredWithdrawals = useMemo(() => {
    if (!searchInput) return withdrawalReport;
    return withdrawalReport.filter((item) =>
      Object.values(item).some((val) =>
        String(val).toLowerCase().includes(searchInput.toLowerCase())
      )
    );
  }, [searchInput, withdrawalReport]);

  // Pagination
  const totalPages = Math.ceil(filteredWithdrawals.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentRows = filteredWithdrawals.slice(
    startIndex,
    startIndex + rowsPerPage
  );

  const handlePrevious = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  // Dynamic columns
  const columns = withdrawalReport.length ? Object.keys(withdrawalReport[0]) : [];
  const formatHeader = (key) =>
    key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase());

  // Export PDF
  const handleExportPDF = () => {
    if (!filteredWithdrawals.length) { toast.error("no data to export"); return }
    const tableColumn = ["S.No.", ...columns];
    const tableRows = filteredWithdrawals.map((item, index) => [
      index + 1,
      ...columns.map((col) => item[col]),
    ]);
    const doc = new jsPDF();
    autoTable(doc, { head: [tableColumn], body: tableRows });
    doc.save("withdrawal_report.pdf");
  };

  // Export Excel
  const handleExportExcel = () => {
    if (!filteredWithdrawals.length) { toast.error("no data to export"); return}
    const excelData = filteredWithdrawals.map((item, index) => {
      const row = { "S.No.": index + 1 };
      columns.forEach((col) => {
        row[col] = item[col];
      });
      return row;
    });
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "WithdrawalReport");
    XLSX.writeFile(workbook, "withdrawal_report.xlsx");
  };

  // Loading / Error states
  if (isLoading) {
    return (
      <div className="p-4 max-w-[1260px] mx-auto">
        <h2 className="text-2xl font-bold mb-4 text-[#103944]">
          Withdrawal Report
        </h2>
        <p className="text-gray-600">Loading withdrawals...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 max-w-[1260px] mx-auto">
        <h2 className="text-2xl font-bold mb-4 text-[#103944]">
          Withdrawal Report
        </h2>
        <p className="text-red-600">
          Error: {error?.message || "Failed to load withdrawal data."}
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4 text-[#103944]">
        Withdrawal Report
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
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 overflow-x-auto">
        <table className="min-w-full text-sm text-left text-gray-800">
          <thead className="bg-[#103944] text-white uppercase">
            <tr>
              <th className="px-4 py-2 whitespace-nowrap">S.No.</th>
              {columns.map((col) => (
                <th
                  key={col}
                  className="px-4 py-2 whitespace-nowrap capitalize"
                >
                  {formatHeader(col)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentRows.length > 0 ? (
              currentRows.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-2 whitespace-nowrap">
                    {startIndex + index + 1}
                  </td>
                  {columns.map((col) => (
                    <td
                      key={col}
                      className="px-4 py-2 whitespace-nowrap"
                    >
                      {item[col]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="text-center px-6 py-8 text-gray-500 text-sm"
                >
                  No withdrawal records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {filteredWithdrawals.length > rowsPerPage && (
          <div className="flex items-center justify-end mt-4">
            <span className="mr-4 text-[16px] font-semibold text-[#103944]">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={handlePrevious}
              disabled={currentPage <= 1}
              className={`px-4 py-2 mr-2 font-semibold rounded ${currentPage > 1
                  ? "bg-[#103944] text-[#FFF] hover:bg-[#0e9d52]"
                  : "bg-[#103944] text-[#FFF] cursor-not-allowed"
                }`}
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
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WithdrawalReport;
