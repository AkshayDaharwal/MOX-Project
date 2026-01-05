import { useState } from 'react';
import { toast } from 'react-toastify';
import { FaDollarSign } from 'react-icons/fa';
import { SiExpensify, SiTether } from 'react-icons/si';
import favlogo from "../../assets/userImages/Logo/MOXicon.png"
import Wallets from './Wallets';


const Swap = () => {

    const [form, setForm] = useState({ plan: "" });
    const [usdtBalance, setUsdtBalance] = useState(1200); // Example static balance
    const [loading, setLoading] = useState(false);

    const plans = [
        { id: "basic", name: "Basic Plan", cost: 100 },
        { id: "standard", name: "Standard Plan", cost: 250 },
        { id: "premium", name: "Premium Plan", cost: 500 },
    ];

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!form.plan) {
            toast.error("Please select a plan");
            return;
        }

        const selectedPlan = plans.find((p) => p.name === form.plan);
        if (!selectedPlan) {
            toast.error("Invalid plan selected");
            return;
        }

        if (usdtBalance < selectedPlan.cost) {
            toast.error("Insufficient balance");
            return;
        }

        setLoading(true);

        // Simulate API call or swap logic
        setTimeout(() => {
            toast.success(`Successfully swapped USDT to EMGT for ${form.plan}`);
            setUsdtBalance((prev) => prev - selectedPlan.cost);
            setForm({ plan: "" }); // Reset form
            setLoading(false);
        }, 1000);
    };



    // const usdtBalance = 1000;
    // const swapFeePercent = 5;
    // const [form, setForm] = useState({
    //     usdt: '',
    //     emgt: '',
    // });
    // const handleChange = (e) => {
    //     const { name, value } = e.target;

    //     if (name === 'usdt') {
    //         const fee = (value * swapFeePercent) / 100;
    //         const emgt = value - fee;
    //         setForm({
    //             usdt: value,
    //             emgt: value ? emgt.toFixed(2) : '',
    //         });
    //     }
    // };
    // const handleSubmit = (e) => {
    //     e.preventDefault();

    //     const usdt = parseFloat(form.usdt);
    //     const emgt = parseFloat(form.emgt);

    //     if (!usdt || usdt <= 0 || usdt > usdtBalance) {
    //         toast.error('Enter a valid USDT amount within your balance.');
    //         return;
    //     }

    //     toast.success(`Swapped ${usdt} USDT for ${emgt} EMGT`);
    //     setForm({ usdt: '', emgt: '' });
    // };



    return (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-10">
                <Wallets />
            </div>

            <div className="max-w-xl mx-auto bg-[#12212154] backdrop-blur-xl border-gradient border p-6 rounded-xl text-white shadow-lg space-y-6">
                <h2 className="text-2xl font-bold text-center">Swap (USDT → EMGT)</h2>

                {/* Balance */}
                <div className="text-sm text-slate-300 text-center">
                    Your USDT Balance:{" "}
                    <span className="text-white text-lg font-semibold">
                        ${usdtBalance.toFixed(2)}
                    </span>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Plan Select */}
                    <div>
                        <label className="block text-slate-400 text-sm mb-1">Select Plan</label>
                        <select
                            name="plan"
                            value={form.plan}
                            onChange={handleChange}
                            className="w-full py-2 px-3 bg-transparent   border border-white/10 rounded-md text-white focus:outline-none"
                        >
                            <option value="" className='bg-slate-700' >-- Select a Plan --</option>
                            {plans.map((plan) => (
                                <option key={plan.id} value={plan.name} className='bg-slate-700'>
                                    {plan.name} — ${plan.cost}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Swap Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2 rounded-md font-semibold text-white bg-gradient-to-r from-[#2298d341] to-[#05CE99] hover:opacity-90 transition disabled:opacity-50"
                    >
                        {loading ? "Processing..." : "Swap Now"}
                    </button>
                </form>
            </div>

            {/* <div className="max-w-xl mx-auto bg-[#12212154] backdrop-blur-xl border-gradient border p-6 rounded-xl text-white shadow-lg space-y-6">
                <h2 className="text-2xl font-bold text-center">Swap (USDT → EMGT)</h2>

                
                <div className="text-sm text-slate-300 text-center">
                    Your USDT Balance: <span className="text-white text-lg font-semibold">${usdtBalance}</span>
                </div>

                 
                <form onSubmit={handleSubmit} className="space-y-4">
                   
                    <div className="relative">
                        <label className="block text-slate-400 text-sm mb-1">USDT Amount</label>
                        <div className="flex items-center bg-transparent border border-white/10 rounded-md gap-3 px-3 py-1 ">
                            <div className={`   aspect-[1/1]  glow-text bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center`}>

                                <SiTether className=" m-2     " />
                            </div>
                            <input
                                type="number"
                                step="0.01"
                                name="usdt"
                                value={form.usdt}
                                onChange={handleChange}
                                placeholder="Enter USDT"
                                className="w-full py-2 bg-transparent text-white focus:outline-none"
                            />
                        </div>
                    </div>

                    
                    <div className="relative">
                        <label className="block text-slate-400 text-sm mb-1">You’ll Receive (EMGT)</label>
                        <div className="flex items-center bg-transparent border border-white/10 rounded-md gap-3 py-1 px-3">
                            <div className={`   aspect-[1/1]  glow-text bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center`}>

                                <img src={favlogo} className='w-9' alt="favlogo" />
                            </div>
                            <input
                                type="number"
                                step="0.01"
                                name="emgt"
                                value={form.emgt}
                                disabled
                                placeholder="EMGT Amount"
                                className="w-full py-2 bg-transparent text-white focus:outline-none"
                            />
                        </div>
                    </div>

                     
                    {form.usdt && (
                        <div className="flex justify-between text-sm text-slate-400">
                            <span>Swap Fee ({swapFeePercent}%)</span>
                            <span className="text-white">
                                ${((form.usdt * swapFeePercent) / 100).toFixed(2)}
                            </span>
                        </div>
                    )}

                    
                    <button
                        type="submit"
                        className="w-full py-2 rounded-md font-semibold text-white bg-gradient-to-r from-[#2298d341] to-[#05CE99] hover:opacity-90 transition"
                    >
                        Swap Now
                    </button>
                </form>
            </div> */}
        </>
    );
};

export default Swap;
