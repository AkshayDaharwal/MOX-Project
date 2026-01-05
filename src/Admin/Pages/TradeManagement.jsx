import { useState } from 'react';

import { appConfig } from "../../config/appConfig";

const TradeManagement = () => {
  const [depositAmount, setDepositAmount] = useState(0);
  const [withdrawalAmount, setWithdrawalAmount] = useState(0);
  const [profitAmount, setProfitAmount] = useState(0);
  const [status, setStatus] = useState("");

  async function handleSubmit(type, amount) {
    setStatus("");
    if (!amount || amount <= 0) {
      setStatus("Amount must be greater than zero.");
      return;
    }
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    let url = "";
    if (type === "deposit") url = `${appConfig.baseURL}/admin/trade/deposit`;
    if (type === "withdrawal") url = `${appConfig.baseURL}/admin/trade/withdrawal`;
    if (type === "profit") url = `${appConfig.baseURL}/admin/trade/profit-withdrawal`;
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ amount })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Operation failed");
      setStatus(data.message || "Success");
    } catch (err) {
      setStatus(err.message);
    }
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-white-100 via-blue-100 to-white z-1">
      <main className="flex-1 min-h-screen p-4 md:p-6 lg:ml-5 overflow-x-hidden overflow-y-auto">
        <div className="max-w-screen-2xl mx-auto">
          <header className="mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#103944] to-[#234767] bg-clip-text text-transparent">
              Trade Management
            </h1>
          </header>
          <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div className="bg-white/70 backdrop-blur-lg shadow-md rounded-2xl p-6">
              <h2 className="font-semibold mb-4 text-[#103944]">Deposit</h2>
              <input type="number" min="1" value={depositAmount} onChange={e => setDepositAmount(Number(e.target.value))} className="w-full p-2 mb-2 text-black rounded" placeholder="Amount" />
              <button onClick={() => handleSubmit("deposit", depositAmount)} className="bg-green-600 px-4 py-2 rounded text-white">Deposit</button>
            </div>
            <div className="bg-white/70 backdrop-blur-lg shadow-md rounded-2xl p-6">
              <h2 className="font-semibold mb-4 text-[#103944]">Withdrawal</h2>
              <input type="number" min="1" value={withdrawalAmount} onChange={e => setWithdrawalAmount(Number(e.target.value))} className="w-full p-2 mb-2 text-black rounded" placeholder="Amount" />
              <button onClick={() => handleSubmit("withdrawal", withdrawalAmount)} className="bg-red-600 px-4 py-2 rounded text-white">Withdraw</button>
            </div>
            <div className="bg-white/70 backdrop-blur-lg shadow-md rounded-2xl p-6">
              <h2 className="font-semibold mb-4 text-[#103944]">Profit Withdrawal</h2>
              <input type="number" min="1" value={profitAmount} onChange={e => setProfitAmount(Number(e.target.value))} className="w-full p-2 mb-2 text-black rounded" placeholder="Amount" />
              <button onClick={() => handleSubmit("profit", profitAmount)} className="bg-blue-600 px-4 py-2 rounded text-white">Profit Withdraw</button>
            </div>
          </section>
          {status && <div className="mb-6 text-yellow-400 font-semibold">{status}</div>}
        </div>
      </main>
    </div>
  );
};

export default TradeManagement;
