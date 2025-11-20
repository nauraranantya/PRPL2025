// Daftar Peran
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../../../api";

const CreateRole = () => {
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [eventId, setEventId] = useState("");
  const [roleName, setRoleName] = useState("");
  const [requiredCount, setRequiredCount] = useState("");
  const [description, setDescription] = useState("");

  // Load upcoming events
  useEffect(() => {
    const loadEvents = async () => {
      try {
        const res = await axios.get(`${API_BASE}/events`, {
          params: { upcoming: true },
        });
        setEvents(res.data.data || []); // safe fallback
      } catch (err) {
        console.error("Failed to load events", err);
      }
    };

    loadEvents();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!eventId || !roleName || !requiredCount) {
      alert("Mohon isi semua field wajib (yang bertanda bintang ✦)");
      return;
    }

    try {
      // Get JWT token from localStorage
      const token = localStorage.getItem("access_token");
      if (!token) {
        alert("Anda harus login terlebih dahulu");
        navigate("/login");
        return;
      }

      // Correct headers object
      const headers = {
        Authorization: `Bearer ${token}`, // JWT for admin
        "x-api-key": process.env.REACT_APP_ADMIN_KEY, // optional admin API key
      };

      await axios.post(
        `${API_BASE}/roles`,
        {
          event_id: eventId,
          role_name: roleName,
          required_count: Number(requiredCount),
          description,
        },
        { headers }
      );

      alert("Peran berhasil dipublikasikan!");
      navigate("/admin/peran");
    } catch (err) {
      console.error("Failed to create role", err);

      if (err.response?.status === 403) {
        alert("Hanya admin yang bisa membuat peran");
      } else if (err.response?.status === 401) {
        alert("Token tidak valid atau telah kadaluarsa. Silakan login ulang.");
        localStorage.clear();
        navigate("/login");
      } else {
        alert("Gagal membuat peran");
      }
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Buat Peran Baru</h1>
      <form className="space-y-5" onSubmit={handleSubmit}>
        {/* EVENT DROPDOWN */}
        <div className="flex flex-col gap-1">
          <label className="font-semibold">
            Pilih Acara <span className="text-red-500">*</span>
          </label>
          <select
            className="border p-3 rounded"
            value={eventId}
            onChange={(e) => setEventId(e.target.value)}
          >
            <option value="">-- Pilih Acara --</option>
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.title}
              </option>
            ))}
          </select>
        </div>

        {/* ROLE NAME */}
        <div className="flex flex-col gap-1">
          <label className="font-semibold">
            Nama Peran <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            className="border p-3 rounded"
            placeholder="Contoh: Dokumentasi, MC, Moderator"
            value={roleName}
            onChange={(e) => setRoleName(e.target.value)}
          />
        </div>

        {/* REQUIRED COUNT */}
        <div className="flex flex-col gap-1">
          <label className="font-semibold">
            Jumlah Diperlukan <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min="1"
            className="border p-3 rounded"
            placeholder="Contoh: 2"
            value={requiredCount}
            onChange={(e) => setRequiredCount(e.target.value)}
          />
        </div>

        {/* DESCRIPTION */}
        <div className="flex flex-col gap-1">
          <label className="font-semibold">Deskripsi Tugas</label>
          <textarea
            className="border p-3 rounded h-32 resize-none"
            placeholder="Tuliskan tugas dan tanggung jawab peran ini..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* BUTTONS */}
        <div className="flex justify-end gap-3 mt-4">
          <button
            type="button"
            onClick={() => navigate("/admin/peran")}
            className="px-4 py-2 border rounded hover:bg-gray-100"
          >
            Batal
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded text-white"
            style={{ backgroundColor: "#4C68D5" }}
          >
            Publikasikan Peran
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateRole;
