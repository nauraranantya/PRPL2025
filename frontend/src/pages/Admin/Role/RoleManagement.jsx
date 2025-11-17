import React, { useEffect, useState } from "react";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE = "http://localhost:8000/api";

const RoleManagement = () => {
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [roles, setRoles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // FETCH EVENTS
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get(`${API_BASE}/events`);
        setEvents(res.data.data);
      } catch (err) {
        console.error("Failed to load events", err);
      }
    };
    fetchEvents();
  }, []);

  // FETCH ROLES BASED ON SELECTED EVENT
  useEffect(() => {
    if (!selectedEvent) return;

    const fetchRoles = async () => {
      try {
        const res = await axios.get(`${API_BASE}/roles/${selectedEvent}`);
        setRoles(res.data);
      } catch (err) {
        console.error("Failed to load roles", err);
      }
    };

    fetchRoles();
  }, [selectedEvent]);

  // COUNTERS
  const totalRoles = roles.length;
  const filledRoles = roles.filter((r) => r.assigned_to).length;
  const emptyRoles = totalRoles - filledRoles;

  // SEARCH FILTER
  const filteredRoles = roles.filter((role) => {
    if (!searchTerm.trim()) return true;

    const target = (role.assigned_to || "").toLowerCase();
    return target.includes(searchTerm.toLowerCase());
  });

  // REMOVE ROLE ASSIGNMENT
const removeAssignment = async (participantId) => {
  if (!window.confirm("Hapus penugasan dari peran ini?")) return;

  try {
    await axios.put(`${API_BASE}/participants/${participantId}/unassign-role`);

    setRoles((prev) =>
      prev.map((r) =>
        r.id === participantId ? { ...r, assigned_to: null } : r
      )
    );
  } catch (err) {
    console.error("Failed to unassign", err);
  }
};

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Kelola Peran</h1>

      {/* EVENT SELECTOR + BUTTON */}
      <div className="flex items-center gap-4">
        <select
          className="border p-2 rounded w-60"
          value={selectedEvent}
          onChange={(e) => setSelectedEvent(e.target.value)}
        >
          <option value="">Pilih Acara</option>

          {events.map((event) => (
            <option key={event.id} value={event.id}>
              {event.title}
            </option>
          ))}
        </select>

        <button
          className="px-4 py-2 bg-blue-600 text-white rounded"
          onClick={() => navigate("/admin/peran/tambah")}
        >
          + Peran Baru
        </button>
      </div>

      {/* COUNTERS */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 border rounded shadow text-center">
          <p className="text-gray-600">Total Peran</p>
          <p className="text-2xl font-bold">{totalRoles}</p>
        </div>

        <div className="p-4 border rounded shadow text-center bg-green-100">
          <p className="text-gray-600">Peran Terisi</p>
          <p className="text-2xl font-bold text-green-700">{filledRoles}</p>
        </div>

        <div className="p-4 border rounded shadow text-center bg-red-100">
          <p className="text-gray-600">Peran Kosong</p>
          <p className="text-2xl font-bold text-red-700">{emptyRoles}</p>
        </div>
      </div>

      {/* SEARCH BAR */}
      <input
        type="text"
        className="border p-2 w-full rounded"
        placeholder="Cari nama anggota..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* ROLES */}
      <div className="space-y-4">
        {filteredRoles.map((role) => (
          <div key={role.id} className="border rounded p-4 shadow bg-white">
            {/* HEADER */}
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-semibold">{role.role_name}</h2>
                <p className="text-gray-600">{role.permissions}</p>
              </div>

              <div className="flex items-center gap-3">
                <button onClick={() => navigate(`/admin/peran/edit/${role.id}`)}>
                  <FiEdit2 className="text-blue-600 text-xl" />
                </button>

                <span className="px-3 py-1 bg-gray-200 rounded text-sm font-semibold">
                  {role.assigned_to ? "1/1" : "0/1"}
                </span>
              </div>
            </div>

            <hr className="my-3" />

            <p className="text-gray-500 text-sm">Ditugaskan kepada:</p>

            {role.assigned_to ? (
              <p className="font-medium mt-1">{role.assigned_to}</p>
            ) : (
              <p className="text-gray-400 italic">Belum ditugaskan</p>
            )}

            {/* BUTTONS */}
            <div className="flex gap-3 mt-4">
              <button
                className="w-3/4 bg-yellow-500 text-white py-2 rounded"
                onClick={() =>
                  navigate(`/admin/peran/tugaskan/${role.id}`, {
                    state: { eventId: selectedEvent },
                  })
                }
              >
                Ubah Penugasan
              </button>

              <button
                className="w-1/4 bg-red-600 text-white py-2 rounded flex justify-center"
                onClick={() => removeAssignment(role.assigned_participant_id)}
              >
                <FiTrash2 />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoleManagement;
