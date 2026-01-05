import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useTable, usePagination } from "react-table";
import { FaEdit, FaBan, FaPlus, FaTrash } from "react-icons/fa";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "../../Service/adminApi"; // Adjust the import path as needed

// Custom debounce function
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

const InvestmentPlan = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editRowData, setEditRowData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [errors, setErrors] = useState({});

  const queryClient = useQueryClient();

  const { data: investmentPlans = [], isLoading, isError } = useQuery({
    queryKey: ["investmentPlans"],
    queryFn: async () => {
      const res = await adminApi.getInvestmentPackages();
      const plans = res?.data?.packages || [];
      // Log warning if any plan is missing _id
      plans.forEach((plan, index) => {
        if (!plan._id) {
          console.warn(`Plan at index ${index} is missing _id:`, plan);
        }
      });
      return plans.map((plan) => ({
        _id: plan._id,
        packageName: plan.name,
        description: `${plan.investment} USD - ${plan.dailyROI}% per day - 5 days, ${plan.lockingPeriodDays} days locking.${plan.tokenConversionLockUntil ? " Locking till presale if converted." : ""
          }`,
        fromAmount: plan.investment,
        toAmount: plan.investment * 2 - 1, // Example logic for toAmount
        perDay: `${plan.dailyROI}%`,
        monthly: `${(plan.dailyROI * 30).toFixed(2)}%`, // Example calculation
        lockingPeriodDays: plan.lockingPeriodDays,
        tokenConversionLockUntil: plan.tokenConversionLockUntil,
      }));
    },
    onSuccess: (data) => {
      toast.success(`Fetched ${data.length} investment plans successfully.`);
    },
    onError: (err) => {
      const message =
        err?.response?.data?.message ||
        err?.data?.message ||
        err?.message ||
        "Failed to fetch investment plans.";
      toast.error(message);
    },
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });

  const [filteredPlans, setFilteredPlans] = useState(investmentPlans);

  useEffect(() => {
    setFilteredPlans(investmentPlans);
  }, [investmentPlans]);

  const handleSearch = useCallback(
    debounce((value) => {
      if (value === "") {
        setFilteredPlans(investmentPlans);
      } else {
        const filtered = investmentPlans.filter((item) =>
          Object.values(item).some((val) =>
            String(val).toLowerCase().includes(value.toLowerCase())
          )
        );
        setFilteredPlans(filtered);
      }
    }, 300),
    [investmentPlans]
  );

  const validateForm = () => {
    const newErrors = {};
    if (!editRowData.packageName.trim()) {
      newErrors.packageName = "Package Name is required";
    }
    if (!editRowData.fromAmount && editRowData.fromAmount !== 0) {
      newErrors.fromAmount = "From Amount is required";
    } else if (isNaN(editRowData.fromAmount) || editRowData.fromAmount < 0) {
      newErrors.fromAmount = "From Amount must be a positive number";
    }
    if (!editRowData.toAmount && editRowData.toAmount !== 0) {
      newErrors.toAmount = "To Amount is required";
    } else if (isNaN(editRowData.toAmount) || editRowData.toAmount < editRowData.fromAmount) {
      newErrors.toAmount = "To Amount must be greater than From Amount";
    }
    if (!editRowData.perDay.trim()) {
      newErrors.perDay = "Per Day % is required";
    } else if (isNaN(parseFloat(editRowData.perDay))) {
      newErrors.perDay = "Per Day % must be a number";
    }
    if (!editRowData.lockingPeriodDays && editRowData.lockingPeriodDays !== 0) {
      newErrors.lockingPeriodDays = "Locking Period is required";
    } else if (isNaN(editRowData.lockingPeriodDays) || editRowData.lockingPeriodDays < 0) {
      newErrors.lockingPeriodDays = "Locking Period must be a positive number";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const { mutate: createPackage, isPending: isCreating } = useMutation({
    mutationFn: (data) => adminApi.createInvestmentPackages(data),
    onSuccess: (res) => {
      toast.success(res?.data?.message || "Investment package created successfully.");
      queryClient.invalidateQueries(["investmentPlans"]);
      closeModal();
    },
    onError: (err) => {
      const message =
        err?.response?.data?.message ||
        err?.data?.message ||
        err?.message ||
        "Failed to create investment package.";
      toast.error(message);
    },
  });

  const { mutate: updatePackage, isPending: isUpdating } = useMutation({
    mutationFn: ({ id, data }) => adminApi.updateInvestmentPackages(id, data),
    onSuccess: (res) => {
      toast.success(res?.data?.message || "Investment package updated successfully.");
      queryClient.invalidateQueries(["investmentPlans"]);
      closeModal();
    },
    onError: (err) => {
      const message =
        err?.response?.data?.message ||
        err?.data?.message ||
        err?.message ||
        "Failed to update investment package.";
      toast.error(message);
    },
  });

  const { mutate: deletePackage, isPending: isDeleting } = useMutation({
    mutationFn: (id) => adminApi.deleteInvestmentPackages(id),
    onSuccess: (res) => {
      toast.success(res?.data?.message || "Investment package deleted successfully.");
      queryClient.invalidateQueries(["investmentPlans"]);
    },
    onError: (err) => {
      const message =
        err?.response?.data?.message ||
        err?.data?.message ||
        err?.message ||
        "Failed to delete investment package.";
      toast.error(message);
    },
  });

  const handleDelete = (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this package?");
    if (confirmDelete) {
      deletePackage(id);
    }
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const tableColumn = ["S.No.", "Package Name", "Investment", "Daily ROI %", "Locking Period (Days)"];
    const tableRows = filteredPlans.map((row, index) => [
      index + 1,
      row.packageName,
      row.fromAmount,
      row.perDay,
      row.lockingPeriodDays,
    ]);
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
    });
    doc.save("investment_plans.pdf");
  };

  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredPlans.map((row, index) => ({
        "S.No.": index + 1,
        "Package Name": row.packageName,
        "Investment": row.fromAmount,
        "Daily ROI %": row.perDay,
        "Locking Period (Days)": row.lockingPeriodDays,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "InvestmentPlans");
    XLSX.writeFile(workbook, "investment_plans.xlsx");
  };

  const isMutating = isCreating || isUpdating || isDeleting;

  const columns = useMemo(
    () => [
      {
        Header: "S.No.",
        accessor: (_row, i) => i + 1,
        id: "serial",
      },
      {
        Header: "Package Name",
        accessor: "packageName",
      },
      {
        Header: "Investment",
        accessor: "fromAmount",
      },
      {
        Header: "Daily ROI %",
        accessor: "perDay",
      },
      {
        Header: "Locking Period (Days)",
        accessor: "lockingPeriodDays",
      },
      {
        Header: "Action",
        Cell: ({ row }) => (
          <div className="flex gap-2">
            <button
              onClick={() => openEditModal(row.original)}
              className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 text-sm disabled:opacity-50"
              title="Edit"
              disabled={isMutating}
              aria-label={`Edit ${row.original.packageName} package`}
            >
              <FaEdit />
            </button>
            <button
              onClick={() => alert("Deactivate clicked")}
              className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 text-sm disabled:opacity-50"
              title="Deactivate"
              disabled={isMutating}
              aria-label={`Deactivate ${row.original.packageName} package`}
            >
              <FaBan />
            </button>
            <button
              onClick={() => handleDelete(row.original._id)}
              className="bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-700 text-sm disabled:opacity-50"
              title="Delete"
              disabled={isMutating}
              aria-label={`Delete ${row.original.packageName} package`}
            >
              <FaTrash />
            </button>
          </div>
        ),
      },
    ],
    [isMutating]
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
      data: filteredPlans,
      initialState: { pageIndex: 0, pageSize: 20 },
    },
    usePagination
  );

  const openEditModal = (rowData) => {
    setEditRowData({
      ...rowData,
      perDay: rowData.perDay.replace("%", ""),
      monthly: rowData.monthly.replace("%", ""),
    });
    setIsEditing(true);
    setIsModalOpen(true);
    setErrors({});
  };

  const openAddModal = () => {
    setEditRowData({
      packageName: "",
      fromAmount: "",
      toAmount: "",
      perDay: "",
      monthly: "",
      lockingPeriodDays: "",
    });
    setIsEditing(false);
    setIsModalOpen(true);
    setErrors({});
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditRowData(null);
    setErrors({});
  };

  const handleSave = () => {
    if (validateForm()) {
      const formattedData = {
        name: editRowData.packageName,
        investment: Number(editRowData.fromAmount),
        dailyROI: parseFloat(editRowData.perDay),
        lockingPeriodDays: Number(editRowData.lockingPeriodDays),
        tokenConversionLockUntil: null, // Adjust based on your requirements
      };
      if (isEditing) {
        updatePackage({ id: editRowData._id, data: formattedData });
      } else {
        createPackage(formattedData);
      }
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-[#103944]">Investment Plans</h2>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-[#103944] text-white px-4 py-2 rounded hover:bg-[#0e9d52] disabled:opacity-50"
          disabled={isMutating}
          aria-label="Add new investment package"
        >
          <FaPlus /> Add Package
        </button>
      </div>

      <div className="mb-4 flex items-center justify-between flex-wrap gap-2">
        <div className="flex gap-2">
          <button
            onClick={handleExportPDF}
            className="bg-red-500 text-white px-4 py-2 rounded mr-2 hover:bg-red-600 text-sm disabled:opacity-50"
            disabled={isLoading || isMutating}
            aria-label="Export to PDF"
          >
            Export PDF
          </button>
          <button
            onClick={handleExportExcel}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 text-sm disabled:opacity-50"
            disabled={isLoading || isMutating}
            aria-label="Export to Excel"
          >
            Export Excel
          </button>
        </div>
        <div className="flex items-center justify-end">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              handleSearch(e.target.value);
            }}
            placeholder="Search plans..."
            className="border border-gray-300 rounded px-4 py-2 w-full max-w-xs"
            aria-label="Search investment plans"
          />
          <button
            onClick={() => handleSearch(searchInput)}
            className="ml-2 bg-[#103944] text-white px-4 py-2 rounded hover:bg-[#0e9d52] text-sm"
            aria-label="Search"
          >
            Search
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 overflow-x-auto">
        <table {...getTableProps()} className="min-w-full text-sm text-left text-gray-800">
          <thead className="bg-[#103944] text-white uppercase">
            {headerGroups.map((headerGroup) => (
              <tr {...headerGroup.getHeaderGroupProps()} key={headerGroup.id}>
                {headerGroup.headers.map((column) => (
                  <th {...column.getHeaderProps()} className="px-4 py-2 whitespace-nowrap" key={column.id}>
                    {column.render("Header")}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()} className="bg-white">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-2 text-center">
                  Loading...
                </td>
              </tr>
            ) : isError ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-2 text-center text-red-500">
                  Error loading data. Please try again.
                </td>
              </tr>
            ) : page.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-2 text-center">
                  No data available
                </td>
              </tr>
            ) : (
              page.map((row, index) => {
                prepareRow(row);
                const rowKey = row.original._id || `row-${index}`; // Fallback to index if _id is missing
                return (
                  <tr {...row.getRowProps()} key={rowKey} className="border-b">
                    {row.cells.map((cell) => (
                      <td {...cell.getCellProps()} className="px-4 py-2 whitespace-nowrap" key={cell.column.id}>
                        {cell.render("Cell")}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        <div className="flex items-center justify-end mt-4">
          <span className="mr-4 text-[16px] font-semibold text-[#103944]" aria-live="polite">
            Page {pageIndex + 1} of {pageOptions.length}
          </span>
          <button
            onClick={() => previousPage()}
            disabled={!canPreviousPage || isLoading || isMutating}
            className={`px-4 py-2 mr-2 font-semibold rounded ${canPreviousPage && !isLoading && !isMutating
                ? "bg-[#103944] text-white hover:bg-[#0e9d52]"
                : "bg-[#103944] text-white cursor-not-allowed opacity-50"
              }`}
            aria-label="Previous page"
          >
            Prev
          </button>
          <button
            onClick={() => nextPage()}
            disabled={!canNextPage || isLoading || isMutating}
            className={`px-4 py-2 font-semibold rounded ${canNextPage && !isLoading && !isMutating
                ? "bg-[#103944] text-white hover:bg-[#0e9d52]"
                : "bg-[#103944] text-white cursor-not-allowed opacity-50"
              }`}
            aria-label="Next page"
          >
            Next
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-xl p-6">
            <div className="flex justify-between items-center mb-5">
              <h2 id="modal-title" className="text-2xl font-bold text-[#103944]">
                {isEditing ? "Edit" : "Add"} Investment Plan
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-red-600 text-3xl leading-none disabled:opacity-50"
                disabled={isMutating}
                aria-label="Close modal"
              >
                &times;
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label htmlFor="package-name" className="block text-sm font-medium text-gray-700 mb-1">
                  Package Name
                </label>
                <input
                  id="package-name"
                  type="text"
                  value={editRowData.packageName}
                  onChange={(e) => setEditRowData({ ...editRowData, packageName: e.target.value })}
                  className={`w-full border ${errors.packageName ? "border-red-500" : "border-gray-300"} px-4 py-2 rounded-lg`}
                  disabled={isMutating}
                  aria-invalid={!!errors.packageName}
                  aria-describedby={errors.packageName ? "package-name-error" : undefined}
                />
                {errors.packageName && (
                  <p id="package-name-error" className="text-red-500 text-xs mt-1">
                    {errors.packageName}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="from-amount" className="block text-sm font-medium text-gray-700 mb-1">
                    Investment Amount
                  </label>
                  <input
                    id="from-amount"
                    type="number"
                    value={editRowData.fromAmount}
                    onChange={(e) => setEditRowData({ ...editRowData, fromAmount: Number(e.target.value) })}
                    className={`w-full border ${errors.fromAmount ? "border-red-500" : "border-gray-300"} px-4 py-2 rounded-lg`}
                    disabled={isMutating}
                    aria-invalid={!!errors.fromAmount}
                    aria-describedby={errors.fromAmount ? "from-amount-error" : undefined}
                  />
                  {errors.fromAmount && (
                    <p id="from-amount-error" className="text-red-500 text-xs mt-1">
                      {errors.fromAmount}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="to-amount" className="block text-sm font-medium text-gray-700 mb-1">
                    To Amount
                  </label>
                  <input
                    id="to-amount"
                    type="number"
                    value={editRowData.toAmount}
                    onChange={(e) => setEditRowData({ ...editRowData, toAmount: Number(e.target.value) })}
                    className={`w-full border ${errors.toAmount ? "border-red-500" : "border-gray-300"} px-4 py-2 rounded-lg`}
                    disabled={isMutating}
                    aria-invalid={!!errors.toAmount}
                    aria-describedby={errors.toAmount ? "to-amount-error" : undefined}
                  />
                  {errors.toAmount && (
                    <p id="to-amount-error" className="text-red-500 text-xs mt-1">
                      {errors.toAmount}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="per-day" className="block text-sm font-medium text-gray-700 mb-1">
                    Daily ROI %
                  </label>
                  <input
                    id="per-day"
                    type="text"
                    value={editRowData.perDay}
                    onChange={(e) => setEditRowData({ ...editRowData, perDay: e.target.value })}
                    className={`w-full border ${errors.perDay ? "border-red-500" : "border-gray-300"} px-4 py-2 rounded-lg`}
                    disabled={isMutating}
                    aria-invalid={!!errors.perDay}
                    aria-describedby={errors.perDay ? "per-day-error" : undefined}
                  />
                  {errors.perDay && (
                    <p id="per-day-error" className="text-red-500 text-xs mt-1">
                      {errors.perDay}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="locking-period" className="block text-sm font-medium text-gray-700 mb-1">
                    Locking Period (Days)
                  </label>
                  <input
                    id="locking-period"
                    type="number"
                    value={editRowData.lockingPeriodDays}
                    onChange={(e) => setEditRowData({ ...editRowData, lockingPeriodDays: Number(e.target.value) })}
                    className={`w-full border ${errors.lockingPeriodDays ? "border-red-500" : "border-gray-300"} px-4 py-2 rounded-lg`}
                    disabled={isMutating}
                    aria-invalid={!!errors.lockingPeriodDays}
                    aria-describedby={errors.lockingPeriodDays ? "locking-period-error" : undefined}
                  />
                  {errors.lockingPeriodDays && (
                    <p id="locking-period-error" className="text-red-500 text-xs mt-1">
                      {errors.lockingPeriodDays}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={closeModal}
                  className="px-5 py-2 rounded-md bg-gray-100 text-gray-800 hover:bg-gray-200 disabled:opacity-50"
                  disabled={isMutating}
                  aria-label="Cancel"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-5 py-2 rounded-md bg-[#103944] text-white hover:bg-[#0e9d52] disabled:opacity-50"
                  disabled={isMutating}
                  aria-label={isEditing ? "Save changes" : "Add package"}
                >
                  {isMutating ? "Saving..." : isEditing ? "Save Changes" : "Add Package"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvestmentPlan;