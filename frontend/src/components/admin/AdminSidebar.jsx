import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Shield,
  ClipboardList,
  Calendar,
  Megaphone,
  UserPlus,
  CheckSquare,
  X,
} from "lucide-react";

export default function Sidebar({ isOpen, toggleSidebar }) {
  const location = useLocation();

  const links = [
    {
      to: "/admin/dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard size={18} />,
    },
    {
      to: "/admin/akun",
      label: "Akun Warga",
      icon: <Users size={18} />,
    },
    {
      to: "/admin/peran",
      label: "Peran",
      icon: <Shield size={18} />,
    },

    // NEW PAGES
    {
      to: "/admin/acara/registrasi",
      label: "Registrasi Acara",
      icon: <UserPlus size={18} />,
    },
    {
      to: "/admin/acara/kehadiran",
      label: "Kehadiran Acara",
      icon: <CheckSquare size={18} />,
    },

    {
      to: "/admin/acara",
      label: "Kelola Acara",
      icon: <Calendar size={18} />,
    },
    {
      to: "/admin/pengumuman",
      label: "Pengumuman",
      icon: <Megaphone size={18} />,
    },
    {
      to: "/admin/laporan",
      label: "Laporan & Analitik",
      icon: <ClipboardList size={18} />,
    },
  ];

  const isRouteActive = (path) => location.pathname.startsWith(path);

  return (
    <aside
      className={`bg-blue-900 text-white w-64 space-y-6 py-7 px-4 fixed inset-y-0 left-0 transform ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } transition duration-300 ease-in-out z-40`}
    >
      <button
        onClick={toggleSidebar}
        className="p-2 text-gray-200 hover:text-white absolute top-4 right-4"
      >
        <X size={20} />
      </button>

      <div className="mt-10">
        <h2 className="text-xl font-bold px-4 mb-4">Menu</h2>

        <nav className="space-y-1">
          {links.map((link) => {
            const active = isRouteActive(link.to);

            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={toggleSidebar}
                className={`flex items-center gap-3 py-2.5 px-4 rounded transition-all duration-200 ${
                  active
                    ? "bg-blue-700 text-white"
                    : "hover:bg-blue-800 text-gray-200"
                }`}
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}