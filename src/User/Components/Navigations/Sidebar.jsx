import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaChevronDown,
  FaThLarge,
  FaUserCircle,
  FaMoneyBillWave,
  FaChartLine,
  FaExchangeAlt,
  FaUsers,
  FaGift,
  FaRegFileAlt,
  FaSignOutAlt,
  FaRegClosedCaptioning,
} from "react-icons/fa";
import { IoIosGitNetwork } from "react-icons/io";
import { TbReportMoney } from "react-icons/tb";
import { MdTrendingUp } from "react-icons/md";
import { useSidebar } from "../../Contexts/SidebarContext";
import logo1 from "../../../assets/userImages/Logo/MOX COIN 1.png";
import logo2 from "../../../assets/userImages/Logo/MOXicon.png";

const navItems = [
  { icon: <FaThLarge />, name: "Dashboard", path: "dashboard" },
  {
    icon: <MdTrendingUp />,
    name: "Trade BOT",
    subItems: [
      { name: "Arbitrage", path: "arbitrage", pro: false },
      { name: "Analytics", path: "analytics", pro: false },
      { name: "History", path: "history", pro: false },
      { name: "Profits", path: "profits", pro: false },
    ],
  },
  {
    icon: <FaMoneyBillWave />,
    name: "Deposit",
    subItems: [
      { name: "Deposit", path: "deposits", pro: false },
      { name: "Report", path: "deposit-report", pro: false },
    ],
  },
  {
    icon: <FaChartLine />,
    name: "Invest",
    subItems: [
      { name: "Investments", path: "investments", pro: false },
      { name: "Report", path: "investment-report", pro: false },
    ],
  },
  {
    icon: <FaExchangeAlt />,
    name: "Swap",
    subItems: [{ name: "Report", path: "swap-report", pro: false }],
  },
  {
    icon: <FaUsers />,
    name: "Referral Program",
    subItems: [
      { name: "Referral Income", path: "referral-income", pro: false },
      { name: "Report", path: "referral-report", pro: false },
    ],
  },
  {
    icon: <IoIosGitNetwork />,
    name: "My Team",
    subItems: [
      { name: "Level Wise Team", path: "level-wise-team", pro: false },
      { name: " Team Tree View", path: "team-tree-view", pro: false },
    ],
  },
  {
    icon: <FaGift />,
    name: "Level Income",
    subItems: [
      { name: "Level Rewards", path: "level-rewards", pro: false },
      { name: "Report", path: "level-plan-report", pro: false },
    ],
  },
  {
    icon: <TbReportMoney />,
    name: "Income Report",
    subItems: [
      { name: "ROI Income", path: "stake-income-report", pro: false },
      { name: "Referral Income", path: "referral-income-report", pro: false },
      { name: "Level Income", path: "lavel-income-report", pro: false },
    ],
  },
  {
    icon: <FaMoneyBillWave />,
    name: "Withdraw",
    subItems: [
      { name: "Withdrawals", path: "withdrawals", pro: false },
      { name: "Report", path: "withdraw-report", pro: false },
    ],
  },
  // ✅ External link (new tab)
  {
    icon: <FaRegFileAlt />,
    name: "Business Plan",
    path: "https://drive.google.com/file/d/1c8OmEyGEMmhpWhF73-_4h3OkK2oRAjTT/view?usp=sharing",
    target: "_blank",
  },
  { icon: <FaUserCircle />, name: "Support", path: "support" },
  { icon: <FaUserCircle />, name: "Profile", path: "my-profile" },
  { icon: <FaSignOutAlt />, name: "Logout" },
];

const Sidebar = () => {
  const { isExpanded, isMobileOpen, setIsMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const [openSubmenu, setOpenSubmenu] = useState(null);
  const [subMenuHeight, setSubMenuHeight] = useState({});
  const subMenuRefs = useRef({});
  const [isApplicationMenuOpen, setApplicationMenuOpen] = useState(false);

  const isActive = useCallback(
    (path) => location.pathname.includes(path),
    [location.pathname]
  );

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate("/user/login");
  };

  useEffect(() => {
    let matched = false;
    navItems.forEach((nav, index) => {
      nav.subItems?.forEach((sub) => {
        if (isActive(sub.path)) {
          setOpenSubmenu({ index });
          matched = true;
        }
      });
    });
    if (!matched) setOpenSubmenu(null);
  }, [location, isActive]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `main-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prev) => ({
          ...prev,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index) => {
    setOpenSubmenu((prev) => (prev && prev.index === index ? null : { index }));
  };

  const renderMenuItems = () => (
    <ul className="flex flex-col gap-2">
      {navItems.map((nav, index) => {
        if (nav.name === "Logout") {
          return (
            <li key={nav.name}>
              <button
                onClick={handleLogout}
                className={`flex w-full items-center gap-4 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 group relative overflow-hidden
                bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800/40
                ${!isExpanded && !isHovered ? "lg:px-[0.9rem]" : ""} lg:justify-start`}
              >
                <div className="absolute inset-0 bg-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl" />
                <span className="relative z-10 flex-shrink-0 ml-[-0.1rem] text-lg">
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="relative z-10 font-medium tracking-wide">
                    {nav.name}
                  </span>
                )}
              </button>
            </li>
          );
        }

        return (
          <li key={nav.name}>
            {nav.subItems ? (
              <button
                onClick={() => handleSubmenuToggle(index)}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 group relative overflow-hidden 
                ${openSubmenu?.index === index
                    ? "bg-gradient-to-r from-green-50 to-indigo-50 dark:from-green-900/20 dark:to-indigo-900/20 text-[#b5861f] dark:text-[#b5861f] shadow-sm border border-green-100 dark:border-[#b5861f]/30"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#182C2D] hover:text-gray-900 dark:hover:text-white"
                  } 
                ${!isExpanded && !isHovered ? " lg:px-[0.9rem]" : " "} lg:justify-start`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl" />
                <span className={`relative z-10 flex-shrink-0 text-lg transition-colors duration-200
                ${openSubmenu?.index === index
                    ? "text-[#b5861f] dark:text-[#b5861f]"
                    : "text-gray-500 dark:text-gray-400 group-hover:text-[#b5861f] dark:group-hover:text-[#b5861f]"
                  }`}>
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <>
                    <span className="relative z-10 flex-1 text-left font-medium tracking-wide">
                      {nav.name}
                    </span>
                    <FaChevronDown
                      className={`relative z-10 w-4 h-4 transition-all duration-300 flex-shrink-0
                      ${openSubmenu?.index === index
                          ? "rotate-180 text-[#b5861f] dark:text-[#b5861f]"
                          : "text-gray-400 dark:text-gray-500 group-hover:text-[#b5861f] dark:group-hover:text-[#b5861f]"
                        }`}
                    />
                  </>
                )}
              </button>
            ) : (
              nav.path &&
              (nav.target === "_blank" ? (
                <a
                  href={nav.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-4 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 group relative overflow-hidden
                  ${isActive(nav.path)
                      ? "bg-gradient-to-r from-green-50 to-indigo-50 dark:from-green-900/20 dark:to-indigo-900/20 text-[#b5861f] dark:text-[#b5861f] shadow-sm border border-green-100 dark:border-green-800/30"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#182C2D] hover:text-gray-900 dark:hover:text-white"
                    }
                  ${!isExpanded && !isHovered ? "lg:px-[0.9rem]" : " "}lg:justify-start`}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl" />
                  <span className={`relative z-10 flex-shrink-0 ml-[-0.1rem] text-lg transition-colors duration-200 
                  ${isActive(nav.path)
                      ? "text-[#b5861f] dark:text-[#b5861f]"
                      : "text-gray-500 dark:text-gray-400 group-hover:text-[#b5861f] dark:group-hover:text-[#b5861f]"
                    }`}>
                    {nav.icon}
                  </span>
                  {(isExpanded || isHovered || isMobileOpen) && (
                    <span className="relative z-10 font-medium tracking-wide">
                      {nav.name}
                    </span>
                  )}
                </a>
              ) : (
                <Link
                  to={nav.path}
                  className={`flex items-center gap-4 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 group relative overflow-hidden
                  ${isActive(nav.path)
                      ? "bg-gradient-to-r from-green-50 to-indigo-50 dark:from-green-900/20 dark:to-indigo-900/20 text-[#b5861f] dark:text-[#b5861f] shadow-sm border border-green-100 dark:border-green-800/30"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#182C2D] hover:text-gray-900 dark:hover:text-white"
                    }
                  ${!isExpanded && !isHovered ? "lg:px-[0.9rem]" : " "}lg:justify-start`}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl" />
                  <span className={`relative z-10 flex-shrink-0 ml-[-0.1rem] text-lg transition-colors duration-200 
                  ${isActive(nav.path)
                      ? "text-[#b5861f] dark:text-[#b5861f]"
                      : "text-gray-500 dark:text-gray-400 group-hover:text-[#b5861f] dark:group-hover:text-[#b5861f]"
                    }`}>
                    {nav.icon}
                  </span>
                  {(isExpanded || isHovered || isMobileOpen) && (
                    <span className="relative z-10 font-medium tracking-wide">
                      {nav.name}
                    </span>
                  )}
                </Link>
              ))
            )}

            {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
              <div
                ref={(el) => {
                  subMenuRefs.current[`main-${index}`] = el;
                }}
                className="overflow-hidden transition-all duration-300 ease-out"
                style={{
                  height:
                    openSubmenu?.index === index
                      ? `${subMenuHeight[`main-${index}`]}px`
                      : "0px",
                }}
              >
                <ul className="mt-2 ml-4 space-y-1 border-l border-gray-200 dark:border-gray-700">
                  {nav.subItems.map((subItem) => (
                    <li key={subItem.name}>
                      <Link
                        to={subItem.path}
                        className={`flex items-center justify-between py-1.5 px-3 rounded-lg text-sm font-medium transition-all duration-200 group relative overflow-hidden
                        ${isActive(subItem.path)
                            ? "bg-gradient-to-r from-green-50 to-indigo-50 dark:from-green-900/10 dark:to-indigo-900/10 text-[#b5861f] dark:text-[#b5861f] shadow-sm"
                            : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#182C2D] hover:text-gray-900 dark:hover:text-white"
                          }`}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-green-500/3 to-indigo-500/3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg" />
                        <span className="relative z-10 tracking-wide">
                          {subItem.name}
                        </span>
                        {(subItem.new || subItem.pro) && (
                          <span className="relative z-10 flex gap-1.5 ml-2">
                            {subItem.new && (
                              <span className="bg-gradient-to-r from-emerald-500 to-green-500 text-white text-sm font-semibold px-2 py-0.5 rounded-full shadow-sm">
                                NEW
                              </span>
                            )}
                            {subItem.pro && (
                              <span className="bg-gradient-to-r from-purple-500 to-violet-500 text-white text-sm font-semibold px-2 py-0.5 rounded-full shadow-sm">
                                PRO
                              </span>
                            )}
                          </span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );

  return (
    <aside
      className={`fixed   top-0 z-[99999] left-0 h-[100vh] bg-white/95 dark:bg-[#00000082] backdrop-blur-md border-r border-gray-200/60 dark:border-gray-700/60 transition-all duration-300 ease-in-out shadow-xl dark:shadow-2xl
        ${isExpanded || isMobileOpen ? "w-[230px]" : isHovered ? "w-[230px]" : "w-[73px]"}
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isMobileOpen ?
        <>
          <div
            onClick={() => { setIsMobileOpen(false) }}
            className="absolute bg-gray-700 px-2 right-[-10px] top-5 rounded-md">
             x
          </div>
        </> :
        <></>}
      {/* LOGO SECTION */}
      <div className={`py-6 px-6 flex border-b border-gray-100 dark:border-gray-800/50 ${!isExpanded && !isHovered ? "lg:px-[0.9rem]" : ""} justify-start`}>
        <Link to="/" className="transition-transform duration-200 hover:scale-105">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <img className="dark:hidden drop-shadow-sm" src={logo1} alt="Logo" width={100} />
              <img className="hidden dark:block drop-shadow-sm" src={logo1} alt="Logo" width={100} />
            </>
          ) : (
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg">
              <img src={logo2} alt="Logo" width={50} className="" />
            </div>
          )}
        </Link>
      </div>

      {/* NAVIGATION */}
      <div className="flex flex-col h-full pb-36 overflow-y-auto no-scrollbar">
        <nav className="flex-1 px-3 py-6">
          <div className="space-y-8">
            <div>
              <h2 className={`mb-6 text-sm font-bold uppercase tracking-wider flex leading-5 ${!isExpanded && !isHovered ? "lg:justify-center text-gray-400 dark:text-gray-500" : "justify-start text-gray-500 dark:text-gray-400"}`}>
                {isExpanded || isHovered || isMobileOpen ? "Navigation" : <div className="w-6 h-0.5 mb-3 bg-gray-300 dark:bg-[#d6f7ff] rounded-full" />}
              </h2>
              {renderMenuItems()}
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
