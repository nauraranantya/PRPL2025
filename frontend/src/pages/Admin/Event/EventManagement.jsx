import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchEvents, deleteEvent, api } from "../../../api";

export default function EventManagement() {
  const [events, setEvents] = useState([]);
  const [recurrences, setRecurrences] = useState({});
  const [loading, setLoading] = useState(true);

  const FREQ_LABELS = {
    daily: "Harian",
    weekly: "Mingguan",
    monthly: "Bulanan",
    yearly: "Tahunan",
  };

  useEffect(() => {
    async function load() {
      try {
        // Load all events
        const res = await fetchEvents();
        if (!res.success) return;

        setEvents(res.data);

        // Load all recurrences
        const r = await api.get("/recurrences");
        if (r.data.success) {
          const map = {};
          r.data.data.forEach((rec) => {
            if (!map[rec.event_id]) map[rec.event_id] = rec;
          });
          setRecurrences(map);
        }

      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    }

    load();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Hapus acara ini?")) return;
    try {
      const res = await deleteEvent(id);
      if (res.success) {
        setEvents(events.filter((e) => e.id !== id));
      }
    } catch (e) {
      alert("Gagal menghubungi server.");
    }
  };

  if (loading) return <div className="p-8">Memuat acara...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#043873]">Kelola Acara</h1>

        <Link
          to="/admin/acara/tambah"
          className="bg-[#043873] text-white px-4 py-2 rounded"
        >
          + Tambah Acara
        </Link>
      </div>

      <div className="space-y-4">
        {events.length === 0 && (
          <p className="text-gray-600">Belum ada acara.</p>
        )}

        {events.map((event) => {
          const isRecurring = recurrences[event.id];
          const recurrenceLabel = isRecurring ? FREQ_LABELS[isRecurring.frequency] : null;

          return (
            <div
              key={event.id}
              className="bg-white shadow rounded-lg p-4 flex justify-between items-center border"
            >
              <div>
                <h2 className="text-lg font-semibold text-[#043873]">
                  {event.title}
                </h2>

                <p className="text-sm text-gray-600">
                  {new Date(event.event_date).toLocaleString()} • {event.location}
                </p>

                {/* Extra details */}
                <div className="mt-1 text-sm text-gray-700 flex gap-4">
                  
                  {/* Slots */}
                  {event.requires_registration && (
                    <span className="text-blue-700">
                      Slots: {event.slots_available}
                    </span>
                  )}

                  {/* Recurrence */}
                  {isRecurring && (
                    <span className="px-2 py-1 rounded bg-green-100 text-green-800 text-xs">
                      {recurrenceLabel}
                    </span>
                  )}

                </div>

              </div>

              {/* Buttons */}
              <div className="flex gap-2">
                <Link
                  to={`/admin/acara/edit/${event.id}`}
                  className="px-3 py-1 rounded bg-yellow-400 text-white hover:bg-yellow-500"
                >
                  Ubah
                </Link>

                <button
                  onClick={() => handleDelete(event.id)}
                  className="px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600"
                >
                  Hapus
                </button>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}