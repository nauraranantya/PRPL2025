import React, { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import { useLocation } from "react-router-dom";
import LogoutModal from "./LogoutModal";

export default function Navbar({ toggleSidebar, admin }) {
  const location = useLocation();
  const path = location.pathname;

  const [ showLogoutModal, setShowLogoutModal ] = useState(false);
  
  const getPageTitle = () => {
    if (path === "/admin" || path === "/admin/dashboard") return "Dashboard";
    if (path.startsWith("/admin/acara/tambah")) return "Buat Acara";
    if (path.startsWith("/admin/edit-acara")) return "Edit Acara";
    if (path.startsWith("/admin/acara")) return "Acara";
    if (path.startsWith("/admin/kehadiran")) return "Kehadiran";
    if (path.startsWith("/admin/peran")) return "Peran";
    if (path.startsWith("/admin/kakun")) return "Kelola Akun";
    if (path.startsWith("/admin/pengumuman")) return "Pengumuman";
    return "Admin Panel";
  };

  return (
    <>
      <nav className="flex justify-between items-center py-4 px-6 bg-blue-800 text-white shadow-md relative z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded hover:bg-blue-700 transition"
          >
            <Menu size={24} />
          </button>

          <h1 className="text-xl font-bold">{getPageTitle()}</h1>
        </div>

        <div className="flex items-center gap-4">
          <span className="font-medium">{admin?.full_name}</span>

          <button
            onClick={() => setShowLogoutModal(true)}
            className="px-4 py-2 rounded text-sm"
          >
            Keluar
          </button>
        </div>
      </nav>

      {showLogoutModal && (
        <LogoutModal
          onConfirm={() => {
            localStorage.removeItem("token");
            window.location.href = "/";
          }}
          onClose={() => setShowLogoutModal(false)}
        />
      )}
    </>
  );
}