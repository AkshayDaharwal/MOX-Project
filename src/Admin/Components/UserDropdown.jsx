import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { adminApi } from "../Service/adminApi";
import { toast } from "react-toastify";
import { FaUser, FaSignOutAlt, FaChevronDown, FaEye, FaEyeSlash } from "react-icons/fa";
import EMicon from "../../assets/adminImages/Logo/icon1.png";
import logo from "../../assets/adminImages/Logo/logo_main.png";

const UserDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    newEmail: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const dropdownRef = useRef();
  const navigate = useNavigate();

  const { mutate: updateProfile, isPending: isUpdating } = useMutation({
    mutationFn: (data) => adminApi.updateProfile(data),
    onSuccess: (res) => {
      setSuccessMessage(res?.data?.message || "Admin profile updated successfully.");
      if (res?.data?.token) {
        localStorage.setItem("adminToken", res.data.true);
      }
      setFormData({ newEmail: "", currentPassword: "", newPassword: "", confirmPassword: "" });
      setShowPasswords({ currentPassword: false, newPassword: false, confirmPassword: false });
      setTimeout(() => {
        setSuccessMessage("");
        setShowModal(false);
      }, 3000);
    },
    onError: (err) => {
      const message =
        err?.response?.data?.message ||
        err?.data?.message ||
        err?.message ||
        "Failed to update profile.";
      setErrorMessage(message);
      setTimeout(() => {
        setErrorMessage("");
      }, 3000);
    },
  });

  const handleToggle = () => setIsOpen(!isOpen);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin/login");
  };

  const handleClickOutside = (e) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleEditProfileClick = () => {
    setShowModal(true);
    setIsOpen(false);
    setFormData({ newEmail: "", currentPassword: "", newPassword: "", confirmPassword: "" });
    setShowPasswords({ currentPassword: false, newPassword: false, confirmPassword: false });
    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setErrorMessage("");
    setSuccessMessage("");
    setFormData({ newEmail: "", currentPassword: "", newPassword: "", confirmPassword: "" });
    setShowPasswords({ currentPassword: false, newPassword: false, confirmPassword: false });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSave = () => {
    if (!formData.newEmail && !formData.currentPassword) {
      setErrorMessage("Please provide either a new email or current password.");
      setTimeout(() => setErrorMessage(""), 3000);
      return;
    }
    if (formData.currentPassword && !formData.newPassword) {
      setErrorMessage("New password is required when updating password.");
      setTimeout(() => setErrorMessage(""), 3000);
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      setErrorMessage("New password and confirm password do not match.");
      setTimeout(() => setErrorMessage(""), 3000);
      return;
    }
    const payload = {};
    if (formData.newEmail) payload.newEmail = formData.newEmail;
    if (formData.currentPassword && formData.newPassword) {
      payload.currentPassword = formData.currentPassword;
      payload.newPassword = formData.newPassword;
    }
    updateProfile(payload);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Dropdown Button */}
      <button
        onClick={handleToggle}
        className="flex items-center gap-2 text-[#103944] font-semibold focus:outline-none"
      >
        <img src={EMicon} alt="MOX" className="h-6" />
        <span className="uppercase">Hi, Mox</span>
        <FaChevronDown className={`transition-transform duration-200 ${isOpen ? "rotate-180" : "rotate-0"}`} />
      </button>

      {/* Dropdown List */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded shadow-lg z-50 shadow-[0_4px_20px_rgba(0,0,0,0.1)]">
          <ul className="text-sm text-[#103944]">
            <li
              onClick={handleEditProfileClick}
              className="px-4 py-2 hover:bg-[#103944] hover:text-white flex items-center gap-2 cursor-pointer"
            >
              <FaUser />
              <span>Edit Profile</span>
            </li>
            <li
              onClick={handleLogout}
              className="px-4 py-2 hover:bg-[#103944] flex items-center gap-2 text-red-500 cursor-pointer border-t"
            >
              <FaSignOutAlt />
              <span>Logout</span>
            </li>
          </ul>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 relative">
            {/* Logo */}
            <div className="flex flex-col items-center mb-4">
              <img src={logo} alt="Admin Logo" className="h-14 mb-2" />
              <h2 className="text-2xl font-bold text-[#103944]">Edit Admin Profile</h2>
            </div>

            {/* Messages */}
            {successMessage && (
              <div className="mb-4 w-full bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded text-sm">
                {successMessage}
              </div>
            )}
            {errorMessage && (
              <div className="mb-4 w-full bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded text-sm">
                {errorMessage}
              </div>
            )}

            {/* Form Fields */}
            <div className="space-y-4">
              {/* <div>
                <label className="block text-sm font-medium text-[#103944] mb-1">Admin ID</label>
                <input
                  type="text"
                  value="admin123"
                  disabled
                  className="w-full px-4 py-2 rounded border bg-gray-100 text-gray-700"
                />
              </div> */}
              <div>
                <label className="block text-sm font-medium text-[#103944] mb-1">
                  Email <span className="text-gray-500 text-xs">(Optional)</span>
                </label>
                <input
                  type="email"
                  name="newEmail"
                  value={formData.newEmail}
                  onChange={handleInputChange}
                  placeholder="Enter new email"
                  className="w-full px-4 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#103944]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#103944] mb-1">Current Password</label>
                <div className="relative">
                  <input
                    type={showPasswords.currentPassword ? "text" : "password"}
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                    placeholder="Enter current password"
                    className="w-full px-4 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#103944]"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility("currentPassword")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#103944] hover:text-[#08242f]"
                  >
                    {showPasswords.currentPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#103944] mb-1">New Password</label>
                <div className="relative">
                  <input
                    type={showPasswords.newPassword ? "text" : "password"}
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    placeholder="Enter new password"
                    className="w-full px-4 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#103944]"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility("newPassword")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#103944] hover:text-[#08242f]"
                  >
                    {showPasswords.newPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#103944] mb-1">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showPasswords.confirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm new password"
                    className="w-full px-4 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#103944]"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility("confirmPassword")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#103944] hover:text-[#08242f]"
                  >
                    {showPasswords.confirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={handleCloseModal}
                disabled={isUpdating}
                className="px-5 py-2 bg-gray-300 text-[#103944] rounded hover:bg-gray-400 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isUpdating}
                className="px-5 py-2 bg-[#103944] text-white rounded hover:bg-[#08242f] transition disabled:opacity-50"
              >
                {isUpdating ? "Saving..." : "Save"}
              </button>
            </div>

            {/* Close Button */}
            <button
              onClick={handleCloseModal}
              disabled={isUpdating}
              className="absolute top-2 right-3 text-gray-600 hover:text-black text-lg font-bold"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDropdown;