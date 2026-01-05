import React, { useMemo, useState, useEffect } from "react";
import { useTable, usePagination } from "react-table";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

const InvestmentReport = () => {
  const [searchInput, setSearchInput] = useState("");
  const [filteredData, setFilteredData] = useState([]);

  const data = useMemo(
    () => [
      {
        userName: "John Doe",
        userWallet: "0xABC123DEF456",
        packageName: "Silver Package",
        amount: "100 USD",
        date: "2025-08-06 10:30 AM",
      },
      {
        userName: "Jane Smith",
        userWallet: "0xXYZ789GHI012",
        packageName: "Gold Package",
        amount: "500 USD",
        date: "2025-08-05 03:45 PM",
      },
      {
        userName: "David Miller",
        userWallet: "0xABC999888",
        packageName: "Diamond Package",
        amount: "1000 USD",
        date: "2025-08-01 12:00 PM",
      },
      {
        userName: "Sara Khan",
        userWallet: "0xXYZZ77777",
        packageName: "Silver Package",
        amount: "150 USD",
        date: "2025-07-30 10:00 AM",
      },
      {
        userName: "Vikram Joshi",
        userWallet: "0xMMNNOO123",
        packageName: "Gold Package",
        amount: "700 USD",
        date: "2025-07-29 09:30 AM",
      },
    ],
    []
  );

  // 🔍 Search Function
  const handleSearch = () => {
    const filtered = data.filter((item) =>
      Object.values(item).some((val) =>
        String(val).toLowerCase().includes(searchInput.toLowerCase())
      )
    );
    setFilteredData(filtered);
  };

  // 🔁 Auto-search when typing (even 1 character)
  useEffect(() => {
    handleSearch();
  }, [searchInput]);

  // 📤 Export to PDF
  const exportPDF = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [["S.No", "User Name", "Wallet", "Package", "Amount", "Date"]],
      body: (filteredData.length > 0 ? filteredData : data).map((item, index) => [
        index + 1,
        item.userName,
        item.userWallet,
        item.packageName,
        item.amount,
        item.date,
      ]),
    });
    doc.save("investment_report.pdf");
  };

  // 📤 Export to Excel
  const exportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      (filteredData.length > 0 ? filteredData : data).map((item, index) => ({
        "S.No": index + 1,
        "User Name": item.userName,
        "Wallet": item.userWallet,
        "Package": item.packageName,
        "Amount": item.amount,
        "Date": item.date,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "InvestmentReport");
    XLSX.writeFile(workbook, "investment_report.xlsx");
  };

  const tableData = filteredData.length > 0 || searchInput ? filteredData : data;

  const columns = useMemo(
    () => [
      {
        Header: "S.No.",
        accessor: (_row, i) => i + 1,
        id: "serial",
      },
      {
        Header: "User Name",
        accessor: "userName",
      },
      {
        Header: "User Wallet",
        accessor: "userWallet",
      },
      {
        Header: "Package Name",
        accessor: "packageName",
      },
      {
        Header: "Amount",
        accessor: "amount",
      },
      {
        Header: "Date",
        accessor: "date",
      },
    ],
    []
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    canPreviousPage,
    canNextPage,
    nextPage,
    previousPage,
    pageOptions,
    state: { pageIndex },
  } = useTable(
    {
      columns,
      data: tableData,
      initialState: { pageIndex: 0, pageSize: 10 },
    },
    usePagination
  );

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4 text-[#103944]">Investment Report</h2>

      {/* Top Controls */}
      <div className="mb-4 flex items-center justify-between">
        {/* Export Buttons */}
        <div className="flex gap-2">
          <button
            onClick={exportPDF}
            className="bg-red-500 text-white px-4 py-2 rounded mr-2 hover:bg-red-600 text-sm"
          >
            Export PDF
          </button>
          <button
            onClick={exportExcel}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 text-sm"
          >
            Export Excel
          </button>
        </div>

        {/* Search Bar */}
        <div className="flex items-center justify-end">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search..."
            className="border border-gray-300 rounded px-4 py-2 w-full max-w-xs"
          />
          <button
            onClick={handleSearch}
            className="ml-2 bg-[#103944] text-white px-4 py-2 rounded hover:bg-[#0e9d52] text-sm"
          >
            Search
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 overflow-x-auto">
        <table {...getTableProps()} className="min-w-full text-sm text-left text-gray-800">
          <thead className="bg-[#103944] text-[#fff] uppercase">
            {headerGroups.map((headerGroup) => (
              <tr {...headerGroup.getHeaderGroupProps()} key={headerGroup.id}>
                {headerGroup.headers.map((column) => (
                  <th
                    {...column.getHeaderProps()}
                    className="px-4 py-2 whitespace-nowrap"
                    key={column.id}
                  >
                    {column.render("Header")}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()} className="bg-white">
            {page.length > 0 ? (
              page.map((row) => {
                prepareRow(row);
                return (
                  <tr {...row.getRowProps()} key={row.id} className="border-b">
                    {row.cells.map((cell) => (
                      <td
                        {...cell.getCellProps()}
                        className="px-4 py-2 whitespace-nowrap"
                        key={cell.column.id}
                      >
                        {cell.render("Cell")}
                      </td>
                    ))}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={columns.length} className="text-center py-4">
                  No matching records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex items-center justify-end mt-4">
          <span className="mr-4 text-[16px] font-semibold text-[#103944]">
            Page {pageIndex + 1} of {pageOptions.length}
          </span>
          <button
            onClick={() => previousPage()}
            disabled={!canPreviousPage}
            className={`px-4 py-2 mr-2 font-semibold rounded ${
              canPreviousPage
                ? "bg-[#103944] text-[#FFF] hover:bg-[#0e9d52]"
                : "bg-[#103944] text-[#FFF] cursor-not-allowed"
            }`}
          >
            Prev
          </button>
          <button
            onClick={() => nextPage()}
            disabled={!canNextPage}
            className={`px-4 py-2 font-semibold rounded ${
              canNextPage
                ? "bg-[#103944] text-[#FFF] hover:bg-[#0e9d52]"
                : "bg-[#103944] text-[#fff] cursor-not-allowed"
            }`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvestmentReport;
