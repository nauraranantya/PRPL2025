import React, { useEffect, useState } from "react";
import { fetchEvents, deleteEvent, fetchDashboardStats, fetchEventParticipants } from "../../api";
import EventCard from "../../components/admin/AdminEventCard";

export default function AdminDashboard() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  
  // Statistics state
  const [totalParticipants, setTotalParticipants] = useState(0);
  const [activeRoles, setActiveRoles] = useState(0);
  
  // Event participant counts
  const [eventParticipantCounts, setEventParticipantCounts] = useState({});

  // Load events
  useEffect(() => {
    async function load() {
      try {
        const res = await fetchEvents();
        if (res.success) {
          const sorted = res.data.sort(
            (a, b) => new Date(a.event_date) - new Date(b.event_date)
          );
          setEvents(sorted);
          
          // Load participant counts for upcoming events
          const upcoming = sorted.filter(
            (e) => new Date(e.event_date) >= new Date()
          );
          loadParticipantCounts(upcoming.slice(0, 3));
        }
      } catch (err) {
        console.error("Failed to load events:", err);
      }
      setLoading(false);
    }
    load();
  }, []);

  // Load dashboard statistics
  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetchDashboardStats();
        if (res.success) {
          setTotalParticipants(res.data.total_participants);
          setActiveRoles(res.data.active_roles);
        }
      } catch (err) {
        console.error("Failed to load stats:", err);
      }
      setStatsLoading(false);
    }
    loadStats();
  }, []);

  // Load participant counts for specific events
  const loadParticipantCounts = async (eventsList) => {
    const counts = {};
    
    for (const event of eventsList) {
      try {
        const count = await fetchEventParticipants(eventId).length;
        counts[event.id] = count;
      } catch (err) {
        console.error(`Failed to load participants for event ${event.id}:`, err);
        counts[event.id] = 0;
      }
    }
    
    setEventParticipantCounts(counts);
  };

  // Delete handler
  const handleDelete = async (id) => {
    if (!window.confirm("Hapus acara ini?")) return;

    try {
      const res = await deleteEvent(id);
      if (res.success) {
        setEvents((prev) => prev.filter((e) => e.id !== id));
        
        // Reload stats after deletion
        const statsRes = await fetchDashboardStats();
        if (statsRes.success) {
          setTotalParticipants(statsRes.data.total_participants);
          setActiveRoles(statsRes.data.active_roles);
        }
      } else {
        alert("Gagal menghapus acara.");
      }
    } catch (err) {
      alert("Gagal menghubungi server.");
    }
  };

  // Derived data for statistics
  const totalEvents = events.length;
  const upcomingEvents = events.filter(
    (e) => new Date(e.event_date) >= new Date()
  );
  const upcomingCount = upcomingEvents.length;
  const topUpcoming = upcomingEvents.slice(0, 3);

  return (
    <div className="p-6">
      {/* ===== Dashboard Statistics ===== */}
      <section>
        <h3 className="text-xl font-bold text-[#043873] mb-4">Statistik</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { 
              label: "Total Acara", 
              value: totalEvents,
              loading: loading 
            },
            { 
              label: "Total Peserta", 
              value: totalParticipants,
              loading: statsLoading 
            },
            { 
              label: "Panitia Aktif", 
              value: activeRoles,
              loading: statsLoading 
            },
            { 
              label: "Acara Mendatang", 
              value: upcomingCount,
              loading: loading 
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-xl shadow p-4 border border-gray-100"
            >
              <p className="text-gray-500 text-sm">{stat.label}</p>
              {stat.loading ? (
                <div className="h-8 bg-gray-200 rounded animate-pulse mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-[#043873]">{stat.value}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ===== Upcoming Events ===== */}
      <section className="mt-10">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-[#043873]">
            Acara Mendatang
          </h3>

          {/* View all events */}
          <a
            href="/admin/acara"
            className="text-blue-600 hover:underline text-sm font-medium"
          >
            Lihat Semua Acara →
          </a>
        </div>

        {loading && <p className="text-gray-500">Memuat acara...</p>}

        {!loading && (
          <div className="flex flex-col gap-4 max-w-3xl">
            {topUpcoming.length > 0 ? (
              topUpcoming.map((event) => (
                <EventCard 
                  key={event.id} 
                  event={event}
                  participantCount={eventParticipantCounts[event.id]}
                  onDelete={handleDelete}
                />
              ))
            ) : (
              <p className="text-gray-500">Tidak ada acara mendatang.</p>
            )}
          </div>
        )}
      </section>
    </div>
  );
}