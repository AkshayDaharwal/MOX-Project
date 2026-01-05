import { useState, useEffect } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend,
} from "recharts";
import { 
  FaChartLine, 
  FaChartBar, 
  FaDollarSign, 
  FaCog,
  FaArrowUp,
  FaArrowDown,
} from "react-icons/fa";
// Removed unused Chart import
import Footer from "../Components/Comman/Footer";
import { appConfig } from '../../config/appConfig';

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeframe, setTimeframe] = useState("7d");

  // Helper: filter analyticsData by timeframe
  const getFilteredData = () => {
    if (!analyticsData || analyticsData.length === 0) return [];
    const now = Date.now();
    let cutoff = 0;
    if (timeframe === "1d") cutoff = now - 1 * 24 * 60 * 60 * 1000;
    else if (timeframe === "7d") cutoff = now - 7 * 24 * 60 * 60 * 1000;
    else if (timeframe === "30d") cutoff = now - 30 * 24 * 60 * 60 * 1000;
    else if (timeframe === "90d") cutoff = now - 90 * 24 * 60 * 60 * 1000;
    return analyticsData.filter(item => (item.tradedAt * 1000) >= cutoff);
  };

  const filteredData = getFilteredData();

  useEffect(() => {
    async function fetchAnalytics() {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
        const res = await fetch(`${appConfig.baseURL}/user/trade/arbitrage`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (!res.ok) throw new Error('Failed to fetch analytics data');
        const data = await res.json();
        setAnalyticsData(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message);
        setAnalyticsData([]);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, [timeframe]);

  // Calculate stats from analyticsData
  const totalProfit = filteredData.reduce((sum, item) => sum + (Number(item.profitAfterFees) || 0), 0);
  const totalTrades = filteredData.length;
  const winRate = filteredData.length > 0 ? `${(
    filteredData.filter(item => Number(item.profitAfterFees) > 0).length / filteredData.length * 100
  ).toFixed(2)}%` : "0%";
  const avgReturn = filteredData.length > 0 ? `$${(
    filteredData.reduce((sum, item) => sum + (Number(item.profitAfterFees) || 0), 0) / filteredData.length
  ).toFixed(2)}` : "$0.00";
  // Removed unused bestPair variable
  // bestPairName is not used in the UI, so remove

  const stats = [
    {
      title: "Total Profit",
      value: `$${totalProfit.toFixed(2)}`,
      color: "bg-green-500",
      icon: <FaDollarSign />,
    },
    {
      title: "Total Trades",
      value: totalTrades,
      color: "bg-purple-500", 
      icon: <FaChartBar />,
    },
    {
      title: "Win Rate",
      value: winRate,
      color: "bg-orange-500",
      icon: <FaChartLine />,
    },
    {
      title: "Avg Return",
      value: avgReturn,
      color: "bg-sky-500",
      icon: <FaArrowUp />,
    },
  ];

  // Remove all chart mock data and options

  return (
    <div className="text-white p-0 overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl uppercase text-primary font-bold">
            Trading Analytics Dashboard
          </h1>
          <p className="text-slate-400 mt-2">
            Comprehensive analysis of your trading performance and market insights
          </p>
        </div>
        <div className="flex items-center gap-4">
          <select 
            className="bg-slate-700 border border-slate-600 rounded px-3 py-2 text-sm"
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
          >
            <option value="1d">1 Day</option>
            <option value="7d">7 Days</option>
            <option value="30d">30 Days</option>
            <option value="90d">90 Days</option>
          </select>
          <button className="p-2 bg-secondary rounded-lg hover:bg-sky-700 transition-colors">
            <FaCog className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((item, idx) => (
          <div
            key={idx}
            className="bg-black backdrop-blur-xl border-gradient p-4 shadow-md shadow-slate-800/50"
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className={`w-8 h-8 aspect-[1/1] ${item.color} rounded-full flex items-center justify-center`}
              >
                {item.icon}
              </div>
              <span className="text-sm text-slate-300">{item.title}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-lg font-bold">{item.value}</div>
              <div className={`flex items-center gap-1 text-sm ${
                item.trend === 'up' ? 'text-green-500' : 'text-red-500'
              }`}>
                {item.trend === 'up' ? <FaArrowUp className="w-3 h-3" /> : <FaArrowDown className="w-3 h-3" />}
                {item.change}
              </div>
            </div>
          </div>
        ))}
      </div>


      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Profit Over Time Chart */}
        <div className="bg-[#12212154] backdrop-blur-xl border-gradient p-6 border border-slate-700 shadow-md shadow-slate-800/50 rounded-xl">
          <h3 className="text-lg font-semibold text-primary mb-4">Profit Over Time</h3>
          {loading ? (
            <div>Loading analytics data...</div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={filteredData.map(item => ({
                tradedAt: new Date(item.tradedAt * 1000).toLocaleDateString(),
                profitAfterFees: Number(item.profitAfterFees) || 0,
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="tradedAt" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="profitAfterFees" stroke="#38bdf8" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Win/Loss Bar Chart */}
        <div className="bg-[#12212154] backdrop-blur-xl border-gradient p-6 border border-slate-700 shadow-md shadow-slate-800/50 rounded-xl">
          <h3 className="text-lg font-semibold text-primary mb-4">Win vs Loss Trades</h3>
          {loading ? (
            <div>Loading analytics data...</div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={(() => {
                const win = filteredData.filter(item => Number(item.profitAfterFees) > 0).length;
                const loss = filteredData.filter(item => Number(item.profitAfterFees) <= 0).length;
                return [
                  { name: "Win", value: win },
                  { name: "Loss", value: loss },
                ];
              })()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#f59e42" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Exchange Performance Chart */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="bg-[#12212154] backdrop-blur-xl border-gradient p-6 border border-slate-700 shadow-md shadow-slate-800/50 rounded-xl">
          <h3 className="text-lg font-semibold text-primary mb-4">Exchange Performance</h3>
          {loading ? (
            <div>Loading analytics data...</div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={(() => {
                // Aggregate profitAfterFees by exchange
                const exchangeMap = {};
                filteredData.forEach(item => {
                  const exchange = item.exchange || "Unknown";
                  exchangeMap[exchange] = (exchangeMap[exchange] || 0) + (Number(item.profitAfterFees) || 0);
                });
                return Object.entries(exchangeMap).map(([exchange, profit]) => ({ exchange, profit: Number(profit.toFixed(2)) }));
              })()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="exchange" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="profit" fill="#34d399" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pair Performance Chart */}
        <div className="bg-[#12212154] backdrop-blur-xl border-gradient p-6 border border-slate-700 shadow-md shadow-slate-800/50 rounded-xl">
          <h3 className="text-lg font-semibold text-primary mb-4">Pair Performance</h3>
          {loading ? (
            <div>Loading analytics data...</div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={(() => {
                // Aggregate profitAfterFees by ticker/pair
                const pairMap = {};
                filteredData.forEach(item => {
                  const pair = item.ticker || "Unknown";
                  pairMap[pair] = (pairMap[pair] || 0) + (Number(item.profitAfterFees) || 0);
                });
                return Object.entries(pairMap).map(([pair, profit]) => ({ pair, profit: Number(profit.toFixed(2)) }));
              })()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="pair" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="profit" fill="#818cf8" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Analytics;
