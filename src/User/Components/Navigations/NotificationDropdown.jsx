import  { useState, useRef, useEffect } from 'react';
import { IoMdNotificationsOutline } from 'react-icons/io';

const notifications = [
    { id: 1, title: 'Withdrawal Approved', message: 'Your withdrawal of $200 has been processed.' },
    { id: 2, title: 'New Referral', message: 'John Doe joined using your referral.' },
    { id: 3, title: 'ROI Credited', message: 'Daily ROI of $5 credited to your wallet.' },
    { id: 4, title: 'Level Up', message: 'You reached Level 3. Congrats!' },
    { id: 5, title: 'Plan Expired', message: 'Your basic plan has expired.' },
    { id: 6, title: 'Swap Success', message: 'You swapped 100 USDT to EMGT successfully.' },
    { id: 7, title: 'New Bonus', message: 'You received a $10 bonus from team activity.' },
];

const NotificationDropdown = () => {
    const [open, setOpen] = useState(false);
    const ref = useRef();

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (ref.current && !ref.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative inline-block text-left" ref={ref}>
            {/* <button
                onClick={() => setOpen(!open)}
                className="text-white text-2xl flex  relative"
            >
                <IoMdNotificationsOutline />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
                    {notifications.length}
                </span>
            </button> */}

            {open && (
                <div className="absolute z-50 mt-3 w-[90vw] sm:w-80   lg:right-0 bg-gradient-to-br from-black to-sky-950 border border-gradient text-white rounded-xl shadow-lg backdrop-blur-xl">
                    <div className="px-4 py-3 border-b border-gray-600 flex justify-between items-center">
                        <span className="font-semibold">Notifications</span>
                        <button onClick={() => setOpen(false)} className="text-sm text-gray-400 hover:text-white">Clear</button>
                    </div>
                    <div className="max-h-80 overflow-y-auto custom-scrollbar">
                        {notifications.map((note) => (
                            <div key={note.id} className="px-4 py-3 border-b border-gray-700 hover:bg-white/5 transition duration-200">
                                <p className="text-sm font-medium">{note.title}</p>
                                <p className="text-xs text-gray-300">{note.message}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;
