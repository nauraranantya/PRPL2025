// Kelola Peran (Fixed - Final Version)
import React, { useEffect, useState } from "react";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import {
  fetchEvents,
  fetchRoles,
  fetchEventParticipants,
  unassignRole,
} from "../../../api";

export default function RoleManagement() {
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [roles, setRoles] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  // ---------------------------------------------
  // Load events on mount
  // ---------------------------------------------
  useEffect(() => {
    async function load() {
      try {
        const res = await fetchEvents();
        setEvents(res.data ?? []);
      } catch (err) {
        console.error("Failed to load events", err);
      }
    }
    load();
  }, []);

  // ---------------------------------------------
  // Load roles + participants when event changes
  // ---------------------------------------------
  useEffect(() => {
    if (!selectedEvent) {
      setRoles([]);
      setParticipants([]);
      return;
    }

    async function loadEventData() {
      setLoading(true);
      
      try {
        // ---- Load Roles ----
        const rolesRes = await fetchRoles(selectedEvent);
        console.log("Roles Response:", rolesRes);
        
        // The API returns array directly, not wrapped in .data
        const backendRoles = Array.isArray(rolesRes) 
          ? rolesRes 
          : Array.isArray(rolesRes.data) 
          ? rolesRes.data 
          : [];
        
        console.log("Backend Roles:", backendRoles);
        setRoles(backendRoles);

        // ---- Load Participants ----
        const pRes = await fetchEventParticipants(selectedEvent);
        console.log("Participants Response:", pRes);
        
        // Same here - array returned directly
        const backendParticipants = Array.isArray(pRes) 
          ? pRes 
          : Array.isArray(pRes.data) 
          ? pRes.data 
          : [];
        
        console.log("Backend Participants:", backendParticipants);
        setParticipants(backendParticipants);
        
      } catch (err) {
        console.error("Failed to load roles or participants", err);
        setRoles([]);
        setParticipants([]);
      } finally {
        setLoading(false);
      }
    }

    loadEventData();
  }, [selectedEvent]);

  // ---------------------------------------------
  // Merge roles with assigned participant
  // ---------------------------------------------
  const merged = roles.map((role) => {
    const assigned = participants.find((p) => p.role_id === role.id);

    return {
      ...role,
      assigned_to_name: assigned?.user_full_name || null,
      assigned_to_email: assigned?.user_email || null,
      assigned_to_phone: assigned?.user_phone || null,
      assigned_participant_id: assigned?.id || null,
    };
  });

  const filteredRoles = merged.filter((role) => {
    const text = [
      role.assigned_to_name,
      role.assigned_to_email,
      role.assigned_to_phone
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return text.includes(searchTerm.toLowerCase());
  });

  // Counts
  const totalRoles = merged.length;
  const filledRoles = merged.filter((r) => r.assigned_to).length;
  const emptyRoles = totalRoles - filledRoles;

  // ---------------------------------------------
  // Unassign Role
  // ---------------------------------------------
  const removeAssignment = async (participantId) => {
    if (!participantId) {
      alert("Peran ini belum memiliki penugasan.");
      return;
    }

    if (!window.confirm("Hapus penugasan dari peran ini?")) return;

    try {
      await unassignRole(participantId);

      // Refresh participant state
      const pRes = await fetchEventParticipants(selectedEvent);
      const backendParticipants = Array.isArray(pRes) 
        ? pRes 
        : Array.isArray(pRes.data) 
        ? pRes.data 
        : [];
      setParticipants(backendParticipants);
    } catch (err) {
      console.error(err);
      alert("Gagal menghapus penugasan.");
    }
  };

  // ---------------------------------------------
  // UI
  // ---------------------------------------------
  return (
    <div className="p-6 space-y-6">

      <h1 className="text-2xl font-bold">Kelola Peran</h1>

      {/* Event Selector */}
      <div className="flex items-center gap-4">
        <select
          className="border p-2 rounded w-60"
          value={selectedEvent}
          onChange={(e) => setSelectedEvent(e.target.value)}
        >
          <option value="">Pilih Acara</option>
          {events.map((ev) => (
            <option key={ev.id} value={ev.id}>
              {ev.title}
            </option>
          ))}
        </select>

        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={() => navigate("/admin/peran/tambah")}
        >
          + Peran Baru
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <p className="text-gray-600">Memuat data...</p>
        </div>
      )}

      {/* Show content only when event is selected and not loading */}
      {selectedEvent && !loading && (
        <>
          {/* Counters */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 border rounded text-center shadow">
              <p className="text-gray-600">Total Peran</p>
              <p className="text-2xl font-bold">{totalRoles}</p>
            </div>
            <div className="p-4 border rounded text-center bg-green-100 shadow">
              <p className="text-gray-600">Terisi</p>
              <p className="text-2xl font-bold text-green-700">{filledRoles}</p>
            </div>
            <div className="p-4 border rounded text-center bg-red-100 shadow">
              <p className="text-gray-600">Kosong</p>
              <p className="text-2xl font-bold text-red-700">{emptyRoles}</p>
            </div>
          </div>

          {/* Search */}
          <input
            type="text"
            className="border p-2 rounded w-full"
            placeholder="Cari nama…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {/* Role List */}
          {filteredRoles.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {merged.length === 0 
                ? "Belum ada peran untuk acara ini" 
                : "Tidak ada hasil pencarian"}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRoles.map((role) => (
                <div key={role.id} className="p-4 border rounded bg-white shadow">

                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-lg font-semibold">{role.role_name}</h2>
                      <p className="text-gray-600">{role.permissions}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => navigate(`/admin/peran/edit/${role.id}`)}
                        className="hover:bg-gray-100 p-2 rounded"
                      >
                        <FiEdit2 className="text-blue-600 text-xl" />
                      </button>
                      <span className="px-3 py-1 bg-gray-200 rounded text-sm">
                        {role.assigned_to ? "1/1" : "0/1"}
                      </span>
                    </div>
                  </div>

                  <hr className="my-3" />

                  <p className="text-gray-500 text-sm">Ditugaskan kepada:</p>

                  {role.assigned_to_name ? (
                    <div className="mt-1">
                      <p className="font-medium">{role.assigned_to_name}</p>

                      <p className="text-sm text-gray-600">
                        {role.assigned_to_email || "-"}
                      </p>

                      <p className="text-sm text-gray-600">
                        {role.assigned_to_phone || "-"}
                      </p>
                    </div>
                  ) : (
                    <p className="text-gray-400 italic">Belum ditugaskan</p>
                  )}

                  <div className="flex gap-3 mt-4">
                    <button
                      className="w-3/4 bg-yellow-500 text-white py-2 rounded hover:bg-yellow-600"
                      onClick={() =>
                        navigate(`/admin/peran/tugaskan/${role.id}`, {
                          state: { eventId: selectedEvent },
                        })
                      }
                    >
                      Ubah Penugasan
                    </button>

                    <button
                      className="w-1/4 bg-red-600 text-white py-2 rounded flex justify-center items-center hover:bg-red-700"
                      onClick={() => removeAssignment(role.assigned_participant_id)}
                    >
                      <FiTrash2 />
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* No event selected message */}
      {!selectedEvent && !loading && (
        <div className="text-center py-8 text-gray-500">
          Pilih acara untuk melihat peran
        </div>
      )}

    </div>
  );
}