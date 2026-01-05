
import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useMutation } from "@tanstack/react-query";
import { adminApi } from "../../Service/adminApi"; // Adjust the import path as needed

const Deposit = () => {
  const [formData, setFormData] = useState({
    userId: "",
    amount: "",
    walletType: "deposit",
    currencyType: "USDT",
  });
  const [errors, setErrors] = useState({});

  const { mutate: setDeposit, isPending } = useMutation({
    mutationFn: (data) => adminApi.setDeposit(data),
    onSuccess: (res) => {
      toast.success(res?.data?.message || "Amount deposited successfully!");
      setFormData({ userId: "", amount: "", walletType: "deposit", currencyType: "USDT" });
      setErrors({});
    },
    onError: (err) => {
      const message =
        err?.response?.data?.message ||
        err?.data?.message ||
        err?.message ||
        "Failed to deposit amount.";
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
    if (!formData.amount) {
      newErrors.amount = "Amount is required";
    } else if (isNaN(formData.amount) || Number(formData.amount) <= 0) {
      newErrors.amount = "Amount must be a positive number";
    }
    if (!formData.walletType) {
      newErrors.walletType = "Wallet Type is required";
    }
    if (!formData.currencyType) {
      newErrors.currencyType = "Currency Type is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      setDeposit({
        userId: formData.userId,
        walletType: formData.walletType,
        amount: Number(formData.amount),
        currencyType: formData.currencyType,
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#fff] flex items-center justify-center px-4">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-lg p-8 border border-gray-200">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
          User Deposit
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
              htmlFor="amount"
              className="block text-[16px] font-medium text-[#103944] mb-1"
            >
              Amount
            </label>
            <input
              id="amount"
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              className={`w-full border ${errors.amount ? "border-red-500" : "border-gray-300"
                } px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300 shadow-sm hover:shadow-md`}
              disabled={isPending}
              required
              min="0"
              step="0.01"
              placeholder="Enter deposit amount"
              aria-invalid={!!errors.amount}
              aria-describedby={errors.amount ? "amount-error" : undefined}
            />
            {errors.amount && (
              <p id="amount-error" className="text-red-500 text-xs mt-1">
                {errors.amount}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="walletType"
              className="block text-[16px] font-medium text-[#103944] mb-1"
            >
              Wallet Type
            </label>
            <select
              id="walletType"
              name="walletType"
              value={formData.walletType}
              onChange={handleChange}
              className={`w-full border ${errors.walletType ? "border-red-500" : "border-gray-300"
                } px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300 shadow-sm hover:shadow-md`}
              disabled={isPending}
              required
              aria-invalid={!!errors.walletType}
              aria-describedby={errors.walletType ? "walletType-error" : undefined}
            >
              {/* <option value="principal">Principal Wallet</option> */}
              <option value="deposit">Deposit Wallet</option>
              {/* <option value="my">My Wallet</option> */}
              {/* <option value="emgtWallet">EMGT Wallet</option> */}
            </select>
            {errors.walletType && (
              <p id="walletType-error" className="text-red-500 text-xs mt-1">
                {errors.walletType}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="currencyType"
              className="block text-[16px] font-medium text-[#103944] mb-1"
            >
              Currency Type
            </label>
            <select
              id="currencyType"
              name="currencyType"
              value={formData.currencyType}
              onChange={handleChange}
              className={`w-full border ${errors.currencyType ? "border-red-500" : "border-gray-300"
                } px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300 shadow-sm hover:shadow-md`}
              disabled={isPending}
              required
              aria-invalid={!!errors.currencyType}
              aria-describedby={errors.currencyType ? "currencyType-error" : undefined}
            >
              <option value="USDT">USDT</option>
              {/* <option value="EMGT">EMGT</option> */}
            </select>
            {errors.currencyType && (
              <p id="currencyType-error" className="text-red-500 text-xs mt-1">
                {errors.currencyType}
              </p>
            )}
          </div>

          <div className="text-center">
            <button
              type="submit"
              className="w-[160px] mt-4 bg-[#103944] hover:bg-[#0e9d52] text-white font-medium py-2 px-4 rounded-md transition-all duration-300 shadow-sm hover:shadow-md hover:scale-105 disabled:opacity-50 disabled:scale-100"
              disabled={isPending}
              aria-label="Submit deposit"
            >
              {isPending ? "Submitting..." : "Submit Deposit"}
            </button>
          </div>
        </form>
      </div>

      <ToastContainer />
    </div>
  );
};

export default Deposit;
