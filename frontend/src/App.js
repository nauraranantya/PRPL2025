// src/App.jsx
import React, {useState, useEffect} from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";

// Public pages
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import EventList from "./pages/EventList";
import EventDetail from "./pages/EventDetail";

// Villager
import VillagerAnnouncement from "./pages/Villager/VillagerAnnouncement";

// Admin Layout
import AdminLayout from "./components/admin/AdminLayout";

// Admin – Dashboard & Accounts
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AccountEdit from "./pages/Admin/AccountEdit";
import VillagersAccount from "./pages/Admin/AccountVillagers";
import Attendance from "./pages/Admin/Attendance";

// Admin – Events
import EventManagement from "./pages/Admin/Event/EventManagement";
import EventCreation from "./pages/Admin/Event/EventCreation";
import EventEdit from "./pages/Admin/Event/EventEdit";

// Admin – Roles
import RoleManagement from "./pages/Admin/Role/RoleManagement";
import RoleCreation from "./pages/Admin/Role/RoleCreation";
import RoleAssign from "./pages/Admin/Role/RoleAssign";
import RoleEdit from "./pages/Admin/Role/RoleEdit";

// Admin – Announcements
import AnnouncementCreation from "./pages/Admin/Announcement/AnnouncementCreation";
import AnnouncementEdit from "./pages/Admin/Announcement/AnnouncementEdit"; 
import AnnouncementManagement from "./pages/Admin/Announcement/AnnouncementManagement";

export default function App() {
  const [user, setUser] = useState(null);
  const location = useLocation();

  // Load saved user
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  // Check if page is inside admin area
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
      <>
      {!isAdminRoute && <Navbar user={user} setUser={setUser} />}

      <Routes>

        {/* ========= PUBLIC ROUTES ========= */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage setUser={setUser}/>} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/daftar-acara" element={<EventList />} />
        <Route path="/detail-acara/:eventId" element={<EventDetail />} />
      
        {/* Villager Routes */}
        <Route path="/pengumuman" element={<VillagerAnnouncement />} />

        {/* ========= ADMIN ROUTES ========= */}
        <Route path="/admin" element={<AdminLayout />}>

          {/* Dashboard */}
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />

          {/* Accounts */}
          <Route path="kelola-akun" element={<VillagersAccount />} />
          <Route path="akun/edit/:id" element={<AccountEdit />} />

          {/* Roles */}
          <Route path="peran" element={<RoleManagement />} />
          <Route path="peran/tambah" element={<RoleCreation />} />
          <Route path="peran/tugaskan" element={<RoleAssign />} />
          <Route path="peran/edit/:roleId" element={<RoleEdit />} />

          {/* Attendance */}
          <Route path="kehadiran" element={<Attendance />} />
          <Route path="kehadiran/edit/:id" element={<Attendance />} />

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