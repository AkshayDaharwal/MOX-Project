import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { MdOutlineAccountBalanceWallet } from "react-icons/md";
import { FiDollarSign } from "react-icons/fi";
import { TbWallet } from "react-icons/tb";
import { FaWallet, FaCopy } from "react-icons/fa";
import axios from "axios"; // Ensure axios is installed: npm install axios
import { appConfig } from "../../config/appConfig"; // Import appConfig

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
      // Extract data object and map to balance state
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
      toast.error("Failed to fetch balance");
      // Fallback to default balances if API fails
      setBalance({ my: 0, principal: 0, deposit: 0, emgt: 0, referral: 0 });
    }
  };

  useEffect(() => {
    fetchBalance();
  }, []);

   const handleCopyAddress = () => {
    
    if (walletAddress === "Not available") {
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
            {/* <option value="emgt" className="bg-gray-800">
              EMGT Wallet
            </option> */}
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
          >
            <FaCopy className="text-xl" />
          </button>
        </div>
      </div>

      {/* Amount Input */}
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

        <div className="text-sm mt-5 text-yellow-300 bg-yellow-900/20 border border-yellow-500/30 rounded-md p-3">
          <span className="font-semibold">Note:</span> The minimum withdrawal
          amount is <span className="font-bold text-yellow-200">$5</span>.
        </div>
      </div>

      {/* Withdraw Button */}
      <button
        onClick={handleWithdraw}
        className="w-full py-2 rounded-md font-semibold text-white bg-gradient-to-r from-[#2298d341] to-[#05CE99] hover:opacity-90 transition"
        disabled={loading}
      >
        {loading ? "Processing..." : "Withdraw"}
      </button>
    </div>
  );
};

export default Withdrawals;
