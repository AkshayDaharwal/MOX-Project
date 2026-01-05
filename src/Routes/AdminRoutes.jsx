import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import AdminLayout from '../Admin/Layout/AdminLayout';
const TradeManagement = lazy(() => import('../Admin/Pages/TradeManagement'));
import AdminLoader from '../Admin/Components/AdminLoader';
import DailyRoiIncome from '../Admin/Pages/IncomeManagement/DailyRoiIncome';
import LevelIncomeRewards from '../Admin/Pages/IncomeManagement/LevelIncomeRewards';
import UserStakePlansReport from '../Admin/Pages/InvestmentReport/UserStakePlansReport';
 

// ✅ Lazy-loaded Auth Pages
const Login = lazy(() => import('../Admin/Auth/Login'));
const SignUp = lazy(() => import('../Admin/Auth/SignUp'));
const ForgetPassword = lazy(() => import('../Admin/Auth/ForgetPassword'));
const ResetPassword = lazy(() => import('../Admin/Auth/ResetPassword'));
const VarifyEmail = lazy(() => import('../Admin/Auth/VarifyEmail'));

// ✅ Lazy-loaded Admin Pages
const Dashboard = lazy(() => import('../Admin/Pages/Dashboard'));
const UserManagment = lazy(() => import('../Admin/Pages/UserManagement'));
const SetTokenPrice = lazy(() => import('../Admin/Pages/SetTokenPrice'));
// const Deposit = lazy(() => import('../Admin/Pages/UsersDeposit/Deposit'));
const DepositReport = lazy(() => import('../Admin/Pages/UsersDeposit/DepositReport'));
const UserWalletUpdate = lazy(() => import('../Admin/Pages/UsersWalletUpdate/WalletUpdate'));
const UserWalletUpdateReport = lazy(() => import('../Admin/Pages/UsersWalletUpdate/WalletUpdateReport'));
const InvestmentsPlan = lazy(() => import('../Admin/Pages/InvestmentManagement/InvestmentsPlan'));
const LavelPlan = lazy(() => import('../Admin/Pages/InvestmentManagement/LavelPlan'));
const BonanzaPlan = lazy(() => import('../Admin/Pages/InvestmentManagement/BonanzaPlan'));
const InvestmentsReports = lazy(() => import('../Admin/Pages/InvestmentManagement/Reports'));
const Withdrawals = lazy(() => import('../Admin/Pages/PayoutManagement/Withdrawals'));
const WithdrawalReport = lazy(() => import('../Admin/Pages/PayoutManagement/WithdrawalReports'));
const PerDayIncome = lazy(() => import('../Admin/Pages/IncomeManagement/DailyRoiIncome'));
const ReferralIncome = lazy(() => import('../Admin/Pages/IncomeManagement/ReferralIncome'));
const BonanzaRewards = lazy(() => import('../Admin/Pages/IncomeManagement/BonanzaRewards'));
const SwapManagementReport = lazy(() => import('../Admin/Pages/SwapManagement/SwapManagementReport'));
const TransferManagementReport = lazy(() => import('../Admin/Pages/SwapManagement/TransferManagementReport'));
const ReinvestManagementReport = lazy(() => import('../Admin/Pages/SwapManagement/ReinvestManagementReport'));

const SessionLog = lazy(() => import('../Admin/Pages/SessionLog'));
const Logout = lazy(() => import('../Admin/Pages/Logout'));

// ✅ Private Route Component
const PrivateRoute = () => {
  const isAuthenticated = localStorage.getItem('token') || sessionStorage.getItem('token');
  // const isAuthenticated = true;
  if (isAuthenticated) {
    return <Outlet />;
  }
  return <Navigate to="/admin/login" replace />;
};

const AdminRoutes = () => {
  return (
    <Routes>
      {/* ✅ Public Auth Routes with Lazy + Loader */}
      <Route
        path="/admin/login"
        element={
          <Suspense fallback={<AdminLoader />}>
            <Login />
          </Suspense>
        }
      />
      <Route
        path="/admin/sign-up"
        element={
          <Suspense fallback={<AdminLoader />}>
            <SignUp />
          </Suspense>
        }
      />
      <Route
        path="/admin/varify-email"
        element={
          <Suspense fallback={<AdminLoader />}>
            <VarifyEmail />
          </Suspense>
        }
      />
      <Route
        path="/admin/forget-password"
        element={
          <Suspense fallback={<AdminLoader />}>
            <ForgetPassword />
          </Suspense>
        }
      />
      <Route
        path="/admin/reset-password"
        element={
          <Suspense fallback={<AdminLoader />}>
            <ResetPassword />
          </Suspense>
        }
      />

      {/* ✅ Protected Admin Routes */}
      <Route
        
        element={
          <PrivateRoute />
        }
      >
        <Route
          path="/admin"
          element={
            <AdminLayout />
          }
        >
          <Route index element={<Navigate to="dashboard" />} />
          <Route
            path="dashboard"
            element={
              <Suspense fallback={<AdminLoader />}>
                <Dashboard />
              </Suspense>
            }
          />
            <Route
              path="trade-management"
              element={
                <Suspense fallback={<AdminLoader />}>
                  <TradeManagement />
                </Suspense>
              }
            />
          <Route
            path="user-management"
            element={
              <Suspense fallback={<AdminLoader />}>
                <UserManagment />
              </Suspense>
            }
          />
          <Route
            path="set-token-price"
            element={
              <Suspense fallback={<AdminLoader />}>
                <SetTokenPrice />
              </Suspense>
            }
          />
          {/* <Route 
            path="user-deposit/deposit"
            element={
              <Suspense fallback={<AdminLoader />}>
                <Deposit />
              </Suspense>
            }
          /> */}
          <Route
            path="user-deposit/deposit-report"
            element={
              <Suspense fallback={<AdminLoader />}>
                <DepositReport />
              </Suspense>
            }
          />

           <Route 
            path="user-wallet/update"
            element={
              <Suspense fallback={<AdminLoader />}>
                <UserWalletUpdate />
              </Suspense>
            }
          />
          <Route
            path="user-wallet/update-report"
            element={
              <Suspense fallback={<AdminLoader />}>
                <UserWalletUpdateReport />
              </Suspense>
            }
          />
          <Route
            path="Investment-Report/user-stake-plans-report"
            element={
              <Suspense fallback={<AdminLoader />}>
                <UserStakePlansReport />
              </Suspense>
            }
          />
          <Route
            path="investment-management/investments-plan"
            element={
              <Suspense fallback={<AdminLoader />}>
                <InvestmentsPlan />
              </Suspense>
            }
          />
          <Route
            path="investment-management/level-plan"
            element={
              <Suspense fallback={<AdminLoader />}>
                <LavelPlan />
              </Suspense>
            }
          />
          <Route
            path="investment-management/bonanza-plan"
            element={
              <Suspense fallback={<AdminLoader />}>
                <BonanzaPlan />
              </Suspense>
            }
          />
          <Route
            path="investment-management/report"
            element={
              <Suspense fallback={<AdminLoader />}>
                <InvestmentsReports />
              </Suspense>
            }
          />
          <Route
            path="payout-management/withdrawals"
            element={
              <Suspense fallback={<AdminLoader />}>
                <Withdrawals />
              </Suspense>
            }
          />
          <Route
            path="payout-management/withdrawal-report"
            element={
              <Suspense fallback={<AdminLoader />}>
                <WithdrawalReport />
              </Suspense>
            }
          />
          <Route
            path="income-management/daily-roi-income"
            element={
              <Suspense fallback={<AdminLoader />}>
                <DailyRoiIncome />
              </Suspense>
            }
          />
          <Route
            path="income-management/referrel-income"
            element={
              <Suspense fallback={<AdminLoader />}>
                <ReferralIncome />
              </Suspense>
            }
          />
          <Route
            path="income-management/level-income-rewards"
            element={
              <Suspense fallback={<AdminLoader />}>
                <LevelIncomeRewards />
              </Suspense>
            }
          />
          {/* <Route
            path="income-management/bonanza-rewards"
            element={
              <Suspense fallback={<AdminLoader />}>
                <BonanzaRewards />
              </Suspense>
            }
          /> */}
          <Route
            path="swap-management/report"
            element={
              <Suspense fallback={<AdminLoader />}>
                <SwapManagementReport />
              </Suspense>
            }
          />
          <Route
            path="transfer-management/report"
            element={
              <Suspense fallback={<AdminLoader />}>
                <TransferManagementReport />
              </Suspense>
            }
          />
          <Route
            path="reinvest-management/report"
            element={
              <Suspense fallback={<AdminLoader />}>
                <ReinvestManagementReport />
              </Suspense>
            }
          />
          <Route
            path="session-log"
            element={
              <Suspense fallback={<AdminLoader />}>
                <SessionLog />
              </Suspense>
            }
          />
          <Route
            path="logout"
            element={
              <Suspense fallback={<AdminLoader />}>
                <Logout />
              </Suspense>
            }
          />
        </Route>
      </Route>
    </Routes>
  );
};

export default AdminRoutes;
