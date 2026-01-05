import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FaEye, FaEyeSlash, FaTimes } from "react-icons/fa";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { adminApi } from "../Service/adminApi";

// Define reusable styles
const styles = {
  badge: {
    base: "px-2 py-1 rounded font-medium text-xs",
    green: "bg-green-100 text-green-800 border border-green-300",
    red: "bg-red-100 text-red-800 border border-red-300",
  },
  button: {
    primary: "bg-[#103944] text-white px-4 py-2 rounded hover:bg-[#0e9d52]",
    secondary: "bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600",
    exportPDF: "bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700",
    exportExcel: "bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700",
    disabled: "bg-gray-300 text-gray-600 cursor-not-allowed px-4 py-2 rounded",
    close:
      " absolute right-5 top-5 bg-gray-500 text-white p-2 rounded-full hover:bg-gray-600",
  },
};

// Main component for managing users
const UserManagement = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [editUser, setEditUser] = useState(null);
  const [visiblePasswordId, setVisiblePasswordId] = useState(null);
  const queryClient = useQueryClient();

  // Fetch user data
  const {
    data: getUserData = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["getUserData"],
    queryFn: async () => {
      const res = await adminApi.getUserData();
      if (!res?.data?.users || !Array.isArray(res.data.users)) {
        throw new Error("Invalid response: users array not found");
      }
      return res.data.users;
    },
    onSuccess: (data) => {
      toast.success(`Fetched ${data.length} users successfully.`);
    },
    onError: (err) => {
      const message =
        err?.response?.data?.message ||
        err?.data?.message ||
        err?.message ||
        "Failed to fetch user data.";
      toast.error(message);
    },
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });

  // Update user mutation
  const { mutate: updateUser, isLoading: isUpdating } = useMutation({
    mutationFn: async ({ id, data }) => {
      const res = await adminApi.updateUserData(id, data);
      return res.data;
    },
    onSuccess: () => {
      toast.success("User updated successfully.");
      queryClient.invalidateQueries(["getUserData"]);
      setEditUser(null);
    },
    onError: (err) => {
      const message =
        err?.response?.data?.message ||
        err?.data?.message ||
        err?.message ||
        "Failed to update user.";
      toast.error(message);
    },
  });

  // Define column keys and mappings
  const allColumnKeys = [
    "role",
    "id",
    "referredBy",
    "referralCode",
    "userId",
    "email",
    "depositWallet",
    "myWallet",
    "referralWallet",
    "principleWallet",
    "emgtWallet",
    "reward",
    "walletAddress",
    "investmentPackage",
    "totalEarnings",
    "registrationDate",
    "paidStatus",
    "status",
    "blockStatus",
    "usdtWithdraw",
    "roi",
  ];

  const keyMapping = {
    role: ["role"],
    id: ["id", "_id", "user_id", "userId"],
    referredBy: ["referredBy", "sponsor_id", "referredBy"],
    referralCode: ["referralCode"],
    userId: ["userId", "user_id", "username"],
    email: ["email", "userEmail"],
    depositWallet: ["depositWallet.amount"],
    myWallet: ["myWallet.amount"],
    referralWallet: ["referralWallet.amount"],
    principleWallet: ["principalWallet.amount"],
    emgtWallet: ["emgtWallet.amount"],
    reward: ["reward", "bonanzaEnabled"],
    walletAddress: ["walletAddress", "wallet_addr"],
    investmentPackage: ["investmentPackage", "package"],
    totalEarnings: ["myWallet.amount", "referralWallet.amount"],
    registrationDate: ["registrationDate", "regDate", "createdAt"],
    paidStatus: ["paidStatus", "paymentStatus"],
    status: ["status", "activeStatus", "isEmailVerified"],
    blockStatus: ["blockStatus", "blocked", "isBlocked"],
    usdtWithdraw: ["usdtWithdraw", "usdt", "withdrawEnabled"],
    roi: ["roi", "returnOnInvestment", "roiEnabled"],
  };

  // Normalize data efficiently with type safety
  const normalizedUsers = useMemo(() => {
    return getUserData.map((user, index) => {
      const normalized = { missingFields: new Set() };
      allColumnKeys.forEach((key) => {
        const possibleKeys = keyMapping[key];
        let value;
        for (const k of possibleKeys) {
          if (k.includes(".")) {
            const parts = k.split(".");
            let current = user;
            let found = true;
            for (const part of parts) {
              if (current && typeof current === "object" && part in current) {
                current = current[part];
              } else {
                found = false;
                break;
              }
            }
            if (found && current !== undefined && typeof current !== "object") {
              value = current;
              break;
            }
          } else if (user[k] !== undefined && typeof user[k] !== "object") {
            value = user[k];
            break;
          }
        }

        // Type-safe default values
        if (value === undefined || value === null) {
          if (
            [
              "myWallet",
              "emgtWallet",
              "principleWallet",
              "depositWallet",
              "totalEarnings",
            ].includes(key)
          ) {
            value = 0;
          } else if (key === "status") {
            value = "Inactive";
          } else if (key === "reward") {
            value = "No Reward";
          } else if (key === "paidStatus") {
            value = "Unpaid";
          } else if (key === "blockStatus") {
            value = "Blocked";
          } else if (["usdtWithdraw", "roi"].includes(key)) {
            value = "Off";
          } else {
            value = "N/A";
          }
          normalized.missingFields.add(key);
        } else if (key === "status" && typeof value === "boolean") {
          value = value ? "Active" : "Inactive";
        } else if (key === "reward" && typeof value === "boolean") {
          value = value ? "Reward" : "No Reward";
        } else if (key === "blockStatus" && typeof value === "boolean") {
          value = value ? "Blocked" : "Unblocked";
        } else if (
          ["usdtWithdraw", "roi"].includes(key) &&
          typeof value === "boolean"
        ) {
          value = value ? "On" : "Off";
        }
        normalized[key] = value;
      });
      normalized.id =
        normalized.id !== "N/A" ? normalized.id : `temp - ${index + 1} `;
      return normalized;
    });
  }, [getUserData]);


  // Navigate to login page
const handleQuickLogin = async (email) => {
    try {
      console.log("Initiating login for email:", email); // Debug log
      const response = await adminApi.adminLoginAsUser({ email });
      if (response.status === "success") {
        const { token, redirectUrl } = response.data;
        if (!token || !redirectUrl) {
          throw new Error("Missing token or redirect URL in response");
        }
        // Store token in localStorage
        localStorage.setItem("authToken", true);
        // Open dashboard in new tab
        const newTab = window.open(redirectUrl, "_blank");
        if (!newTab || newTab.closed || typeof newTab.closed === "undefined") {
          toast.error("Popup blocked. Please allow popups for this site.");
        } else {
          toast.success("Opened user dashboard in new tab.", {
            icon: <FaEye className="text-green-500" />,
          });
        }
      } else {
        throw new Error(response.data.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error); // Debug log
      toast.error(`Failed to login as user: ${error.message || "Unknown error"}`);
    }
  };

  // Start editing a user
  const handleEdit = (user) => {
    const defaultUser = { missingFields: user.missingFields };
    allColumnKeys.forEach((key) => {
      defaultUser[key] =
        user[key] ?? // Use existing value or default
        (key === "reward"
          ? "No Reward"
          : key === "paidStatus"
          ? "Unpaid"
          : key === "status"
          ? "Inactive"
          : key === "blockStatus"
          ? "Blocked"
          : key === "usdtWithdraw" || key === "roi"
          ? "Off"
          : key === "myWallet" ||
            key === "emgtWallet" ||
            key === "principleWallet" ||
            key === "depositWallet"
          ? 0
          : "N/A");
    });
    setEditUser(defaultUser);
  };

  // Update edit user state
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditUser((prev) => ({ ...prev, [name]: value }));
  };

  // Save edited user
  const saveEdit = () => {
    if (window.confirm("Are you sure you want to save changes?")) {
      const payload = {
        withdrawEnabled: editUser.usdtWithdraw === "On",
        roiEnabled: editUser.roi === "On",
        isBlocked: editUser.blockStatus === "Blocked",
        bonanzaEnabled: editUser.reward === "Reward",
      };
      updateUser({ id: editUser.id, data: payload });
    }
  };

  // Cancel edit with confirmation
  const cancelEdit = () => {
    if (
      window.confirm(
        "Are you sure you want to cancel? Unsaved changes will be lost."
      )
    ) {
      setEditUser(null);
    }
  };

  // Format column names
  const formatColumnName = (key) => {
    return key
      .replace(/([A-Z])/g, " $1")
      .trim()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Style badges for status fields
  const getBadgeStyle = (value, field) => {
    const baseStyle = styles.badge.base;
    const green = `${baseStyle} ${styles.badge.green} `;
    const red = `${baseStyle} ${styles.badge.red} `;
    if (field === "paidStatus") return value === "Paid" ? green : red;
    if (field === "status") return value === "Active" ? green : red;
    if (field === "blockStatus") return value === "Unblocked" ? green : red;
    if (field === "usdtWithdraw" || field === "roi")
      return value === "On" ? green : red;
    if (field === "reward") return value === "Reward" ? green : red;
    return baseStyle;
  };

  // Define table columns
const columns = useMemo(() => {
    const dataColumns = [
      {
        accessorKey: "sNo",
        header: "S.No.",
        cell: ({ row }) => row.index + 1,
      },
      ...allColumnKeys.map((key) => ({
        accessorKey: key,
        header: formatColumnName(key),
        cell: ({ getValue, row }) => {
          const value = getValue() ?? "N/A";
          if (
            [
              "paidStatus",
              "status",
              "blockStatus",
              "usdtWithdraw",
              "roi",
              "reward",
            ].includes(key)
          ) {
            return <span className={getBadgeStyle(value, key)}>{value}</span>;
          }
          return String(value);
        },
      })),
    ];

    return [
      ...dataColumns,
      {
        id: "quickLogin",
        header: "Quick Login",
        cell: ({ row }) => (
          <button
            onClick={() => handleQuickLogin(row.original.email)}
            className={styles.button.primary}
            aria-label={`Log in as ${row.original.email}`}
          >
            Login
          </button>
        ),
      },
      {
        id: "action",
        header: "Action",
        cell: ({ row }) => (
          <button
            onClick={() => handleEdit(row.original)}
            className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
            aria-label={`Edit user ${row.original.id}`}
          >
            Edit
          </button>
        ),
      },
    ];
  }, [visiblePasswordId]);

  // Set up TanStack Table
  const table = useReactTable({
    data: normalizedUsers,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: { globalFilter: searchQuery },
    onGlobalFilterChange: setSearchQuery,
    globalFilterFn: (row, columnId, filterValue) => {
      const value = row.getValue(columnId);
      return value
        ? String(value).toLowerCase().includes(filterValue.toLowerCase())
        : false;
    },
    initialState: { pagination: { pageSize: 20 } },
  });

  // Export to Excel with loading state
  const [isExporting, setIsExporting] = useState(false);
  const exportToExcel = async () => {
    if (normalizedUsers.length === 0) {
      toast.warn("No data to export.");
      return;
    }
    setIsExporting(true);
    try {
      const data = table.getPrePaginationRowModel().rows.map((row) => {
        const rowData = {};
        allColumnKeys.forEach((key) => {
          rowData[formatColumnName(key)] = row.original[key];
        });
        return rowData;
      });
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
      XLSX.writeFile(workbook, "UserManagement.xlsx");
      toast.success("Exported to Excel successfully.");
    } catch (err) {
      toast.error("Failed to export to Excel.");
    } finally {
      setIsExporting(false);
    }
  };

  // Export to PDF with loading state
  const exportToPDF = async () => {
    if (normalizedUsers.length === 0) {
      toast.warn("No data to export.");
      return;
    }
    setIsExporting(true);
    try {
      const doc = new jsPDF();
      const columns = allColumnKeys.map(formatColumnName);
      const data = table
        .getPrePaginationRowModel()
        .rows.map((row) =>
          allColumnKeys.map((key) => String(row.original[key]))
        );

      autoTable(doc, {
        head: [columns],
        body: data,
        startY: 20,
        theme: "striped",
        headStyles: { fillColor: [16, 57, 68], textColor: [255, 255, 255] },
        styles: { fontSize: 8, cellPadding: 2 },
        margin: { top: 20 },
        didDrawPage: (data) => {
          doc.setFontSize(10);
          doc.text(
            `Page ${data.pageNumber} `,
            doc.internal.pageSize.getWidth() - 30,
            10
          );
        },
      });
      doc.save("UserManagement.pdf");
      toast.success("Exported to PDF successfully.");
    } catch (err) {
      toast.error("Failed to export to PDF.");
    } finally {
      setIsExporting(false);
    }
  };

  // Render loading or error states
  if (isLoading) {
    return (
      <div className="p-4 max-w-[1260px] mx-auto">
        <h2 className="text-2xl font-bold mb-4 text-[#103944]">
          User Management
        </h2>
        <p className="text-gray-600">Loading users...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 max-w-[1260px] mx-auto">
        <h2 className="text-2xl font-bold mb-4 text-[#103944]">
          User Management
        </h2>
        <p className="text-red-600">
          Error: {error?.message || "Failed to load user data."}
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 flex-1 text-nowrap max-w-[1260px] mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-[#103944]">
        User Management
      </h2>

      <div className="mb-4 flex flex-col md:flex-row items-center justify-between">
        <div className="flex gap-2 mb-4 md:mb-0">
          <button
            onClick={exportToPDF}
            className={
              isExporting ? styles.button.disabled : styles.button.exportPDF
            }
            disabled={isExporting}
            aria-label="Export to PDF"
          >
            {isExporting ? "Exporting..." : "Export PDF"}
          </button>
          <button
            onClick={exportToExcel}
            className={
              isExporting ? styles.button.disabled : styles.button.exportExcel
            }
            disabled={isExporting}
            aria-label="Export to Excel"
          >
            {isExporting ? "Exporting..." : "Export Excel"}
          </button>
        </div>
        <div className="flex items-center w-full md:w-auto">
          <input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border border-gray-300 rounded px-4 py-2 w-full max-w-xs focus:outline-none focus:ring-2 focus:ring-[#103944]"
            aria-label="Search users"
          />
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded shadow-md border border-gray-200 p-4">
        <table className="min-w-[1800px] w-full text-sm border" role="grid">
          <thead className="bg-[#103944] text-white">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="p-2 border whitespace-nowrap"
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
                  <td key={cell.id} className="p-2 border">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editUser && (
        <div
          onClick={cancelEdit}
          className="fixed inset-0 bg-black mt-10 bg-opacity-50 flex items-center justify-center"
          role="dialog"
          aria-modal="true"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white   p-6 rounded-lg shadow-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto relative"
          >
            <button
              onClick={cancelEdit}
              className={styles.button.close}
              aria-label="Close edit popup"
              title="Close"
            >
              <FaTimes />
            </button>
            <h3 className="text-2xl font-bold mb-4 text-[#103944]">
              Edit User
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allColumnKeys.map(
                (key) =>
                  key !== "id" && (
                    <div key={key} className="flex flex-col">
                      <label
                        className="text-sm font-medium text-gray-700 capitalize"
                        htmlFor={key}
                      >
                        {formatColumnName(key)}
                      </label>
                      {[
                        "paidStatus",
                        "status",
                        "blockStatus",
                        "usdtWithdraw",
                        "roi",
                        "reward",
                      ].includes(key) ? (
                        <select
                          id={key}
                          name={key}
                          value={editUser[key]}
                          onChange={handleEditChange}
                          disabled={
                            key !== "usdtWithdraw" &&
                            key !== "roi" &&
                            key !== "blockStatus" &&
                            key !== "reward"
                          }
                          className={`border rounded px - 2 py - 1 mt - 1 focus: outline - none focus: ring - 2 focus: ring - [#103944] ${getBadgeStyle(
                            editUser[key],
                            key
                          )} ${
                            key !== "usdtWithdraw" &&
                            key !== "roi" &&
                            key !== "blockStatus" &&
                            key !== "reward"
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          } `}
                          aria-label={`Edit ${formatColumnName(key)} `}
                        >
                          {key === "paidStatus" && (
                            <>
                              <option value="Paid">Paid</option>
                              <option value="Unpaid">Unpaid</option>
                            </>
                          )}
                          {key === "status" && (
                            <>
                              <option value="Active">Active</option>
                              <option value="Inactive">Inactive</option>
                            </>
                          )}
                          {key === "blockStatus" && (
                            <>
                              <option value="Unblocked">Unblocked</option>
                              <option value="Blocked">Blocked</option>
                            </>
                          )}
                          {(key === "usdtWithdraw" || key === "roi") && (
                            <>
                              <option value="On">On</option>
                              <option value="Off">Off</option>
                            </>
                          )}
                          {key === "reward" && (
                            <>
                              <option value="Reward">Reward</option>
                              <option value="No Reward">No Reward</option>
                            </>
                          )}
                        </select>
                      ) : (
                        <input
                          id={key}
                          type={
                            key === "password"
                              ? "password"
                              : key.includes("Wallet") ||
                                key === "totalEarnings"
                              ? "number"
                              : "text"
                          }
                          name={key}
                          value={editUser[key] ?? ""}
                          onChange={handleEditChange}
                          disabled
                          className="border rounded px-2 py-1 mt-1 focus:outline-none focus:ring-2 focus:ring-[#103944] opacity-50 cursor-not-allowed"
                          aria-label={`Edit ${formatColumnName(key)} `}
                        />
                      )}
                    </div>
                  )
              )}
            </div>
            <div className="flex justify-end mt-6 gap-2">
              <button
                onClick={cancelEdit}
                className={styles.button.secondary}
                aria-label="Cancel editing"
                disabled={isUpdating}
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                className={
                  isUpdating ? styles.button.disabled : styles.button.primary
                }
                aria-label="Save changes"
                disabled={isUpdating}
              >
                {isUpdating ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-end mt-4">
        <span className="text-sm text-gray-600 mr-4">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className={
              table.getCanPreviousPage()
                ? styles.button.primary
                : styles.button.disabled
            }
            aria-label="Previous page"
          >
            Prev
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className={
              table.getCanNextPage()
                ? styles.button.primary
                : styles.button.disabled
            }
            aria-label="Next page"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
