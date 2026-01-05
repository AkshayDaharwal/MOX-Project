import React from "react";
import { useQuery } from "@tanstack/react-query";
import { FaArrowsDownToPeople, FaPeopleGroup, FaPeoplePulling } from "react-icons/fa6";
import { BsArrowDown } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import i1 from "../../assets/userImages/images/lavel1.webp";
import i2 from "../../assets/userImages/images/lavel2.webp";
import i3 from "../../assets/userImages/images/lavel3.webp";
import { appConfig } from "../../config/appConfig";
import SkeletonLoader from "../Components/Comman/Skeletons";

const ReferralIncome = () => {
  const navigate = useNavigate();

  // Default referral data to prevent undefined errors
  const defaultReferralData = [
    {
      level: "Level 1",
      percentage: 3,
      users: 0,
      income: 0,
    },
    {
      level: "Level 2",
      percentage: 2,
      users: 0,
      income: 0,
    },
    {
      level: "Level 3",
      percentage: 1,
      users: 0,
      income: 0,
    },
  ];

  // Fetch referral data using useQuery
  const { data: referralData = defaultReferralData, isLoading, isError, error } = useQuery({
    queryKey: ["referralTeam"],
    queryFn: async () => {
      const token =
        localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authentication token found. Please log in.");
      }

      const response = await fetch(`${appConfig.baseURL}/user/referral-level-wise-team`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Invalid token. Please log in again.");
        }
        throw new Error("Failed to fetch referral team data.");
      }

      const { data } = await response.json();
      if (!data || typeof data !== "object") {
        throw new Error("Invalid referral data received from the server");
      }

      return [
        {
          level: "Level 1",
          percentage: 3,
          users: data["1"]?.length || 0,
          income: (data["1"]?.reduce((sum, user) => sum + (user.earned || 0), 0)) || 0,
        },
        {
          level: "Level 2",
          percentage: 2,
          users: data["2"]?.length || 0,
          income: (data["2"]?.reduce((sum, user) => sum + (user.earned || 0), 0)) || 0,
        },
        {
          level: "Level 3",
          percentage: 1,
          users: data["3"]?.length || 0,
          income: (data["3"]?.reduce((sum, user) => sum + (user.earned || 0), 0)) || 0,
        },
      ];
    },
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
    onError: (err) => {
      if (err.message.includes("Invalid token")) {
        navigate("/user/login");
      }
    },
  });

  // Calculate totals
  const totalUsers = referralData.reduce((sum, r) => sum + (r.users || 0), 0);
  const totalIncome = referralData.reduce((sum, r) => sum + (r.income || 0), 0);

  // Loading or Error State
  // if (isLoading) {
  //   return <div className="text-center text-sm text-slate-400 py-4">
  //     <SkeletonLoader variant="card" />
  //   </div>;
  // }

  if (isError) {
    return (
      <div className="text-center text-sm text-red-500 py-4">
        {error?.message || "Failed to fetch referral team data. Please try again later."}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h2
        className="text-2xl md:text-3xl font-bold mb-8 text-center text-primary"
        role="heading"
        aria-level="2"
      >
        Your 3-Level Referral Income
      </h2>

      {/* Levels Tree */}
      <div className="flex flex-col items-center space-y-8 relative">
        {/* Level 1 */}
        {
          isLoading ?
            <><SkeletonLoader variant="card3" rows={1} /></>
            :
            <>
              {referralData[0] && (
                <div className="bg-gradient-to-br from-green-400/10 to-green-700/10 border border-green-500/30 border-gradient px-6 py-4 rounded-lg w-full max-w-md shadow-lg flex sm:flex-row flex-col-reverse sm:text-left text-center gap-5 transition-transform hover:scale-105">
                  <div className="sm:w-1/2 w-full">
                    <h3
                      className="text-xl md:text-2xl font-semibold text-green-300 mb-1"
                      role="heading"
                      aria-level="3"
                    >
                      Level 1
                    </h3>
                    <p className="text-sm md:text-base text-slate-300">
                      {referralData[0].percentage}% Commission
                    </p>
                    <p className="text-sm md:text-base text-slate-300">
                      Users Referred: <span className="font-bold text-white">{referralData[0].users}</span>
                    </p>
                    <p className="text-sm md:text-base text-slate-300">
                      Income Earned:{" "}
                      <span className="text-green-400 font-semibold">
                        ${referralData[0].income.toLocaleString()}
                      </span>
                    </p>
                  </div>
                  <div className="sm:w-1/2 w-full">
                    <div className="w-24 h-24 md:w-32 md:h-32 mx-auto bg-gradient-to-br from-purple-500 to-secondary rounded-xl flex items-center justify-center">
                      <img src={i1} alt="Level 1 Referral" className="w-[4rem] md:w-20" />
                    </div>
                  </div>
                </div>
              )}
            </>

        }

        {/* Down arrow */}
        <BsArrowDown className="text-3xl md:text-4xl text-gray-400" />

        {/* Level 2 */}
        {
          isLoading ?
            <><SkeletonLoader variant="card3" rows={1} /></>
            :
            <>
              {referralData[1] && (
                <div className="bg-gradient-to-br from-blue-400/10 to-blue-700/10 border border-green-500/30 border-gradient px-6 py-4 rounded-lg w-full max-w-md shadow-lg flex sm:flex-row flex-col-reverse sm:text-left text-center gap-5 transition-transform hover:scale-105">
                  <div className="sm:w-1/2 w-full">
                    <h3
                      className="text-xl md:text-2xl font-semibold text-blue-300 mb-1"
                      role="heading"
                      aria-level="3"
                    >
                      Level 2
                    </h3>
                    <p className="text-sm md:text-base text-slate-300">
                      {referralData[1].percentage}% Commission
                    </p>
                    <p className="text-sm md:text-base text-slate-300">
                      Users Referred: <span className="font-bold text-white">{referralData[1].users}</span>
                    </p>
                    <p className="text-sm md:text-base text-slate-300">
                      Income Earned:{" "}
                      <span className="text-green-400 font-semibold">
                        ${referralData[1].income.toLocaleString()}
                      </span>
                    </p>
                  </div>
                  <div className="sm:w-1/2 w-full">
                    <div className="w-24 h-24 md:w-32 md:h-32 mx-auto bg-gradient-to-br from-secondary to-primary rounded-xl flex items-center justify-center">
                      <img src={i2} alt="Level 2 Referral" className="w-[4rem] md:w-20" />
                    </div>
                  </div>
                </div>
              )}
            </>
        }

        {/* Down arrow */}
        <BsArrowDown className="text-3xl md:text-4xl text-gray-400" />

        {/* Level 3 */}
        {
          isLoading ?
            <><SkeletonLoader variant="card3" rows={1} /></>
            :
            <>
              {referralData[2] && (
                <div className="bg-gradient-to-br from-purple-400/10 to-purple-700/10 border border-green-500/30 border-gradient px-6 py-4 rounded-lg w-full max-w-md shadow-lg flex sm:flex-row flex-col-reverse sm:text-left text-center gap-5 transition-transform hover:scale-105">
                  <div className="sm:w-1/2 w-full">
                    <h3
                      className="text-xl md:text-2xl font-semibold text-purple-300 mb-1"
                      role="heading"
                      aria-level="3"
                    >
                      Level 3
                    </h3>
                    <p className="text-sm md:text-base text-slate-300">
                      {referralData[2].percentage}% Commission
                    </p>
                    <p className="text-sm md:text-base text-slate-300">
                      Users Referred: <span className="font-bold text-white">{referralData[2].users}</span>
                    </p>
                    <p className="text-sm md:text-base text-slate-300">
                      Income Earned:{" "}
                      <span className="text-green-400 font-semibold">
                        ${referralData[2].income.toLocaleString()}
                      </span>
                    </p>
                  </div>
                  <div className="sm:w-1/2 w-full">
                    <div className="w-24 h-24 md:w-32 md:h-32 mx-auto bg-gradient-to-br from-secondary to-purple-500 rounded-xl flex items-center justify-center">
                      <img src={i3} alt="Level 3 Referral" className="w-[4rem] md:w-20" />
                    </div>
                  </div>
                </div>
              )}
            </>
        }
      </div>

      {/* Summary */}
      <div className="mt-8 border-t border-slate-600 pt-4 text-sm md:text-base flex flex-col md:flex-row justify-between gap-4 text-slate-300">
        <div>
          Total Referred Users: <span className="text-white font-medium">{totalUsers.toLocaleString()}</span>
        </div>
        <div>
          Total Referral Income:{" "}
          <span className="text-green-400 font-semibold">${totalIncome.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

export default ReferralIncome;