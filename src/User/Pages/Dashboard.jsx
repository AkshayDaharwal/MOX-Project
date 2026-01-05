import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Chart } from "react-google-charts";
import { BiSolidOffer } from "react-icons/bi";
import { BsMicrosoftTeams } from "react-icons/bs";
import {
  FaChartLine,
  FaDollarSign,
  FaUsers,
  FaBullseye,
  FaCog,
  FaPeopleArrows,
  FaWallet,
} from "react-icons/fa";
import { FaPeopleGroup } from "react-icons/fa6";
import { GiProfit, GiTakeMyMoney } from "react-icons/gi";
import { TbPigMoney } from "react-icons/tb";
import { GrAnnounce, GrMoney } from "react-icons/gr";
import { IoTodayOutline } from "react-icons/io5";
import { MdOutlineCalendarMonth, MdAutorenew } from "react-icons/md";
import { PiHandWithdrawDuotone } from "react-icons/pi";
import logoicon from "../../../src/assets/userImages/Logo/MOXicon.png";
// import banner1 from "../../assets/userImages/images/embot-banner.png";
// import banner2 from "../../assets/userImages/images/embot-banner-2.png";
// import { Swiper, SwiperSlide } from "swiper/react";
// import "swiper/css";
// import "swiper/css/navigation";
// import "swiper/css/pagination";
// import { Navigation, Pagination, Autoplay } from "swiper/modules";
import Footer from "../Components/Comman/Footer";
import Wallets from "./Wallets";
import { useNavigate } from "react-router-dom";
import { appConfig } from "../../config/appConfig";
import SkeletonLoader from "../Components/Comman/Skeletons";

const Dashboard = () => {
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  // Default dashboard data to prevent undefined access
  const defaultDashboardData = {
    userName: "Loading...",
    referralCode: "N/A",
    walletAddress: "",
    wallets: {
      myWallet: "$0.00",
      depositWallet: "$0.00",
      principleWallet: "$0.00",
      emgtWallet: "$0.00",
      referralWallet: "$0.00",
      totalInvestment: "$0.00",
      totalWalletBalance: "$0.00",
    },
    profitTracker: {
      investment: "$0.00",
      earnings: "$0.00",
      earningWithoutCap: "$0.00",
      earningsTimes: "$0.00",
    },
    teamBusiness: {
      directBusiness: "$0.00",
      totalTeamBusiness: "$0.00",
      todayTeamBusiness: "$0.00",
    },
    incomes: {
      roiIncome: "$0.00",
      levelIncome: "$0.00",
      bonusIncome: "$0.00",
    },
    transactions: {
      totalEarning: "$0.00",
      totalWithdraw: "0.00",
    },
    teamStats: {
      totalTeam: 0,
      myDirect: 0,
      indirect: 0,
    },
    tokenOverview: {
      price: 0,
    },
    referralLink: "N/A",
    userEmail: "N/A",
  };

  const {
    data: dashboardData = defaultDashboardData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["dashboardData"],
    queryFn: async () => {
      const token =
        localStorage.getItem("authToken") ||
        sessionStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authentication token found. Please log in.");
      }
      const response = await fetch(`${appConfig.baseURL}/user/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Invalid token. Please log in again.");
        }
        throw new Error("Failed to load dashboard data.");
      }
      
      const data = await response.json();
      const referralLink = `${appConfig.frontendURL}/user/signup?referral=${
        data.data.referralCode || "N/A"
      }`;
      return {
        userName: data.data.userName || "Unknown User",
        referralCode: data.data.referralCode || "N/A",
        walletAddress: data.data.walletAddress || "",
        wallets: {
          myWallet: data.data.wallets?.myWallet
            ? `${Number(
                data.data.wallets.myWallet.replace("$", "")
              ).toLocaleString()}`
            : "0.00",
          depositWallet: data.data.wallets?.depositWallet
            ? `${Number(
                data.data.wallets.depositWallet.replace("$", "")
              ).toLocaleString()}`
            : "0.00",
          referralWallet: data.data.wallets?.referralWallet
            ? `${Number(
                data.data.wallets.referralWallet.replace("$", "")
              ).toLocaleString()}`
            : "0.00",
          principleWallet: data.data.wallets?.principalWallet
            ? `${Number(
                data.data.wallets.principalWallet.replace("$", "")
              ).toLocaleString()}`
            : "0.00",
          emgtWallet: data.data.wallets?.emgtWallet
            ? `${Number(data.data.wallets.emgtWallet)}`
            : "0.00",
          totalInvestment: data.data.wallets?.totalInvestment
            ? `${Number(
                data.data.wallets.totalInvestment.replace("$", "")
              ).toLocaleString()}`
            : "0.00",
          latestLevelRank: data.data.wallets?.latestLevelRank || "N/A",
          totalWalletBalance: data.data.wallets?.totalWalletBalance
            ? `${Number(
                data.data.wallets.totalWalletBalance.replace("$", "")
              ).toLocaleString()}`
            : "$0.00",
        },
        profitTracker: {
          investment: data.data.profitTracker?.investment
            ? `${Number(
                data.data.profitTracker.investment.replace("$", "")
              ).toLocaleString()}`
            : "$0.00",
          earning: data.data.profitTracker?.earning
            ? `${Number(
                data.data.profitTracker.earning.replace("$", "")
              ).toLocaleString()}`
            : "$0.00",
          earningWithoutCap: data.data.profitTracker?.earningWithoutCap
            ? `${Number(
                data.data.profitTracker.earningWithoutCap.replace("$", "")
              ).toLocaleString()}`
            : "$0.00",
          earningTimes: data.data.profitTracker?.earningTimes || "0X",
          
        },
        teamBusiness: {
          directBusiness: data.data.teamBusiness?.directBusiness
            ? `$${Number(
                data.data.teamBusiness.directBusiness.replace("$", "")
              ).toLocaleString()}`
            : "$0.00",
          totalTeamBusiness: data.data.teamBusiness?.totalTeamBusiness
            ? `$${Number(
                data.data.teamBusiness.totalTeamBusiness.replace("$", "")
              ).toLocaleString()}`
            : "$0.00",
          todayTeamBusiness: data.data.teamBusiness?.todayTeamBusiness
            ? `$${Number(
                data.data.teamBusiness.todayTeamBusiness.replace("$", "")
              ).toLocaleString()}`
            : "$0.00",
        },
        incomes: {
          roiIncome: data.data.incomes?.roiIncome
            ? `$${Number(
                data.data.incomes.roiIncome.replace("$", "")
              ).toLocaleString()}`
            : "$0.00",
          levelIncome: data.data.incomes?.referralIncome
            ? `$${Number(
                data.data.incomes.referralIncome.replace("$", "")
              ).toLocaleString()}`
            : "$0.00",
          totalLevelRewards: data.data.incomes?.totalLevelRewards
            ? `$${Number(
                data.data.incomes.totalLevelRewards.replace("$", "")
              ).toLocaleString()}`
            : "$0.00",
          dailyIncome: data.data.incomes?.dailyIncome
            ? `$${Number(
                data.data.incomes.dailyIncome.replace("$", "")
              ).toLocaleString()}`
            : "$0.00",
          monthlyIncome: data.data.incomes?.monthlyIncome
            ? `$${Number(
                data.data.incomes.monthlyIncome.replace("$", "")
              ).toLocaleString()}`
            : "$0.00",
        },
        transactions: {
          totalEarning: data.data.transactions?.totalEarning
            ? `$${Number(
                data.data.transactions.totalEarning.replace("$", "")
              ).toLocaleString()}`
            : "$0.00",
          totalWithdraw: data.data.transactions?.totalWithdraw
            ? `${Number(
                data.data.transactions.totalWithdraw.replace("$", "")
              ).toLocaleString()}`
            : "$0.00",
        },
        teamStats: {
          totalTeam: data.data.teamStats?.totalTeam || 0,
          myDirect: data.data.teamStats?.myDirect || 0,
          indirect: data.data.teamStats?.indirect || 0,
        },
        tokenOverview: {
          price: data.data.tokenOverview?.price || "N/A",
        },
        referralLink,
        userEmail: data.data.userEmail || "N/A",
      };
    },
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
    onError: (err) => {
      if (err.message.includes("Invalid token")) {
        navigate("/user/login");
      }
    },
  });

  console.log("Dashboard Data:", dashboardData);

  const handleCopy = () => {
    navigator.clipboard.writeText(dashboardData.referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const data = useMemo(
    () => [
      ["Type", "Value"],
      [
        "Investment",
        parseFloat(
          dashboardData.profitTracker?.investment?.replace("$", "") || "0"
        ) || 0,
      ],
      [
        "Earning",
        parseFloat(
          dashboardData.profitTracker?.earning?.replace("$", "") || "0"
        ) || 0,
      ],
    ],
    [dashboardData.profitTracker]
  );

  const options = {
    pieHole: 0.75,
    pieStartAngle: 270,
    slices: {
      0: { color: "#4ade80" },
      1: { color: "#3cadf3" },
    },
    tooltip: { trigger: "selection" },
    legend: "none",
    backgroundColor: "transparent",
    chartArea: { width: "100%", height: "100%" },
  };


  // Parse earningTimes for button condition
  const earningTimes = dashboardData.profitTracker.earningTimes;
  const parsedEarningTimes = typeof earningTimes === "string"
    ? parseFloat(earningTimes.replace("X", ""))
    : parseFloat(earningTimes);
  const shouldShowButton = earningTimes === "2.00X" ||
    (!isNaN(parsedEarningTimes) && parsedEarningTimes >= 1.98 && parsedEarningTimes <= 2.00);


  if (isLoading) {
    return (
      <div className="text-white  text-center">
        <SkeletonLoader variant="dashboard" rows={6} />
      </div>
    );
  }

  return (
    <div className="text-white p-0 overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl uppercase   text-[#e8eaec]  ]
 font-bold">
            Welcome, {dashboardData.userName}! Have a nice day!
          </h1>
        </div>
        <div className="flex items-center gap-4">
          {shouldShowButton && (
            <button
              className="flex animate-pulse items-center gap-2 px-4 py-2 bg-green-500 rounded-lg transition-colors pulse-animation"
              onClick={() => navigate("/user/deposits")}
              title="Retopup & Reinvest"
              aria-label="Retopup and Reinvest"
            >
              <MdAutorenew className="w-5 h-5" />
              <span className="text-sm font-semibold">Retopup / Reinvest</span>
            </button>
          )}
          {/* <button
            className="p-2 bg-secondary rounded-lg hover:bg-sky-700 transition-colors"
            onClick={() => navigate("/user/settings")}
            title="Settings"
            aria-label="Settings"
          >
            <FaCog className="w-5 h-5" />
          </button> */}
          <div className="flex items-center gap-2  px-4 py-2 rounded-lg">
            <div className="w-8 h-8 bg-[#b5861f]  rounded-full flex items-center justify-center">
              <span className="text-sm font-bold">
                {dashboardData.userName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </span>
            </div>
            <span className="text-sm">
              {dashboardData.userName} ({dashboardData.referralCode})
            </span>
          </div>
        </div>
      </div>

      {/* Row 1: Wallets */}
      <div className=" gap-4">
        <div className="grid grid-cols-4  text-[#b5861f] sm:grid-cols-4 lg:grid-cols-4 gap-4 rounded-xl lg:col-span-2">
          {[
            {
              title: "Total Investment",
              value: dashboardData.wallets?.totalInvestment || "$0.00",
              color: "bg-[radial-gradient(circle_at_center,#000000_45%,#1A1A1A_65%,#ffffff_100%)]",
              icon: <FaDollarSign />,
            },

            {
              title: "Available Wallet Balance",
              value: dashboardData.wallets?.totalWalletBalance || "$0.00",
              color: "bg-[radial-gradient(circle_at_center,#000000_45%,#1A1A1A_65%,#ffffff_100%)]",
              icon: <FaDollarSign />,
            },
            {
              title: "Total ROI",
              value: dashboardData.incomes?.roiIncome || "$0.00",
              color: "bg-[radial-gradient(circle_at_center,#000000_45%,#1A1A1A_65%,#ffffff_100%)]",
              icon: <FaChartLine />,
            },
            {
              title: "Total Level Rewards",
              value: dashboardData.incomes?.totalLevelRewards || "$0.00",
              color: "bg-[radial-gradient(circle_at_center,#000000_45%,#1A1A1A_65%,#ffffff_100%)]",
              icon: <FaBullseye />,
            },
            {
              title: "Total Referral Rewards",
              value: dashboardData.incomes?.levelIncome || "$0.00",
              color: "bg-[radial-gradient(circle_at_center,#000000_45%,#1A1A1A_65%,#ffffff_100%)]",
              icon: <FaDollarSign />,
            },
            {
              title: "Total Earnings",
              value: dashboardData.profitTracker?.earning || "$0.00",
              color: "bg-[radial-gradient(circle_at_center,#000000_45%,#1A1A1A_65%,#ffffff_100%)]",
              icon: <FaDollarSign />,
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className=" bg-gradient-to-b from-[#2A2A2A] via-[#000000] to-[#000000] backdrop-blur-xl rounded-[28px] border-gradient p-4 shadow-md shadow-slate-800/50   "
            >
              <div className="flex items-center gap-2 mb-2 ">
                <div
                  className={`w-8 h-8 aspect-[1/1]  ${item.color} rounded-full flex items-center justify-center`}
                >
                  {item.icon}
                </div>
                <span className="text-sm text-slate-300">{item.title}</span>
              </div>
              <div className="text-lg font-bold">{item.value}</div>
            </div>
          ))}

          {[
            {
              name: "Deposit Wallet",
              balance: dashboardData.wallets?.depositWallet || "0.00",
            },
            {
              name: "My Wallet",
              balance: dashboardData.wallets?.myWallet || "0.00",
            }
            ,
            {
              name: "Principle Wallet",
              balance: dashboardData.wallets?.principleWallet || "0.00",
            },
            {
              name: "Emgt Wallet",
              balance: dashboardData.wallets?.emgtWallet || "0.00",
            },
            {
              name: "Referral Wallet",
              balance: dashboardData.wallets?.referralWallet || "0.00",
            },
            {
              name: "Total Withdraw",
              balance: dashboardData.transactions?.totalWithdraw || "0.00",
            },
          ].map((wallet, idx) => {
            return (
              <div
                key={idx}
                className="rounded-xl  border border-gradient  shadow-lg shadow-slate-800/40  bg-gradient-to-b from-[#2A2A2A] via-[#000000] to-[#000000] backdrop-blur-xl p-3 text-white space-y-2"
              >
                <div className="flex  flex-col-reverse gap-3 justify-between">
                  <h2 className="text-sm font-semibold flex items-center gap-2">
                    <FaWallet className="text-[#C9A24F]" />
                    {wallet.name}
                  </h2>
                  <span className="text-xs text-slate-400">
                    Wallet {idx + 1}
                  </span>
                </div>

                {wallet.name === "Emgt Wallet" ? (
                  <div className="text-sm break-words font-semibold  text-[#b5861f]">
                    {wallet.balance.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}

                    <span className="text-xs text-gray-400 ml-1">
                      ($
                      {(
                        Number(wallet.balance || 0) *
                        Number(dashboardData.tokenOverview.price || 0)
                      ).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                      )
                    </span>
                  </div>
                ) : (
                  <div className="text-sm break-words font-semibold text-[#b5861f]">
                    ${" "}
                    {wallet.balance.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {/* <Wallets /> */}
        </div>

        {/* <div className="lg:col-span-1 ">
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            pagination={{ clickable: true }}
            autoplay={{ delay: 3000, disableOnInteraction: true }}
            loop={true}
            className="h-full  "
          >
          
            <SwiperSlide>
              <img
                src={banner1}
                className="w-full h-full object-contain rounded-md"
                alt="Event Slide 1"
              />
            </SwiperSlide>
            <SwiperSlide>
              <img
                src={banner2}
                className="w-full h-full object-contain rounded-md"
                alt="Event Slide 2"
              />
            </SwiperSlide>
          </Swiper>
        </div> */}
      </div>

      {/* Row 2: Referral + Incomes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="bg-gradient-to-b from-[#2A2A2A] via-[#000000] to-[#000000] flex  flex-col justify-between backdrop-blur-xl border-gradient p-6 border border-slate-700 shadow-md shadow-slate-800/50">
          <div className="mb-5">
            <h3 className="text-lg font-semibold text-[#e9a002] mb-2">
              TOTAL INCOMES
            </h3>
            <p className="text-sm leading-tight text-gray-300">
              Track your overall earnings in one place. Get a clear view of your
              ROI, Level Income, and Referral Income instantly.
            </p>
          </div>
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="w-44 h-44 bg-gradient-to-r from-[#b5861f] to-[#b5861f]  rounded-full flex items-center justify-center">
                <GiTakeMyMoney className="h-20 w-20" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold">%</span>
              </div>
            </div>
          </div>
          <div className="space-y-2 text-sm font-semibold text-[#b5861f]">
            {[
              {
                label: "ROI Income",
                value: dashboardData.incomes?.roiIncome || "$0.00",
              },
              {
                label: "Level Income",
                value: dashboardData.incomes?.totalLevelRewards || "$0.00",
              },
              {
                label: "Referral Income",
                value: dashboardData.incomes?.levelIncome || "$0.00",
              },
            ].map((item, idx) => (
              <div key={idx} className="flex justify-between">
                <span className="text-slate-300">{item.label}</span>
                <span className="font-bold">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-5">
          <div className="bg-gradient-to-b from-[#2A2A2A] via-[#000000] to-[#000000] backdrop-blur-xl border-gradient p-6 border border-slate-700 shadow-md shadow-slate-800/50">
            <div
              className={`w-8 h-8 bg-[#b5861f] mb-3 rounded-full flex items-center justify-center`}
            >
              <FaUsers />
            </div>
            <h3 className="text-lg font-semibold text-[#e9a002]  mb-4">
              REFERRAL LINK
            </h3>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 bg-slate-700 rounded-lg p-3">
              <input
                type="text"
                value={dashboardData.referralLink}
                readOnly
                className="flex-1 bg-transparent text-sky-300 text-sm outline-none w-full sm:w-auto"
              />
              <button
                onClick={handleCopy}
                className="bg-gradient-to-r from-[#FFD978] via-[#F6C453] to-[#D9A441] text-black mt-3 sm:mt-0 hover:opacity-80 px-4 py-1 rounded text-sm transition-colors"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-b from-[#2A2A2A] via-[#000000] to-[#000000] backdrop-blur-xl border-gradient p-6 border border-slate-700 shadow-md shadow-slate-800/50">
            <h3 className="text-lg font-semibold text-[#e9a002] mb-4">
              TEAM BUSINESS OVERVIEW
            </h3>
            <div className="space-y-4 ">
              {[
                {
                  
                  text: "Direct Business",
                  value: dashboardData.teamBusiness?.directBusiness || "$0.00",
                },
                {
                  text: "Total Team Business",
                  value:
                    dashboardData.teamBusiness?.totalTeamBusiness || "$0.00",
                },
                {
                  text: "Today Team Business",
                  value:
                    dashboardData.teamBusiness?.todayTeamBusiness || "$0.00",
                },
              ].map((item, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-[radial-gradient(circle_at_center,#000000_45%,#1A1A1A_65%,#ffffff_100%)] rounded-full flex items-center justify-center">
                      <FaUsers className="w-3 h-3" />
                    </div>
                    <span className="text-sm">{item.text}</span>
                  </div>
                  <span className="font-semibold text-sm text-[#b5861f]">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-b from-[#2A2A2A] via-[#000000] to-[#000000] backdrop-blur-xl border-gradient p-6 border border-slate-700 shadow-md shadow-slate-800/50">
          <h3 className="text-lg font-semibold text-[#e9a002] mb-4">
            PROFIT TRACKER
          </h3>
          <div className="space-y-2 text-sm">
            {[
              {
                label: "Investment",
                value: dashboardData.profitTracker?.investment || "$0.00",
              },
              {
                label: "Total Earnings",
                value: dashboardData.profitTracker?.earning || "$0.00",
              },
              {
                label: "ROI + Level",
                value: dashboardData.profitTracker?.earningWithoutCap || "$0.00",
              },
              {
                label: "Earnings Times",
                value: dashboardData.profitTracker?.earningTimes || "$0.00",
              },
            ].map((item, idx) => (
              <div key={idx} className="flex justify-between">
                <span className="text-slate-300">{item.label}</span>
                <span className="font-semibold text-[#b5861f]">{item.value}</span>
              </div>
            ))}
          </div>
          <div className="flex mt-10 justify-center mb-4">
            <div className="relative w-44 h-44 rounded-full">
              <Chart
                chartType="PieChart"
                data={data}
                options={options}
                width="176px"
                height="176px"
                loader={<div className="text-white">Loading chart...</div>}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 bg-gradient-to-r from-[#b5861f] to-[#b5861f]  rounded-full flex items-center justify-center">
                  <GiProfit className="text-white w-10 h-10" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Team + Investment */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6 items-stretch ">
        <div className="flex-1 bg-gradient-to-b from-[#2A2A2A] via-[#000000] to-[#000000] backdrop-blur-xl border-gradient p-6 border border-slate-700 shadow-md shadow-slate-800/50 flex flex-col justify-center text-center h-full">
          <div
            className={`w-full mb-4 h-14 mx-auto bg-gradient-to-r from-[#FFD978] via-[#F6C453] to-[#D9A441] rounded-md flex items-center justify-center`}
          >
            <TbPigMoney className="text-2xl" />
          </div>
          <h3 className="text-lg font-semibold text-[#e9a002] mb-4">
            INVESTMENT OVERVIEW
          </h3>
          <p className="text-sm text-slate-400">Total Investment</p>
          <p className="text-2xl font-semibold text-[#b5861f]">
            {dashboardData.wallets?.totalInvestment || "$0.00"}
          </p>
        </div>

        <div className=" flex-1 bg-gradient-to-b from-[#2A2A2A] via-[#000000] to-[#000000] flex flex-col justify-center backdrop-blur-xl border-gradient p-6 border border-slate-700 shadow-md shadow-slate-800/50">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="space-y-4">
              <div
                className={`w-full h-14 mx-auto  bg-gradient-to-r from-[#FFD978] via-[#F6C453] to-[#D9A441] rounded-md flex items-center justify-center`}
              >
                <MdOutlineCalendarMonth className="text-2xl" />
              </div>
              <p className="text-sm text-slate-400">Monthly ROI Income</p>
              <p className="text-xl font-semibold text-[#b5861f]">
                {dashboardData.incomes?.monthlyIncome || "$0.00"}
              </p>
            </div>
            <div className="space-y-4">
              <div
                className={`w-full h-14 mx-auto bg-gradient-to-r from-[#FFD978] via-[#F6C453] to-[#D9A441] rounded-md flex items-center justify-center`}
              >
                <IoTodayOutline className="text-2xl" />
              </div>
              <p className="text-sm text-slate-400">Daily ROI Income</p>
              <p className="text-xl font-semibold text-[#b5861f]">
                {dashboardData.incomes?.dailyIncome || "$0.00"}
              </p>
            </div>
          </div>
        </div>

        {/* <div className=" md:col-span-1 ">
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            pagination={{ clickable: true }}
            autoplay={{ delay: 3000, disableOnInteraction: true }}
            loop={true}
            className="h-full  "
          >
            <SwiperSlide>
              <img
                src={banner1}
                className="w-full h-full object-contain rounded-md"
                alt="Event Slide 1"
              />
            </SwiperSlide>
            <SwiperSlide>
              <img
                src={banner2}
                className="w-full h-full object-contain rounded-md"
                alt="Event Slide 2"
              />
            </SwiperSlide>
          </Swiper>
        </div> */}

        {/* <div className="md:col-span-2 bg-[#12212154] backdrop-blur-xl border-gradient p-6 border border-slate-700 shadow-md shadow-slate-800/50 text-center">
          <h3 className="text-lg font-semibold text-primary mb-4">TRANSACTIONS</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className={`w-14 mb-4 h-14 mx-auto bg-gradient-to-br from-cyan-500 to-secondary rounded-full flex items-center justify-center`}>
                <GrMoney className="text-2xl" />
              </div>
              <p className="text-slate-400 text-sm">Total Earning</p>
              <p className="text-3xl font-bold">{dashboardData.transactions?.totalEarning || "$0.00"}</p>
            </div>
            <div>
              <div className={`w-14 mb-4 h-14 mx-auto bg-gradient-to-br from-cyan-500 to-secondary rounded-full flex items-center justify-center`}>
                <PiHandWithdrawDuotone className="text-2xl" />
              </div>
              <p className="text-slate-400 text-sm">Total Withdraw</p>
              <p className="text-3xl font-bold">{dashboardData.transactions?.totalWithdraw || "$0.00"}</p>
            </div>
          </div>
        </div> */}
      </div>

      {/* Row 4: Team Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-6 text-center">
        {[
          {
            title: "Total Team",
            value: dashboardData.teamStats?.totalTeam || 0,
            icon: <FaPeopleGroup className="text-2xl" />,
          },
          {
            title: "My Direct",
            value: dashboardData.teamStats?.myDirect || 0,
            icon: <BsMicrosoftTeams className="text-2xl" />,
          },
          {
            title: "Indirect",
            value: dashboardData.teamStats?.indirect || 0,
            icon: <FaPeopleArrows className="text-2xl" />,
          },
        ].map((label, idx) => (
          <div
            key={idx}
            className="bg-gradient-to-b from-[#2A2A2A] via-[#000000] to-[#000000]backdrop-blur-xl border-gradient p-6 border border-slate-700 shadow-md shadow-slate-800/50"
          >
            <div
              className={`w-14 mb-4 h-14 mx-auto bg-gradient-to-r from-[#b5861f] to-[#b5861f] rounded-xl flex items-center justify-center`}
            >
              {label.icon}
            </div>
            <div className="text-3xl font-bold mb-2">{label.value}</div>
            <p className="text-sm text-slate-400">{label.title}</p>
          </div>
        ))}

        <div className="bg-gradient-to-b from-[#2A2A2A] via-[#000000] to-[#000000] lg:col-span-2 backdrop-blur-xl border-gradient p-6 border border-slate-700 shadow-md shadow-slate-800/50 text-center">
          <h3 className="text-lg font-semibold text-[#e9a002] mb-4">
            EASY MONEY TOKEN OVERVIEW
          </h3>
          <div className="flex items-center justify-center mx-auto mb-3">
            <img src={logoicon} className="w-10" alt="Token Logo" />
          </div>
          <p className="text-lg font-bold mb-1 [text-shadow:0_0_5px_rgb(181,134,31),0_0_10px_rgb(181,134,31)]">Easy Money Token Price</p>
          <p className="text-white text-sm">
            1 EMGT = USDT {dashboardData.tokenOverview?.price || "0"}
          </p>
        </div>
      </div>

      {/* Row 5: Announcements + Level Achievement */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
        <div className="relative lg:col-span-2 bg-gradient-to-b from-[#2A2A2A] via-[#000000] to-[#000000] backdrop-blur-xl border-gradient p-6 border border-slate-700 shadow-md shadow-slate-800/50">
          <div className="absolute right-0 top-0">
            <BiSolidOffer className="text-[6rem] text-[#b5861f]" />
          </div>
          <div className="flex items-center gap-4">
            <div
              className={`w-14 mb-4 h-14 glow-text bg-gradient-to-r from-[#b5861f] to-[#b5861f] rounded-full flex items-center justify-center`}
            > 
              <GrAnnounce className="text-2xl" />
            </div>
            <h3 className="text-lg font-semibold glow-text text-[#e9a002] mb-4">
              LATEST ANNOUNCEMENT
            </h3>
          </div>
          <h4 className="text-xl glow-text font-bold mb-4">
            Empowering Decentralized Income with Easy Money
          </h4>
          <p className="text-slate-300 glow-text text-sm leading-relaxed">
            Easy Money Project is a next-gen blockchain-based MLM (Multi-Level
            Marketing) platform designed to empower individuals with a
            decentralized, secure, and transparent income model.
          </p>
        </div>
        <div className="bg-gradient-to-b from-[#2A2A2A] via-[#000000] to-[#000000] backdrop-blur-xl border-gradient p-6 border border-slate-700 shadow-md shadow-slate-800/50 text-center">
          <h3 className="text-lg font-semibold text-[#e9a002] mb-4">
            LEVEL ACHIEVEMENT
          </h3>
          <div className="text-yellow-500 font-bold mb-2">
            {dashboardData.wallets.latestLevelRank || "N/A"}
          </div>
          <button
            className="bg-gradient-to-r from-[#FFD978] via-[#F6C453] to-[#D9A441] hover:opacity-80 text-black py-2 px-4 rounded text-sm"
            onClick={() => navigate("/user/lavel-income-report")}
          >
            View Report
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Dashboard;
