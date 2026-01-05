import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/adminImages/Logo/logo_main.png";
import bgImage from "../../assets/adminImages/images/bg_login.jpg";
import { useMutation } from "@tanstack/react-query";
import { adminApi } from "../Service/adminApi";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "", otp: "" });
  const [errors, setErrors] = useState({});
  const [animate, setAnimate] = useState(false);
  const [otpRequested, setOtpRequested] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setAnimate(true);
  }, []);

  // Validation function
  const validate = () => {
    const newErrors = {};

    if (!form.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email))
      newErrors.email = "Please enter a valid email address";

    if (!form.password) newErrors.password = "Password is required";
    else if (form.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password))
      newErrors.password =
        "Password must include uppercase, lowercase, and a number";

    if (otpRequested && !form.otp) newErrors.otp = "OTP is required";
    else if (otpRequested && !/^\d{6}$/.test(form.otp))
      newErrors.otp = "OTP must be a 6-digit number";

    return newErrors;
  };

  // Mutation for requesting OTP
  const { mutate: requestOtp, isPending: isRequestingOtp } = useMutation({
    mutationFn: (data) => adminApi.resendSignUpOtp(data),
    onSuccess: (res) => {
      const message = res?.message || res?.data?.message || "OTP sent to your email.";
      toast.success(message);
      setOtpRequested(true);
    },
    onError: (err) => {
      console.error("Request OTP error:", err);
      const message =
        err?.response?.data?.message ||
        err?.data?.message ||
        err?.message ||
        "Failed to send OTP.";
      toast.error(message);
      if (message === "Admin not found") {
        setErrors((prev) => ({ ...prev, email: "Admin not found" }));
      } else if (message === "Too many OTP resend attempts. Please try again later.") {
        toast.error(message);
      }
    },
  });

  // Mutation for login
  const { mutate: login, isPending: isLoggingIn } = useMutation({
    mutationFn: (creds) => adminApi.adminLogin(creds),
    onSuccess: (res) => {
      const token = res?.token || res?.data?.token;
      const message = res?.message || res?.data?.message || "Login successful.";
      if (token) {
        localStorage.setItem("token", true);
        toast.success(message);
        setTimeout(() => {
          navigate("/admin/dashboard");
        }, 1000);
      } else {
        toast.error("No token received from server.");
      }
    },
    onError: (err) => {
      console.error("Login error:", err);
      const message =
        err?.response?.data?.message ||
        err?.data?.message ||
        err?.message ||
        "Login failed due to unknown error.";
      toast.error(message);
      if (message === "Email not verified") {
        navigate("/admin/verify-email");
      } else if (message === "Invalid or expired OTP") {
        setErrors((prev) => ({ ...prev, otp: message }));
      } else if (message === "Invalid credentials") {
        setErrors((prev) => ({
          ...prev,
          email: message,
          password: message,
        }));
      }
    },
  });

  const handleRequestOtp = () => {
    const validationErrors = validate();
    if (validationErrors.email || validationErrors.password) {
      setErrors(validationErrors);
      toast.error("Please fix the validation errors before requesting OTP.");
      return;
    }
    setErrors({});
    requestOtp({ email: form.email, purpose: "login" });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error("Please fix the validation errors before submitting.");
      return;
    }

    setErrors({});
    if (!otpRequested) {
      handleRequestOtp();
    } else {
      login(form);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center px-4 transition-all duration-700"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <ToastContainer position="top-right" autoClose={3000} />
      <div
        className={`w-full max-w-md shadow-xl rounded-xl p-8 backdrop-blur-md bg-white/80 border border-white/30 transition-all duration-700 transform ${
          animate ? "scale-100 opacity-100" : "scale-90 opacity-0"
        }`}
      >
        {/* Logo */}
        <div className="flex justify-center mb-4">
          <img src={logo} alt="Logo" className="h-14 w-auto drop-shadow-lg" />
        </div>

        <h2 className="text-[28px] text-center font-bold text-[#103944] mb-2">
          Welcome to Admin Panel
        </h2>
        <p className="text-[16px] text-center text-[#000] mb-6">
          {otpRequested
            ? "Enter the OTP sent to your email to complete login."
            : "Enter your credentials to receive an OTP."}
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>
          <label className="block text-[#103944] font-semibold mb-1 text-[16px]">
            Email
          </label>
          <input
            type="email"
            placeholder="Enter your email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className={`w-full p-2 mb-1 border rounded outline-none transition duration-300 focus:ring-2 ${
              errors.email
                ? "border-red-600 focus:ring-red-400"
                : "border-[#103944] focus:border-[#0e9d52] focus:ring-[#0e9d52]/30"
            }`}
            disabled={isLoggingIn || isRequestingOtp || otpRequested}
          />
          {errors.email && (
            <p className="text-red-600 text-sm mb-3">{errors.email}</p>
          )}

          <label className="block text-[#103944] font-semibold mb-1 text-[16px]">
            Password
          </label>
          <input
            type="password"
            placeholder="Enter your password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className={`w-full p-2 mb-1 border rounded outline-none transition duration-300 focus:ring-2 ${
              errors.password
                ? "border-red-600 focus:ring-red-400"
                : "border-[#103944] focus:border-[#0e9d52] focus:ring-[#0e9d52]/30"
            }`}
            disabled={isLoggingIn || isRequestingOtp || otpRequested}
          />
          {errors.password && (
            <p className="text-red-600 text-sm mb-3">{errors.password}</p>
          )}

          {otpRequested && (
            <>
              <label className="block text-[#103944] font-semibold mb-1 text-[16px]">
                OTP
              </label>
              <input
                type="text"
                placeholder="Enter 6-digit OTP"
                value={form.otp}
                onChange={(e) => setForm({ ...form, otp: e.target.value })}
                className={`w-full p-2 mb-1 border rounded outline-none transition duration-300 focus:ring-2 ${
                  errors.otp
                    ? "border-red-600 focus:ring-red-400"
                    : "border-[#103944] focus:border-[#0e9d52] focus:ring-[#0e9d52]/30"
                }`}
                disabled={isLoggingIn || isRequestingOtp}
              />
              {errors.otp && (
                <p className="text-red-600 text-sm mb-3">{errors.otp}</p>
              )}
            </>
          )}

          <div className="flex justify-center mt-4">
            <button
              type="submit"
              disabled={isLoggingIn || isRequestingOtp}
              className="w-[120px] bg-[#103944] text-white py-2 rounded shadow-md hover:bg-[#0e9d52] transition duration-300 transform hover:scale-[1.02] disabled:opacity-50"
            >
              {isLoggingIn || isRequestingOtp
                ? "Processing..."
                : otpRequested
                ? "Login"
                : "Request OTP"}
            </button>
          </div>

          {otpRequested && (
            <div className="flex justify-center mt-3">
              <button
                type="button"
                onClick={handleRequestOtp}
                disabled={isLoggingIn || isRequestingOtp}
                className="w-[120px] bg-gray-600 text-white py-2 rounded shadow-md hover:bg-gray-700 transition duration-300 transform hover:scale-[1.02] disabled:opacity-50"
              >
                Resend OTP
              </button>
            </div>
          )}

          <div className="flex justify-between mt-4 text-[15px]">
            <Link
              to="/admin/reset-password"
              className="text-blue-600 hover:underline"
            >
              Forgot Password?
            </Link>
            <Link
              to="/admin/sign-up"
              className="text-blue-600 hover:underline"
            >
              Sign Up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;