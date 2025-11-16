import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { fetchEvents } from "../api";
import { FiSearch } from "react-icons/fi";
import { Link } from "react-router-dom";

export default function EventList() {
  const [events, setEvents] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [query, setQuery] = useState("");
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
          setFiltered(sorted);
        }
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    }
    load();
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setFiltered(events);
      return;
    }

    const q = query.toLowerCase();
    setFiltered(events.filter((e) => e.title.toLowerCase().includes(q)));
  }, [query, events]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">

      <div className="px-8 md:px-20 mt-8">
        <h1 className="text-3xl font-bold text-[#043873]">Daftar Acara</h1>

        <div className="mt-4 flex items-center gap-2 border rounded-lg p-3 bg-white">
          <FiSearch size={20} />
          <input
            type="text"
            placeholder="Cari acara…"
            className="w-full outline-none"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <section className="px-8 md:px-20 mt-8 pb-16">
        {loading && <p>Memuat acara...</p>}

        {!loading && filtered.length === 0 && (
          <p className="text-gray-500 mt-4">Tidak ada acara ditemukan.</p>
        )}

        <div className="flex flex-col gap-8">
          {!loading &&
            filtered.map((event) => (
              <div
                key={event.id}
                className="bg-white border rounded-xl p-6 shadow-sm hover:shadow-md transition"
              >
                <h4 className="text-xl font-semibold text-blue-800">{event.title}</h4>

                <p className="text-sm text-gray-500 mt-1">
                  📅 {new Date(event.event_date).toLocaleString()} | 📍{" "}
                  {event.location || "Lokasi tidak tersedia"}
                </p>

                <p className="text-gray-700 mt-3 line-clamp-3">{event.description}</p>

                <Link
                  to={`/detail-acara/${event.id}`}
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
