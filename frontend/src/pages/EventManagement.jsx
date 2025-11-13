import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchEvents, deleteEvent } from "../api";

export default function EventManagement() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetchEvents();
        if (res.success) {
          setEvents(res.data);
        } else {
          setError("Gagal memuat daftar acara.");
        }
      } catch (err) {
        setError("Tidak dapat mengambil data dari server.");
      }
      setLoading(false);
    }
    load();
  }, []);

  // Handle delete event
  const handleDelete = async (id) => {
    if (!window.confirm("Hapus acara ini?")) return;

    try {
      const res = await deleteEvent(id);
      if (res.success) {
        setEvents(events.filter((e) => e.id !== id));
      } else {
        alert("Gagal menghapus acara.");
      }
    } catch (err) {
      alert("Gagal menghubungi server.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {/* Back Button */}
      <div className="mb-6">
        <Link
          to="/"
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
        >
          ← Back to Dashboard
        </Link>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#043873]">Kelola Acara</h1>
        <Link
          to="/buat-acara"
          className="bg-[#043873] text-white px-4 py-2 rounded hover:bg-blue-800"
        >
          + Tambah Acara
        </Link>
      </div>

      {/* Loading State */}
      {loading && <p>Memuat daftar acara...</p>}

      {/* Error State */}
      {error && <p className="text-red-600">{error}</p>}

      {/* Event list */}
      {!loading && !error && (
        <div className="space-y-4">
          {events.length === 0 && (
            <p className="text-gray-600">Belum ada acara.</p>
          )}

          {events.map((event) => (
            <div
              key={event.id}
              className="bg-white shadow rounded-lg p-4 flex justify-between items-center"
            >
              <div>
                <h2 className="text-lg font-semibold text-[#043873]">
                  {event.title}
                </h2>
                <p className="text-sm text-gray-600">
                  {event.event_date
                    ? new Date(event.event_date).toLocaleString()
                    : "Tidak ada tanggal"}{" "}
                  • {event.location}
                </p>
              </div>

              <div className="flex gap-2">
                <Link
                  to={`/edit-acara/${event.id}`}
                  className="px-3 py-1 bg-yellow-400 text-white rounded hover:bg-yellow-500"
                >
                  Ubah
                </Link>

                <button
                  onClick={() => handleDelete(event.id)}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}