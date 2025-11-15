// src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";

// Public pages
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";

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
import AnnouncementCreate from "./pages/Admin/Announcement/AnnouncementCreate";
import AnnouncementEdit from "./pages/Admin/Announcement/AnnouncementEdit"; 
import AnnouncementManagement from "./pages/Admin/Announcement/AnnouncementManagement";

// Villager
import AnnouncementList from "./pages/Villager/AnnouncementList";

export default function App() {
  return (
    <Routes>
      
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* Admin Routes */}
      <Route path="/admin" element={<AdminLayout />}>

        {/* Default admin landing */}
        <Route index element={<AdminDashboard />} />

        {/* Dashboard */}
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
        <Route path="kehadiran/edit/:id" element={<AccountEdit />} />

        {/* Events */}
        <Route path="kelola-acara" element={<EventManagement />} />
        <Route path="acara/tambah" element={<EventCreation />} />
        <Route path="acara/edit/:id" element={<EventEdit />} />
        
        {/* Announcements */}
        <Route path="pengumuman" element={<AnnouncementManagement />} />
        <Route path="pengumuman/tambah" element={<AnnouncementCreate />} />
        <Route path="pengumuman/edit/:id" element={<AnnouncementEdit />} /> 
      
      </Route>

      {/* Villager Routes */}
      <Route path="/warga/pengumuman" element={<AnnouncementList />} />

    </Routes>
  );
}
