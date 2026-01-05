
import React, { useState, useEffect, useMemo } from "react";
import { useTable, usePagination } from "react-table";
import { FaEdit, FaBan, FaPlus, FaTrash } from "react-icons/fa";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {adminApi} from "../../Service/adminApi"; // Adjust the import path as needed

const BonanzaPlan = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editRowData, setEditRowData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [errors, setErrors] = useState({});
  const [filteredPlans, setFilteredPlans] = useState([]);

  const queryClient = useQueryClient();

  const { data: bonanzaPlans = [], isLoading, isError } = useQuery({
    queryKey: ["bonanzaPlans"],
    queryFn: async () => {
      const res = await adminApi.getBonanzaPlans();
      return res?.data?.bonanzaPlans || [];
    },
    onSuccess: (data) => {
      toast.success(`Fetched ${ data.length } bonanza plans successfully.`);
    },
    onError: (err) => {
      const message =
        err?.response?.data?.message ||
        err?.data?.message ||
        err?.message ||
        "Failed to fetch bonanza plans.";
      toast.error(message);
    },
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    setFilteredPlans(bonanzaPlans);
  }, [bonanzaPlans]);

  const handleSearch = () => {
    if (searchInput === "") {
      setFilteredPlans(bonanzaPlans);
    } else {
      const filtered = bonanzaPlans.filter((item) =>
        Object.values(item).some((val) =>
          String(val).toLowerCase().includes(searchInput.toLowerCase())
        )
      );
      setFilteredPlans(filtered);
    }
  };

  useEffect(() => {
    handleSearch();
  }, [searchInput, bonanzaPlans]);

  const validateForm = () => {
    const newErrors = {};
    if (!editRowData.name.trim()) {
      newErrors.name = "Plan Name is required";
    }
    if (!editRowData.target && editRowData.target !== 0) {
      newErrors.target = "Target Amount is required";
    } else if (isNaN(editRowData.target) || Number(editRowData.target) < 0) {
      newErrors.target = "Target Amount must be a positive number";
    }
    if (!editRowData.roi && editRowData.roi !== 0) {
      newErrors.roi = "ROI is required";
    } else if (isNaN(editRowData.roi) || Number(editRowData.roi) < 0) {
      newErrors.roi = "ROI must be a positive number";
    }
    if (!editRowData.minDirect && editRowData.minDirect !== 0) {
      newErrors.minDirect = "Min Direct is required";
    } else if (isNaN(editRowData.minDirect) || Number(editRowData.minDirect) < 0) {
      newErrors.minDirect = "Min Direct must be a positive number";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const { mutate: createBonanza, isPending: isCreating } = useMutation({
    mutationFn: (data) => adminApi.createBonanzaPlans(data),
    onSuccess: (res) => {
      toast.success(res?.data?.message || "Bonanza plan created successfully.");
      queryClient.invalidateQueries(["bonanzaPlans"]);
      closeModal();
    },
    onError: (err) => {
      const message =
        err?.response?.data?.message ||
        err?.data?.message ||
        err?.message ||
        "Failed to create bonanza plan.";
      toast.error(message);
    },
  });

  const { mutate: updateBonanza, isPending: isUpdating } = useMutation({
    mutationFn: ({ id, data }) => adminApi.updateBonanzaPlan(id, data),
    onSuccess: (res) => {
      toast.success(res?.data?.message || "Bonanza plan updated successfully.");
      queryClient.invalidateQueries(["bonanzaPlans"]);
      closeModal();
    },
    onError: (err) => {
      const message =
        err?.response?.data?.message ||
        err?.data?.message ||
        err?.message ||
        "Failed to update bonanza plan.";
      toast.error(message);
    },
  });

  const { mutate: deleteBonanza, isPending: isDeleting } = useMutation({
    mutationFn: (id) => adminApi.deleteBonanzaPlan(id),
    onSuccess: (res) => {
      toast.success(res?.data?.message || "Bonanza plan deleted successfully.");
      queryClient.invalidateQueries(["bonanzaPlans"]);
    },
    onError: (err) => {
      const message =
        err?.response?.data?.message ||
        err?.data?.message ||
        err?.message ||
        "Failed to delete bonanza plan.";
      toast.error(message);
    },
  });

  const handleDelete = (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this plan?");
    if (confirmDelete) {
      deleteBonanza(id);
    }
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const tableColumn = ["S.No.", "Plan Name", "ROI %", "Target Amount"];
    const tableRows = filteredPlans.map((row, index) => [
      index + 1,
      row.name,
      row.minDirect,
      row.roi,
      row.target,
    ]);
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
    });
    doc.save("bonanza_plans.pdf");
  };

  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredPlans.map((row, index) => ({
      "S.No.": index + 1,
      "Plan Name": row.name,
      "Min Direct": row.minDirect,
      "ROI %": row.roi,
      "Target Amount": row.target,
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "BonanzaPlans");
    XLSX.writeFile(workbook, "bonanza_plans.xlsx");
  };

  const columns = useMemo(
    () => [
      {
        Header: "S.No.",
        accessor: (_row, i) => i + 1,
        id: "serial",
      },
      {
        Header: "Plan Name",
        accessor: "name",
      },
      {
        Header: "Min Direct",
        accessor: "minDirect",
      },
      {
        Header: "ROI %",
        accessor: "roi",
      },
      {
        Header: "Target Amount",
        accessor: "target",
      },
      {
        Header: "Action",
        Cell: ({ row }) => (
          <div className="flex gap-2">
            <button
              onClick={() => openEditModal(row.original)}
              className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 text-sm"
              title="Edit"
              disabled={isMutating}
            >
              <FaEdit />
            </button>
            <button
              onClick={() => alert("Deactivate clicked")}
              className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 text-sm"
              title="Deactivate"
              disabled={isMutating}
            >
              <FaBan />
            </button>
            <button
              onClick={() => handleDelete(row.original._id)}
              className="bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-700 text-sm"
              title="Delete"
              disabled={isMutating}
            >
              <FaTrash />
            </button>
          </div>
        ),
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
      data: filteredPlans,
      initialState: { pageIndex: 0, pageSize: 20 },
    },
    usePagination
  );

  const openEditModal = (rowData) => {
    setEditRowData({ ...rowData, minDirect: rowData.minDirect ?? "" });
    setIsEditing(true);
    setIsModalOpen(true);
    setErrors({});
  };

  const openAddModal = () => {
    setEditRowData({
      name: "",
      roi: "",
      target: "",
      minDirect: "",
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
        name: editRowData.name,
        roi: Number(editRowData.roi),
        target: Number(editRowData.target),
        minDirect: Number(editRowData.minDirect),
      };
      if (isEditing) {
        updateBonanza({ id: editRowData._id, data: formattedData });
      } else {
        createBonanza(formattedData);
      }
    }
  };

  const isMutating = isCreating || isUpdating || isDeleting;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-[#103944]">Bonanza Plans</h2>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-[#103944] text-white px-4 py-2 rounded hover:bg-[#0e9d52]"
          disabled={isMutating}
        >
          <FaPlus /> Add Plan
        </button>
      </div>

      <div className="mb-4 flex items-center justify-between flex-wrap gap-2">
        <div className="flex gap-2">
          <button
            onClick={handleExportPDF}
            className="bg-red-500 text-white px-4 py-2 rounded mr-2 hover:bg-red-600 text-sm"
            disabled={isLoading || isMutating}
          >
            Export PDF
          </button>
          <button
            onClick={handleExportExcel}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 text-sm"
            disabled={isLoading || isMutating}
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
          <button
            onClick={handleSearch}
            className="ml-2 bg-[#103944] text-white px-4 py-2 rounded hover:bg-[#0e9d52] text-sm"
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
              page.map((row) => {
                prepareRow(row);
                return (
                  <tr  {...row.getRowProps()} key={row.id} className="border-b">
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
          <span className="mr-4 text-[16px] font-semibold text-[#103944]">
            Page {pageIndex + 1} of {pageOptions.length}
          </span>
          <button
            onClick={() => previousPage()}
            disabled={!canPreviousPage || isLoading || isMutating}
            className={`px-4 py-2 mr - 2 font - semibold rounded ${
  canPreviousPage && !isLoading && !isMutating
  ? "bg-[#103944] text-white hover:bg-[#0e9d52]"
  : "bg-[#103944] text-white cursor-not-allowed"
} `}
          >
            Prev
          </button>
          <button
            onClick={() => nextPage()}
            disabled={!canNextPage || isLoading || isMutating}
            className={`px-4 py-2 font - semibold rounded ${
  canNextPage && !isLoading && !isMutating
  ? "bg-[#103944] text-white hover:bg-[#0e9d52]"
  : "bg-[#103944] text-white cursor-not-allowed"
} `}
          >
            Next
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-xl p-6">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-2xl font-bold text-[#103944]">
                {isEditing ? "Edit" : "Add"} Bonanza Plan
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-red-600 text-3xl leading-none"
                disabled={isMutating}
              >
                &times;
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Plan Name</label>
                <input
                  type="text"
                  value={editRowData.name}
                  onChange={(e) => setEditRowData({ ...editRowData, name: e.target.value })}
                  className={`w-full border ${ errors.name ? "border-red-500" : "border-gray-300" } px-4 py-2 rounded-lg`}
                  disabled={isMutating}
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Direct</label>
                <input
                  type="number"
                  value={editRowData.minDirect}
                  onChange={(e) => setEditRowData({ ...editRowData, minDirect: e.target.value })}
                  className={`w-full border ${ errors.minDirect ? "border-red-500" : "border-gray-300" } px-4 py-2 rounded-lg`}
                  disabled={isMutating}
                />
                {errors.minDirect && (
                  <p className="text-red-500 text-xs mt-1">{errors.minDirect}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ROI %</label>
                <input
                  type="number"
                  step="0.1"
                  value={editRowData.roi}
                  onChange={(e) => setEditRowData({ ...editRowData, roi: e.target.value })}
                  className={`w-full border ${ errors.roi ? "border-red-500" : "border-gray-300" } px-4 py-2 rounded-lg`}
                  disabled={isMutating}
                />
                {errors.roi && (
                  <p className="text-red-500 text-xs mt-1">{errors.roi}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Amount</label>
                <input
                  type="number"
                  value={editRowData.target}
                  onChange={(e) => setEditRowData({ ...editRowData, target: e.target.value })}
                  className={`w-full border ${ errors.target ? "border-red-500" : "border-gray-300" } px-4 py-2 rounded-lg`}
                  disabled={isMutating}
                />
                {errors.target && (
                  <p className="text-red-500 text-xs mt-1">{errors.target}</p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={closeModal}
                  className="px-5 py-2 rounded-md bg-gray-100 text-gray-800 hover:bg-gray-200"
                  disabled={isMutating}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-5 py-2 rounded-md bg-[#103944] text-white hover:bg-[#0e9d52]"
                  disabled={isMutating}
                >
                  {isMutating ? "Saving..." : isEditing ? "Save Changes" : "Add Plan"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BonanzaPlan;
