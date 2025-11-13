// src/pages/AdminDashboard.jsx
import React, { useState } from "react";
import {
  Menu,
  X,
  Users,
  CalendarDays,
  BarChart,
  Megaphone,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Sample data
  const stats = [
    { label: "Total Acara", value: 12 },
    { label: "Total Peserta", value: 150 },
    { label: "Panitia Aktif", value: 8 },
    { label: "Acara Mendatang", value: 3 },
  ];

  const upcomingEvents = [
    {
      id: 1,
      title: "Gotong Royong Mingguan",
      date: "2025-11-15",
      location: "Balai Desa",
      participants: "Tidak terbatas",
      status: "Terbuka",
    },
    {
      id: 2,
      title: "Pelatihan UMKM",
      date: "2025-11-20",
      location: "Aula Desa",
      participants: "20 peserta",
      status: "Penuh",
    },
  ];

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 bg-[#043873] text-white w-64 transform transition-transform duration-200 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-blue-800">
          <h1 className="text-xl font-bold">Admin Panel</h1>
          <button className="md:hidden" onClick={toggleSidebar}>
            <X size={24} />
          </button>
        </div>

        <nav className="mt-6 space-y-2 px-4">
          <Link
            to="/"
            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-blue-800"
          >
            <BarChart size={20} /> <span>Dashboard</span>
          </Link>

          <Link
            to="/peserta"
            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-blue-800"
          >
            <Users size={20} /> <span>Peserta</span>
          </Link>

          <Link
            to="/kelola-acara"
            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-blue-800"
          >
            <CalendarDays size={20} /> <span>Kelola Acara</span>
          </Link>

          <Link
            to="/pengumuman"
            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-blue-800"
          >
            <Megaphone size={20} /> <span>Announcements</span>
          </Link>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 md:ml-64">
        {/* Top bar */}
        <header className="flex items-center justify-between bg-white shadow p-4 sticky top-0 z-30">
          <button
            onClick={toggleSidebar}
            className="text-[#043873] p-2 border border-blue-200 rounded-md hover:bg-blue-50 md:hidden"
          >
            <Menu size={24} />
          </button>
          <h2 className="text-2xl font-semibold text-[#043873]">
            Admin Dashboard
          </h2>
        </header>

        <main className="p-6">
          {/* Statistics Section */}
          <section>
            <h3 className="text-xl font-bold text-[#043873] mb-4">Statistika</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="bg-white rounded-xl shadow p-4 border border-gray-100"
                >
                  <p className="text-gray-500 text-sm">{stat.label}</p>
                  <p className="text-2xl font-bold text-[#043873]">
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Upcoming Events */}
          <section className="mt-10">
            <h3 className="text-xl font-bold text-[#043873] mb-4">
              Acara Mendatang
            </h3>
            <div className="flex flex-col gap-4 max-w-3xl">
              {upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  className="bg-white p-4 rounded-lg shadow border border-gray-100 flex justify-between items-center"
                >
                  <div>
                    <h4 className="text-lg font-semibold text-blue-800">
                      {event.title}
                    </h4>
                    <p className="text-sm text-gray-500">
                      📅 {event.date} | 📍 {event.location}
                    </p>
                    <p className="text-sm text-gray-700 mt-1">
                      Peserta: {event.participants}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 text-sm font-medium rounded-full ${
                      event.status === "Terbuka"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {event.status}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
