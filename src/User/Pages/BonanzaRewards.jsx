import { useState, useEffect } from "react";
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
import axios from "axios";
import { appConfig } from '../../config/appConfig';

// Define icons and gradients for dynamic assignment
const planStyles = [
  { icon: <FaMedal />, gradient: 'from-gray-400 to-slate-500', description: 'Step into success with your first milestone!' },
  { icon: <FaCrown />, gradient: 'from-yellow-400 to-amber-500', description: 'Shine brighter as you scale your rewards.' },
  { icon: <FaGem />, gradient: 'from-slate-300 to-gray-100', description: 'Solid growth with premium returns.' },
  { icon: <FaLeaf />, gradient: 'from-green-400 to-emerald-600', description: 'Grow consistently and earn generously.' },
  { icon: <FaShapes />, gradient: 'from-cyan-300 to-blue-500', description: 'Shine bright as your earnings soar.' },
  { icon: <FaStar />, gradient: 'from-blue-500 to-indigo-600', description: 'Twice the impact, double the returns.' },
  { icon: <FaShieldAlt />, gradient: 'from-black to-gray-800', description: 'Elite status with powerful rewards.' },
  { icon: <FaAward />, gradient: 'from-purple-500 to-indigo-700', description: 'Lead with honor and earn with pride.' },
  { icon: <FaChessKing />, gradient: 'from-pink-500 to-red-600', description: 'Rule the game with top-tier rewards.' },
];

const BonanzaRewards = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch Bonanza Plans from API
  useEffect(() => {
    const fetchBonanzaPlans = async () => {
      try {
        setLoading(true);
        const token =
          localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
        if (!token) {
          setError("No authentication token found. Please log in.");
          return;
        }

        const response = await axios.get(`${appConfig.baseURL}/user/bonanza-plans`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const fetchedPlans = response.data.data.plans || [];
        // Assign icons and gradients based on index
        const enrichedPlans = fetchedPlans.map((plan, index) => ({
          ...plan,
          icon: planStyles[index % planStyles.length].icon,
          gradient: planStyles[index % planStyles.length].gradient,
          description: planStyles[index % planStyles.length].description,
        }));
        setPlans(enrichedPlans);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch Bonanza Plans");
        console.error("Error fetching Bonanza Plans:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBonanzaPlans();
  }, []);

  if (plans.length === 0) {
    return (
      <div className="bg-[#12212154] backdrop-blur-xl border border-slate-700 border-gradient shadow-md shadow-slate-800/50 text-white p-6 rounded-md max-w-full mx-auto text-center text-sm text-slate-400">
        No Bonanza Plans available
      </div>
    );
  }

  return (
    <div className="bg-[#12212154] backdrop-blur-xl border border-slate-700 border-gradient shadow-md shadow-slate-800/50 text-white p-6 rounded-md max-w-full mx-auto">
      <h2 className="text-xl md:text-2xl font-bold text-center mb-6 text-primary">Bonanza Rewards</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan, index) => (
          <div
            key={plan._id}
            className="rounded-xl border border-gradient bg-[#12212154] backdrop-blur-xl p-6 text-center shadow-md transition-all hover:scale-[1.02] hover:shadow-lg duration-300"
          >
            <div className={`w-20 h-20 mx-auto mb-4 rounded-xl flex items-center justify-center text-white text-5xl shadow-md bg-gradient-to-br ${plan.gradient}`}>
              {plan.icon}
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">{plan.name}</h3>
            <p className="text-sm text-white/70 mb-1 italic">{plan.description}</p>
            <p className="text-sm text-white/70 mb-1">
              ROI: <span className="text-white font-medium">{plan.roi}%</span>
            </p>
            <p className="text-sm text-white/70 mb-1">
              Min Direct: <span className="text-white font-medium">{plan.minDirect}</span>
            </p>
            <p className="text-sm text-white/70">
              Target: <span className="text-white font-medium">${plan.target}</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BonanzaRewards;