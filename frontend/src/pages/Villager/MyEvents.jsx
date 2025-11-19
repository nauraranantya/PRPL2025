// src/pages/Villager/MyEvents.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, MapPin, Clock } from "lucide-react";
import { fetchEvents, fetchEventParticipants } from "../../api";

export default function MyEvents({ user }) {
  const [myEvents, setMyEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      loadMyEvents();
    }
  }, [user]);

  async function loadMyEvents() {
    try {
      setLoading(true);
      setError(null);

      // Fetch all events
      const eventsRes = await fetchEvents();
      if (!eventsRes.success) {
        setError("Gagal memuat acara");
        return;
      }

      const allEvents = eventsRes.data || [];

      // For each event, check if user is registered
      const registeredEvents = [];

      for (const event of allEvents) {
        try {
          const participants = await fetchEventParticipants(event.id);
          const isRegistered = participants.some((p) => p.user_id === user.id);

          if (isRegistered) {
            registeredEvents.push(event);
          }
        } catch (err) {
          console.error(`Failed to check participants for event ${event.id}:`, err);
        }
      }

      // Sort by date
      registeredEvents.sort((a, b) => new Date(a.event_date) - new Date(b.event_date));

      setMyEvents(registeredEvents);
    } catch (err) {
      console.error("Failed to load my events:", err);
      setError("Terjadi kesalahan saat memuat data");
    } finally {
      setLoading(false);
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isUpcoming = (dateString) => {
    return new Date(dateString) >= new Date();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-600">Memuat acara Anda...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-[#043873] mb-6">Acara Saya</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {myEvents.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
          <p className="text-gray-500 mb-4">Anda belum terdaftar di acara manapun.</p>
          <Link
            to="/daftar-acara"
            className="inline-block bg-[#043873] text-white px-6 py-2 rounded-lg hover:bg-blue-900 transition-colors"
          >
            Lihat Acara Tersedia
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {myEvents.map((event) => {
            const upcoming = isUpcoming(event.event_date);

            return (
              <Link
                key={event.id}
                to={`/detail-acara/${event.id}`}
                className="block bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow p-5"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      {event.title}
                    </h3>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar size={16} className="flex-shrink-0" />
                        <span>{formatDate(event.event_date)}</span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock size={16} className="flex-shrink-0" />
                        <span>{formatTime(event.event_date)}</span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin size={16} className="flex-shrink-0" />
                        <span>{event.location || "Lokasi tidak tersedia"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ml-4 ${
                      upcoming
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {upcoming ? "Mendatang" : "Selesai"}
                  </span>
                </div>

                {event.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {event.description}
                  </p>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}