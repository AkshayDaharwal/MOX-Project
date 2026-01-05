// src/Admin/Service/adminApi.js
import axiosClient from "../../api/axiosClient";

export const adminApi = {
  // auth
  adminLogin: (data) => axiosClient.post("/admin/auth/login", data),
  forgetPassword: (data) =>
    axiosClient.post("/admin/auth/forgot-password", data),
  resetPassword: (data) => axiosClient.post("/admin/auth/reset-password", data),
  signupOtp: (data) => axiosClient.post("/admin/auth/signup", data),
  signupVarifyOtp: (data) => axiosClient.post("/admin/auth/verify-otp", data),
  resendSignUpOtp: (data) => axiosClient.post("admin/auth/resend-otp", data),

  getUserData: () => axiosClient.get("/admin/users"),
adminLoginAsUser: (data) =>
  axiosClient.post("/admin/admin/login-as-user", data),
  updateUserData: (id, data) =>
    axiosClient.put(`/admin/user/update-status/${id}`, data),
  getAdminReport: (swapReportType) =>
    axiosClient.get(`/admin/swap-report`, { params: { type: swapReportType } }),
  getTransferReport: (transferReportType) =>
    axiosClient.get(`/admin/transfer-report`, { params: { type: transferReportType } }),
  getReinvestReport: (reinvestReportType) =>
    axiosClient.get(`/admin/reinvest-report`, { params: { type: reinvestReportType } }),
  
  setTokenPrice: (data) => axiosClient.post("/admin/set-price", data),
  setDeposit: (data) => axiosClient.post("/admin/user/deposit", data),
  getDeposit: () => axiosClient.get("/admin/user/deposits"),

  updateUserWalletAddress: (data) =>axiosClient.put("/admin/user/update-wallet-address", data),
  getWalletUpdateLogs: () => axiosClient.get("/admin/wallet-update-logs"),

  getPerDayIncomeReport: () =>
    axiosClient.get("/admin/history/roi-distribution-history"),
  getReferralIncomeReport: () =>
    axiosClient.get("/admin/history/referral-history"),
  getLevelIncomeReport: (page, limit) =>
    axiosClient.get(`/admin/level-income-rewards?page=${page}&limit=${limit}`),
  getBonanzaRewardsReport: () =>
    axiosClient.get("/admin/history/bonanza-reward-history"),
  getSessionLog: () => axiosClient.get("/admin/login-log"),
  getWithdrawals: () => axiosClient.get("/admin/user/withdrawals"),
  postWithdrawalApprovel: (data) =>
    axiosClient.post(`/admin/user/withdrawal/approve`, data),
  updateProfile: (data) =>
    axiosClient.put(`/admin/update-email-password`, data),
  getDashboardData: () => axiosClient.get("/admin/dashboard"),
  getUserStakePlans: () => axiosClient.get("/admin/stake/user-staked-plans"),

  // Trade management APIs
  addTradeDeposit: (data) => axiosClient.post("/admin/trade/deposit", data),
  addTradeWithdrawal: (data) =>
    axiosClient.post("/admin/trade/withdrawal", data),
  addTradeProfitWithdrawal: (data) =>
    axiosClient.post("/admin/trade/profit-withdrawal", data),

  // investment plains
  createInvestmentPackages: (data) =>
    axiosClient.post("/admin/package/create", data),
  getInvestmentPackages: () => axiosClient.get("/admin/packages"),
  updateInvestmentPackages: (id, data) =>
    axiosClient.put(`/admin/package/update/${id}`, data),
  deleteInvestmentPackages: (id) =>
    axiosClient.delete(`/admin/package/delete/${id}`),

  // Lavel plains
  createLavelPlans: (data) =>
    axiosClient.post("/admin/level-plan/create", data),
  getLevelPlans: (page = 1, limit = 10) =>
    axiosClient.get(`/admin/level-plans?page=${page}&limit=${limit}`),
  updateLavelPlan: (id, data) =>
    axiosClient.put(`/admin/level-plan/update/${id}`, data),
  deleteLavelPlan: (id) => axiosClient.delete(`/admin/level-plan/delete/${id}`),

  // bonanza plains
  createBonanzaPlans: (data) =>
    axiosClient.post("/admin/bonanza-plan/create", data),
  getBonanzaPlans: () => axiosClient.get("/admin/bonanza-plans"),
  updateBonanzaPlan: (id, data) =>
    axiosClient.put(`/admin/bonanza-plan/update/${id}`, data),
  deleteBonanzaPlan: (id) =>
    axiosClient.delete(`/admin/bonanza-plan/delete/${id}`),

  // getDashboardStats: () => axiosClient.get("/admin/dashboard"),
  // getUsers: () => axiosClient.get("/admin/users"),
  // createUser: (data) => axiosClient.post("/admin/users", data),
  // updateUser: (id, data) => axiosClient.put(`/admin/users/${id}`, data),
  // deleteUser: (id) => axiosClient.delete(`/admin/users/${id}`),
};

// previous

/** ====== READ ====== */
// const { data: users, isLoading, error } = useQuery({
//     queryKey: ["userData"], // Unique cache key
//     queryFn: async () => {
//         const res = await adminApi.getUserData();
//         return res.data; // Axios wraps response in res.data
//     },
//     refetchOnWindowFocus: false, // Optional override
// });

// const { data: users = [],  isLoading,   isError} = useQuery({
//     queryKey: ["userData"],
//     queryFn: async () => {
//         const res = await adminApi.getUserData();
//         return res?.data?.users || [];
//     },
//     onSuccess: (data) => {
//         toast.success(`Fetched ${data.length} users successfully.`);
//     },
//     onError: (err) => {
//         const message =
//             err?.response?.data?.message ||
//             err?.data?.message ||
//             err?.message ||
//             "Failed to fetch user data.";
//         toast.error(message);
//     },
//     refetchOnWindowFocus: false,
//     staleTime: 5 * 60 * 1000,
// });

// Create bonanza plan
// const { mutate: createBonanza, isPending: isCreating } = useMutation({
//     mutationFn: (data) => adminApi.createBonanzaPlans(data),
//     onSuccess: (res) => {
//         toast.success(res?.data?.message || "Bonanza plan created successfully.");
//         queryClient.invalidateQueries(["bonanzaPlans"]);
//         closeModal();
//     },
//     onError: (err) => {
//         const message =
//             err?.response?.data?.message ||
//             err?.data?.message ||
//             err?.message ||
//             "Failed to create bonanza plan.";
//         toast.error(message);
//     },
// });

// Update bonanza plan
// const { mutate: updateBonanza, isPending: isUpdating } = useMutation({
//     mutationFn: ({ id, data }) => adminApi.updateBonanzaPlan(id, data),
//     onSuccess: (res) => {
//         toast.success(res?.data?.message || "Bonanza plan updated successfully.");
//         queryClient.invalidateQueries(["bonanzaPlans"]);
//         closeModal();
//     },
//     onError: (err) => {
//         const message =
//             err?.response?.data?.message ||
//             err?.data?.message ||
//             err?.message ||
//             "Failed to update bonanza plan.";
//         toast.error(message);
//     },
// });

// Delete bonanza plan
// const { mutate: deleteBonanza, isPending: isDeleting } = useMutation({
//     mutationFn: (id) => adminApi.deleteBonanzaPlan(id),
//     onSuccess: (res) => {
//         toast.success(res?.data?.message || "Bonanza plan deleted successfully.");
//         queryClient.invalidateQueries(["bonanzaPlans"]);
//     },
//     onError: (err) => {
//         const message =
//             err?.response?.data?.message ||
//             err?.data?.message ||
//             err?.message ||
//             "Failed to delete bonanza plan.";
//         toast.error(message);
//     },
// });
