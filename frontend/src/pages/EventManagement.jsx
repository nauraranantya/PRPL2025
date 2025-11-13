import React from "react";
import { Link } from "react-router-dom";

export default function EventManagement() {
  const events = [
    { id: 1, title: "Gotong Royong", date: "2025-11-15", location: "Balai Desa" },
    { id: 2, title: "Pelatihan UMKM", date: "2025-11-20", location: "Aula Desa" },
  ];

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

      {/* Event list */}
      <div className="space-y-4">
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
                {event.date} • {event.location}
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                to={`/edit-acara/${event.id}`}
                className="px-3 py-1 bg-yellow-400 text-white rounded hover:bg-yellow-500"
              >
                Ubah
              </Link>
              <button className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">
                Hapus
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
