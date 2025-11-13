// src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import AdminDashboard from "./pages/AdminDashboard";
import EventManagement from "./pages/EventManagement";
import EventCreation from "./pages/EventCreation";
import EventEdit from "./pages/EventEdit";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<AdminDashboard />} />
      <Route path="/kelola-acara" element={<EventManagement />} />
      <Route path="/buat-acara" element={<EventCreation />} />
      <Route path="/edit-acara/:id" element={<EventEdit />} />
    </Routes>
  );
}
