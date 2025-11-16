import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar({ user, setUser }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    setUser(null);
    navigate("/");
  };

  return (
    <nav className="flex justify-between items-center py-4 px-6 bg-blue-800 text-white shadow-md">
      {/* Left Section */}
      <div className="text-xl font-bold">
        {user ? (
          <span>Hi, {user.full_name}</span>
        ) : (
          <Link to="/" className="hover:underline">
            MyApp
          </Link>
        )}
      </div>

      {/* Right Section */}
      <div>
        {user ? (
          <>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 transition text-white px-3 py-1 rounded"
            >
              Keluar
            </button>
          </>
        ) : (
          <>
            <Link
              to="/signup"
              className="mr-4 text-white font-semibold hover:underline"
            >
              Daftar
            </Link>
            <Link
              to="/login"
              className="text-white font-semibold hover:underline"
            >
              Masuk
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
