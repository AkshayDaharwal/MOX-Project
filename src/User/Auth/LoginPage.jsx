import { useState, useEffect } from "react";
import axios from "axios";
import loginimg from "../../assets/userImages/images/loginimg.webp";
import logo from "../../assets/homeimages/images/ICON MOX.png";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { toast } from "react-toastify";
import { appConfig } from "../../config/appConfig";

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    otp: "",
    remember: localStorage.getItem("rememberMe") === "true",
  });
  const [errors, setErrors] = useState({ email: "", password: "", otp: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [otpRequested, setOtpRequested] = useState(false);

  // Check if already logged in on mount
  useEffect(() => {
    const storedToken =
      localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
    if (storedToken && window.location.pathname !== "/user/dashboard") {
      console.log("Token found, redirecting to /user/dashboard:", storedToken);
      navigate("/user/dashboard", { replace: true });
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Enter a valid email address.";
    }
    if (!formData.password) {
      newErrors.password = "Password is required.";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    }
    if (otpRequested && !formData.otp) {
      newErrors.otp = "OTP is required.";
    } else if (otpRequested && !/^\d{6}$/.test(formData.otp)) {
      newErrors.otp = "OTP must be a 6-digit number.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRequestOTP = async () => {
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
      setErrors((prev) => ({
        ...prev,
        email: formData.email ? "Enter a valid email address." : "Email is required.",
      }));
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(`${appConfig.baseURL}/user/auth/resend-otp`, {
        email: formData.email,
        purpose: "login",
      });
      const { message } = response.data;
      toast.success(message || "OTP sent to your email!");
      setOtpRequested(true);
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to send OTP.";
      if (errorMessage === "User not found") {
        setErrors((prev) => ({ ...prev, email: "User not found." }));
      } else if (errorMessage === "Too many OTP resend attempts. Please try again later.") {
        toast.error(errorMessage);
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (!otpRequested) {
      await handleRequestOTP();
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(`${appConfig.baseURL}/user/auth/login`, {
        email: formData.email,
        password: formData.password,
        otp: formData.otp,
      });
      const { message, data } = response.data;
      const { token } = data;

      if (token) {
        const storage = formData.remember ? localStorage : sessionStorage;
        storage.setItem("authToken", token);
        if (formData.remember) {
          localStorage.setItem("rememberMe", "true");
        } else {
          localStorage.removeItem("rememberMe");
        }
        toast.success(message || "Login successful!");
        setTimeout(() => navigate("/user/dashboard", { replace: true }), 1000);
      } else {
        toast.error("Login failed: No token received");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Invalid email, password, or OTP.";
      if (errorMessage === "Email not verified") {
        navigate("/user/verify-user", { replace: true });
        toast.info("Please verify your email before proceeding.");
      } else if (errorMessage === "Invalid OTP" || errorMessage === "OTP expired") {
        setErrors((prev) => ({ ...prev, otp: errorMessage }));
        toast.error(errorMessage);
      } else if (errorMessage === "Invalid credentials") {
        setErrors((prev) => ({
          ...prev,
          email: errorMessage,
          password: errorMessage,
        }));
        toast.error(errorMessage);
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-fit md:h-screen overflow-hidden shadow-xl flex flex-col-reverse md:flex-row">
      <div className="w-full md:w-1/2 bg-[#1a152d] relative">
        <img src={loginimg} alt="Login" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/40 flex flex-col justify-between p-6">
          <Link
            to="/"
            className="self-end text-sm text-white bg-white/10 px-4 py-1 rounded-full backdrop-blur-md"
            aria-label="Back to website"
          >
            Back to website →
          </Link>
          <div>
            <p className="text-xl font-medium">Capturing Moments,</p>
            <p className="text-xl font-medium">Creating Memories</p>
            <div className="mt-3 flex space-x-1">
              <span className="w-2 h-2 bg-white/40 rounded-full"></span>
              <span className="w-2 h-2 bg-white/40 rounded-full"></span>
              <span className="w-2 h-2 bg-white rounded-full"></span>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full relative min-h-screen md:min-h-auto flex items-center justify-center md:w-1/2 p-8 md:p-12">
        <Link
          to="/"
          className="absolute top-5 right-5 text-xs text-white bg-white/10 px-4 py-1 rounded-full backdrop-blur-md"
          aria-label="Back to website"
        >
          Back to website →
        </Link>
        <div className="w-full max-w-xl">
          <div className="mb-5">
            <img src={logo} className="w-20" alt="Logo" />
          </div>
          <h2 className="text-3xl font-bold mb-4">Sign in to your account</h2>
          <p className="text-sm text-gray-400 mb-6">
            {otpRequested
              ? "Enter the OTP sent to your email to complete login."
              : "Enter your credentials to receive an OTP."}
          </p>
          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            <div>
              <input
                type="email"
                name="email"
                placeholder="Email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-md bg-secondary/10 border ${
                  errors.email ? "border-red-500" : "border-white/10"
                } focus:outline-none focus:ring-2 ${
                  errors.email ? "focus:ring-red-500" : "focus:ring-primary"
                }`}
                disabled={isLoading || otpRequested}
                autoFocus
                aria-label="Email input"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1" role="alert">
                  {errors.email}
                </p>
              )}
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-md bg-secondary/10 border ${
                  errors.password ? "border-red-500" : "border-white/10"
                } focus:outline-none focus:ring-2 ${
                  errors.password ? "focus:ring-red-500" : "focus:ring-primary"
                }`}
                disabled={isLoading || otpRequested}
                aria-label="Password input"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                disabled={isLoading || otpRequested}
                className={`absolute right-3 top-4 mix-blend-difference text-white text-lg hover:text-gray-300 transition-colors ${
                  isLoading || otpRequested ? "opacity-50 cursor-not-allowed" : ""
                }`}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1" role="alert">
                  {errors.password}
                </p>
              )}
            </div>
            {otpRequested && (
              <div>
                <input
                  type="text"
                  name="otp"
                  placeholder="Enter 6-digit OTP"
                  value={formData.otp}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-md bg-secondary/10 border ${
                    errors.otp ? "border-red-500" : "border-white/10"
                  } focus:outline-none focus:ring-2 ${
                    errors.otp ? "focus:ring-red-500" : "focus:ring-primary"
                  }`}
                  disabled={isLoading}
                  aria-label="OTP input"
                />
                {errors.otp && (
                  <p className="text-red-500 text-sm mt-1" role="alert">
                    {errors.otp}
                  </p>
                )}
              </div>
            )}
            <div className="flex items-center justify-between text-sm text-gray-300">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="remember"
                  checked={formData.remember}
                  onChange={handleChange}
                  className="accent-primary"
                  disabled={isLoading}
                  aria-label="Remember me checkbox"
                />
                Remember me
              </label>
              <Link
                to="/user/forgot-password"
                className="text-secondary hover:underline"
                aria-label="Forgot password link"
              >
                Forgot password?
              </Link>
            </div>
            <button
              type="submit"
              className={`w-full py-3 rounded-md bg-gradient-to-br from-[#2298d341] to-[#05CE99] hover:opacity-90 transition-colors font-semibold ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={isLoading}
              aria-label={otpRequested ? "Sign in button" : "Request OTP button"}
            >
              {isLoading ? (
                <svg
                  className="animate-spin h-5 w-5 mx-auto"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
              ) : otpRequested ? (
                "Sign In"
              ) : (
                "Request OTP"
              )}
            </button>
            {otpRequested && (
              <button
                type="button"
                onClick={handleRequestOTP}
                className={`w-full py-3 mt-2 rounded-md bg-gray-600 hover:bg-gray-700 transition-colors font-semibold text-white ${
                  isLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={isLoading}
                aria-label="Resend OTP button"
              >
                Resend OTP
              </button>
            )}
          </form>
          <div className="my-6 flex items-center gap-4">
            <hr className="flex-1 border-gray-600" />
            <span className="text-gray-400 text-sm">
              Want to create an account?{" "}
              <Link
                to="/user/signup"
                className="text-secondary text-nowrap underline-offset-4 hover:underline"
                aria-label="Sign up link"
              >
                Sign Up
              </Link>
            </span>
            <hr className="flex-1 border-gray-600" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;