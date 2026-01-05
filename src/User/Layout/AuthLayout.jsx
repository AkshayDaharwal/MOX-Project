import { Outlet } from 'react-router-dom';
import vid from "../../assets/userImages/images/bg-video.webm"
import { ToastContainer } from 'react-toastify';

const AuthLayout = () => {
    return (
        <div className="  relative  text-white    ">
            <div className="fixed z-[-99] left-0 top-0 object-cover inset-0  bg-cover bg-[90%_top] bg-fixed blur-sm opacity-[0.6]  scale-110" />
            <video
                muted
                autoPlay
                loop
                playsInline
                className="fixed top-0 left-0 w-full h-full object-cover z-[-99] opacity-[0.1] scale-110 blur-xl"
                >
                <source src={vid} type="video/mp4" />
                Your browser does not support the video tag.
                </video>

            <div>
                <ToastContainer />
            </div>
             
            
            {/* <AuthNav/> */}
                <div className="  w-full  h-full        ">
                    <Outlet />  {/* like chindren */}

                </div>
            
        </div>
    );
};

export default AuthLayout;
