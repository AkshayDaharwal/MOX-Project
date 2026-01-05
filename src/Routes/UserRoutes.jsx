import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Suspense, lazy } from 'react';

// Layout (static import, NOT lazy)
import UserLayout from '../User/Layout/UserLayout';
import UserLoader from '../User/Components/Comman/UserLoader';
import AuthLayout from '../User/Layout/AuthLayout';
import LoginPage from '../User/Auth/LoginPage';
import SignUpPage from '../User/Auth/SignUpPage';
import VerifyUser from '../User/Auth/VerifyUser';
import ForgotPasswordPage from '../User/Auth/ForgotPasswordPage';
import TeamDownline from '../User/Pages/TeamDownline';
import TeamTreeView from '../User/Pages/TeamTreeView';
import DirectReferral from '../User/Pages/DirectReferral';
import LevelWiseTeam from '../User/Pages/LevelWiseTeam';
import ScrollToTop from '../User/Components/Comman/ScrollToTop';
import LevelIncomeReport from '../User/Pages/LevelIncomeReport';
import LavelRewards from '../User/Pages/LavelRewards';
import Support from '../User/Pages/Support';
import Test from '../User/Pages/Test';

// Lazy-loaded pages
const Dashboard = lazy(() => import('../User/Pages/Dashboard'));
const MyProfile = lazy(() => import('../User/Pages/MyProfile'));
const Deposit = lazy(() => import('../User/Pages/Deposit'));
const DepositReport = lazy(() => import('../User/Pages/DepositReport'));
const Wallets = lazy(() => import('../User/Pages/Wallets'));
const Investments = lazy(() => import('../User/Pages/Investments'));
const ActivePlans = lazy(() => import('../User/Pages/ActivePlans'));
const InvestmentReport = lazy(() => import('../User/Pages/InvestmentReport'));
const Swap = lazy(() => import('../User/Pages/Swap'));
const SwapReport = lazy(() => import('../User/Pages/SwapReport'));
const ReferralIncome = lazy(() => import('../User/Pages/ReferralIncome'));
const ReferralReport = lazy(() => import('../User/Pages/ReferralReport'));
const StakeIncomeReport = lazy(() => import('../User/Pages/StakeIncomeReport'));
const LavelIncomeReport = lazy(() => import('../User/Pages/ReferralIncomeReportGarbage'));
// const BonanzaIncome = lazy(() => import('../User/Pages/BonanzaIncome'));
// const BonanzaRewards = lazy(() => import('../User/Pages/BonanzaRewards'));
const Withdrawals = lazy(() => import('../User/Pages/Withdrawals'));
const WithdrawReport = lazy(() => import('../User/Pages/WithdrawReport'));
const TransactionHistory = lazy(() => import('../User/Pages/TransactionHistory'));

// Trade section lazy-loaded pages
const Arbitrage = lazy(() => import('../User/Pages/Arbitrage'));
const Analytics = lazy(() => import('../User/Pages/Analytics'));
const History = lazy(() => import('../User/Pages/History'));
const Profits = lazy(() => import('../User/Pages/Profits'));

// ProtectedRoute component
const ProtectedRoute = () => {
  // const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  const token =  true;
  if (token) {
    return <Outlet />;
  }
  return <Navigate to="/user/login" replace />;
};

const UserRoutes = () => {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/user">
          {/* Auth routes with AuthLayout */}
          <Route element={<AuthLayout />}>
            <Route path="login" element={<LoginPage />} />
            <Route path="signup" element={<SignUpPage />} />
            <Route path="forgot-password" element={<ForgotPasswordPage />} />
            <Route path="verify-user" element={<VerifyUser />} />
          </Route>
          

          {/* Protected routes with UserLayout */}
          <Route element={<ProtectedRoute />}>
            <Route element={<UserLayout />}>
              <Route index element={<Navigate to="dashboard" />} />
              <Route
                path="dashboard"
                element={
                  <Suspense fallback={<UserLoader />}>
                    <Dashboard />
                  </Suspense>
                }
              />
              <Route
                path="test"
                element={
                  <Suspense fallback={<UserLoader />}>
                    <Test />
                  </Suspense>
                }
              />
              {/* Trade Section Routes */}
              <Route
                path="arbitrage"
                element={
                  <Suspense fallback={<UserLoader />}>
                    <Arbitrage />
                  </Suspense>
                }
              />
              <Route
                path="analytics"
                element={
                  <Suspense fallback={<UserLoader />}>
                    <Analytics />
                  </Suspense>
                }
              />
              <Route
                path="history"
                element={
                  <Suspense fallback={<UserLoader />}>
                    <History />
                  </Suspense>
                }
              />
              <Route
                path="profits"
                element={
                  <Suspense fallback={<UserLoader />}>
                    <Profits />
                  </Suspense>
                }
              />
              {/* End Trade Section Routes */}
              <Route
                path="my-profile"
                element={
                  <Suspense fallback={<UserLoader />}>
                    <MyProfile />
                  </Suspense>
                }
              />
              <Route
                path="deposits"
                element={
                  <Suspense fallback={<UserLoader />}>
                    <Deposit />
                  </Suspense>
                }
              />
              <Route
                path="deposit-report"
                element={
                  <Suspense fallback={<UserLoader />}>
                    <DepositReport />
                  </Suspense>
                }
              />
              <Route
                path="wallets"
                element={
                  <Suspense fallback={<UserLoader />}>
                    <Wallets />
                  </Suspense>
                }
              />
              <Route
                path="investments"
                element={
                  <Suspense fallback={<UserLoader />}>
                    <Investments />
                  </Suspense>
                }
              />
              <Route
                path="active-plan"
                element={
                  <Suspense fallback={<UserLoader />}>
                    <ActivePlans />
                  </Suspense>
                }
              />
              <Route
                path="investment-report"
                element={
                  <Suspense fallback={<UserLoader />}>
                    <InvestmentReport />
                  </Suspense>
                }
              />
              <Route
                path="swap"
                element={
                  <Suspense fallback={<UserLoader />}>
                    <Swap />
                  </Suspense>
                }
              />
              <Route
                path="swap-report"
                element={
                  <Suspense fallback={<UserLoader />}>
                    <SwapReport />
                  </Suspense>
                }
              />
              <Route
                path="referral-income"
                element={
                  <Suspense fallback={<UserLoader />}>
                    <ReferralIncome />
                  </Suspense>
                }
              />
              <Route
                path="referral-report"
                element={
                  <Suspense fallback={<UserLoader />}>
                    <ReferralReport />
                  </Suspense>
                }
              />
              <Route
                path="team-downline"
                element={
                  <Suspense fallback={<UserLoader />}>
                    <TeamDownline />
                  </Suspense>
                }
              />
              <Route
                path="team-tree-view"
                element={
                  <Suspense fallback={<UserLoader />}>
                    <TeamTreeView />
                  </Suspense>
                }
              />
              <Route
                path="direct-referral"
                element={
                  <Suspense fallback={<UserLoader />}>
                    <DirectReferral />
                  </Suspense>
                }
              />
              <Route
                path="level-wise-team"
                element={
                  <Suspense fallback={<UserLoader />}>
                    <LevelWiseTeam />
                  </Suspense>
                }
              />
              <Route
                path="Level-rewards"
                element={
                  <Suspense fallback={<UserLoader />}>
                    <LavelRewards />
                  </Suspense>
                }
              />
              <Route
                path="level-plan-report"
                element={
                  <Suspense fallback={<UserLoader />}>
                    {/* <BonanzaIncome /> */}
                    <LevelIncomeReport/>
                  </Suspense>
                }
              />
              <Route
                path="stake-income-report"
                element={
                  <Suspense fallback={<UserLoader />}>
                    <StakeIncomeReport />
                  </Suspense>
                }
              />
              <Route
                path="referral-income-report"
                element={
                  <Suspense fallback={<UserLoader />}>
                    <ReferralReport />
                  </Suspense>
                }
              />
              <Route
                path="lavel-income-report"
                element={
                  <Suspense fallback={<UserLoader />}>
                    <LevelIncomeReport />
                  </Suspense>
                }
              />
              <Route
                path="withdrawals"
                element={
                  <Suspense fallback={<UserLoader />}>
                    <Withdrawals />
                  </Suspense>
                }
              />
              <Route
                path="withdraw-report"
                element={
                  <Suspense fallback={<UserLoader />}>
                    <WithdrawReport />
                  </Suspense>
                }
              />
              <Route
                path="transaction-history"
                element={
                  <Suspense fallback={<UserLoader />}>
                    <TransactionHistory />
                  </Suspense>
                }
              />
              <Route
                path="support"
                element={
                  <Suspense fallback={<UserLoader />}>
                    <Support />
                  </Suspense>
                }
              />
              <Route
                path="ul"
                element={
                  <Suspense fallback={<UserLoader />}>
                    <UserLoader />
                  </Suspense>
                }
              />
            </Route>
          </Route>
        </Route>
      </Routes>
    </>
  );
};

export default UserRoutes;