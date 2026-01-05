import   { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from '../../assets/adminImages/Logo/logo_main.png';
import bgImage from '../../assets/adminImages/images/bg_login.jpg';
import { adminApi } from "../Service/adminApi";
import { useMutation } from "@tanstack/react-query";

const VerifyEmail = () => {
    const [otp, setOtp] = useState("");
    const [email, setEmail] = useState("");
    const [timer, setTimer] = useState(0);
    const [errors, setErrors] = useState({});
    const [success, setSuccess] = useState("");
    const [animate, setAnimate] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        setAnimate(true);
    }, []);

    useEffect(() => {
        let interval;
        if (timer > 0) {
            interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    const { mutate: verifyEmail, isPending: isSubmitting } = useMutation({
        mutationFn: (payload) => adminApi.signupVarifyOtp(payload),
        onSuccess: (res) => {
            setSuccess(res?.message || "Account verified successfully!");
            setErrors({});
            setTimeout(() => navigate("/admin/login"), 3000);
        },
        onError: (err) => {
            setSuccess("");
            setErrors({
                api: err?.response?.data?.message || "Failed to verify OTP",
            });
        },
    });

    const { mutate: resendOtp, isPending: isSendingOtp } = useMutation({
        mutationFn: (payload) => adminApi.resendSignUpOtp(payload),
        onSuccess: (res) => {
            setSuccess(res?.message || "OTP sent successfully!");
            setErrors({});
            setTimer(60);
        },
        onError: (err) => {
            setSuccess("");
            setErrors({
                api: err?.response?.data?.message || "Failed to send OTP",
            });
        },
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        const newErrors = {};

        if (!email) {
            newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = "Invalid email format";
        }
        if (!otp) {
            newErrors.otp = "OTP is required";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setSuccess("");
            return;
        }

        verifyEmail({ email, otp });
    };

    const handleResendOtp = () => {
        const newErrors = {};
        if (!email) {
            newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = "Invalid email format";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setSuccess("");
            return;
        }

        resendOtp({ email, purpose: "signup" });
    };

    const formatTimer = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center bg-cover bg-center p-4 sm:p-6"
            style={{ backgroundImage: `url(${bgImage})` }}
        >
            <div
                className={`w-full max-w-md shadow-xl rounded-xl p-8 backdrop-blur-md bg-white/90 border border-white/30 transition-all duration-700 transform ${animate ? "scale-100 opacity-100" : "scale-90 opacity-0"
                    }`}
            >
                <div className="flex justify-center mb-6">
                    <img src={logo} alt="Logo" className="h-14 w-auto" />
                </div>
                <h2 className="text-3xl text-center font-bold text-[#103944] mb-6">
                    Verify Email
                </h2>

                {success && (
                    <div
                        className="text-green-600 text-center text-sm mb-4"
                        role="alert"
                    >
                        {success}
                    </div>
                )}
                {errors.api && (
                    <div
                        className="text-red-600 text-center text-sm mb-4"
                        role="alert"
                    >
                        {errors.api}
                    </div>
                )}

                <form onSubmit={handleSubmit} aria-label="Email Verification Form">
                    <div className="mb-4">
                        <label
                            htmlFor="email"
                            className="block text-[#103944] font-semibold mb-1"
                        >
                            Email
                        </label>
                        <div className="flex items-center space-x-2">
                            <input
                                id="email"
                                type="email"
                                placeholder="Enter your email"
                                className={`flex-1 p-2 border rounded outline-none ${errors.email ? "border-red-600" : "border-[#103944]"
                                    }`}
                                value={email}
                                onChange={(e) => setEmail(e.target.value.trim())}
                                disabled={isSubmitting}
                                aria-invalid={!!errors.email}
                                aria-describedby={errors.email ? "email-error" : undefined}
                                autoComplete="email"
                            />
                            <button
                                type="button"
                                onClick={handleResendOtp}
                                disabled={isSendingOtp || timer > 0 || isSubmitting}
                                className={`w-[100px] py-2 rounded transition text-sm ${isSendingOtp || timer > 0 || isSubmitting
                                        ? "bg-gray-400 text-white cursor-not-allowed opacity-70"
                                        : "bg-[#103944] text-white hover:bg-[#0e9d52]"
                                    }`}
                                aria-disabled={isSendingOtp || timer > 0 || isSubmitting}
                            >
                                {isSendingOtp ? "Sending..." : "Resend OTP"}
                            </button>
                        </div>
                        {errors.email && (
                            <p id="email-error" className="text-red-600 text-sm mt-1">
                                {errors.email}
                            </p>
                        )}
                    </div>

                    <div className="mb-4">
                        <label
                            htmlFor="otp"
                            className="block text-[#103944] font-semibold mb-1"
                        >
                            OTP
                        </label>
                        <input
                            id="otp"
                            type="text"
                            placeholder="Enter OTP"
                            className={`w-full p-2 border rounded outline-none ${errors.otp ? "border-red-600" : "border-[#103944]"
                                }`}
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.trim())}
                            disabled={isSubmitting}
                            aria-invalid={!!errors.otp}
                            aria-describedby={errors.otp ? "otp-error" : undefined}
                        />
                        {errors.otp && (
                            <p id="otp-error" className="text-red-600 text-sm mt-1">
                                {errors.otp}
                            </p>
                        )}
                    </div>

                    <div className="flex items-center justify-between mb-6">
                        {timer > 0 ? (
                            <span className="text-sm text-gray-600">
                                Resend OTP in {formatTimer(timer)}
                            </span>
                        ) : (
                            <span className="text-sm text-gray-600">
                                Ready to resend OTP
                            </span>
                        )}
                    </div>

                    <div className="flex justify-center">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-[120px] py-2 rounded transition text-sm ${isSubmitting
                                    ? "bg-gray-400 text-white cursor-not-allowed opacity-70"
                                    : "bg-[#103944] text-white hover:bg-[#0e9d52]"
                                }`}
                            aria-disabled={isSubmitting}
                        >
                            {isSubmitting ? "Submitting..." : "Verify"}
                        </button>
                    </div>
                </form>

                <div className="text-right mt-6">
                    <Link
                        to="/admin/login"
                        className="text-sm text-blue-600 hover:underline"
                    >
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default VerifyEmail;