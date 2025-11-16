import React from "react";
import { Link, useNavigate } from "react-router-dom";


export default function Navbar({ user, setUser}) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");

    setUser(null);
    navigate("/");
    window.location.reload();
  };

  return (
    <nav className="flex justify-between items-center py-4 px-6 bg-blue-800 text-white shadow-md">

      {/* LEFT */}
      <div className="text-xl font-bold">
        {user ? (
          <span>Ayo datang ke acara kami, {user.full_name} !</span>
        ) : (
          <Link to="/" className="hover:underline">Acara Desa</Link>
        )}
      </div>

      {/* RIGHT */}
      <div>
        {user ? (
          <button
            onClick={handleLogout}
            className="hover:bg-red-700 px-3 py-1 rounded"
          >
            Keluar
          </button>
        ) : (
          <>
            <Link to="/signup" className="mr-4 font-semibold hover:underline">
              Daftar
            </Link>
            <Link to="/login" className="font-semibold hover:underline">
              Masuk
            </Link>
          </>
        )}
      </div>

    </nav>
  );
}
