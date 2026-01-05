import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { FaCopy, FaWallet, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import QRCode from "react-qr-code";
import "./connect";
import {
  useAppKit,
  useAppKitAccount,
  useAppKitProvider,
} from "@reown/appkit/react";
import {
  BrowserProvider,
  Contract,
  formatUnits,
  parseUnits,
  JsonRpcProvider,
} from "ethers";
import axios from "axios";
import { DEPOSIT_ABI, USDT_ABI } from "./utils/mainnetDepositABI";
// import { DEPOSIT_ABI, USDT_ABI } from "./utils/testnetDepositABI";
import { appConfig } from "../../config/appConfig";
import { Wallet } from "lucide-react";
import Wallets from "./Wallets";

const PUBLIC_RPC_URL = appConfig.PUBLIC_RPC_URL; 
const publicProvider = new JsonRpcProvider(PUBLIC_RPC_URL);
const MAX_DEPOSIT_USD = 1000000;

const Deposit = () => {
  const [method, setMethod] = useState("wallet");
  const [depositType, setDepositType] = useState("usdt");
  const [amount, setAmount] = useState("");
  const [usdtBalance, setUsdtBalance] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [swapToTokens, setSwapToTokens] = useState(false);
  const [validationError, setValidationError] = useState("");
  const { address, isConnected } = useAppKitAccount();
  const { open } = useAppKit();
  const { walletProvider } = useAppKitProvider("eip155");

  const walletAddress = address || "Not connected";

  // Fetch USDT balance when wallet is connected
  const fetchBalance = useCallback(async () => {
    if (isConnected && address) {
      try {
        const provider = new BrowserProvider(walletProvider);
        const usdtContract = new Contract(appConfig.USDT_ADDRESS, USDT_ABI, provider);
        const balance = await usdtContract.balanceOf(address);
        setUsdtBalance(formatUnits(balance, 18));
      } catch (error) {
        handleError("Failed to fetch USDT balance.", error);
        setUsdtBalance(null);
      }
    } else {
      setUsdtBalance(null);
    }
  }, [isConnected, address, walletProvider]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  // Validate amount in real-time
  const validateAmount = useCallback(
    (value) => {
      const parsedAmount = parseFloat(value);
      // if (!value || isNaN(parsedAmount)) {
      //   setValidationError("Please enter a valid numeric amount!");
      //   return false;
      // }
      if (parsedAmount <= 0) {
        setValidationError("Amount must be greater than zero!");
        return false;
      }
      if (parsedAmount < appConfig.MIN_INVESTMENT_USD) {
        setValidationError(
          `Amount must be at least ${appConfig.MIN_INVESTMENT_USD} USD!`
        );
        return false;
      }
      if (parsedAmount > MAX_DEPOSIT_USD) {
        setValidationError(
          `Amount exceeds maximum deposit limit of ${MAX_DEPOSIT_USD} USD!`
        );
        return false;
      }
      if (usdtBalance !== null && parsedAmount > parseFloat(usdtBalance)) {
        setValidationError("Insufficient USDT balance!");
        return false;
      }
      setValidationError("");
      return true;
    },
    [usdtBalance]
  );

  useEffect(() => {
    validateAmount(amount);
  }, [amount, validateAmount]);

  const copyToClipboard = () => {
    if (!isConnected) {
      toast.error("Please connect your wallet first!", {
        icon: <FaTimesCircle className="text-red-400" />,
      });
      return;
    }
    navigator.clipboard.writeText(walletAddress);
    toast.success("Wallet address copied to clipboard!", {
      icon: <FaCheckCircle className="text-primary" />,
    });
  };

  const handleConnectWallet = () => {
    open();
  };

  const checkNetwork = useCallback(async () => {
    if (!walletProvider) {
      toast.error(
        "Wallet provider unavailable. Please try reconnecting your wallet.",
        {
          icon: <FaTimesCircle className="text-red-400" />,
        }
      );
      return false;
    }
    try {
      const provider = new BrowserProvider(walletProvider);
      const network = await provider.getNetwork();
      if (network.chainId !== appConfig.chainID) {
        toast.error(
          "Incorrect network! Please switch to Binance Smart Chain Testnet.",
          {
            icon: <FaTimesCircle className="text-red-400" />,
          }
        );
        return false;
      }
      return true;
    } catch (error) {
      handleError("Failed to verify network.", error);
      return false;
    }
  }, [walletProvider]);

  const handleError = (message, error) => {
    console.error(message, error);
    toast.error(message, {
      icon: <FaTimesCircle className="text-red-400" />,
      autoClose: 3000,
    });
  };

  const handleDeposit = async () => {
    if (!isConnected) {
      handleError("Please connect your wallet first!");
      return;
    }

    if (depositType === "emgt") {
      handleError("EMGT deposits are not supported yet. Please select USDT.");
      return;
    }

    if (!validateAmount(amount)) return;

    if (!(await checkNetwork())) return;

    setIsLoading(true);
    try {
      const provider = new BrowserProvider(walletProvider);
      const signer = await provider.getSigner();
      const usdtContract = new Contract(appConfig.USDT_ADDRESS, USDT_ABI, signer);
      const depositContract = new Contract(
        appConfig.DEPOSIT_ADDRESS,
        DEPOSIT_ABI,
        signer
      );

      const balance = await usdtContract.balanceOf(address);
      const amountWei = parseUnits(amount, 18);
      if (balance < amountWei) {
        handleError("Insufficient USDT balance in your wallet!");
        return;
      }

      const transactionToastId = toast.info(
        "Processing transaction: Approving USDT...",
        {
          autoClose: false,
        }
      );
      const approveTx = await usdtContract.approve(appConfig.DEPOSIT_ADDRESS, amountWei);
      await approveTx.wait();
      toast.update(transactionToastId, {
        render: "Processing transaction: Depositing to contract...",
        type: "info",
        autoClose: false,
      });
      const depositTx = await depositContract.deposit(amountWei);
      const receipt = await depositTx.wait();
      toast.dismiss(transactionToastId);

      const token =
        localStorage.getItem("authToken") ||
        sessionStorage.getItem("authToken");
      if (!token) {
        handleError("User not authenticated. Please log in.");
        return;
      }

      const response = await axios.post(
        `${appConfig.baseURL}/user/userDeposit`,
        {
          amount: parseFloat(amount),
          walletAddress: address,
          transactionHash: receipt.hash,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("Deposit response:", response.data);

      if (response.data.status === 'success') {
        toast.success("Deposit successful!", {
          icon: <FaCheckCircle className="text-green-500" />,
          autoClose: 3000,
        });
        setAmount("");
        await fetchBalance(); // Refresh balance
      } else {
        handleError(response.data.status);
      }
    } catch (error) {
      let errorMessage = "Deposit failed. Please try again.";
      if (error.code === "ACTION_REJECTED" || error.code === 4001) {
        errorMessage = "Transaction rejected by user.";
      } else if (error.message.includes("insufficient funds")) {
        errorMessage = "Insufficient funds for gas fees.";
      } else if (error.message.includes("execution reverted")) {
        errorMessage = "Transaction failed: Smart contract error.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      handleError(errorMessage, error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        <Wallets />
      </div>
      <div className="bg-[#12212154] backdrop-blur-xl border border-slate-700 shadow-md shadow-slate-800/50 text-white p-5 rounded-md max-w-2xl mx-auto">
        <div className="flex justify-center mb-6 border-b border-slate-600 gap-4">
          {/* <button
            className={`px-4 py-2 rounded-t ${method === 'qr' ? 'text-white border-b-2 border-sky-400 bg-gradient-to-b from-primary/50 to-sky-400/50' : 'bg-slate-800/50'}`}
            onClick={() => setMethod('qr')}
          >
            Deposit via Cryptapi
          </button> */}

          <button
            className={`px-4 py-2 rounded-t bg-slate-800/50 text-slate-400 cursor-not-allowed`}
            disabled
          >
            Deposit via Cryptapi (Disabled)
          </button>
          <button
            className={`px-4 py-2 rounded-t md:text-base text-sm ${
              method === "wallet"
                ? "text-white border-b-2 border-sky-400 bg-gradient-to-b from-primary/50 to-sky-400/50"
                : "bg-slate-800/50"
            }`}
            onClick={() => setMethod("wallet")}
          >
            Deposit via Wallet
          </button>
        </div>

        {method === "qr" ? (
          // <div className="space-y-4">
          //   <div>
          //     <label className="block text-sm font-semibold mb-1">
          //       Select Token
          //     </label>
          //     <select
          //       value={depositType}
          //       onChange={(e) => setDepositType(e.target.value)}
          //       className="w-full bg-transparent border border-slate-800 px-4 py-2 rounded text-white focus:outline-none"
          //     >
          //       <option value="usdt" className="bg-gray-700">
          //         Deposit in USDT
          //       </option>
          //       {/* <option value="emgt" className="bg-gray-700">
          //         Deposit in EMGT
          //       </option> */}
          //     </select>
          //   </div>
          //   <div className="bg-gradient-to-br from-secondary/50 to-primary/50 p-4 rounded flex justify-center">
          //     {isConnected ? (
          //       <QRCode
          //         value={walletAddress}
          //         fgColor="#ffffff"
          //         bgColor="transparent"
          //       />
          //     ) : (
          //       <p className="text-yellow-400">
          //         Connect wallet to generate QR code
          //       </p>
          //     )}
          //   </div>
          //   <div>
          //     <label className="block text-sm font-semibold mb-1">
          //       Wallet Address
          //     </label>
          //     <div className="flex items-center gap-2 bg-slate-800/50 px-4 py-2 rounded border border-slate-600">
          //       <span className="text-base truncate">{walletAddress}</span>
          //       <button
          //         onClick={copyToClipboard}
          //         className="ml-auto text-sky-400 hover:text-sky-300"
          //         title="Copy to clipboard"
          //       >
          //         <FaCopy />
          //       </button>
          //     </div>
          //   </div>
          //   {isConnected && usdtBalance !== null && (
          //     <div className="text-sm">
          //       <span className="font-semibold">USDT Balance: </span>
          //       <span>{parseFloat(usdtBalance).toFixed(2)} USDT</span>
          //     </div>
          //   )}
          //   <p className="text-yellow-400 text-sm mt-2">
          //     ⚠️ Pay the exact amount on Binance Smart Chain Testnet. Otherwise,
          //     funds will be lost.
          //   </p>
          // </div>

          <div className="space-y-4 text-center py-6">
      <p className="text-yellow-400 text-sm">
        ⚠️ QR Code/Wallet deposit method is not available at the moment. Please use the Wallet deposit option.
      </p>
    </div>
        ) : (
          <div className="space-y-6 mt-10">
            <div className="flex flex-col items-center justify-center gap-4">
              <button
                className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-sky-700 rounded text-sm font-semibold"
                onClick={handleConnectWallet}
              >
                <FaWallet /> {isConnected ? "Connected" : "Connect Wallet"}
              </button>
              {isConnected && (
                <>
                  <span className="text-primary text-sm">
                    Wallet: {address.slice(0, 6)}...{address.slice(-4)}
                  </span>
                  {usdtBalance !== null && (
                    <span className="text-sm">
                      <span className="font-semibold">USDT Balance: </span>
                      <span>{parseFloat(usdtBalance).toFixed(2)} USDT</span>
                    </span>
                  )}
                </>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">
                Enter Amount (USD)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={`w-full bg-transparent border ${
                  validationError ? "border-red-500" : "border-slate-600"
                } px-4 py-2 rounded text-white focus:outline-none`}
                placeholder={`Minimum ${appConfig.MIN_INVESTMENT_USD} USD`}
                disabled={!isConnected || isLoading}
              />
              {validationError && (
                <p className="text-red-400 text-xs mt-1">{validationError}</p>
              )}
            </div>
            <button
              onClick={handleDeposit}
              className="w-full bg-green-600 hover:bg-green-700 py-2 rounded text-sm font-semibold disabled:bg-gray-600 flex items-center justify-center"
              disabled={!isConnected || isLoading || !!validationError}
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 mr-2 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </>
              ) : (
                "Deposit"
              )}
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default Deposit;
