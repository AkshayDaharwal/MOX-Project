
import React, { useState, useMemo, useCallback } from "react";
import { useTable, usePagination } from "react-table";
import dayjs from "dayjs";
import { Trash2 } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "../Service/adminApi"; // Adjust the import path as needed

// Custom debounce function
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

const SetTokenPrice = () => {
  const [currencyType, setCurrencyType] = useState("USDT");
  const [price, setPrice] = useState("");
  const [history, setHistory] = useState([]);
  const [lastPrices, setLastPrices] = useState({ USDT: 1.0, EMGT: 0.0 });
  const [searchInput, setSearchInput] = useState("");

  const queryClient = useQueryClient();

  const { mutate: setTokenPrice, isPending: isSettingPrice } = useMutation({
    mutationFn: (data) => adminApi.setTokenPrice(data),
    onSuccess: (res) => {
      const date = dayjs().format("YYYY-MM-DD hh:mm:ss A");
      const newEntry = {
        id: Date.now(), // Generate a unique ID locally
        currencyType,
        lastPrice: lastPrices[currencyType] || 0,
        newPrice: parseFloat(price),
        updatedAt: date,
      };
      setHistory((prev) => [newEntry, ...prev]);
      setLastPrices((prev) => ({
        ...prev,
        [currencyType]: parseFloat(price),
      }));
      setPrice("");
      toast.success(res?.message || "Price updated successfully!");
    },
    onError: (err) => {
      const message =
        err?.response?.message ||
        err?.message ||
        err?.message ||
        "Failed to set token price.";
      toast.error(message);
    },
  });

  const filteredData = useMemo(() => {
    if (!searchInput) return history;
    return history.filter((entry) =>
      Object.values(entry).some((value) =>
        String(value).toLowerCase().includes(searchInput.toLowerCase())
      )
    );
  }, [searchInput, history]);

  const handleSearch = useCallback(
    debounce((value) => {
      setSearchInput(value);
    }, 300),
    []
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!price || price.trim() === "" || isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      toast.error("Please enter a valid positive price.");
      return;
    }
    setTokenPrice({ currencyType, price: parseFloat(price) });
  };

  const handleDelete = (index) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this price entry?");
    if (confirmDelete) {
      setHistory((prev) => prev.filter((_, i) => i !== index));
      toast.success("Price entry deleted successfully!");
    }
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const tableColumn = ["Currency Type", "Last Price", "New Price", "Updated At"];
    const tableRows = filteredData.map((item) => [
      item.currencyType,
      `$${item.lastPrice.toFixed(4)} `,
      `$${item.newPrice.toFixed(4)} `,
      item.updatedAt,
    ]);
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
    });
    doc.save("token_price_history.pdf");
  };

  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredData.map((item) => ({
        "Currency Type": item.currencyType,
        "Last Price": item.lastPrice,
        "New Price": item.newPrice,
        "Updated At": item.updatedAt,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "TokenPriceHistory");
    XLSX.writeFile(workbook, "token_price_history.xlsx");
  };

  const columns = useMemo(
    () => [
      { Header: "Currency Type", accessor: "currencyType" },
      {
        Header: "Last Price",
        accessor: "lastPrice",
        Cell: ({ value }) => (
          <span className="inline-block px-3 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
            ${value.toFixed(4)}
          </span>
        ),
      },
      {
        Header: "New Price",
        accessor: "newPrice",
        Cell: ({ value }) => (
          <span className="inline-block px-3 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
            ${value.toFixed(4)}
          </span>
        ),
      },
      { Header: "Updated At", accessor: "updatedAt" },
      {
        Header: "Action",
        accessor: "action",
        Cell: ({ row }) => (
          <button
            onClick={() => handleDelete(row.index)}
            className="text-red-500 hover:text-red-700 transition disabled:opacity-50"
            disabled={isSettingPrice}
            aria-label={`Delete price entry for ${row.original.currencyType}`}
          >
            <Trash2 size={18} />
          </button>
        ),
      },
    ],
    [isSettingPrice]
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    nextPage,
    previousPage,
    canNextPage,
    canPreviousPage,
    pageOptions,
    state: { pageIndex },
  } = useTable(
    {
      columns,
      data: filteredData,
      initialState: { pageIndex: 0, pageSize: 10 },
    },
    usePagination
  );

  return (
    <div className="min-h-screen bg-[#fff] p-6 flex flex-col items-center">
      <div className="w-full max-w-xl bg-white rounded-xl shadow-lg p-8 mb-10 border border-gray-200">
        <h2 className="text-2xl font-bold text-[#103944] mb-6 text-center">
          Set Token Price
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="currency-type"
              className="block text-[16px] font-semibold text-[#103944] mb-2"
            >
              Select Currency
            </label>
            <select
              id="currency-type"
              value={currencyType}
              onChange={(e) => setCurrencyType(e.target.value)}
              className="w-full border border-gray-300 px-4 py-2 rounded-lg"
              disabled={isSettingPrice}
              aria-label="Select currency type"
            >
              <option value="USDT">USDT</option>
              <option value="EMGT">EMGT</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="price"
              className="block text-[16px] font-semibold text-[#103944] mb-2"
            >
              New Price
            </label>
            <input
              id="price"
              type="number"
              step="0.0001"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder={`Current: $${lastPrices[currencyType] || 0} `}
              className="w-full border border-gray-300 px-4 py-2 rounded-lg"
              disabled={isSettingPrice}
              aria-label="Enter new token price"
            />
            {/* <p className="text-[14px] text-gray-500 mt-2">
              Current Price:{" "}
              <span className="font-semibold text-green-600">
                ${lastPrices[currencyType]?.toFixed(4) || "0.0000"}
              </span>
            </p> */}
          </div>

          <div className="flex justify-center">
            <button
              type="submit"
              className="bg-[#103944] hover:bg-[#0e9d52] text-white font-medium px-8 py-2 rounded-lg transition-all duration-300 shadow-md disabled:opacity-50"
              disabled={isSettingPrice}
              aria-label="Save token price"
            >
              {isSettingPrice ? "Saving..." : "Save Price"}
            </button>
          </div>
        </form>
      </div>
 {/*
 
 {history.length > 0 && (
   <div className="w-full max-w-5xl bg-white rounded-xl shadow-lg p-6 border border-gray-200">
     <h2 className="text-2xl font-bold text-[#103944] mb-4 text-start">
       Price Update History
     </h2>

     <div className="flex flex-col md:flex-row items-center justify-between mb-4">
       <div className="mb-2 md:mb-0">
         <button
           onClick={handleExportPDF}
           className="mr-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 text-sm disabled:opacity-50"
           disabled={isSettingPrice}
           aria-label="Export to PDF"
         >
           Export PDF
         </button>
         <button
           onClick={handleExportExcel}
           className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 text-sm disabled:opacity-50"
           disabled={isSettingPrice}
           aria-label="Export to Excel"
         >
           Export Excel
         </button>
       </div>

       <div className="flex items-center justify-end w-full md:w-auto">
         <input
           type="text"
           value={searchInput}
           onChange={(e) => handleSearch(e.target.value)}
           placeholder="Search..."
           className="border border-gray-300 rounded px-4 py-2 w-full max-w-xs"
           aria-label="Search price history"
         />
       </div>
     </div>

     <div className="overflow-auto rounded-md">
       <table
         {...getTableProps()}
         className="min-w-full text-sm text-[#103944] bg-white"
       >
         <thead className="bg-[#103944] text-white">
           {headerGroups.map((headerGroup) => (
             <tr {...headerGroup.getHeaderGroupProps()} key={headerGroup.id}>
               {headerGroup.headers.map((column) => (
                 <th
                   {...column.getHeaderProps()}
                   className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider"
                   key={column.id}
                 >
                   {column.render("Header")}
                 </th>
               ))}
             </tr>
           ))}
         </thead>
         <tbody {...getTableBodyProps()} className="divide-y divide-gray-200">
           {page.map((row) => {
             prepareRow(row);
             return (
               <tr
                 {...row.getRowProps()}
                 key={row.original.id}
                 className="hover:bg-gray-50"
               >
                 {row.cells.map((cell) => (
                   <td
                     {...cell.getCellProps()}
                     className="px-6 py-3"
                     key={cell.column.id}
                   >
                     {cell.render("Cell")}
                   </td>
                 ))}
               </tr>
             );
           })}
         </tbody>
       </table>

       <div className="flex items-center justify-end mt-4">
         <span
           className="mr-4 text-[16px] font-semibold text-[#103944]"
           aria-live="polite"
         >
           Page {pageIndex + 1} of {pageOptions.length}
         </span>
         <button
           onClick={previousPage}
           disabled={!canPreviousPage || isSettingPrice}
           className={`px - 4 py - 2 mr - 2 font - semibold rounded ${canPreviousPage && !isSettingPrice
               ? "bg-[#103944] text-[#FFF] hover:bg-[#0e9d52]"
               : "bg-[#103944] text-[#FFF] cursor-not-allowed opacity-50"
             } `}
           aria-label="Previous page"
         >
           Prev
         </button>
         <button
           onClick={nextPage}
           disabled={!canNextPage || isSettingPrice}
           className={`px - 4 py - 2 font - semibold rounded ${canNextPage && !isSettingPrice
               ? "bg-[#103944] text-[#FFF] hover:bg-[#0e9d52]"
               : "bg-[#103944] text-[#FFF] cursor-not-allowed opacity-50"
             } `}
           aria-label="Next page"
         >
           Next
         </button>
       </div>
     </div>
   </div>
 )}
 */}
    </div>
  );
};

export default SetTokenPrice;
