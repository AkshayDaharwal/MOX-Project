import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import axios from "axios";
import { appConfig } from "../../config/appConfig";
import SkeletonLoader from "../Components/Comman/Skeletons";

const fetchPlans = async () => {
  const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
  if (!token) throw new Error("No authentication token found. Please log in.");

  const response = await axios.get(`${appConfig.baseURL}/user/package/allDetails`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data.data.map((plan) => ({
    name: plan.name,
    amount: plan.investment,
    roi: `${plan.dailyROI.toFixed(1)}%`,
    stakingDays: "5 days",
    lockPeriod: `${plan.lockingPeriodDays} days`,
  }));
};

const fetchWalletBalance = async () => {
  const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
  if (!token) throw new Error("No authentication token found. Please log in.");

  const response = await axios.get(`${appConfig.baseURL}/user/wallet`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data.data.depositWallet || 0;
};

const Investments = () => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loadingBtn, setLoadingBtn] = useState(null); // yes | no | null
  const queryClient = useQueryClient();

  // ✅ Plans query with caching
  const {
    data: plans = [],
    isLoading: plansLoading,
    error: plansError,
  } = useQuery({
    queryKey: ["plans"],
    queryFn: fetchPlans,
    staleTime: 1000 * 60 * 2, // 2 min fresh
    cacheTime: 1000 * 60 * 5, // 5 min cache
  });

  // ✅ Wallet balance query with caching
  const {
    data: walletBalance = 0,
    isLoading: walletLoading,
    error: walletError,
  } = useQuery({
    queryKey: ["walletBalance"],
    queryFn: fetchWalletBalance,
    staleTime: 1000 * 60 * 2,
    cacheTime: 1000 * 60 * 5,
  });

  const handleInvestClick = (plan) => {
    setSelectedPlan(plan);
    setShowModal(true);
  };

  const confirmPurchase = async () => {
    if (!selectedPlan) return;
    setLoadingBtn("yes");

    try {
      const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
      if (!token) {
        toast.error("No authentication token found. Please log in.");
        setShowModal(false);
        return;
      }

      const response = await axios.post(
        `${appConfig.baseURL}/user/package/select`,
        { packageName: selectedPlan.name },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { packageName, stakeId, amount } = response.data.data;
      toast.success(
        `${packageName} Plan Purchased Successfully! Stake ID: ${stakeId} (Amount: $${amount.toLocaleString()})`
      );

      setShowModal(false);

      // ✅ Refetch wallet balance after purchase
      queryClient.invalidateQueries(["walletBalance"]);
    } catch (error) {
      console.error("Error selecting package:", error.response?.data || error.message);
      if (error.response?.status === 400) {
        toast.error(error.response.data.message || "Insufficient funds or invalid request.");
      } else if (error.response?.status === 401) {
        toast.error("Session expired. Please log in again.");
        localStorage.removeItem("authToken");
        sessionStorage.removeItem("authToken");
      }
      setShowModal(false);
    } finally {
      setLoadingBtn(null);
    }
  };

  const cancelPurchase = () => {
    setLoadingBtn("no");
    setTimeout(() => {
      toast.error("Purchase Cancelled.");
      setShowModal(false);
      setLoadingBtn(null);
    }, 1000);
  };

  const loading = plansLoading || walletLoading;
  const error = plansError?.message || walletError?.message;

  return (
    <>
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-center">
        <h2 className="text-2xl text-primary font-bold">Investment Plans</h2>
        <div className="text-white text-lg font-semibold mt-2 sm:mt-0">
          Deposit Wallet: ${walletBalance.toLocaleString()}
        </div>
      </div>

      {/* Loading or Error State */}
      {loading && (
        <div className="overflow-auto rounded">
          <SkeletonLoader variant="card2" />
        </div>
      )}
      {error && <p className="text-center text-red-500">{error}</p>}

      {/* Cards Grid */}
      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 text-white">
          {plans.map((plan, index) => (
            <div
              key={index}
              className="relative group p-[1px] border-gradient bg-gradient-to-br from-black to-blue-500/20 hover:shadow-sm hover:shadow-[rgba(34,152,211,0.53)] transition-all duration-300"
            >
              <div className="relative bg-[#12212154] backdrop-blur-xl h-full p-6 flex flex-col justify-between">
                <div className="absolute inset-0 z-0 opacity-0 group-hover:opacity-20 transition-all duration-300 bg-gradient-to-br from-white/40 via-transparent to-transparent" />

                <div className="text-xs uppercase font-semibold bg-gradient-to-r from-[#2298D3] to-[#05CE99] text-white px-3 py-1 rounded-full w-max mb-4">
                  Most Popular
                </div>

                <div className="z-10 space-y-1 mb-6">
                  <h2 className="text-xl uppercase font-semibold tracking-wider">{plan.name}</h2>
                  <p className="text-4xl font-extrabold text-green-400">
                    ${plan.amount.toLocaleString()}
                  </p>
                </div>

                <ul className="text-sm text-slate-300 list-disc space-y-1 z-10 mb-6">
                  <li>
                    Daily ROI: <span className="text-white text-base font-medium">{plan.roi}</span>
                  </li>
                  <li>
                    Staking Days:{" "}
                    <span className="text-white font-medium">{plan.stakingDays}</span> (Excl. Sat/Sun)
                  </li>
                  <li>
                    Locking Period: <span className="text-white font-medium">{plan.lockPeriod}</span>
                  </li>
                  <li>
                    Cap: <span className="text-white font-medium">3x</span>
                  </li>
                </ul>

                <button
                  className="z-10 mt-auto w-full py-2 rounded-md text-white font-semibold bg-gradient-to-r from-[#2298d341] to-[#05CE99] hover:opacity-90 transition"
                  onClick={() => handleInvestClick(plan)}
                  disabled={plan.amount > walletBalance}
                  aria-label={`Invest in ${plan.name} plan for $${plan.amount.toLocaleString()}`}
                >
                  {plan.amount > walletBalance ? "Insufficient Funds" : "Invest Now"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-[#122121ee] text-white max-w-md w-full rounded-xl p-6 shadow-lg border border-gradient">
            <h2 className="text-xl font-bold mb-4 text-center">Confirm Investment</h2>
            <p className="text-sm text-center mb-6">
              Are you sure you want to purchase the{" "}
              <span className="font-semibold text-green-400">{selectedPlan.name}</span> plan for $
              {selectedPlan.amount.toLocaleString()}?
            </p>
            <div className="flex justify-center gap-4">
              {/* YES BUTTON */}
              <button
                onClick={confirmPurchase}
                className={`px-4 py-2 rounded-md font-semibold flex items-center justify-center w-24
                  bg-gradient-to-r from-[#2298D3] to-[#05CE99] hover:opacity-90 
                  ${loadingBtn === "yes" ? "opacity-50 cursor-not-allowed" : ""}`}
                disabled={loadingBtn === "yes"}
                aria-label="Confirm purchase"
              >
                {loadingBtn === "yes" ? (
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
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
                  "Yes"
                )}
              </button>

              {/* NO BUTTON */}
              <button
                onClick={cancelPurchase}
                className={`px-4 py-2 rounded-md font-semibold flex items-center justify-center w-24
                  bg-white/10 border border-white/20 hover:bg-white/20
                  ${loadingBtn === "no" ? "opacity-50 cursor-not-allowed" : ""}`}
                disabled={loadingBtn === "no"}
                aria-label="Cancel purchase"
              >
                {loadingBtn === "no" ? (
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
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
                  "No"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Investments;
