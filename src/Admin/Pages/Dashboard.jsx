import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "../Service/adminApi";
import { Link } from "react-router-dom";
import {
  FaUserCheck,
  FaUserClock,
  FaUsers,
  FaGift,
  FaHandHoldingUsd,
  FaHourglassHalf,
  FaChartLine,
  FaDollarSign,
  FaArrowLeft,
  FaArrowRight,
} from "react-icons/fa";

const glass = "bg-white bg-opacity-40 backdrop-blur-md border border-white border-opacity-80 shadow-xl";

const StatCard = ({ title, subtitle, value, icon: Icon, gradient, link }) => (
  <>

    <Link to={link} >
      
    <div

      className={`m-2 p-4    rounded-2xl flex items-center transition-transform hover:scale-105 ${glass} justify-start shadow-[inset_-7px_-6px_16.8px_-7px_#fff,inset_6px_10px_19.6px_-11px_#00000012,-12px_-11px_21px_4px_#fff,12px_11px_21.9px_#00000040]`}
      style={{ minWidth: "220px" }}
    >
       
      <div
        className="rounded-full p-4 mr-4 flex items-center justify-center"
        style={{ background: gradient }}
      >
        <Icon className="text-white text-3xl" />
      </div>
      <div className="flex flex-col text-align-start">
        <div className="text-gray-800 font-semibold font-24px">{title}</div>
        {subtitle && (
          <div className="text-gray-600 text-xs font-medium">{subtitle}</div>
        )}
        <div className="text-indigo-600 font-bold font-20px">{value}</div>
      </div>
      


    </div>
    </Link>
  </>
);

const InfoRow = ({ label, value }) => (
  <div className="flex justify-between items-center border-b pb-2 z-1">
    <span className="font-medium">{label}</span>
    <span className="text-gray-600">{value || "N/A"}</span>
  </div>
);

const Dashboard = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentTransactionPage, setCurrentTransactionPage] = useState(1);
  const [currentUserPage, setCurrentUserPage] = useState(1);
  const rowsPerPage = 5;

  const { data: dashboardData = {}, isLoading, isError, error } = useQuery({
    queryKey: ["dashboardData"],
    queryFn: async () => {
      const res = await adminApi.getDashboardData();
      return res?.data || {};
    },
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });

  // Stats for StatCard

  const stats = useMemo(
    () => [
      {
        title: "Total User",
        value: dashboardData.totalUsers ?? 0,
        icon: FaUsers,
        gradient: "linear-gradient(135deg,#6190e8,#a7bfe8)",
        link: "/admin/user-management",
      },
      {
        title: "Inactive Users",
        value: dashboardData.totalInactiveUsers ?? 0,
        icon: FaUserCheck,
        gradient: "linear-gradient(135deg,#43cea2,#185a9d)",
        link: "/admin/user-management ",
      },
      {
        title: "Total Direct Admin ",
        value: dashboardData.totalAdminDirect ?? 0,
        icon: FaUserCheck,
        gradient: "linear-gradient(135deg,#43cea2,#185a9d)",
        link: "/admin/user-management ",
      },
      {
        title: "Total Indirect Admin ",
        value: dashboardData.totalAdminIndirect ?? 0,
        icon: FaUserClock,
        gradient: "linear-gradient(135deg,#af67e9,#f68d7f)",
        link: "/admin/user-management ",
      },
      {
        title: "Plan Stake",
        value: dashboardData.totalPlanStakeNumber
          ? `${Number(dashboardData.totalPlanStakeNumber).toLocaleString()}`
          : "0",
        icon: FaChartLine,
        gradient: "linear-gradient(135deg,#fc5c7d,#6a82fb)",
        link: "/admin/Investment-Report/user-stake-plans-report",
      },
      {
        title: "User Investment",
        value: dashboardData.totalUserInvestment ?? 0,
        icon: FaUserClock,
        gradient: "linear-gradient(135deg,#af67e9,#f68d7f)",
        link: "/admin/Investment-Report/user-stake-plans-report",
      },
      {
        title: "Total Deposit Amount",
        value: dashboardData.totalDepositAmount
          ? `$${Number(dashboardData.totalDepositAmount).toLocaleString()}`
          : "$0",
        icon: FaDollarSign,
        gradient: "linear-gradient(135deg,#f7971e,#ffd200)",
        link: "/admin/user-deposit/deposit-report",
      },
      {
        title: "Total User Balance",
        value: dashboardData.totalUserBalance
          ? `$${Number(dashboardData.totalUserBalance).toLocaleString()}`
          : "$0",
        icon: FaHandHoldingUsd,
        gradient: "linear-gradient(135deg,#dd5e89,#f7bb97)",
        link: "/admin/user-management",
      },
      {
        title: "Total DepositWallet Balance",
        value: dashboardData.totalUserDepositWalletBalance
          ? `$${Number(dashboardData.totalUserDepositWalletBalance).toLocaleString()}`
          : "$0",
        icon: FaHandHoldingUsd,
        gradient: "linear-gradient(135deg,#dd5e89,#f7bb97)",
        link: "/admin/user-management?wallet=deposit",
      },
      {
        title: "Total MyWallet Balance",
        subtitle: "( ROI + Level )",
        value: dashboardData.totalUserMyWalletBalance
          ? `$${Number(dashboardData.totalUserMyWalletBalance).toLocaleString()}`
          : "$0",
        icon: FaHandHoldingUsd,
        gradient: "linear-gradient(135deg,#dd5e89,#f7bb97)",
        link: "/admin/user-management?wallet=mywallet",
      },
      {
        title: "Total PrincipalWallet Balance",
        value: dashboardData.totalUserPrincipalWalletBalance
          ? `$${Number(dashboardData.totalUserPrincipalWalletBalance).toLocaleString()}`
          : "$0",
        icon: FaHandHoldingUsd,
        gradient: "linear-gradient(135deg,#dd5e89,#f7bb97)",
        link: "/admin/user-management?wallet=principal",
      },
      {
        title: "Total ReferralWallet Balance",
        value: dashboardData.totalUserReferralWalletBalance
          ? `$${Number(dashboardData.totalUserReferralWalletBalance).toLocaleString()}`
          : "$0",
        icon: FaHandHoldingUsd,
        gradient: "linear-gradient(135deg,#dd5e89,#f7bb97)",
        link: "/admin/user-management?wallet=principal",
      },
      {
        title: "Total EMGTWallet Balance",
        value: dashboardData.totalUserEMGTWalletBalance
          ? `EMGT${Number(dashboardData.totalUserEMGTWalletBalance).toLocaleString()}`
          : "EMGT 0",
        icon: FaHandHoldingUsd,
        gradient: "linear-gradient(135deg,#dd5e89,#f7bb97)",
        link: "/admin/user-management?wallet=emgt",
      },
      {
        title: "Total ROI Distribute",
        value: dashboardData.totalRoiDistributed
          ? `$${Number(dashboardData.totalRoiDistributed).toLocaleString()}`
          : "$0",
        icon: FaDollarSign,
        gradient: "linear-gradient(135deg,#21d397,#7d5fff)",
        link: "/admin/income-management/daily-roi-income",
      },
      {
        title: "Total Level Income Distribute",
        value: dashboardData.totalLevelRewardDistributed
          ? `$${Number(dashboardData.totalLevelRewardDistributed).toLocaleString()}`
          : "$0",
        icon: FaDollarSign,
        gradient: "linear-gradient(135deg,#21d397,#7d5fff)",
        link: "/admin/income-management/level-income-rewards",
      },
      {
        title: "Total Referral Reward Distributed",
        value: dashboardData.totalReferralRewardDistributed
          ? `$${Number(dashboardData.totalReferralRewardDistributed).toLocaleString()}`
          : "$0",
        icon: FaDollarSign,
        gradient: "linear-gradient(135deg,#21d397,#7d5fff)",
        link: "/admin/income-management/referrel-income",
      },
      {
        title: "Withdraw Done",
        value: dashboardData.totalWithdrawDone ?? 0,
        icon: FaHourglassHalf,
        gradient: "linear-gradient(135deg,#f7971e,#ffd200)",
        link: "/admin/payout-management/withdrawals",
      },
      {
        title: "Withdraw Pending",
        value: dashboardData.totalWithdrawAmount ?? 0,
        icon: FaHourglassHalf,
        gradient: "linear-gradient(135deg,#f7971e,#ffd200)",
        link: "/admin/payout-management/withdrawals",
      },
      {
        title: "Total Swaped Amount",
        value: dashboardData.totalSwapedAmount
          ? `$${Number(dashboardData.totalSwapedAmount).toLocaleString()}`
          : "$0",
        icon: FaDollarSign,
        gradient: "linear-gradient(135deg,#f7971e,#ffd200)",
        link: "/admin/payout-management/withdrawals",
      },
      {
        title: "Total Swap Charge",
        value: dashboardData.totalSwapChargeCollected
          ? `$${Number(dashboardData.totalSwapChargeCollected).toLocaleString()}`
          : "$0",
        icon: FaDollarSign,
        gradient: "linear-gradient(135deg,#f7971e,#ffd200)",
        link: "/admin/payout-management/withdrawals",
      },
      {
        title: "Total Transaction Charge",
        value: dashboardData.totalTransactionChargeCollected
          ? `$${Number(dashboardData.totalTransactionChargeCollected).toLocaleString()}`
          : "$0",
        icon: FaDollarSign,
        gradient: "linear-gradient(135deg,#21d397,#7d5fff)",
        link: "/admin/income-management?type=transaction-charge",
      },
    ],
    [dashboardData]
  );


  // Latest Transactions Pagination
  const transactions = dashboardData.latestTransactions || [];
  const emgtTokenPrice = dashboardData.emgtTokenPrice ? dashboardData.emgtTokenPrice.price : "N/A";
  const totalTransactionPages = Math.ceil(transactions.length / rowsPerPage);
  const transactionStartIndex = (currentTransactionPage - 1) * rowsPerPage;
  const currentTransactions = transactions.slice(transactionStartIndex, transactionStartIndex + rowsPerPage);

  const handleTransactionPrevious = () => {
    if (currentTransactionPage > 1) setCurrentTransactionPage((prev) => prev - 1);
  };

  const handleTransactionNext = () => {
    if (currentTransactionPage < totalTransactionPages) setCurrentTransactionPage((prev) => prev + 1);
  };

  // Latest Users Pagination
  const users = dashboardData.latestUsers || [];
  const totalUserPages = Math.ceil(users.length / rowsPerPage);
  const userStartIndex = (currentUserPage - 1) * rowsPerPage;
  const currentUsers = users.slice(userStartIndex, userStartIndex + rowsPerPage);

  const handleUserPrevious = () => {
    if (currentUserPage > 1) setCurrentUserPage((prev) => prev - 1);
  };

  const handleUserNext = () => {
    if (currentUserPage < totalUserPages) setCurrentUserPage((prev) => prev + 1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex bg-gradient-to-br from-white-100 via-blue-100 to-white z-1">
        <main className="flex-1 min-h-screen p-4 md:p-6 lg:ml-5 overflow-x-hidden overflow-y-auto">
          <div className="max-w-screen-2xl mx-auto">
            <header className="mb-8">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-[#103944] to-[#234767] bg-clip-text text-transparent">
                Dashboard
              </h1>
            </header>
            <p className="text-gray-600">Loading dashboard data...</p>
          </div>
        </main>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex bg-gradient-to-br from-white-100 via-blue-100 to-white z-1">
        <main className="flex-1 min-h-screen p-4 md:p-6 lg:ml-5 overflow-x-hidden overflow-y-auto">
          <div className="max-w-screen-2xl mx-auto">
            <header className="mb-8">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-[#103944] to-[#234767] bg-clip-text text-transparent">
                Dashboard
              </h1>
            </header>
            <p className="text-red-600">Error: {error?.message || "Failed to load dashboard data."}</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen  w-50  flex bg-gradient-to-br from-white-100 via-blue-100 to-white z-1">
      <main className="flex-1 min-h-screen     overflow-x-hidden overflow-y-auto">
        <div className="max-w-screen-2xl mx-auto">
          <header className="mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#103944] to-[#234767] bg-clip-text text-transparent">
              Dashboard
            </h1>
          </header>

          <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {stats.map((item, idx) => (
              <StatCard key={idx} {...item} />
            ))}
          </section>

          <section className="mt-10 flex flex-col lg:flex-row gap-6">
            {/* Latest Transactions */}
            <div
              className={`${glass} lg:w-3/5 w-full p-6 rounded-xl shadow-[inset_-7px_-6px_16.8px_-7px_#fff,inset_6px_10px_19.6px_-11px_#00000012,-12px_-11px_21px_4px_#fff,12px_11px_21.9px_#00000040]`}
            >
              <h3 className="text-2xl font-semibold mb-4 text-[#103944]">Latest Transactions</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-left">
                  <thead>
                    <tr className="text-xs uppercase bg-[#103944] text-white">
                      <th className="px-5 py-3">User</th>
                      <th className="px-5 py-3">Amount</th>
                      <th className="px-5 py-3">Type</th>
                      <th className="px-5 py-3">Stake ID</th>
                      <th className="px-5 py-3">Package</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-700">
                    {currentTransactions.length > 0 ? (
                      currentTransactions.map((txn, idx) => (
                        <tr
                          key={txn._id || idx}
                          className={`transition hover:bg-gray-100/60 ${idx % 2 === 0 ? "bg-white/40" : "bg-gray-50/50"
                            } border-b border-gray-400`}
                        >
                          <td className="px-5 py-4 font-medium">{txn.userId?.email || "N/A"}</td>
                          <td className="px-5 py-4">{txn.amount ? `$${Number(txn.amount).toFixed(2)}` : "N/A"}</td>
                          <td className="px-5 py-4">
                            <span
                              className={`px-3 py-1 text-xs font-medium rounded-full shadow-sm ${txn.type === "deposit" ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600"
                                }`}
                            >
                              {txn.type ? txn.type.charAt(0).toUpperCase() + txn.type.slice(1) : "N/A"}
                            </span>
                          </td>
                          <td className="px-5 py-4">{txn.stakeId || "N/A"}</td>
                          <td className="px-5 py-4">{txn.packageName || "N/A"}</td>
                          <td className="px-5 py-4">
                            <span
                              className={`px-3 py-1 text-xs font-medium rounded-full shadow-sm ${txn.status === "completed" ? "bg-green-100 text-green-600" : "bg-yellow-100 text-yellow-800"
                                }`}
                            >
                              {txn.status ? txn.status.charAt(0).toUpperCase() + txn.status.slice(1) : "N/A"}
                            </span>
                          </td>
                          <td className="px-5 py-4 whitespace-nowrap">
                            {txn.createdAt ? new Date(txn.createdAt).toLocaleString() : "N/A"}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="text-center px-6 py-8 text-gray-500 text-sm">
                          No transactions found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {transactions.length > rowsPerPage && (
                <div className="flex items-center justify-end mt-4">
                  <span className="mr-4 text-[16px] font-semibold text-[#103944]" aria-live="polite">
                    Page {currentTransactionPage} of {totalTransactionPages}
                  </span>
                  <button
                    onClick={handleTransactionPrevious}
                    disabled={currentTransactionPage <= 1}
                    className={`flex items-center px-4 py-2 mr-2 font-semibold rounded ${currentTransactionPage > 1
                      ? "bg-[#103944] text-[#FFF] hover:bg-[#0e9d52]"
                      : "bg-[#103944] text-[#FFF] cursor-not-allowed"
                      }`}
                    aria-label="Previous transaction page"
                  >
                    <FaArrowLeft className="mr-1" /> Prev
                  </button>
                  <button
                    onClick={handleTransactionNext}
                    disabled={currentTransactionPage >= totalTransactionPages}
                    className={`flex items-center px-4 py-2 font-semibold rounded ${currentTransactionPage < totalTransactionPages
                      ? "bg-[#103944] text-[#FFF] hover:bg-[#0e9d52]"
                      : "bg-[#103944] text-[#FFF] cursor-not-allowed"
                      }`}
                    aria-label="Next transaction page"
                  >
                    Next <FaArrowRight className="ml-1" />
                  </button>
                </div>
              )}
            </div>

            {/* Current Token Price */}
            <div
              className={`${glass}  w-full p-6 rounded-xl shadow-[inset_-7px_-6px_16.8px_-7px_#fff,inset_6px_10px_19.6px_-11px_#00000012,-12px_-11px_21px_4px_#fff,12px_11px_21.9px_#00000040]`}
            >
              <h3 className="text-2xl font-semibold mb-4 text-[#103944]">Current Token Price</h3>
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
                <label className="text-base font-medium sm:w-1/3">Token Price</label>
                <div className="w-full sm:w-2/3 px-4 py-2 rounded-lg bg-gray-100 text-gray-800 font-semibold">
                  {emgtTokenPrice}
                </div>
              </div>
            </div>
          </section>

          <section className="flex flex-col gap-6 mt-10">
            <div
              className="bg-white/70 backdrop-blur-lg shadow-md rounded-2xl p-6 w-full shadow-[inset_-7px_-6px_16.8px_-7px_#fff,inset_6px_10px_19.6px_-11px_#00000012,-12px_-11px_21px_4px_#fff,12px_11px_21.9px_#00000040]"
            >
              <h3 className="text-2xl font-semibold text-[#103944] mb-5">Latest Sign Ups</h3>
              {currentUsers.length === 0 ? (
                <div className="text-gray-500 text-center py-6">No users found.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm text-left">
                    <thead>
                      <tr className="text-xs uppercase bg-[#103944] text-white rounded-t-xl">
                        <th className="px-5 py-3">ID</th>
                        <th className="px-5 py-3">Username</th>
                        <th className="px-5 py-3">Referral Code</th>
                        <th className="px-5 py-3">Referred By</th>
                        <th className="px-5 py-3">Email</th>
                        <th className="px-5 py-3">Joining Date</th>
                        {/* <th className="px-5 py-3">Action</th> */}
                      </tr>
                    </thead>
                    <tbody className="text-gray-700">
                      {currentUsers.map((user, idx) => (
                        <tr
                          key={user._id || idx}
                          className={`transition hover:bg-gray-100/60 ${idx % 2 === 0 ? "bg-white/40" : "bg-gray-50/50"
                            } border-b border-gray-400 rounded-lg`}
                        >
                          <td className="px-5 py-4 font-medium">{user._id || "N/A"}</td>
                          <td className="px-5 py-4">{user.username || "N/A"}</td>
                          <td className="px-5 py-4">{user.referralCode || "N/A"}</td>
                          <td className="px-5 py-4">{user.referredBy || "N/A"}</td>
                          <td className="px-5 py-4">{user.email || "N/A"}</td>
                          <td className="px-5 py-4 whitespace-nowrap">
                            {user.createdAt ? new Date(user.createdAt).toLocaleString() : "N/A"}
                          </td>
                          {/* <td className="px-5 py-4">
                            <button
                              onClick={() =>
                                setSelectedUser({
                                  ...user,
                                  name: user.username,
                                  referredBy: user.referredBy || "N/A",
                                  referralCode: user.referralCode || "N/A",
                                  image: user.image || "https://via.placeholder.com/100",
                                  joiningDate: user.createdAt ? new Date(user.createdAt).toLocaleString() : "N/A",
                                  email: user.email || "N/A",
                                  status: user.status || "Unknown",
                                })
                              }
                              className="bg-[#2298D3] hover:bg-[#0e9d52] text-white text-xs px-4 py-1.5 rounded-full shadow-md transition"
                            >
                              View Profile
                            </button>
                          </td> */}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {users.length > rowsPerPage && (
                <div className="flex items-center justify-end mt-4">
                  <span className="mr-4 text-[16px] font-semibold text-[#103944]" aria-live="polite">
                    Page {currentUserPage} of {totalUserPages}
                  </span>
                  <button
                    onClick={handleUserPrevious}
                    disabled={currentUserPage <= 1}
                    className={`flex items-center px-4 py-2 mr-2 font-semibold rounded ${currentUserPage > 1
                      ? "bg-[#103944] text-[#FFF] hover:bg-[#0e9d52]"
                      : "bg-[#103944] text-[#FFF] cursor-not-allowed"
                      }`}
                    aria-label="Previous user page"
                  >
                    <FaArrowLeft className="mr-1" /> Prev
                  </button>
                  <button
                    onClick={handleUserNext}
                    disabled={currentUserPage >= totalUserPages}
                    className={`flex items-center px-4 py-2 font-semibold rounded ${currentUserPage < totalUserPages
                      ? "bg-[#103944] text-[#FFF] hover:bg-[#0e9d52]"
                      : "bg-[#103944] text-[#FFF] cursor-not-allowed"
                      }`}
                    aria-label="Next user page"
                  >
                    Next <FaArrowRight className="ml-1" />
                  </button>
                </div>
              )}
            </div>
          </section>
        </div>

        {selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
            <div className="bg-white max-w-md w-full rounded-2xl shadow-2xl overflow-hidden relative">
              <button
                onClick={() => setSelectedUser(null)}
                className="absolute top-2 right-2 text-[#FFF] hover:text-red-600 text-2xl font-bold"
              >
                &times;
              </button>
              <div className="bg-[#2298D3] p-6 flex flex-col items-center text-white">
                <img
                  src={selectedUser.image}
                  alt={selectedUser.name}
                  className="w-24 h-24 rounded-full border-4 border-white shadow-md mb-4"
                />
                <h2 className="text-xl font-semibold">{selectedUser.name}</h2>
                <span
                  className={`mt-1 px-3 py-1 rounded-full text-sm font-medium ${selectedUser.status === "Member" ? "bg-white text-[#2298D3]" : "bg-red-100 text-red-600"
                    }`}
                >
                  {selectedUser.status}
                </span>
              </div>
              <div className="p-6 space-y-4 text-sm text-[#103944]">
                <InfoRow label="Referred By" value={selectedUser.referredBy} />
                <InfoRow label="User ID" value={selectedUser.id} />
                <InfoRow label="User Name" value={selectedUser.name} />
                <InfoRow label="Email ID" value={selectedUser.email} />
                {/* <InfoRow label="Contact No." value={selectedUser.phone} /> */}
                <InfoRow label="Joining Date" value={selectedUser.joiningDate} />
                {/* <InfoRow label="Address" value={selectedUser.address} /> */}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;