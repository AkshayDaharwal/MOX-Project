import   { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from '../../assets/adminImages/Logo/logo_main.png';
import bgImage from '../../assets/adminImages/images/bg_login.jpg';
import { adminApi } from "../Service/adminApi";
import { useMutation } from "@tanstack/react-query";

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");
  const [animate, setAnimate] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setAnimate(true);
  }, []);

  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);

  const validatePassword = (password) => {
    return (
      password.length >= 6 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /\d/.test(password)
    );
  };

  const { mutate: sendOtp, isPending: isSendingOtp } = useMutation({
    mutationFn: (payload) => adminApi.signupOtp(payload),
    onSuccess: (res) => {
      setSuccess(res?.message || "OTP sent successfully to your email!");
      setErrors({});
      navigate("/admin/varify-email", { state: { email, password } });
    },
    onError: (err) => {
      setSuccess("");
      setErrors({
        api: err?.response?.data?.message || "Failed to send OTP",
      });
    },
  });

  const handleSendOtp = () => {
    const newErrors = {};

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(email)) {
      newErrors.email = "Invalid email format";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    } else if (!validatePassword(password)) {
      newErrors.password = "Password must include uppercase, lowercase, and a number";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setSuccess("");
      return;
    }

    sendOtp({ email, password });
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
        <div className="flex justify-center mb-4">
          <img src={logo} alt="Logo" className="h-14 w-auto" />
        </div>
        <h2 className="text-[28px] text-center font-bold text-[#103944] mb-4">Admin Sign Up</h2>

        {success && (
          <div className="text-green-600 text-center text-sm mb-4">{success}</div>
        )}
        {errors.api && (
          <div className="text-red-600 text-center text-sm mb-4">{errors.api}</div>
        )}

        <div>
          <label className="block text-[#103944] font-semibold mb-1">Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            className="w-full p-2 mb-1 border border-[#103944] rounded outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSendingOtp}
          />
          {errors.email && <p className="text-red-600 text-sm mb-2">{errors.email}</p>}

          <label className="block text-[#103944] font-semibold mb-1 mt-2">Password</label>
          <input
            type="password"
            placeholder="Create password"
            className="w-full p-2 mb-1 border border-[#103944] rounded outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isSendingOtp}
          />
          {errors.password && <p className="text-red-600 text-sm mb-2">{errors.password}</p>}

          <div className="flex justify-center mt-4">
            <button
              type="button"
              onClick={handleSendOtp}
              disabled={
                isSendingOtp ||
                !email ||
                !validateEmail(email) ||
                !password ||
                !validatePassword(password)
              }
              className={`w-[120px] py-2 rounded transition ${isSendingOtp ||
                  !email ||
                  !validateEmail(email) ||
                  !password ||
                  !validatePassword(password)
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : "bg-[#103944] text-white hover:bg-[#0e9d52]"
                }`}
            >
              {isSendingOtp ? "Sending..." : "Send OTP"}
            </button>
          </div>
        </div>

        <div className="text-right flex justify-between mt-4">
          <Link to="/admin/login" className="text-[15px] text-blue-600 hover:underline">
              Login
          </Link>
          

        </div>
      </div>
    </div>
  );
};

export default SignUp;