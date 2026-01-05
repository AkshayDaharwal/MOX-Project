import React from "react";
import { useNavigate } from "react-router-dom";

const Logout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // TODO: clear wallet auth/session storage
    localStorage.clear();
    navigate("/admin/login");
  };

  return (
    <div className="p-4 text-center">
      <h2 className="text-xl font-bold mb-4">Logout</h2>
      <button
        onClick={handleLogout}
        className="bg-red-600 text-white px-6 py-2 rounded"
      >
        Logout Now
      </button>
    </div>
  );
};

export default Logout;
