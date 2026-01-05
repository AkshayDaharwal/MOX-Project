import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useMutation } from "@tanstack/react-query";
import { adminApi } from "../../Service/adminApi";

const UpdateWalletAddress = () => {
  const [formData, setFormData] = useState({
    userId: "",
    newWalletAddress: "",
    ticketId: "",
    notes: "",
  });
  const [errors, setErrors] = useState({});

  const { mutate: updateWalletAddress, isPending } = useMutation({
    mutationFn: (data) => adminApi.updateUserWalletAddress(data),
    onSuccess: (res) => {
      toast.success(res?.data?.message || "Wallet address updated successfully!");
      setFormData({ userId: "", newWalletAddress: "", ticketId: "", notes: "" });
      setErrors({});
    },
    onError: (err) => {
      const message =
        err?.response?.data?.message ||
        err?.data?.message ||
        err?.message ||
        "Failed to update wallet address.";
      toast.error(message);
    },
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.userId.trim()) {
      newErrors.userId = "User ID is required";
    } else if (!/^[0-9a-fA-F]{24}$/.test(formData.userId.trim())) {
      newErrors.userId = "Invalid User ID format";
    }
    if (!formData.newWalletAddress.trim()) {
      newErrors.newWalletAddress = "New wallet address is required";
    } else if (!/^0x[a-fA-F0-9]{40}$/.test(formData.newWalletAddress.trim())) {
      newErrors.newWalletAddress = "Invalid wallet address format (must be 0x followed by 40 hex characters)";
    }
    if (!formData.ticketId.trim()) {
      newErrors.ticketId = "Ticket ID is required";
    } else if (!/^TICKET-[a-f0-9]{8}$/.test(formData.ticketId.trim())) {
      newErrors.ticketId = "Invalid Ticket ID format (must be TICKET- followed by 8 hex characters)";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      updateWalletAddress({
        userId: formData.userId,
        newWalletAddress: formData.newWalletAddress,
        ticketId: formData.ticketId,
        notes: formData.notes,
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#fff] flex items-center justify-center px-4">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-lg p-8 border border-gray-200">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
          Update User Wallet Address
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="userId"
              className="block text-[16px] font-medium text-[#103944] mb-1"
            >
              User ID
            </label>
            <input
              id="userId"
              type="text"
              name="userId"
              value={formData.userId}
              onChange={handleChange}
              className={`w-full border ${errors.userId ? "border-red-500" : "border-gray-300"
                } px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300 shadow-sm hover:shadow-md`}
              disabled={isPending}
              required
              placeholder="Enter 24-character User ID"
              aria-invalid={!!errors.userId}
              aria-describedby={errors.userId ? "userId-error" : undefined}
            />
            {errors.userId && (
              <p id="userId-error" className="text-red-500 text-xs mt-1">
                {errors.userId}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="newWalletAddress"
              className="block text-[16px] font-medium text-[#103944] mb-1"
            >
              New Wallet Address
            </label>
            <input
              id="newWalletAddress"
              type="text"
              name="newWalletAddress"
              value={formData.newWalletAddress}
              onChange={handleChange}
              className={`w-full border ${errors.newWalletAddress ? "border-red-500" : "border-gray-300"
                } px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300 shadow-sm hover:shadow-md`}
              disabled={isPending}
              required
              placeholder="Enter new wallet address (e.g., 0x...)"
              aria-invalid={!!errors.newWalletAddress}
              aria-describedby={errors.newWalletAddress ? "newWalletAddress-error" : undefined}
            />
            {errors.newWalletAddress && (
              <p id="newWalletAddress-error" className="text-red-500 text-xs mt-1">
                {errors.newWalletAddress}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="ticketId"
              className="block text-[16px] font-medium text-[#103944] mb-1"
            >
              Ticket ID
            </label>
            <input
              id="ticketId"
              type="text"
              name="ticketId"
              value={formData.ticketId}
              onChange={handleChange}
              className={`w-full border ${errors.ticketId ? "border-red-500" : "border-gray-300"
                } px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300 shadow-sm hover:shadow-md`}
              disabled={isPending}
              required
              placeholder="Enter Ticket ID (e.g., TICKET-4b8efa3d)"
              aria-invalid={!!errors.ticketId}
              aria-describedby={errors.ticketId ? "ticketId-error" : undefined}
            />
            {errors.ticketId && (
              <p id="ticketId-error" className="text-red-500 text-xs mt-1">
                {errors.ticketId}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="notes"
              className="block text-[16px] font-medium text-[#103944] mb-1"
            >
              Notes (Optional)
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className={`w-full border ${errors.notes ? "border-red-500" : "border-gray-300"
                } px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300 shadow-sm hover:shadow-md`}
              disabled={isPending}
              placeholder="Enter any additional notes"
              rows="4"
              aria-describedby={errors.notes ? "notes-error" : undefined}
            />
            {errors.notes && (
              <p id="notes-error" className="text-red-500 text-xs mt-1">
                {errors.notes}
              </p>
            )}
          </div>

          <div className="text-center">
            <button
              type="submit"
              className="w-[160px] mt-4 bg-[#103944] hover:bg-[#0e9d52] text-white font-medium py-2 px-4 rounded-md transition-all duration-300 shadow-sm hover:shadow-md hover:scale-105 disabled:opacity-50 disabled:scale-100"
              disabled={isPending}
              aria-label="Update wallet address"
            >
              {isPending ? "Submitting..." : "Update Wallet"}
            </button>
          </div>
        </form>
      </div>

      <ToastContainer />
    </div>
  );
};

export default UpdateWalletAddress;