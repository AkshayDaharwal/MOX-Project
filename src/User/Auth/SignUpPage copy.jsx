import { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { toast } from "react-toastify";
import { appConfig } from "../../config/appConfig";
import loginimg from "../../assets/userImages/images/loginimg.webp";
import logo from "../../assets/userImages/Logo/MOX COIN 1.png";

const SignUpPage = () => {
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    reenterpassword: "",
    referral: "",
  });
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showReenterPassword, setShowReenterPassword] = useState(false);

  useEffect(() => {
    const referralFromUrl = searchParams.get("referral");
    if (referralFromUrl) {
      setFormData((prev) => ({ ...prev, referral: referralFromUrl }));
    }
  }, [searchParams]);

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
    if (!formData.password.trim()) newErrors.password = "Password is required";
    else if (formData.password.length < 8)
      newErrors.password = "Password must be at least 8 characters";
    if (!formData.reenterpassword.trim())
      newErrors.reenterpassword = "Please re-enter your password";
    else if (formData.reenterpassword !== formData.password)
      newErrors.reenterpassword = "Passwords do not match";
    return newErrors;
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
      const referralCode = formData.referral.trim() || "admin123"; // Use "admin123" if referral is empty
      const response = await axios.post(`${appConfig.baseURL}/user/auth/signup`, {
        email: formData.email,
        password: formData.password,
        referredBy: referralCode,
      });
      toast.success(response.data.message || "Sign up successful! Please verify your email.");
      setTimeout(() => navigate("/user/verify-user", { replace: true }), 1000); // Delay for toast visibility
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to sign up";
      toast.error(errorMessage);
      setErrors((prev) => ({
        ...prev,
        email: errorMessage.includes("email") ? errorMessage : prev.email,
        password: errorMessage.includes("password") ? errorMessage : prev.password,
      }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-fit md:h-screen overflow-hidden shadow-xl flex flex-col-reverse md:flex-row">
      <div className="w-full h-screen md:w-1/2 bg-[#1a152d] relative">
        <img src={loginimg} alt="Join Community" className="w-full h-full object-cover" />
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
          <h2 className="text-3xl font-bold mb-4">Create your account</h2>
          <p className="text-sm text-gray-400 mb-6">
            Join us and get started on your journey. Fill in the details below to sign up.
          </p>

          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            <div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                className={`w-full px-4 py-3 rounded-md bg-secondary/10 border ${
                  errors.email ? "border-red-500" : "border-white/10"
                } focus:outline-none focus:ring-2 ${
                  errors.email ? "focus:ring-red-500" : "focus:ring-primary"
                }`}
                disabled={isLoading}
                autoFocus
                aria-label="Email input"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1" role="alert">
                  {errors.email}
                </p>
              )}
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                className={`w-full px-4 py-3 rounded-md bg-secondary/10 border ${
                  errors.password ? "border-red-500" : "border-white/10"
                } focus:outline-none focus:ring-2 ${
                  errors.password ? "focus:ring-red-500" : "focus:ring-primary"
                }`}
                disabled={isLoading}
                aria-label="Password input"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                disabled={isLoading}
                className={`absolute right-3 top-4 mix-blend-difference text-white text-lg hover:text-gray-300 transition-colors ${
                  isLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1" role="alert">
                  {errors.password}
                </p>
              )}
            </div>

            <div className="relative">
              <input
                type={showReenterPassword ? "text" : "password"}
                name="reenterpassword"
                value={formData.reenterpassword}
                onChange={handleChange}
                placeholder="Re-enter Password"
                className={`w-full px-4 py-3 rounded-md bg-secondary/10 border ${
                  errors.reenterpassword ? "border-red-500" : "border-white/10"
                } focus:outline-none focus:ring-2 ${
                  errors.reenterpassword ? "focus:ring-red-500" : "focus:ring-primary"
                }`}
                disabled={isLoading}
                aria-label="Confirm password input"
              />
              <button
                type="button"
                onClick={() => setShowReenterPassword((prev) => !prev)}
                disabled={isLoading}
                className={`absolute right-3 top-4 mix-blend-difference text-white text-lg hover:text-gray-300 transition-colors ${
                  isLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                aria-label={showReenterPassword ? "Hide confirm password" : "Show confirm password"}
              >
                {showReenterPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
              {errors.reenterpassword && (
                <p className="text-red-500 text-xs mt-1" role="alert">
                  {errors.reenterpassword}
                </p>
              )}
            </div>

            <div>
              <input
                type="text"
                name="referral"
                value={formData.referral}
                onChange={handleChange}
                placeholder="Referral Code"
                className="w-full px-4 py-3 rounded-md bg-secondary/10 border border-white/10 focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={isLoading}
                aria-label="Referral code input"
              />
            </div>

            <button
              type="submit"
              className={`w-full py-3 rounded-md bg-gradient-to-br from-[#2298d341] to-[#05CE99] hover:opacity-90 transition-colors font-semibold ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={isLoading}
              aria-label="Sign up button"
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
                "Sign Up"
              )}
            </button>
          </form>

          <div className="my-6 flex items-center gap-4">
            <hr className="flex-1 border-gray-600" />
            <span className="text-gray-400 text-sm">
              Already have an account?{" "}
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
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;