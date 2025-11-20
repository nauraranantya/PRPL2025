// Edit Peran (Fixed)
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchEvents, fetchEventRoles, deleteRole } from "../../../api";
import axios from "axios";

const RoleEdit = () => {
  const navigate = useNavigate();
  const { roleId } = useParams();

  const API_BASE = "http://localhost:8000/api";

  const [events, setEvents] = useState([]);
  const [eventId, setEventId] = useState("");
  const [roleName, setRoleName] = useState("");
  const [slotsRequired, setSlotsRequired] = useState(1);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Helper to get headers with token
  const getAuthHeaders = () => {
    const token = localStorage.getItem("access_token");
    const headers = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    if (process.env.REACT_APP_ADMIN_KEY)
      headers["x-api-key"] = process.env.REACT_APP_ADMIN_KEY;
    return headers;
  };

  // Load events + role data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // 1) Load events
        const eventsRes = await fetchEvents();
        const eventsData = eventsRes.data || eventsRes || [];
        setEvents(eventsData);

        // 2) Load role - FIXED ENDPOINT
        const roleRes = await axios.get(`${API_BASE}/roles/${roleId}`, {
          headers: getAuthHeaders(),
        });
        
        console.log("Role data:", roleRes.data);
        const role = roleRes.data;

        setEventId(role.event_id || "");
        setRoleName(role.role_name || "");
        setDescription(role.description || role.permissions || "");
        setSlotsRequired(role.slots_required || 1);
        
      } catch (err) {
        console.error("Load error", err);
        setError("Gagal memuat data peran: " + (err.response?.data?.detail || err.message));
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [roleId]);

  // Update role
  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!eventId || !roleName || !slotsRequired) {
      alert("Mohon isi semua field wajib.");
      return;
    }

    try {
      setLoading(true);
      
      await axios.put(
        `${API_BASE}/roles/${roleId}`,
        {
          event_id: eventId,
          role_name: roleName,
          description: description,
          slots_required: Number(slotsRequired),
        },
        { headers: getAuthHeaders() }
      );

      alert("Peran berhasil diperbarui!");
      navigate("/admin/peran");
      
    } catch (err) {
      console.error("Update gagal", err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        alert("Anda tidak memiliki izin untuk memperbarui peran ini.");
      } else {
        alert("Gagal memperbarui peran: " + (err.response?.data?.detail || err.message));
      }
    } finally {
      setLoading(false);
    }
  };

  // Delete role
  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      "Apakah Anda yakin ingin menghapus peran ini? Tindakan ini tidak dapat dibatalkan."
    );
    if (!confirmDelete) return;

    try {
      setLoading(true);
      
      await deleteRole(roleId);

      alert("Peran berhasil dihapus.");
      navigate("/admin/peran");
      
    } catch (err) {
      console.error("Delete gagal", err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        alert("Anda tidak memiliki izin untuk menghapus peran ini.");
      } else {
        alert("Gagal menghapus peran: " + (err.response?.data?.detail || err.message));
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading && !eventId) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="text-center py-8">
          <p className="text-gray-600">Memuat data peran...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      
      <button
        className="text-blue-600 hover:text-blue-800 mb-2"
        onClick={() => navigate("/admin/peran")}
      >
        ← Kembali ke Kelola Peran
      </button>

      <h1 className="text-2xl font-bold">Edit Peran</h1>

      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <form className="space-y-5" onSubmit={handleUpdate}>
        {/* Event */}
        <div className="flex flex-col gap-1">
          <label className="font-semibold">
            Pilih Acara <span className="text-red-500">*</span>
          </label>
          <select
            className="border p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={eventId}
            onChange={(e) => setEventId(e.target.value)}
            required
          >
            <option value="">-- Pilih Acara --</option>
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.title}
              </option>
            ))}
          </select>
        </div>

        {/* Role Name */}
        <div className="flex flex-col gap-1">
          <label className="font-semibold">
            Nama Peran <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            className="border p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={roleName}
            onChange={(e) => setRoleName(e.target.value)}
            required
          />
        </div>

        {/* Slots Required */}
        <div className="flex flex-col gap-1">
          <label className="font-semibold">
            Slot Diperlukan <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min="1"
            className="border p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={slotsRequired}
            onChange={(e) => setSlotsRequired(Number(e.target.value))}
            required
          />
          <p className="text-sm text-gray-600">
            Jumlah orang yang dibutuhkan untuk peran ini
          </p>
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1">
          <label className="font-semibold">Deskripsi / Tugas</label>
          <textarea
            className="border p-3 rounded h-32 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Jelaskan tugas dan tanggung jawab peran ini..."
          ></textarea>
        </div>

        {/* Buttons */}
        <div className="flex justify-between mt-6 pt-4 border-t">
          <button
            type="button"
            onClick={() => navigate("/admin/peran")}
            className="px-4 py-2 border rounded hover:bg-gray-100"
            disabled={loading}
          >
            Batal
          </button>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-2 rounded text-white bg-red-500 hover:bg-red-600 disabled:bg-gray-400"
              disabled={loading}
            >
              Hapus Peran
            </button>

            <button
              type="submit"
              className="px-4 py-2 rounded text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
              disabled={loading}
            >
              {loading ? "Menyimpan..." : "Perbarui Peran"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default RoleEdit;