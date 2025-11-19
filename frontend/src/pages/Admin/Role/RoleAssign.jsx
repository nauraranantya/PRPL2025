//Tugaskan Peran (Updated to handle both new and edit modes)
import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import {
  fetchEvents,
  fetchRoles,
  fetchEventParticipants,
  assignRole
} from "../../../api"; 

export default function RoleAssign() {
  const navigate = useNavigate();
  const { roleId } = useParams(); // Get roleId from URL if exists
  const location = useLocation();
  const eventIdFromState = location.state?.eventId; // Get eventId from navigation state

  const [events, setEvents] = useState([]);
  const [roles, setRoles] = useState([]);
  const [participants, setParticipants] = useState([]);

  const [selectedEvent, setSelectedEvent] = useState(eventIdFromState || "");
  const [selectedRole, setSelectedRole] = useState(roleId || "");
  const [selectedParticipant, setSelectedParticipant] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Determine if we're in "edit mode" (coming from role management)
  const isEditMode = Boolean(roleId && eventIdFromState);

  // Load events on mount (only if not in edit mode)
  useEffect(() => {
    if (!isEditMode) {
      async function load() {
        try {
          const res = await fetchEvents();
          const eventsData = res.data || res || [];
          setEvents(eventsData);
        } catch (err) {
          console.error("Failed to load events", err);
        }
      }
      load();
    }
  }, [isEditMode]);

  // Load roles when event changes
  useEffect(() => {
    if (selectedEvent) {
      async function load() {
        try {
          const res = await fetchRoles(selectedEvent);
          const rolesData = Array.isArray(res) ? res : res.data || [];
          setRoles(rolesData);
        } catch (err) {
          console.error("Failed to load roles", err);
        }
      }
      load();
    } else {
      setRoles([]);
    }
  }, [selectedEvent]);

  // Load participants when event changes
  useEffect(() => {
    if (selectedEvent) {
      async function load() {
        try {
          const res = await fetchEventParticipants(selectedEvent);
          const participantsData = Array.isArray(res) ? res : res.data || [];
          setParticipants(participantsData);
        } catch (err) {
          console.error("Failed to load participants", err);
        }
      }
      load();
    } else {
      setParticipants([]);
    }
  }, [selectedEvent]);

  // Filter participants based on search
  const filteredParticipants = participants.filter((p) => {
    const name = p.user?.full_name || p.name || "";
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleAssign = async () => {
    setMessage("");

    if (!selectedEvent) return setMessage("Pilih acara wajib diisi.");
    if (!selectedRole) return setMessage("Pilih peran wajib diisi.");
    if (!selectedParticipant) return setMessage("Pilih peserta wajib diisi.");

    if (!window.confirm("Tugaskan peran ini kepada peserta terpilih?")) {
      return;
    }

    try {
      setLoading(true);

      // Call API to assign role
      await assignRole(selectedParticipant, selectedRole);

      setMessage("Peran berhasil ditugaskan!");
      
      // If in edit mode, go back to role management
      if (isEditMode) {
        setTimeout(() => {
          navigate("/admin/peran");
        }, 1500);
      } else {
        // Reset form for new assignment
        setSelectedParticipant("");
        setSearchQuery("");
      }
    } catch (err) {
      console.error(err);
      setMessage("Gagal menugaskan peran: " + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6">

      {/* Back button for edit mode */}
      {isEditMode && (
        <button
          className="text-blue-600 hover:text-blue-800 mb-2"
          onClick={() => navigate("/admin/peran")}
        >
          ← Kembali ke Kelola Peran
        </button>
      )}

      <h2 className="text-2xl font-semibold">
        {isEditMode ? "Ubah Penugasan Peran" : "Tugaskan Peran"}
      </h2>

      {message && (
        <div className={`p-3 rounded ${
          message.includes("berhasil") 
            ? "bg-green-100 text-green-800" 
            : "bg-yellow-100 text-gray-800"
        }`}>
          {message}
        </div>
      )}

      {/* Select Event (hidden in edit mode) */}
      {!isEditMode && (
        <div>
          <label className="block mb-1 font-medium">Pilih Acara *</label>
          <select
            className="w-full p-2 border rounded"
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value)}
          >
            <option value="">-- pilih acara --</option>
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.title || ev.judulAcara}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Select Role (hidden in edit mode) */}
      {!isEditMode && (
        <div>
          <label className="block mb-1 font-medium">Pilih Peran *</label>
          <select
            className="w-full p-2 border rounded"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            disabled={!selectedEvent}
          >
            <option value="">-- pilih peran --</option>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.role_name || r.namaPeran}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Show selected role info in edit mode */}
      {isEditMode && (
        <div className="bg-blue-50 p-4 rounded border border-blue-200">
          <p className="text-sm text-gray-600">Mengubah penugasan untuk peran:</p>
          <p className="font-semibold">
            {roles.find(r => r.id === selectedRole)?.role_name || "Memuat..."}
          </p>
        </div>
      )}

      {/* Search Bar */}
      <div>
        <label className="block mb-1 font-medium">Cari Peserta</label>
        <input
          className="w-full p-2 border rounded"
          type="text"
          placeholder="Cari nama peserta..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Participants List */}
      <div>
        <h3 className="font-semibold mb-3">
          Pilih Peserta ({filteredParticipants.length} peserta tersedia)
        </h3>

        {!selectedEvent && (
          <p className="text-gray-500 italic">Pilih acara terlebih dahulu</p>
        )}

        {selectedEvent && filteredParticipants.length === 0 && (
          <p className="text-gray-500 italic">
            {searchQuery ? "Tidak ada peserta yang cocok" : "Belum ada peserta terdaftar"}
          </p>
        )}

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredParticipants.map((p) => {
            const hasRole = Boolean(p.role_id);
            const name = p.user?.full_name || p.name || "Peserta";
            const phone = p.user?.phone || p.phone || "";
            
            return (
              <label
                key={p.id}
                className={`flex items-center gap-3 p-3 border rounded cursor-pointer hover:bg-gray-50 ${
                  selectedParticipant === p.id ? "bg-blue-50 border-blue-400" : ""
                }`}
              >
                <input
                  type="radio"
                  name="selectedParticipant"
                  value={p.id}
                  checked={selectedParticipant === p.id}
                  onChange={() => setSelectedParticipant(p.id)}
                />
                <div className="flex-1">
                  <div className="font-medium">{name}</div>
                  {phone && <div className="text-sm text-gray-600">{phone}</div>}
                </div>
                {hasRole && (
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                    Sudah memiliki peran
                  </span>
                )}
              </label>
            );
          })}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <button 
          className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
          onClick={() => isEditMode ? navigate("/admin/peran") : window.location.reload()}
        >
          Batal
        </button>

        <button
          className="px-4 py-2 rounded text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          onClick={handleAssign}
          disabled={loading || !selectedEvent || !selectedRole || !selectedParticipant}
        >
          {loading ? "Memproses..." : "Tugaskan Peran"}
        </button>
      </div>

    </div>
  );
}