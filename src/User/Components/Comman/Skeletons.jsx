// components/common/SkeletonLoader.jsx
import React from "react";

const SkeletonLoader = ({ variant = "table", rows = 5, cols = 5 }) => {
    if (variant === "table") {
        return (
            <div className="overflow-x-auto-auto rounded">
                <table className="w-full border-collapse text-sm">
                    <thead>
                        <tr>
                            {Array.from({ length: cols }).map((_, i) => (
                                <th
                                    key={i}
                                    className="px-4 py-2 border-b border-slate-700 bg-slate-800/50 text-left"
                                >
                                    <div className="h-4 w-24 bg-slate-700 animate-pulse rounded"></div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {Array.from({ length: rows }).map((_, rowIdx) => (
                            <tr
                                key={rowIdx}
                                className="hover:bg-slate-800/40 transition"
                            >
                                {Array.from({ length: cols }).map((_, colIdx) => (
                                    <td
                                        key={colIdx}
                                        className="px-4 py-3 border-b border-slate-700"
                                    >
                                        <div className="h-4 w-20 bg-slate-700 animate-pulse rounded"></div>
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }

    if (variant === "card") {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Array.from({ length: rows }).map((_, i) => (
                    <div
                        key={i}
                        className="bg-[#12212154]  backdrop-blur-xl border border-slate-700 rounded-xl p-4 shadow-md"
                    >
                        <div className="h-6 w-32 bg-slate-700 animate-pulse rounded mb-3"></div>
                        <div className="h-4 w-20 bg-slate-700 animate-pulse rounded mb-2"></div>
                        <div className="h-4 w-16 bg-slate-700 animate-pulse rounded"></div>
                    </div>
                ))}
            </div>
        );
    }
    if (variant === "card3") {
        return (
            
                <div className="bg-gradient-to-br from-green-400/10 to-green-700/10 border border-green-500/30 border-gradient px-6 py-4 rounded-lg w-full max-w-md shadow-lg flex sm:flex-row flex-col-reverse sm:text-left text-center gap-5 animate-pulse">
                    {/* Left Content */}
                    <div className="sm:w-1/2 w-full space-y-3 flex flex-col justify-center">
                        <div className="h-6 w-24 bg-slate-700 rounded mx-auto sm:mx-0"></div>
                        <div className="h-4 w-32 bg-slate-700 rounded mx-auto sm:mx-0"></div>
                        <div className="h-4 w-40 bg-slate-700 rounded mx-auto sm:mx-0"></div>
                        <div className="h-4 w-28 bg-slate-700 rounded mx-auto sm:mx-0"></div>
                    </div>

                    {/* Right Icon Box */}
                    <div className="sm:w-1/2 w-full flex items-center justify-center">
                        <div className="w-24 h-24 md:w-32 md:h-32 bg-slate-700 rounded-xl"></div>
                    </div>
                </div>
            
        );
    }
    if (variant === "card2") {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {Array.from({ length: rows }).map((_, i) => (
                    <div key={i} className="relative group p-[1px] border-gradient bg-gradient-to-br from-black to-blue-500/20 transition-all duration-300">
                        <div className="relative bg-[#12212154] backdrop-blur-xl h-full p-6 flex flex-col justify-between animate-pulse">
                            <div className="absolute inset-0 z-0 opacity-0 group-hover:opacity-20 transition-all duration-300 bg-gradient-to-br from-white/40 via-transparent to-transparent" />

                            {/* Badge */}
                            <div className="h-5 w-28 bg-slate-700 rounded-full mb-4"></div>

                            {/* Plan name + amount */}
                            <div className="z-10 space-y-3 mb-6">
                                <div className="h-5 w-32 bg-slate-700 rounded"></div>
                                <div className="h-8 w-24 bg-slate-700 rounded"></div>
                            </div>

                            {/* Features list */}
                            <ul className="text-sm space-y-2 z-10 mb-6">
                                <li className="h-4 w-40 bg-slate-700 rounded"></li>
                                <li className="h-4 w-44 bg-slate-700 rounded"></li>
                                <li className="h-4 w-36 bg-slate-700 rounded"></li>
                                <li className="h-4 w-20 bg-slate-700 rounded"></li>
                            </ul>

                            {/* Button */}
                            <div className="h-10 w-full bg-slate-700 rounded-md mt-auto"></div>
                        </div>
                    </div>
                ))}
            </div>
            
        );
    }

    if (variant === "form") {
        return (
            <div className="space-y-4">
                {Array.from({ length: rows }).map((_, i) => (
                    <div key={i} className="flex flex-col gap-2">
                        <div className="h-4 w-32 bg-slate-700 animate-pulse rounded"></div>
                        <div className="h-10 w-full bg-slate-700 animate-pulse rounded"></div>
                    </div>
                ))}
                <div className="h-10 w-28 bg-slate-700 animate-pulse rounded mt-4"></div>
            </div>
        );
    }

    if (variant === "list") {
        return (
            <ul className="space-y-3">
                {Array.from({ length: rows }).map((_, i) => (
                    <li
                        key={i}
                        className="flex items-center gap-3 p-3 border border-slate-700 rounded bg-[#12212154]"
                    >
                        <div className="h-10 w-10 bg-slate-700 animate-pulse rounded-full"></div>
                        <div className="flex-1">
                            <div className="h-4 w-40 bg-slate-700 animate-pulse rounded mb-2"></div>
                            <div className="h-3 w-24 bg-slate-700 animate-pulse rounded"></div>
                        </div>
                    </li>
                ))}
            </ul>
        );
    }
    

    if (variant === "dashboard") {
        return (
            <div className="text-white p-0 overflow-x-hidden animate-pulse space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div className="h-6 w-64 bg-slate-700 rounded"></div>
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-700 rounded-lg"></div>
                        <div className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-lg">
                            <div className="w-8 h-8 bg-slate-700 rounded-full"></div>
                            <div className="h-4 w-32 bg-slate-700 rounded"></div>
                        </div>
                    </div>
                </div>

                {/* Row 1: Wallets */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:col-span-2">
                        {Array.from({ length: 4 }).map((_, idx) => (
                            <div
                                key={idx}
                                className="bg-[#12212154] backdrop-blur-xl border-gradient p-4 shadow-md shadow-slate-800/50 space-y-3"
                            >
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-slate-700 rounded-full"></div>
                                    <div className="h-4 w-24 bg-slate-700 rounded"></div>
                                </div>
                                <div className="h-6 w-20 bg-slate-700 rounded"></div>
                            </div>
                        ))}
                        {Array.from({ length: 4 }).map((_, idx) => (
                            <div
                                key={idx}
                                className="bg-[#12212154] backdrop-blur-xl border-gradient p-4 shadow-md shadow-slate-800/50 space-y-3"
                            >
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-slate-700 rounded-full"></div>
                                    <div className="h-4 w-24 bg-slate-700 rounded"></div>
                                </div>
                                <div className="h-6 w-20 bg-slate-700 rounded"></div>
                            </div>
                        ))}
                    </div>
                    <div className="lg:col-span-1 border-gradient bg-[#12212154] backdrop-blur-xl rounded-md h-48"></div>
                </div>

                {/* Row 2 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-[#12212154] border-gradient backdrop-blur-xl p-6 space-y-6">
                        <div className="h-5 w-40 bg-slate-700 rounded"></div>
                        <div className="mx-auto w-32 h-32 bg-slate-700 rounded-full"></div>
                        <div className="space-y-2">
                            {Array.from({ length: 3 }).map((_, idx) => (
                                <div key={idx} className="flex justify-between">
                                    <div className="h-4 w-24 bg-slate-700 rounded"></div>
                                    <div className="h-4 w-16 bg-slate-700 rounded"></div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-5">
                        <div className="bg-[#12212154] border-gradient p-6 space-y-4">
                            <div className="w-8 h-8 bg-slate-700 rounded-full"></div>
                            <div className="h-5 w-32 bg-slate-700 rounded"></div>
                            <div className="h-10 w-full bg-slate-700 rounded"></div>
                        </div>
                        <div className="bg-[#12212154] border-gradient p-6 space-y-4">
                            <div className="h-5 w-40 bg-slate-700 rounded"></div>
                            {Array.from({ length: 3 }).map((_, idx) => (
                                <div key={idx} className="flex justify-between">
                                    <div className="h-4 w-28 bg-slate-700 rounded"></div>
                                    <div className="h-4 w-16 bg-slate-700 rounded"></div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-[#12212154] border-gradient p-6 space-y-4">
                        <div className="h-5 w-40 bg-slate-700 rounded"></div>
                        <div className="mx-auto w-32 h-32 bg-slate-700 rounded-full"></div>
                    </div>
                </div>

                {/* Row 3 */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                    <div className="bg-[#12212154] border-gradient p-6 space-y-4">
                        <div className="h-14 w-full bg-slate-700 rounded-md"></div>
                        <div className="h-5 w-32 bg-slate-700 rounded mx-auto"></div>
                        <div className="h-6 w-20 bg-slate-700 rounded mx-auto"></div>
                    </div>
                    <div className="bg-[#12212154] border-gradient p-6">
                        <div className="grid grid-cols-2 gap-4">
                            {Array.from({ length: 2 }).map((_, idx) => (
                                <div key={idx} className="space-y-2">
                                    <div className="h-14 w-full bg-slate-700 rounded-md"></div>
                                    <div className="h-4 w-20 bg-slate-700 rounded mx-auto"></div>
                                    <div className="h-5 w-16 bg-slate-700 rounded mx-auto"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="md:col-span-2 border-gradient bg-[#12212154] p-6 space-y-4">
                        <div className="h-5 w-40 bg-slate-700 rounded mx-auto"></div>
                        <div className="grid grid-cols-2 gap-4">
                            {Array.from({ length: 2 }).map((_, idx) => (
                                <div key={idx}>
                                    <div className="h-14 w-14 bg-slate-700 rounded-full mx-auto mb-2"></div>
                                    <div className="h-4 w-20 bg-slate-700 rounded mx-auto"></div>
                                    <div className="h-5 w-16 bg-slate-700 rounded mx-auto"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Row 4 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    {Array.from({ length: 3 }).map((_, idx) => (
                        <div
                            key={idx}
                            className="bg-[#12212154] border-gradient p-6 space-y-3 text-center"
                        >
                            <div className="h-14 w-14 bg-slate-700 rounded-xl mx-auto"></div>
                            <div className="h-6 w-10 bg-slate-700 rounded mx-auto"></div>
                            <div className="h-4 w-24 bg-slate-700 rounded mx-auto"></div>
                        </div>
                    ))}
                    <div className="lg:col-span-2 border-gradient bg-[#12212154] p-6 space-y-4 text-center">
                        <div className="h-5 w-40 bg-slate-700 rounded mx-auto"></div>
                        <div className="h-10 w-10 bg-slate-700 rounded-full mx-auto"></div>
                        <div className="h-4 w-32 bg-slate-700 rounded mx-auto"></div>
                    </div>
                </div>

                {/* Row 5 */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="lg:col-span-2 border-gradient bg-[#12212154] p-6 space-y-4">
                        <div className="h-5 w-40 bg-slate-700 rounded"></div>
                        <div className="h-6 w-64 bg-slate-700 rounded"></div>
                        <div className="h-4 w-full bg-slate-700 rounded"></div>
                        <div className="h-4 w-3/4 bg-slate-700 rounded"></div>
                    </div>
                    <div className="bg-[#12212154] border-gradient p-6 space-y-4 text-center">
                        <div className="h-5 w-40 bg-slate-700 rounded mx-auto"></div>
                        <div className="h-6 w-24 bg-slate-700 rounded mx-auto"></div>
                        <div className="h-8 w-32 bg-slate-700 rounded mx-auto"></div>
                    </div>
                </div>
            </div>
        );
    }


    return null;
};

export default SkeletonLoader;
