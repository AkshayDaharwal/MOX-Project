import { useState, useEffect } from "react";
import axios from "axios";
import loginimg from "../../assets/userImages/images/loginimg.webp";
import logo from "../../assets/homeimages/images/ICON MOX.png";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { toast } from "react-toastify";
import { appConfig } from "../../config/appConfig";

const ForgotPasswordPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [otpSent, setOtpSent] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Countdown timer for OTP resend
  useEffect(() => {
    let countdown;
    if (timer > 0) {
      countdown = setTimeout(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(countdown);
  }, [timer]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateEmail = () => {
    const newErrors = {};
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Invalid email";
    return newErrors;
  };

  const validateReset = () => {
    const newErrors = {};
    if (!formData.otp.trim()) newErrors.otp = "OTP is required";
    else if (!/^\d{6}$/.test(formData.otp)) newErrors.otp = "OTP must be a 6-digit number";
    if (!formData.newPassword.trim()) newErrors.newPassword = "New password is required";
    else if (formData.newPassword.length < 6)
      newErrors.newPassword = "Password must be at least 6 characters";
    if (!formData.confirmPassword.trim()) newErrors.confirmPassword = "Please confirm your password";
    else if (formData.newPassword !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    return newErrors;
  };

  const handleSendOtp = async () => {
    const emailErrors = validateEmail();
    if (Object.keys(emailErrors).length > 0) {
      setErrors(emailErrors);
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(`${appConfig.baseURL}/user/auth/forgot-password`, {
        email: formData.email,
      });
      setOtpSent(true);
      setTimer(60);
      toast.success(response.data.message || `OTP sent to ${formData.email}`);
    } catch (error) {
      console.log("Send OTP Error:", error.response?.data, error.response?.status);
      toast.error(error.response?.data?.message || "Failed to send OTP");
      setErrors((prev) => ({ ...prev, email: error.response?.data?.message || "Failed to send OTP" }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const resetErrors = validateReset();
    if (Object.keys(resetErrors).length > 0) {
      setErrors(resetErrors);
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(`${appConfig.baseURL}/user/auth/reset-password`, {
        email: formData.email,
        otp: formData.otp,
        newPassword: formData.newPassword,
      });
      toast.success(response.data.message || "Password reset successfully");
      setTimeout(() => navigate("/user/login", { replace: true }), 1000); // Delay for toast visibility
    } catch (error) {
      console.log("Reset Password Error:", error.response?.data, error.response?.status);
      const errorMessage = error.response?.data?.message || "Failed to reset password";
      toast.error(errorMessage);
      setErrors((prev) => ({
        ...prev,
        otp: errorMessage.includes("OTP") ? errorMessage : prev.otp,
        newPassword: errorMessage.includes("password") ? errorMessage : prev.newPassword,
        confirmPassword: errorMessage.includes("password") ? errorMessage : prev.confirmPassword,
      }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-fit md:h-screen overflow-hidden shadow-xl flex flex-col-reverse md:flex-row">
      <div className="w-full h-screen md:w-1/2 bg-[#1a152d] relative">
        <img src={loginimg} alt="Reset Password" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/40 flex flex-col justify-between p-6">
          <Link
            to="/"
            className="self-end text-sm text-white bg-white/10 px-4 py-1 rounded-full backdrop-blur-md"
            aria-label="Back to website"
          >
            Back to website →
          </Link>
          <div>
            <p className="text-xl font-medium">Forgot Your Password?</p>
            <p className="text-xl font-medium">Reset It Safely</p>
            <div className="mt-3 flex space-x-1">
              <span className="w-2 h-2 bg-white/40 rounded-full"></span>
              <span className="w-2 h-2 bg-white/40 rounded-full"></span>
              <span className="w-2 h-2 bg-white rounded-full"></span>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full relative min-h-screen md:h-full overflow-y-auto flex items-center justify-center md:w-1/2 p-8 md:p-12">
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
          <h2 className="text-3xl font-bold mb-4">Reset Your Password</h2>
          <p className="text-sm text-gray-400 mb-6">
            Enter your email to receive an OTP, then use it to set a new password.
          </p>

          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            {/* Email + Send OTP */}
            <div>
              <div className="w-full relative rounded-md bg-secondary/10 border border-white/10 focus:outline-none focus:ring-2 focus:ring-primary">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email"
                  className="bg-transparent h-full px-4 py-3 w-full"
                  disabled={isLoading || otpSent}
                  autoFocus
                  aria-label="Email input"
                />
                <button
                  type="button"
                  disabled={isLoading || timer > 0}
                  onClick={handleSendOtp}
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-nowrap border px-3 rounded-full text-xs py-1 transition-all duration-200 ${
                    isLoading || timer > 0
                      ? "cursor-not-allowed bg-gray-500 text-white border-gray-500"
                      : "bg-slate-900 border-slate-600 hover:bg-white hover:text-black"
                  }`}
                  aria-label={isLoading ? "Sending OTP" : timer > 0 ? `Resend OTP in ${timer} seconds` : "Send OTP"}
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
                  ) : otpSent ? (
                    timer > 0 ? `Resend OTP (${timer}s)` : "Resend OTP"
                  ) : (
                    "Send OTP"
                  )}
                </button>
              </div>
              {errors.email && (
                <p className="text-red-500 text-xs mt-1" role="alert">
                  {errors.email}
                </p>
              )}
            </div>

            {/* OTP + Password Fields */}
            {otpSent && (
              <>
                <div>
                  <input
                    type="text"
                    name="otp"
                    value={formData.otp}
                    onChange={handleChange}
                    placeholder="Enter OTP"
                    className="w-full px-4 py-3 rounded-md bg-secondary/10 border border-white/10 focus:outline-none focus:ring-2 focus:ring-primary"
                    disabled={isLoading}
                    inputMode="numeric"
                    pattern="\d*"
                    aria-label="OTP input"
                  />
                  {errors.otp && (
                    <p className="text-red-500 text-xs mt-1" role="alert">
                      {errors.otp}
                    </p>
                  )}
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    placeholder="New Password"
                    className="w-full px-4 py-3 rounded-md bg-secondary/10 border border-white/10 focus:outline-none focus:ring-2 focus:ring-primary"
                    disabled={isLoading}
                    aria-label="New password input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    disabled={isLoading}
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-white text-lg hover:text-gray-300 transition-colors ${
                      isLoading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                  {errors.newPassword && (
                    <p className="text-red-500 text-xs mt-1" role="alert">
                      {errors.newPassword}
                    </p>
                  )}
                </div>

                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm Password"
                    className="w-full px-4 py-3 rounded-md bg-secondary/10 border border-white/10 focus:outline-none focus:ring-2 focus:ring-primary"
                    disabled={isLoading}
                    aria-label="Confirm password input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    disabled={isLoading}
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-white text-lg hover:text-gray-300 transition-colors ${
                      isLoading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-xs mt-1" role="alert">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </>
            )}

            <div className="my-6 flex items-center gap-4">
              <hr className="flex-1 border-gray-600" />
              <span className="text-gray-400 text-sm">
                I remember my password{" "}
                <Link
                  to="/user/login"
                  className="text-secondary underline-offset-4 hover:underline text-nowrap"
                  aria-label="Sign in link"
                >
                  Sign In
                </Link>
              </span>
              <hr className="flex-1 border-gray-600" />
            </div>

            {/* Final Submit */}
            {otpSent && (
              <button
                type="submit"
                className={`w-full py-3 rounded-md bg-gradient-to-br from-[#2298d341] to-[#05CE99] hover:opacity-90 transition-colors font-semibold ${
                  isLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={isLoading}
                aria-label="Reset password button"
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
                ) : (
                  "Reset Password"
                )}
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;