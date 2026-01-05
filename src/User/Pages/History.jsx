import { useState, useEffect } from "react";
import { 
  FaHistory, 
  FaDollarSign, 
  FaCog,
  FaDownload,
  FaArrowUp,
} from "react-icons/fa";
import Footer from "../Components/Comman/Footer";
import { appConfig } from '../../config/appConfig';

const History = () => {
  // ...existing code...
  const [balanceHistory, setBalanceHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    async function fetchBalanceHistory() {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
        const res = await fetch(`${appConfig.baseURL}/user/trade/balance/history`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (!res.ok) throw new Error('Failed to fetch balance history');
        const data = await res.json();
        setBalanceHistory(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message);
        setBalanceHistory([]);
      } finally {
        setLoading(false);
      }
    }
    fetchBalanceHistory();
  }, []);


  // Calculate stats from balanceHistory
  const totalTransactions = balanceHistory.length;
  const totalDeposits = balanceHistory.reduce((sum, item) => sum + (item.deposit || 0), 0);
  const totalWithdrawals = balanceHistory.reduce((sum, item) => sum + (item.withdrawal || 0), 0);
  const currentBalance = balanceHistory.length > 0 ? balanceHistory[0].amount : 0;

  const stats = [
    {
      title: "Total Transactions",
      value: totalTransactions,
      color: "bg-purple-500",
      icon: <FaHistory />,
    },
    {
      title: "Total Deposits",
      value: totalDeposits,
      color: "bg-green-500", 
      icon: <FaArrowUp />,
    },
    {
      title: "Total Withdrawals",
      value: totalWithdrawals,
      color: "bg-orange-500",
      icon: <FaDollarSign />,
    },
    {
      title: "Current Balance",
      value: currentBalance,
      color: "bg-sky-500",
      icon: <FaArrowUp />,
    },
  ];

  return (
    <div className="text-white p-0 overflow-x-hidden">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl uppercase text-primary font-bold">
            Trading Balance History
          </h1>
          <p className="text-slate-400 mt-2">
            Complete record of all your trading activities and transactions
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded transition-colors">
            <FaDownload className="w-4 h-4" />
            Export
          </button>
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
            className="bg-[#12212154] backdrop-blur-xl border-gradient p-4 shadow-md shadow-slate-800/50"
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className={`w-8 h-8 aspect-[1/1] ${item.color} rounded-full flex items-center justify-center`}
              >
                {item.icon}
              </div>
              <span className="text-sm text-slate-300">{item.title}</span>
            </div>
            <div className="text-lg font-bold">{item.value}</div>
          </div>
        ))}
      </div>

      {/* Balance History Section */}
      <div className="bg-[#12212154] backdrop-blur-xl border-gradient p-4 border border-slate-700 shadow-md shadow-slate-800/50 mb-6">
        <h2 className="text-lg font-semibold text-primary mb-4">Trading Balance History</h2>
        {loading ? (
          <div>Loading balance history...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-600">
                  <th className="text-left pb-3 text-slate-400">ID</th>
                  <th className="text-right pb-3 text-slate-400">Amount</th>
                  <th className="text-right pb-3 text-slate-400">Deposit</th>
                  <th className="text-right pb-3 text-slate-400">Withdrawal</th>
                  <th style={{minWidth: '120px'}} className="text-left pb-3 text-slate-400 pl-6">Updated At</th>
                </tr>
              </thead>
              <tbody>
                {balanceHistory.map((item) => (
                  <tr key={item.id} className="border-b border-slate-700/50 hover:bg-slate-800/30">
                    <td className="py-2">{item.id}</td>
                    <td className="py-2 text-right font-mono">{item.amount}</td>
                    <td className="py-2 text-right font-mono">{item.deposit ?? '-'}</td>
                    <td className="py-2 text-right font-mono">{item.withdrawal ?? '-'}</td>
                    <td className="py-2 pl-6">{new Date(item.updated_at * 1000).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {balanceHistory.length === 0 && (
              <div className="text-center py-8 text-slate-400">No balance history found.</div>
            )}
          </div>
        )}
      </div>


      <Footer />
    </div>
  );
};

export default History;
