// src/pages/LandingPage.jsx
import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Hero from "../components/Hero";
import EventCard from "../components/EventCard";
import { fetchEvents } from "../api";
import { Link } from "react-router-dom";

export default function LandingPage() {
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);

  // Static hero images from assets
  const heroImages = [
    "/assets/hero1.jpg",
    "/assets/hero2.jpg",
    "/assets/hero3.jpg",
  ];

  useEffect(() => {
    async function loadEvents() {
      try {
        const res = await fetchEvents({ upcoming: true });
        if (res.success) {
          const validEvents = res.data
            .filter((e) => !e.is_cancelled)
            .sort((a, b) => new Date(a.event_date) - new Date(b.event_date));
          setUpcoming(validEvents.slice(0, 3)); // top 3
        }
      } catch (err) {
        console.error("Failed to fetch events:", err);
      }
      setLoading(false);
    }

    loadEvents();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Hero images={heroImages} />

      {/* Upcoming Events */}
      <section className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-[#043873]">Acara Mendatang</h2>
          <Link to="/daftar-acara" className="text-blue-600 hover:underline">
            Semua
          </Link>
        </div>

        {loading ? (
          <p className="mt-4">Memuat acara...</p>
        ) : upcoming.length === 0 ? (
          <p className="mt-4 text-gray-500">Tidak ada acara mendatang.</p>
        ) : (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            {upcoming.map((ev) => (
              <EventCard key={ev.id} event={ev} />
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
