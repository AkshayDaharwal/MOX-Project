import { SidebarProvider, useSidebar } from "../Contexts/SidebarContext";
import { Outlet } from "react-router-dom";
import TopNav from "../Components/Navigations/TopNav";
import Backdrop from "../Components/Navigations/Backdrop";
import Sidebar from "../Components/Navigations/Sidebar";
import { ThemeProvider } from "../Contexts/ThemeContext";
import { ToastContainer } from "react-toastify";
import "../../Styles/UserStyles/UserComman.css";

const UserLayout = () => {
    const { isExpanded, isHovered, isMobileOpen } = useSidebar();

    return (
        <>

            <div className="relative text-white min-h-screen xl:flex   overflow-hidden">
                {/* Background */}
                <div className="fixed z-[-99] inset-0  bg-cover blur-sm opacity-[0.6] scale-110" />

                <div>
                    <Sidebar />
                    <Backdrop />
                    <ToastContainer />
                </div>


                {/* <div
                className={` z-[999] w-full fixed top-0 right-0      transition-all duration-300 ease-in-out 
                    ${isExpanded || isHovered ? "lg:w-[84.5vw]" : "lg:w-[91.5rem]"}
                    ${isMobileOpen ? "ml-0" : ""}`}
            >
                <TopNav />

            </div> */}
                <div
                    className={`flex-1  min-w-0 transition-all duration-300 ease-in-out 
                    ${isExpanded || isHovered ? "lg:ml-[230px]" : "lg:ml-[73px]"}
                    ${isMobileOpen ? "ml-0" : ""}`}
                >
                    <TopNav />
                    {/* Content wrapper */}
                    <div className="p-4 md:p-5    mt-20 lg:mt-0  w-full overflow-x-auto">
                        <Outlet />
                    </div>
                </div>

            </div>
        </>
    );
};

const AdminLayout = () => {
    return (
        <ThemeProvider>
            <SidebarProvider>
                <UserLayout />
            </SidebarProvider>
        </ThemeProvider>
    );
};

export default AdminLayout;
