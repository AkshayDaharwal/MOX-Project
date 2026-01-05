import { useState, useEffect } from "react";
import {
  FaEye,
  FaEyeSlash,
  FaEnvelope,
  FaWallet,
  FaKey,
} from "react-icons/fa";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ProfileUpdate from "../../assets/userImages/images/profileUpdate.webp";
import Footer from "../Components/Comman/Footer";
import axios from "axios";
import { appConfig } from "../../config/appConfig";

const MyProfile = () => {
  const [activeTab, setActiveTab] = useState("personal");
  const [formData, setFormData] = useState({
    email: "",
    walletAddress: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [loading, setLoading] = useState(true);

  // Fetch user profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const token =
          localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
        if (!token) {
          toast.error("No authentication token found. Please log in.");
          return;
        }

        const response = await axios.get(`${appConfig.baseURL}/user/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const { profile } = response.data.data;
        setFormData({
          email: profile.email || "",
          walletAddress: profile.walletAddress || "",
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } catch (error) {
        toast.error("Failed to load profile data. Please try again later.");
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    const { email, walletAddress } = formData;
    const errorObj = {};

    if (!email.trim()) errorObj.email = "Email is required";
    if (!walletAddress.trim()) errorObj.walletAddress = "Wallet Address is required";

    if (Object.keys(errorObj).length > 0) {
      setErrors(errorObj);
      Object.values(errorObj).forEach((msg) => toast.error(msg));
    } else {
      try {
        setLoading(true);
        const token =
          localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
        if (!token) {
          toast.error("No authentication token found. Please log in.");
          return;
        }

        const response = await axios.put(
          `${appConfig.baseURL}/user/profile/update`,
          {
            email,
            walletAddress,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // Update token if returned (in case of session changes)
        const newToken = response.headers["x-new-token"];
        if (newToken) {
          localStorage.setItem("authToken", true);
          sessionStorage.setItem("authToken", newToken);
        }

        setErrors({});
        toast.success("Profile updated successfully!");
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to update profile."
        );
        console.error("Error updating profile:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    const { currentPassword, newPassword, confirmPassword } = formData;
    const errorObj = {};

    if (!currentPassword || !newPassword || !confirmPassword) {
      errorObj.password = "All fields are required";
    } else if (newPassword !== confirmPassword) {
      errorObj.password = "Passwords don't match";
    } else if (newPassword.length < 6) {
      errorObj.password = "Password must be at least 6 characters";
    }

    if (Object.keys(errorObj).length > 0) {
      setErrors(errorObj);
      toast.error(errorObj.password);
    } else {
      try {
        setLoading(true);
        const token =
          localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
        if (!token) {
          toast.error("No authentication token found. Please log in.");
          return;
        }

        const response = await axios.put(
          `${appConfig.baseURL}/user/profile/update`,
          {
            currentPassword,
            newPassword,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // Update token if returned (in case of password change)
        const newToken = response.headers["x-new-token"];
        if (newToken) {
          localStorage.setItem("authToken", newToken);
          sessionStorage.setItem("authToken", newToken);
        }

        setFormData({
          ...formData,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setErrors({});
        toast.success("Password updated successfully!");
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to update password."
        );
        console.error("Error updating password:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <>
      <div className="bg-[#12212154] backdrop-blur-xl border border-slate-700 border-gradient shadow-md shadow-slate-800/50 text-white p-5 rounded-md">
        {/* Tabs */}
        <div className="flex border-b border-slate-600 mb-6">
          {["Personal Details", "Password Details"].map((tab, idx) => (
            <button
              key={idx}
              onClick={() =>
                setActiveTab(idx === 0 ? "personal" : "password")
              }
              className={`px-4 py-2 text-sm font-semibold ${
                activeTab === (idx === 0 ? "personal" : "password")
                  ? "text-white border-b-2 border-blue-400 bg-gradient-to-b from-green-400/20 to-sky-400/50 rounded-t"
                  : "text-slate-400"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Personal Details Form */}
        {activeTab === "personal" && (
          <form
            onSubmit={handleProfileSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            <div className="space-y-6">
              <div>
                <label className="text-sm mb-1 font-bold flex items-center gap-2">
                  <FaEnvelope className="text-sky-500" /> Email Id
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full bg-transparent border-b ${
                    errors.email ? "border-red-500" : "border-slate-500"
                  } focus:outline-none text-white`}
                />
                {errors.email && (
                  <p className="text-sm text-red-500 mt-1">{errors.email}</p>
                )}
              </div>
              <div>
                <label className="text-sm mb-1 font-bold flex items-center gap-2">
                  <FaWallet className="text-sky-500" /> Wallet Address
                </label>
                <input
                  type="text"
                  name="walletAddress"
                  value={formData.walletAddress}
                  onChange={handleInputChange}
                  className={`w-full bg-transparent border-b ${
                    errors.walletAddress ? "border-red-500" : "border-slate-500"
                  } focus:outline-none text-white`}
                />
                {errors.walletAddress && (
                  <p className="text-sm text-red-500 mt-1">{errors.walletAddress}</p>
                )}
              </div>
              {/* <button
                type="submit"
                className="px-6 py-2 bg-blue-500 hover:bg-blue-600 transition-colors text-white text-sm rounded mt-4"
                disabled={loading}
              >
                {loading ? "Updating..." : "Profile Update"}
              </button> */}
            </div>
            <div className="flex justify-center items-center">
              <div className="w-[24rem] rounded-lg bg-gradient-to-br from-slate-900/70 to-sky-800/50 flex items-center justify-center">
                <img src={ProfileUpdate} alt="Profile" />
              </div>
            </div>
          </form>
        )}

        {/* Password Details Form */}
        {activeTab === "password" && (
          <form
            onSubmit={handlePasswordSubmit}
            className="max-w-xl space-y-6"
          >
            {["currentPassword", "newPassword", "confirmPassword"].map(
              (field, idx) => (
                <div className="relative" key={idx}>
                  <label className="text-sm mb-1 font-bold flex items-center gap-2">
                    <FaKey className="text-sky-500" />{" "}
                    {field.replace(/([A-Z])/g, " $1")}
                  </label>
                  <input
                    type={
                      showPassword[field.replace("Password", "").toLowerCase()]
                        ? "text"
                        : "password"
                    }
                    name={field}
                    value={formData[field]}
                    onChange={handleInputChange}
                    className={`w-full bg-transparent border-b ${
                      errors.password ? "border-red-500" : "border-slate-500"
                    } focus:outline-none text-white pr-10`}
                  />
                  <span
                    onClick={() =>
                      setShowPassword((prev) => ({
                        ...prev,
                        [field.replace("Password", "").toLowerCase()]:
                          !prev[field.replace("Password", "").toLowerCase()],
                      }))
                    }
                    className="absolute right-2 top-7 text-slate-400 cursor-pointer"
                  >
                    {showPassword[field.replace("Password", "").toLowerCase()] ? (
                      <FaEyeSlash />
                    ) : (
                      <FaEye />
                    )}
                  </span>
                </div>
              )
            )}
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password}</p>
            )}
            <button
              type="submit"
              className="px-6 py-2 bg-green-600 hover:bg-green-700 transition-colors text-white text-sm rounded"
              disabled={loading}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}
      </div>
      <Footer />
    </>
  );
};

export default MyProfile;