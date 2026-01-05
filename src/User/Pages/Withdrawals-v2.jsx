import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { MdOutlineAccountBalanceWallet } from "react-icons/md";
import { FiDollarSign } from "react-icons/fi";
import { TbWallet } from "react-icons/tb";
import { FaWallet, FaCopy } from "react-icons/fa";
import axios from "axios";
import { appConfig } from "../../config/appConfig";

const Withdrawals = () => {
  const [walletType, setWalletType] = useState("my");
  const [amount, setAmount] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [balance, setBalance] = useState({
    my: 0,
    principal: 0,
    deposit: 0,
    emgt: 0,
    referral: 0,
  });
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [requestId, setRequestId] = useState(null);
  const [withdrawalDetails, setWithdrawalDetails] = useState(null);

  const fetchBalance = async () => {
    try {
      const token =
        localStorage.getItem("authToken") ||
        sessionStorage.getItem("authToken");
      if (!token) {
        toast.error("Please log in to fetch balance");
        return;
      }
      const response = await axios.get(`${appConfig.baseURL}/user/wallet`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("fetchBalance response:", response.data); // Debug log
      const walletData = response.data.data || {};
      setBalance({
        my: walletData.myWallet || 0,
        principal: walletData.principalWallet || 0,
        deposit: walletData.depositWallet || 0,
        emgt: walletData.emgtWallet || 0,
        referral: walletData.referralWallet || 0,
      });
      const walletAddress = walletData.walletAddress || "N/A";
      setWalletAddress(walletAddress);
    } catch (error) {
      console.error("fetchBalance error:", error); // Debug log
      toast.error("Failed to fetch balance");
      setBalance({ my: 0, principal: 0, deposit: 0, emgt: 0, referral: 0 });
    }
  };

  useEffect(() => {
    fetchBalance();
  }, []);

  const handleCopyAddress = () => {
    if (walletAddress === "N/A") {
      toast.error("No wallet address available to copy");
      return;
    }
    navigator.clipboard.writeText(walletAddress).then(() => {
      toast.success("Wallet address copied to clipboard!");
    }).catch(() => {
      toast.error("Failed to copy wallet address");
    });
  };

  const handleWithdraw = async () => {
    const minimumWithdrawal = 5;
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (parseFloat(amount) > balance[walletType]) {
      toast.error("Insufficient balance in selected wallet");
      return;
    }
    if (parseFloat(amount) < minimumWithdrawal) {
      toast.error(`Minimum withdrawal amount is $${minimumWithdrawal}`);
      return;
    }
    if (walletAddress === "N/A") {
      toast.error("Please set a valid wallet address before withdrawing");
      return;
    }

    setLoading(true);
    try {
      const token =
        localStorage.getItem("authToken") ||
        sessionStorage.getItem("authToken");
      if (!token) {
        toast.error("Please log in to proceed with withdrawal");
        setLoading(false);
        return;
      }

      // Request OTP with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
      const otpResponse = await axios.post(
        `${appConfig.baseURL}/user/request-withdrawal-otp`,
        {
          walletType,
          amount: parseFloat(amount),
          currencyType: "USDT",
          walletAddress,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        }
      );
      clearTimeout(timeoutId);

      console.log("request-withdrawal-otp response:", otpResponse.data); // Debug log
      if (otpResponse.data.status !== "success" || !otpResponse.data.data.requestId) {
        throw new Error("Invalid OTP response");
      }

      setRequestId(otpResponse.data.data.requestId);
      setShowOtpInput(true);
      toast.success("OTP sent to your email. Please check your inbox and enter the OTP below.");
    } catch (error) {
      console.error("handleWithdraw error:", error); // Debug log
      const message =
        error.response?.data?.message ||
        error.message === "signal is aborted"
          ? "Request timed out. Please try again."
          : "Failed to request withdrawal OTP. Please verify your email address.";
      toast.error(message);
      setShowOtpInput(false);
      setRequestId(null);
    } finally {
      setLoading(false);
    }
  };

const handleOtpSubmit = async () => {
    const minimumWithdrawal = 5; // Set minimum withdrawal amount
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (parseFloat(amount) > balance[walletType]) {
      toast.error("Insufficient balance in selected wallet");
      return;
    }

        if (parseFloat(amount) < minimumWithdrawal) {
      toast.error(`Minimum withdrawal amount is $${minimumWithdrawal}`);
      return;
    }

    setLoading(true);
    try {
      const token =
        localStorage.getItem("authToken") ||
        sessionStorage.getItem("authToken");
      if (!token) {
        toast.error("Please log in to proceed with withdrawal");
        return;
      }

      const response = await axios.post(
        `${appConfig.baseURL}/user/withdraw`,
        {
          walletType,
          amount: parseFloat(amount),
          currencyType: "USDT", // Hardcoded for now, adjust if dynamic
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success(response.data.message);
      setAmount("");
      // Refetch balance after successful request (optional, since deduction is on admin approval)
      await fetchBalance();
    } catch (error) {
      const message =
        error.response?.data?.message || "Withdrawal request failed";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const getWalletLabel = (type) => {
    switch (type) {
      case "my":
        return "My Wallet";
      case "principal":
        return "Principal Wallet";
      case "deposit":
        return "Deposit Wallet";
      case "emgt":
        return "EMGT Wallet";
      case "referral":
        return "Referral Wallet";
      default:
        return "";
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-[#12212154] backdrop-blur-xl border-gradient border p-6 rounded-xl text-white shadow-lg space-y-6">
      <h2 className="text-2xl font-bold text-center">Withdraw Funds</h2>

      {/* Wallet Selector */}
      <div>
        <label className="block text-slate-400 text-sm mb-1">
          Select Wallet
        </label>
        <div className="flex items-center bg-transparent border border-white/10 rounded-md gap-3 px-3 py-1">
          <div className="aspect-[1/1] glow-text bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
            <TbWallet className="m-2" />
          </div>
          <select
            value={walletType}
            onChange={(e) => setWalletType(e.target.value)}
            className="w-full py-2 bg-transparent text-white focus:outline-none"
            disabled={loading}
          >
            <option value="my" className="bg-gray-800">
              My Wallet
            </option>
            <option value="principal" className="bg-gray-800">
              Principal Wallet
            </option>
            <option value="deposit" className="bg-gray-800">
              Deposit Wallet
            </option>
            <option value="referral" className="bg-gray-800">
              Referral Wallet
            </option>
          </select>
        </div>
      </div>

      {/* Balance Info */}
      <div className="flex items-center justify-between bg-transparent border border-white/10 px-4 py-3 rounded-md text-slate-300 text-sm">
        <div className="flex items-center gap-2">
          <MdOutlineAccountBalanceWallet className="text-green-400 text-xl" />
          Available Balance in {getWalletLabel(walletType)}:
        </div>
        <span className="text-white font-semibold">${balance[walletType]}</span>
      </div>

      {/* Wallet Address */}
      <div className="bg-transparent border border-white/10 px-4 py-3 rounded-md text-slate-300 text-sm">
        <div className="flex items-center gap-2">
          <FaWallet className="text-blue-400 text-xl" />
          <span>Wallet Address:</span>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-white font-semibold break-all">{walletAddress}</span>
          <button
            onClick={handleCopyAddress}
            className="p-1 text-blue-400 hover:text-blue-300 transition"
            title="Copy wallet address"
            disabled={loading}
          >
            <FaCopy className="text-xl" />
          </button>
        </div>
      </div>

      {/* Amount and OTP Inputs */}
      <div>
        <label className="block text-slate-400 text-sm mb-1">
          Enter Amount
        </label>
        <div className="flex items-center bg-transparent border border-white/10 rounded-md gap-3 px-3 py-1">
          <div className="aspect-[1/1] glow-text bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
            <FiDollarSign className="m-2" />
          </div>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            className="w-full py-2 bg-transparent text-white focus:outline-none"
            disabled={loading}
          />
        </div>

        {showOtpInput && (
          <div className="mt-4">
            <label className="block text-slate-400 text-sm mb-1">
              Enter OTP
            </label>
            <div className="flex items-center bg-transparent border border-white/10 rounded-md gap-3 px-3 py-1">
              <div className="aspect-[1/1] glow-text bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                <FiDollarSign className="m-2" />
              </div>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter 6-digit OTP"
                className="w-full py-2 bg-transparent text-white focus:outline-none"
                disabled={loading}
              />
            </div>
          </div>
        )}

        <div className="text-sm mt-5 text-yellow-300 bg-yellow-900/20 border border-yellow-500/30 rounded-md p-3">
          <span className="font-semibold">Note:</span> The minimum withdrawal
          amount is <span className="font-bold text-yellow-200">$5</span>. Please
          ensure your wallet address is correct, as it will not be verified by our
          system prior to processing the withdrawal. Check your email for the OTP
          after requesting a withdrawal.
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={showOtpInput ? handleOtpSubmit : handleWithdraw}
        className="w-full py-2 rounded-md font-semibold text-white bg-gradient-to-r from-[#2298d341] to-[#05CE99] hover:opacity-90 transition"
        disabled={loading}
      >
        {loading ? "Processing..." : showOtpInput ? "Submit OTP" : "Withdraw"}
      </button>

      {/* Withdrawal Confirmation */}
      {withdrawalDetails && (
        <div className="bg-transparent border border-white/10 px-4 py-3 rounded-md text-slate-300 text-sm">
          <h3 className="text-lg font-bold text-white mb-2">Withdrawal Details</h3>
          <p>
            <strong>Status:</strong>{" "}
            {withdrawalDetails.status === "completed"
              ? "Completed"
              : "Pending Approval"}
          </p>
          <p>
            <strong>Amount:</strong> ${withdrawalDetails.netAmount}
          </p>
          <p>
            <strong>Transaction Charge:</strong> $
            {withdrawalDetails.transactionCharge}
          </p>
          <p>
            <strong>Wallet Address:</strong>{" "}
            <span className="break-all">{withdrawalDetails.walletAddress}</span>
          </p>
          {withdrawalDetails.status === "completed" && (
            <p>
              <strong>Transaction Hash:</strong>{" "}
              <a
                href={`https://bscscan.com/tx/${withdrawalDetails.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline break-all"
              >
                {withdrawalDetails.txHash}
              </a>
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default Withdrawals;