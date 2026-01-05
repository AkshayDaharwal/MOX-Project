import { useState, useEffect } from "react";
import axios from "axios";
import loginimg from "../../assets/userImages/images/loginimg.webp";
import logo from "../../assets/userImages/Logo/MOX COIN 1.png";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { appConfig } from "../../config/appConfig";

const VerifyUserPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    otp: "",
  });
  const navigate = useNavigate();
  const location = useLocation();
  const [errors, setErrors] = useState({});
  const [timer, setTimer] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false); // Track if OTP was sent

  useEffect(() => {
    // Pre-fill email from navigation state if available
    const email = location.state?.email || "";
    if (email) {
      setFormData((prev) => ({ ...prev, email }));
      setIsEmailSent(true); // Assume OTP was sent if email is passed
      setTimer(60); // Start timer for resend OTP
    }

    let countdown;
    if (timer > 0) {
      countdown = setTimeout(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(countdown);
  }, [timer, location.state]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Invalid email";
    if (!formData.otp.trim()) newErrors.otp = "OTP is required";
    else if (!/^\d{6}$/.test(formData.otp)) newErrors.otp = "OTP must be a 6-digit number";
    return newErrors;
  };

  const handleResendOtp = async () => {
    if (!formData.email.trim()) {
      setErrors((prev) => ({ ...prev, email: "Email is required" }));
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(`${appConfig.baseURL}/user/auth/resend-otp`, {
        email: formData.email,
        purpose: "signup",
      });
      toast.success(response.data.message || `New OTP sent to ${formData.email}`);
      setTimer(60);
      setIsEmailSent(true); // Mark OTP as sent
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to resend OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(`${appConfig.baseURL}/user/auth/verify-otp`, {
        email: formData.email,
        otp: formData.otp,
      });
      toast.success(response.data.message || "Email verified successfully");

      // Assuming the backend returns a token or user data
      const { token } = response.data; // Adjust based on your API response
      if (token) {
        const storage = localStorage.getItem("rememberMe") === "true" ? localStorage : sessionStorage;
        storage.setItem("authToken", true);
      }

      setTimeout(() => navigate("/user/dashboard", { replace: true }), 1000); // Navigate to dashboard with delay
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid OTP");
      setErrors((prev) => ({ ...prev, otp: error.response?.data?.message || "Invalid OTP" }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-fit md:h-screen overflow-hidden shadow-xl flex flex-col-reverse md:flex-row">
      <div className="w-full h-screen md:w-1/2 bg-[#1a152d] relative">
        <img src={loginimg} alt="Verify Community" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/40 flex flex-col justify-between p-6">
          <Link
            to="/"
            className="self-end text-sm text-white bg-white/10 px-4 py-1 rounded-full backdrop-blur-md"
            aria-label="Back to website"
          >
            Back to website →
          </Link>
          <div>
            <p className="text-xl font-medium">Join the Community,</p>
            <p className="text-xl font-medium">Grow with us</p>
            <div className="mt-3 flex space-x-1">
              <span className="w-2 h-2 bg-white/40 rounded-full"></span>
              <span className="w-2 h-2 bg-white/40 rounded-full"></span>
              <span className="w-2 h-2 bg-white rounded-full"></span>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full relative h-full overflow-y-auto flex justify-center md:w-1/2 p-8 md:p-12">
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
          <h2 className="text-3xl font-bold mb-4">Verify your email</h2>
          <p className="text-sm text-gray-400 mb-6">
            Enter the OTP sent to {formData.email || "your email"} to verify your account.
          </p>

          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            <div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                className="w-full px-4 py-3 rounded-md bg-secondary/10 border border-white/10 focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={isLoading || isEmailSent} // Disable after OTP is sent
                aria-label="Email input"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1" role="alert">
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <div className="w-full relative rounded-md bg-secondary/10 border border-white/10 focus:outline-none focus:ring-2 focus:ring-primary">
                <input
                  type="text"
                  name="otp"
                  value={formData.otp}
                  onChange={handleChange}
                  placeholder="Enter OTP"
                  className="bg-transparent h-full px-4 py-3 w-full"
                  disabled={isLoading}
                  inputMode="numeric" // Suggest numeric keyboard
                  pattern="\d*" // Ensure only numbers
                  aria-label="OTP input"
                />
                <button
                  type="button"
                  disabled={timer > 0 || isLoading}
                  onClick={handleResendOtp}
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-nowrap border px-3 rounded-full text-xs py-1 transition-all duration-200 ${
                    timer > 0 || isLoading
                      ? "cursor-not-allowed bg-gray-500 text-white border-gray-500"
                      : "bg-white/10 border-slate-600 hover:bg-white/20"
                  }`}
                  aria-label={timer > 0 ? `Resend OTP in ${timer} seconds` : "Resend OTP"}
                >
                  {timer > 0 ? `Resend OTP (${timer}s)` : "Resend OTP"}
                </button>
              </div>
              {errors.otp && (
                <p className="text-red-500 text-xs mt-1" role="alert">
                  {errors.otp}
                </p>
              )}
            </div>

            <button
              type="submit"
              className={`w-full py-3 rounded-md bg-gradient-to-br from-[#2298d341] to-[#05CE99] hover:opacity-90 transition-colors font-semibold ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={isLoading}
              aria-label="Verify email button"
            >
              {isLoading ? "Processing..." : "Verify Email"}
            </button>
          </form>

          <div className="my-6 flex items-center gap-4">
            <hr className="flex-1 border-gray-600" />
            <span className="text-gray-400 text-sm">
              Back to{" "}
              <Link
                to="/user/signup"
                className="text-secondary underline-offset-4 hover:underline text-nowrap"
                aria-label="Back to sign up"
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

export default VerifyUserPage;