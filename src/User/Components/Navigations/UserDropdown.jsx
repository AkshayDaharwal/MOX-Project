import { useState, useRef, useEffect } from 'react';
import { FiLogOut } from 'react-icons/fi';
import { IoPersonOutline } from 'react-icons/io5';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { appConfig } from '../../../config/appConfig';

const UserDropdown = () => {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState({
    username: 'Loading...',
    image: 'https://i.pravatar.cc/300?img=13', // Default image
  });
  const ref = useRef(null);
  const navigate = useNavigate();

  // Fetch user profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token =
          localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
        if (!token) {
          // toast.error('No authentication token found. Please log in.');
          // navigate('/user/login');
          setUser({
          username:  'User',
          image:  'https://i.pravatar.cc/300?img=13', // Use profile image if available
        })
          return;
        }

        const response = await axios.get(`${appConfig.baseURL}/user/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const { profile } = response.data.data;
        setUser({
          username: profile.username || 'User',
          image: profile.image || 'https://i.pravatar.cc/300?img=13', // Use profile image if available
        });
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchProfile();
  }, [navigate]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const closeHandler = () => {
    setOpen(false);
  };

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate('/user/login');
  };

  return (
    <div className=" z-[9999] relative inline-block text-left" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center space-x-2 text-white focus:outline-none"
      >
        <img
          src={user.image}
          alt="User Avatar"
          className="w-8 h-8 rounded-full border border-white/30"
        />
        <span className="hidden md:inline-block text-sm">{user.username}</span>
      </button>

      {open && (
        <div className="absolute z-[9999] right-0 mt-3 w-56 bg-gradient-to-br from-black to-sky-950 border border-gradient text-white rounded-xl shadow-lg backdrop-blur-xl  ">
          <div className="px-4 py-3 border-b border-gray-600">
            <div className="flex items-center space-x-3">
              <img
                src={user.image}
                alt="User Avatar"
                className="w-10 h-10 rounded-full border border-white/30"
              />
              <div>
                <p className="text-sm font-semibold">{user.username}</p>
              </div>
            </div>
          </div>
          <div className="py-2">
            <Link
              to="/user/my-profile"
              className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-white/10 transition"
              onClick={closeHandler}
            >
              <IoPersonOutline className="text-lg" />
              Profile
            </Link>
            <button
              className="w-full flex text-red-500 items-center gap-3 px-4 py-2 text-sm hover:bg-white/10 transition"
              onClick={() => {
                handleLogout();
                closeHandler();
              }}
            >
              <FiLogOut className="text-lg" />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDropdown;