import {
  FaMedal,
  FaCrown,
  FaGem,
  FaLeaf,
  FaShapes,
  FaStar,
  FaShieldAlt,
  FaAward,
  FaChessKing,
} from "react-icons/fa";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { appConfig } from "../../config/appConfig";
import SkeletonLoader from "../Components/Comman/Skeletons";

// Define icons and gradients for dynamic assignment
const planStyles = [
  { icon: <FaMedal />, gradient: "from-gray-400 to-slate-500", description: "Step into success with your first milestone!" },
  { icon: <FaCrown />, gradient: "from-yellow-400 to-amber-500", description: "Shine brighter as you scale your rewards." },
  { icon: <FaGem />, gradient: "from-slate-300 to-gray-100", description: "Solid growth with premium returns." },
  { icon: <FaLeaf />, gradient: "from-green-400 to-emerald-600", description: "Grow consistently and earn generously." },
  { icon: <FaShapes />, gradient: "from-cyan-300 to-blue-500", description: "Shine bright as your earnings soar." },
  { icon: <FaStar />, gradient: "from-blue-500 to-indigo-600", description: "Twice the impact, double the returns." },
  { icon: <FaShieldAlt />, gradient: "from-black to-gray-800", description: "Elite status with powerful rewards." },
  { icon: <FaAward />, gradient: "from-purple-500 to-indigo-700", description: "Lead with honor and earn with pride." },
  { icon: <FaChessKing />, gradient: "from-pink-500 to-red-600", description: "Rule the game with top-tier rewards." },
];

const fetchLevelPlans = async ({ queryKey }) => {
  const [_key, page, limit] = queryKey;
  const token =
    localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
  if (!token) throw new Error("No authentication token found. Please log in.");

  const response = await axios.get(
    `${appConfig.baseURL}/user/level-plans?page=${page}&limit=${limit}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  const fetchedPlans = response.data.data.levelPlans || [];
  const pagination = response.data.data.pagination;

  const enrichedPlans = fetchedPlans.map((plan, index) => ({
    ...plan,
    icon: planStyles[index % planStyles.length].icon,
    gradient: planStyles[index % planStyles.length].gradient,
    description: planStyles[index % planStyles.length].description,
  }));

  return { plans: enrichedPlans, totalPages: pagination.pages };
};

const LavelRewards = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(6);

  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["levelPlans", page, limit],
    queryFn: fetchLevelPlans,
    staleTime: 1000 * 60 * 2, // 2 min
    cacheTime: 1000 * 60 * 5, // 5 min
    refetchOnWindowFocus: false,
    keepPreviousData: true,
  });

  if (isLoading) {
    return (
      <div className="text-white text-center">
        <h2 className="text-xl md:text-2xl font-bold text-center mb-6 text-primary">
          Level Rewards
        </h2>
        <SkeletonLoader variant="card2" rows={6} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-[#12212154] backdrop-blur-xl border border-slate-700 border-gradient shadow-md shadow-slate-800/50 text-red-400 p-6 rounded-md max-w-full mx-auto text-center text-sm">
        {error.message || "Failed to fetch Level Plans"}
      </div>
    );
  }

  if (!data || data.plans.length === 0) {
    return (
      <div className="bg-[#12212154] backdrop-blur-xl border border-slate-700 border-gradient shadow-md shadow-slate-800/50 text-white p-6 rounded-md max-w-full mx-auto text-center text-sm text-slate-400">
        No Level Plans available
      </div>
    );
  }

  return (
    <div className="shadow-md shadow-slate-800/50 text-white p-6 rounded-md max-w-full mx-auto">
      <h2 className="text-xl md:text-2xl font-bold text-center mb-6 text-primary">
        Level Rewards
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.plans.map((plan) => (
          <div
            key={plan._id}
            className="rounded-xl border border-gradient bg-[#12212154] backdrop-blur-xl p-6 text-center shadow-md transition-all hover:scale-[1.02] hover:shadow-lg duration-300"
          >
            <div
              className={`w-20 h-20 mx-auto mb-4 rounded-xl flex items-center justify-center text-white text-5xl shadow-md bg-gradient-to-br ${plan.gradient}`}
            >
              {plan.icon}
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">{plan.name}</h3>
            <p className="text-sm text-white/70 mb-1 italic">{plan.description}</p>
            <p className="text-sm text-white/70 mb-1">
              ROI: <span className="text-white font-medium">{plan.roi}%</span>
            </p>
            <p className="text-sm text-white/70 mb-1">
              Strong Leg: <span className="text-white font-medium">{plan.strongLeg}</span>
            </p>
            <p className="text-sm text-white/70 mb-1">
              Weak Leg: <span className="text-white font-medium">{plan.weakLeg}</span>
            </p>
            <p className="text-sm text-white/70">
              Target: <span className="text-white font-medium">${plan.target}</span>
            </p>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-center items-center mt-6 gap-4">
        <button
          disabled={page === 1}
          onClick={() => setPage((prev) => prev - 1)}
          className="px-4 py-2 rounded-lg bg-transparent border-gradient text-white disabled:opacity-50"
        >
          {"<"}
        </button>
        <span className="text-white">
          Page {page} of {data.totalPages}
        </span>
        <button
          disabled={page === data.totalPages}
          onClick={() => setPage((prev) => prev + 1)}
          className="px-4 py-2 rounded-lg bg-transparent border-gradient text-white disabled:opacity-50"
        >
          {">"}
        </button>
      </div>
    </div>
  );
};

export default LavelRewards;
