import  { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { adminApi } from "../../Admin/Service/adminApi";
import logo from "../../assets/adminImages/Logo/logo_main.png";
import bgImage from "../../assets/adminImages/images/bg_login.jpg";

const ForgetPassword = () => {
  const [email, setEmail] = useState("");
  const [animate, setAnimate] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // 'success' or 'error'
  const navigate = useNavigate();

  useEffect(() => {
    setAnimate(true);
  }, []);

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  // Mutation for sending OTP
  const { mutate: sendOtp, isPending: isSendingOtp } = useMutation({
    mutationFn: (payload) => adminApi.forgetPassword(payload),
    onSuccess: (res) => {
      setMessage(res?.message || "OTP sent successfully.");
      setMessageType("success");
      navigate("/admin/reset-password", { state: { email } });
    },
    onError: (err) => {
      setMessage(err?.response?.data?.message || "Failed to send OTP.");
      setMessageType("error");
    },
  });

  const handleSendOtp = (e) => {
    e.preventDefault();
    setMessage("");

    if (!email) {
      setMessage("Please enter your email.");
      setMessageType("error");
      return;
    }

    if (!validateEmail(email)) {
      setMessage("Please enter a valid email address.");
      setMessageType("error");
      return;
    }

    sendOtp({ email });
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center px-4"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div
        className={`w-full max-w-md shadow-xl rounded-xl p-8 backdrop-blur-md bg-white/90 border border-white/30 transition-all duration-700 transform ${animate ? "scale-100 opacity-100" : "scale-90 opacity-0"
          }`}
      >
        {/* Logo */}
        <div className="flex justify-center mb-4">
          <img src={logo} alt="Logo" className="h-14 w-auto" />
        </div>

        {/* Heading */}
        <h2 className="text-[28px] text-center font-bold text-[#103944] mb-6">
          Forgot Password
        </h2>

        {/* Alert Messages */}
        {message && (
          <div
            className={`mb-4 text-sm font-medium p-2 rounded text-center ${messageType === "error"
                ? "bg-red-100 text-red-700"
                : "bg-green-100 text-green-700"
              }`}
          >
            {message}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSendOtp}>
          <label className="block text-[#103944] font-semibold mb-1">
            Email
          </label>
          <input
            type="email"
            placeholder="Enter your email"
            className="w-full p-2 mb-4 border border-[#103944] rounded outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className="flex justify-center">
            <button
              type="submit"
              disabled={isSendingOtp}
              className="w-[140px] bg-[#103944] text-white py-2 rounded hover:bg-[#0e9d52] transition"
            >
              {isSendingOtp ? "Sending..." : "Send OTP"}
            </button>
          </div>
        </form>

        {/* Link to Login */}
        <div className="text-right mt-4">
          <Link
            to="/admin/login"
            className="text-[15px] text-blue-600 hover:underline"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgetPassword;
