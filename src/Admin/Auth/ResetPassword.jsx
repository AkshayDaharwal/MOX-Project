import   { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import {adminApi} from "../../Admin/Service/adminApi"; // adjust path
import logo from "../../assets/adminImages/Logo/logo_main.png";
import bgImage from "../../assets/adminImages/images/bg_login.jpg";

const ResetPassword = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Handle form changes
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  // Client-side validation
  const validate = () => {
    const newErrors = {};

    if (!form.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!form.otp) {
      newErrors.otp = "OTP is required";
    }
 

    if (!form.newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (form.newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters";
    } else if (!/[a-z]/.test(form.newPassword)) {
      newErrors.newPassword = "Password must contain at least one lowercase letter";
    }

    if (!form.confirmPassword) {
      newErrors.confirmPassword = "Confirm password is required";
    } else if (form.confirmPassword !== form.newPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    return newErrors;
  };

  // Send OTP mutation
  const { mutate: sendOtp, isPending: isSendingOtp } = useMutation({
    mutationFn: (payload) => adminApi.forgetPassword(payload),
    onSuccess: (res) => {
      setOtpSent(true);
      setCountdown(60);
      setSuccess(res?.message || "OTP sent successfully.");
      setErrors({});
    },
    onError: (err) => {
      setSuccess("");
      setErrors({
        api: err?.response?.data?.message || "Failed to send OTP.",
      });
    },
  });

  // Reset Password mutation
  const { mutate: resetPassword, isPending: isResetting } = useMutation({
    mutationFn: (payload) => adminApi.resetPassword(payload),
    onSuccess: (res) => {
      setSuccess(res?.message || "Password reset successful!");
      setErrors({});
      setTimeout(() => navigate("/admin/login"), 2000);
    },
    onError: (err) => {
      setSuccess("");
      setErrors({
        api: err?.response?.data?.message || "Failed to reset password",
      });
    },
  });

  // Send OTP handler
  const handleSendOtp = () => {
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) {
      setErrors({ email: "Please enter a valid email before requesting OTP" });
      return;
    }
    sendOtp({ email: form.email });
  };

  // Reset Password handler
  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setSuccess("");
      return;
    }
    resetPassword({
      email: form.email,
      otp: form.otp,
      newPassword: form.newPassword,
    });
  };

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="bg-white bg-opacity-90 p-8 rounded-xl shadow-lg w-full max-w-md">
        <div className="flex justify-center mb-6">
          <img src={logo} alt="Logo" className="h-16" />
        </div>
        <h2 className="text-2xl font-semibold text-center mb-4 text-gray-800">
          Reset Password
        </h2>

        {success && (
          <div className="mb-4 text-green-600 text-sm text-center">{success}</div>
        )}
        {errors.api && (
          <div className="mb-4 text-red-600 text-sm text-center">{errors.api}</div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Email + Send OTP */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-1">Email</label>
            <div className="flex gap-2">
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="flex-1 border border-gray-300 p-2 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
              />
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={countdown > 0 || isSendingOtp}
                className={`px-3 py-2 rounded-md text-white ${countdown > 0 || isSendingOtp
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-[#103944] hover:bg-[#0e9d52]"
                  }`}
              >

                {
                  isSendingOtp?"Sending...":
                  countdown > 0
                  ? `Resend (${countdown}s)`
                  : otpSent
                    ? "Resend"
                    : "Send OTP"}
              </button>
            </div>
            {errors.email && <p className="text-red-600 text-sm">{errors.email}</p>}
          </div>

          {/* OTP */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-1">OTP</label>
            <input
              type="text"
              name="otp"
              value={form.otp}
              onChange={handleChange}
              className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
            />
            {errors.otp && <p className="text-red-600 text-sm">{errors.otp}</p>}
          </div>

          {/* New Password */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-1">New Password</label>
            <input
              type="password"
              name="newPassword"
              value={form.newPassword}
              onChange={handleChange}
              className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
            />
            {errors.newPassword && (
              <p className="text-red-600 text-sm">{errors.newPassword}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="mb-6">
            <label className="block text-gray-700 mb-1">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
            />
            {errors.confirmPassword && (
              <p className="text-red-600 text-sm">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Submit */}
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={isResetting}
              className="w-[100px] bg-[#103944] text-white py-2 rounded-md hover:bg-[#0e9d52] transition duration-300"
            >
              {isResetting ? "Loading..." : "Submit"}
            </button>
          </div>

          <div className="text-center mt-4">
            <Link to="/admin/login" className="text-blue-600 hover:underline text-sm">
              Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
