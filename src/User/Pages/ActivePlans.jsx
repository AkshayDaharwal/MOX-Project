import { FaCheck } from 'react-icons/fa';

const activePlans = [
    {
        name: 'Gold',
        amount: 500,
        roi: '0.6%',
        stakingDays: '5 days',
        lockPeriod: '90 days',
    },
    {
        name: 'Diamond',
        amount: 5000,
        roi: '0.9%',
        stakingDays: '5 days',
        lockPeriod: '270 days',
    },
    {
        name: 'Platinum',
        amount: 1000,
        roi: '0.7%',
        stakingDays: '5 days',
        lockPeriod: '120 days',
    },
];

const ActivePlans = () => {
    return (
        <>
            <h2 className="text-2xl text-primary   font-bold mb-6">My Active Plans</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 text-white">
                {activePlans.map((plan, index) => (
                    <div
                        key={index}
                        className="relative group p-[1px] border-gradient bg-gradient-to-br from-black to-blue-500/20 hover:shadow-sm hover:shadow-[rgba(34,152,211,0.53)] transition-all duration-300"
                    >
                        {/* Inner glass card */}
                        <div className="relative bg-[#12212154] backdrop-blur-xl h-full p-6 flex flex-col justify-between">
                            <div className="absolute inset-0 z-0 opacity-0 group-hover:opacity-20 transition-all duration-300 bg-gradient-to-br from-white/40 via-transparent to-transparent" />

                            {/* Tag */}
                            <div className="text-xs uppercase font-semibold bg-gradient-to-r from-[#05CE99] to-[#2298D3] text-white px-3 py-1 rounded-full w-max mb-4">
                                Active Plan
                            </div>

                            {/* Header */}
                            <div className="z-10 space-y-1 mb-6">
                                <h2 className="text-xl uppercase font-semibold tracking-wider">{plan.name}</h2>
                                <p className="text-4xl font-extrabold text-green-400">
                                    ₹{plan.amount.toLocaleString()}
                                </p>
                            </div>

                            {/* Details */}
                            <ul className="text-sm text-slate-300 space-y-1 z-10 mb-6">
                                <li>
                                    Daily ROI: <span className="text-white text-base font-medium">{plan.roi}</span>
                                </li>
                                <li>
                                    Staking Days: <span className="text-white font-medium">{plan.stakingDays}</span> (Excl. Sat/Sun)
                                </li>
                                <li>
                                    Locking Period: <span className="text-white font-medium">{plan.lockPeriod}</span>
                                </li>
                                <li>
                                    Cap: <span className="text-white font-medium">3x</span>
                                </li>
                            </ul>

                            {/* Bonus Features */}
                            <div className="z-10 mt-5 pt-4 border-t border-white/10 text-sm space-y-2">
                                {[
                                    'Stable Returns',
                                    'Secure Staking',
                                    'Auto Withdrawals'
                                ].map((feature, i) => (
                                    <div key={i} className="flex items-center gap-2 text-slate-200">
                                        <FaCheck className="text-green-400" />
                                        {feature}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
};

export default ActivePlans;
