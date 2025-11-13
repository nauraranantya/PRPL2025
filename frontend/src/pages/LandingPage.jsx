import { Link } from "react-router-dom";
import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { fetchEvents } from "../api"; 

export default function LandingPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetchEvents();
        if (res.success) {
          const sorted = res.data.sort(
            (a, b) => new Date(a.event_date) - new Date(b.event_date)
          );
          setEvents(sorted);
        }
      } catch (err) {
        console.error("Failed to load events:", err);
      }
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      {/* Upcoming Events Section */}
      <section className="px-8 md:px-20 py-12 bg-gray-50">
        <h2 className="text-3xl font-bold text-[#043873] mb-6">
          Acara Mendatang
        </h2>

        {loading && <p>Memuat acara...</p>}

        {!loading && events.length === 0 && (
          <p className="text-gray-500">Belum ada acara yang terdaftar.</p>
        )}

        <div className="flex flex-col gap-8">
          {!loading &&
            events.map((event) => (
              <div
                key={event.id}
                className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition"
              >
                <h4 className="text-xl font-semibold text-blue-800">
                  {event.title}
                </h4>

                <p className="text-sm text-gray-500 mt-1">
                  📅{" "}
                  {event.event_date
                    ? new Date(event.event_date).toLocaleString()
                    : "Tanggal belum ditentukan"}{" "}
                  | 📍 {event.location || "Lokasi tidak tersedia"}
                </p>

                <p className="text-gray-700 mt-3">
                  {event.description || "Tidak ada deskripsi tersedia"}
                </p>

                <Link
                  to={`/events/${event.id}`}
                  className="inline-block mt-4 text-blue-700 font-semibold hover:underline"
                >
                  Lihat Detail →
                </Link>
              </div>
            ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}