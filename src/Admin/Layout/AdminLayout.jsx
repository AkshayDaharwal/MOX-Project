import { SidebarProvider, useSidebar } from "../Contexts/SidebarContext";
import { Outlet } from "react-router-dom";
import TopNav from "../Components/Navigations/TopNav";
import Backdrop from "../Components/Navigations/Backdrop";
import Sidebar from "../Components/Navigations/Sidebar";
import { ThemeProvider } from "../Contexts/ThemeContext";
import "../../Styles/AdminStyles/AdminComman.css"
import { ToastContainer } from "react-toastify";

const LayoutContent = () => {
    const { isExpanded, isHovered, isMobileOpen } = useSidebar();

    return (
        <div className="min-h-screen  bg-white xl:flex">
            <div>
                <Sidebar />
                <Backdrop />
                <ToastContainer />
            </div>
            <div
                className={`flex-1   bg-white transition-all duration-300 ease-in-out ${isExpanded || isHovered ? "lg:ml-[230px]" : "lg:ml-[80px]"
                    } ${isMobileOpen ? "ml-0" : ""}`}
            >
                <TopNav />
                <div className="p-4 mx-auto max-w-full md:p-6">
                    <Outlet />  {/* like chindren */}
                </div>
            </div>
        </div>
    );
};

const AdminLayout = () => {
    return (
        <ThemeProvider>
            <SidebarProvider>
                <LayoutContent />
            </SidebarProvider>
        </ThemeProvider>
    );
};

export default AdminLayout;
