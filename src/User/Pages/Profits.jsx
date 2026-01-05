import { useState, useEffect } from "react";
import { FaDollarSign, FaArrowUp, FaHistory } from "react-icons/fa";
import Footer from "../Components/Comman/Footer";
import { appConfig } from '../../config/appConfig';

const Profits = () => {
  const [profitHistory, setProfitHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchProfitHistory() {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
        const res = await fetch(`${appConfig.baseURL}/user/trade/profit-withdrawal/history`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (!res.ok) throw new Error('Failed to fetch profit withdrawal history');
        const data = await res.json();
        setProfitHistory(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message);
        setProfitHistory([]);
      } finally {
        setLoading(false);
      }
    }
    fetchProfitHistory();
  }, []);

  // Calculate stats from profitHistory
  const totalWithdrawals = profitHistory.length;
  const totalAmount = profitHistory.reduce((sum, item) => sum + (item.amount || 0), 0);
  const latestWithdrawal = profitHistory.length > 0 ? profitHistory[0].amount : 0;
  const stats = [
    {
      title: "Total Withdrawals",
      value: totalWithdrawals,
      color: "bg-purple-500",
      icon: <FaHistory />,
    },
    {
      title: "Total Amount Withdrawn",
      value: totalAmount,
      color: "bg-green-500", 
      icon: <FaDollarSign />,
    },
    {
      title: "Latest Withdrawal",
      value: latestWithdrawal,
      color: "bg-orange-500",
      icon: <FaArrowUp />,
    },
  ];


  return (
    <div className="text-white p-0 overflow-x-hidden">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl uppercase text-primary font-bold mb-2">Profit & Earnings Dashboard</h1>
        <p className="text-slate-400 mb-6">Track your profit withdrawals and view your earnings history</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.map((item, idx) => (
            <div
              key={idx}
              className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-6 shadow-md flex flex-col items-start gap-2"
            >
              <div className={`w-10 h-10 ${item.color} rounded-full flex items-center justify-center mb-2`}>
                {item.icon}
              </div>
              <div className="text-sm text-slate-400">{item.title}</div>
              <div className="text-2xl font-bold text-white">{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Profit Withdrawal History Table */}
  <div className="bg-[#12212154] backdrop-blur-xl border-gradient p-8 border border-slate-700 shadow-md shadow-slate-800/50 mb-8 rounded-xl">
        <h3 className="text-lg font-semibold text-primary mb-4">Profit Withdrawal History</h3>
        {loading ? (
          <div>Loading profit withdrawal history...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm rounded-lg overflow-hidden">
              <thead>
                <tr className="border-b border-slate-600 bg-slate-800">
                  <th className="text-left py-4 px-4 text-slate-400">ID</th>
                  <th className="text-right py-4 px-4 text-slate-400">Amount</th>
                  <th className="text-left py-4 px-6 text-slate-400">Created At</th>
                </tr>
              </thead>
              <tbody>
                {profitHistory.map((item) => (
                  <tr key={item.id} className="border-b border-slate-700/50 hover:bg-slate-800/30">
                    <td className="py-3 px-4">{item.id}</td>
                    <td className="py-3 px-4 text-right font-mono">{item.amount}</td>
                    <td className="py-3 px-6">{new Date(item.created_at * 1000).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {profitHistory.length === 0 && (
              <div className="text-center py-8 text-slate-400">No profit withdrawal history found.</div>
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Profits;





