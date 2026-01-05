 
import React, { useMemo, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "../Service/adminApi";
import { toast } from "react-toastify";

const SessionLog = () => {
  const [searchInput, setSearchInput] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const { data: sessions = [], isLoading, isError, error } = useQuery({
    queryKey: ["sessionLog"],
    queryFn: async () => {
      const res = await adminApi.getSessionLog();
      const sessionsData = res?.data?.loginLogs;
      if (!Array.isArray(sessionsData)) {
        throw new Error("Invalid response: sessions array not found");
      }
      return sessionsData;
    },
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });

  // Dynamic columns based on response
  const columns = useMemo(() => {
    const baseColumns = [{ Header: "S.No.", accessor: "sno" }];
    if (sessions.length > 0) {
      const sampleSession = sessions[0];
      const dynamicColumns = Object.keys(sampleSession)
        .filter((key) => key !== "_id")
        .map((key) => ({
          Header: key
            .replace(/([A-Z])/g, " $1")
            .replace(/^./, (str) => str.toUpperCase()),
          accessor: key,
          Cell: key.toLowerCase().includes("time")
            ? ({ value }) => new Date(value).toLocaleString()
            : key.toLowerCase().includes("amount")
            ? ({ value }) => `$${ Number(value).toFixed(2) } `
            : undefined,
        }));
      return [...baseColumns, ...dynamicColumns];
    }
    return baseColumns;
  }, [sessions]);

  // Filtering
  const filteredSessions = useMemo(() => {
    if (!searchInput) return sessions;
    return sessions.filter((item) =>
      Object.keys(item)
        .filter((key) => key !== "_id")
        .some((key) =>
          String(item[key]).toLowerCase().includes(searchInput.toLowerCase())
        )
    );
  }, [searchInput, sessions]);

  // Pagination
  const totalPages = Math.ceil(filteredSessions.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentRows = filteredSessions.slice(startIndex, startIndex + rowsPerPage);

  const handlePrevious = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  // Export PDF
  const handleExportPDF = () => {
    if (!filteredSessions.length) {
      toast.error("No data to export", { position: "top-right" });
      return;
    }
    const tableColumn = columns.map((col) => col.Header);
    const tableRows = filteredSessions.map((item, index) => [
      index + 1,
      ...columns
        .filter((col) => col.accessor !== "sno")
        .map((col) =>
          col.Cell ? col.Cell({ value: item[col.accessor] }) : item[col.accessor]
        ),
    ]);
    const doc = new jsPDF();
    doc.text("Admin Session Log", 14, 10);
    autoTable(doc, { head: [tableColumn], body: tableRows });
    doc.save("admin_session_log.pdf");
  };

  // Export Excel
  const handleExportExcel = () => {
    if (!filteredSessions.length) {
      toast.error("No data to export", { position: "top-right" });
      return;
    }
    const excelData = filteredSessions.map((item, index) => {
      const row = { "S.No.": index + 1 };
      columns
        .filter((col) => col.accessor !== "sno")
        .forEach((col) => {
          row[col.Header] = col.Cell
            ? col.Cell({ value: item[col.accessor] })
            : item[col.accessor];
        });
      return row;
    });
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "AdminSessionLog");
    XLSX.writeFile(workbook, "admin_session_log.xlsx");
  };

  // Loading / Error states
  if (isLoading) {
    return (
      <div className="p-4 max-w-[1260px] mx-auto">
        <h2 className="text-2xl font-bold mb-4 text-[#103944]">
          Session Log
        </h2>
        <p className="text-gray-600">Loading session log...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 max-w-[1260px] mx-auto">
        <h2 className="text-2xl font-bold mb-4 text-[#103944]">
          Session Log
        </h2>
        <p className="text-red-600">
          Error: {error?.message || "Failed to load session log data."}
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4 text-[#103944]">
        Session Log
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
            aria-label="Search session log records"
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
                        ? col.Cell({ value: item[col.accessor] })
                        : item[col.accessor]}
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
                  No session log records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredSessions.length > rowsPerPage && (
        <div className="flex items-center justify-end mt-4">
          <span className="mr-4 text-[16px] font-semibold text-[#103944]" aria-live="polite">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={handlePrevious}
            disabled={currentPage <= 1}
            className={`px - 4 py - 2 mr - 2 font - semibold rounded ${
  currentPage > 1
    ? "bg-[#103944] text-[#FFF] hover:bg-[#0e9d52]"
    : "bg-[#103944] text-[#FFF] cursor-not-allowed"
} `}
            aria-label="Previous page"
          >
            Prev
          </button>
          <button
            onClick={handleNext}
            disabled={currentPage >= totalPages}
            className={`px - 4 py - 2 font - semibold rounded ${
  currentPage < totalPages
    ? "bg-[#103944] text-[#FFF] hover:bg-[#0e9d52]"
    : "bg-[#103944] text-[#FFF] cursor-not-allowed"
} `}
            aria-label="Next page"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default SessionLog;
