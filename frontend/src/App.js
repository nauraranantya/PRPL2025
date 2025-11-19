// src/App.jsx
import React, { useState, useEffect } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";

// Public pages
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import EventList from "./pages/EventList";
import EventDetail from "./pages/EventDetail";

// Villager
import MyEvents from "./pages/Villager/MyEvents";
import VillagerProfile from "./pages/Villager/VillagerProfile";
import VillagerAnnouncement from "./pages/Villager/VillagerAnnouncement";

// Admin Layout
import AdminLayout from "./components/admin/AdminLayout";

// Admin – Dashboard 
import AdminDashboard from "./pages/Admin/AdminDashboard";

import RegistrationManagement from "./pages/Admin/RegistrationManagement";
import AttendanceManagement from "./pages/Admin/Attendance";
import ReportsAnalytics from "./pages/Admin/ReportsAnalytics";

// Admin – Accounts
import VillagersAccount from "./pages/Admin/Account/AccountVillagers";
import AccountEdit from "./pages/Admin/Account/AccountEdit";

// Admin – Events
import EventManagement from "./pages/Admin/Event/EventManagement";
import EventCreation from "./pages/Admin/Event/EventCreation";
import EventEdit from "./pages/Admin/Event/EventEdit";

// Admin – Roles
import RoleManagement from "./pages/Admin/Role/RoleManagement";
import RoleCreation from "./pages/Admin/Role/RoleCreation";
import RoleEdit from "./pages/Admin/Role/RoleEdit";
import RoleAssign from "./pages/Admin/Role/RoleAssign";

// Admin – Announcements
import AnnouncementCreation from "./pages/Admin/Announcement/AnnouncementCreation";
import AnnouncementEdit from "./pages/Admin/Announcement/AnnouncementEdit";
import AnnouncementManagement from "./pages/Admin/Announcement/AnnouncementManagement";

// Protected Route Component for Villagers
function ProtectedVillagerRoute({ user, children }) {
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (user.is_admin) {
    return <Navigate to="/admin" replace />;
  }
  return children;
}

export default function App() {
  const [user, setUser] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const savedUser = sessionStorage.getItem("user");

    if (savedUser) {
      setUser(JSON.parse(savedUser));
    } else {
      setUser(null);
    }
  }, []);

  // Check if page is inside admin area
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <>
      {/* Show Navbar for all pages EXCEPT admin pages */}
      {!isAdminRoute && <Navbar user={user} setUser={setUser} />}

      <Routes>
        {/* ========= PUBLIC ROUTES ========= */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage setUser={setUser} />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/daftar-acara" element={<EventList />} />
        <Route path="/detail-acara/:eventId" element={<EventDetail user={user} />} />
        <Route path="/pengumuman" element={<VillagerAnnouncement />} />

        {/* ========= VILLAGER ROUTES ========= */}
        <Route
          path="/profil"
          element={
            <ProtectedVillagerRoute user={user}>
              <VillagerProfile user={user} setUser={setUser} />
            </ProtectedVillagerRoute>
          }
        />

        <Route
          path="/acara-saya"
          element={
            <ProtectedVillagerRoute user={user}>
              <MyEvents user={user} />
            </ProtectedVillagerRoute>
          }
        />

        {/* ========= ADMIN ROUTES ========= */}
        <Route path="/admin" element={<AdminLayout />}>
          {/* Dashboard */}
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />

          {/* Accounts */}
          <Route path="akun" element={<VillagersAccount />} />
          <Route path="akun/edit/:id" element={<AccountEdit />} />

          {/* Roles */}
          <Route path="peran" element={<RoleManagement />} />
          <Route path="peran/tambah" element={<RoleCreation />} />
          <Route path="peran/edit/:roleId" element={<RoleEdit />} />
          <Route path="peran/tugaskan/:roleId" element={<RoleAssign />} />

          {/* registration */}
          <Route path="acara/registrasi" element={<RegistrationManagement />} />
          <Route path="acara/registrasi/:eventId" element={<RegistrationManagement />} />

          {/* === NEW: ATTENDANCE MANAGEMENT === */}
          <Route path="acara/kehadiran" element={<AttendanceManagement />} />
          <Route path="acara/kehadiran/:eventId" element={<AttendanceManagement />} />

          {/* reports & analytics */}
          <Route path="laporan" element={<ReportsAnalytics />} />
          <Route path="laporan/:eventId" element={<ReportsAnalytics />} />

          {/* Events */}
          <Route path="acara" element={<EventManagement />} />
          <Route path="acara/tambah" element={<EventCreation />} />
          <Route path="acara/edit/:id" element={<EventEdit />} />

          {/* Announcements */}
          <Route path="pengumuman" element={<AnnouncementManagement />} />
          <Route path="pengumuman/tambah" element={<AnnouncementCreation />} />
          <Route path="pengumuman/edit/:id" element={<AnnouncementEdit />} />
        </Route>
      </Routes>
    </>
  );
}