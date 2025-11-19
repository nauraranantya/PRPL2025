// src/components/Navbar.jsx
import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Calendar, Bell, User, LogOut, ChevronDown, Home } from "lucide-react";

export default function Navbar({ user, setUser }) {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    // Clear storage first
    sessionStorage.clear();
    localStorage.clear();
    
    // IMPORTANT: Clear user state BEFORE navigation
    setUser(null);
    
    // Navigate to home
    navigate("/");
    
    // Force reload to ensure clean state
    window.location.reload();
  };

  return (
    <nav className="bg-blue-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* LEFT - Logo/Brand */}
          <div className="text-xl font-bold">
            <Link to="/" className="hover:text-blue-200 transition-colors">
              Acara Desa
            </Link>
          </div>

          {/* CENTER - Navigation Links (for logged-in users) */}
          {user && !user.is_admin && (
            <div className="hidden md:flex items-center gap-6">
              <Link
                to="/"
                className="flex items-center gap-2 hover:text-blue-200 transition-colors"
              >
                <Home size={18} />
                Beranda
              </Link>
              <Link
                to="/daftar-acara"
                className="flex items-center gap-2 hover:text-blue-200 transition-colors"
              >
                <Calendar size={18} />
                Acara
              </Link>
              <Link
                to="/pengumuman"
                className="flex items-center gap-2 hover:text-blue-200 transition-colors"
              >
                <Bell size={18} />
                Pengumuman
              </Link>
            </div>
          )}

          {/* RIGHT - User Menu or Login/Signup */}
          <div className="flex items-center">
            {user ? (
              // User Dropdown Menu
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <User size={20} />
                  <span className="hidden sm:inline font-medium">
                    {user.full_name}
                  </span>
                  <ChevronDown
                    size={18}
                    className={`transition-transform ${
                      dropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                    {/* User Info */}
                    <div className="px-4 py-2 border-b border-gray-200">
                      <p className="text-sm font-semibold text-gray-800">
                        {user.full_name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {user.email || user.phone}
                      </p>
                    </div>

                    {/* Menu Items - Only for non-admin */}
                    {!user.is_admin && (
                      <>
                        <Link
                          to="/acara-saya"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          <Calendar size={18} />
                          <span>Acara Saya</span>
                        </Link>

                        <Link
                          to="/profil"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          <User size={18} />
                          <span>Profil</span>
                        </Link>

                        <div className="border-t border-gray-200 my-2"></div>
                      </>
                    )}

                    {/* Logout */}
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={18} />
                      <span>Keluar</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // Login/Signup Buttons (public users)
              <div className="flex items-center gap-4">
                <Link
                  to="/signup"
                  className="font-semibold hover:text-blue-200 transition-colors"
                >
                  Daftar
                </Link>
                <Link
                  to="/login"
                  className="bg-white text-blue-800 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                >
                  Masuk
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu - Navigation Links */}
        {user && !user.is_admin && (
          <div className="md:hidden pb-4 flex gap-4 border-t border-blue-700 pt-4">
            <Link
              to="/"
              className="text-sm hover:text-blue-200 transition-colors"
            >
              Beranda
            </Link>
            <Link
              to="/daftar-acara"
              className="text-sm hover:text-blue-200 transition-colors"
            >
              Acara
            </Link>
            <Link
              to="/pengumuman"
              className="text-sm hover:text-blue-200 transition-colors"
            >
              Pengumuman
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}