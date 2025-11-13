import { Link } from "react-router-dom";
import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import EventCard from "../components/EventCard";
import { events } from "../data/eventsData";

export default function LandingPage() {
  const sortedEvents = [...events].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />

      {/* Upcoming Events Section */}
      <section className="px-8 md:px-20 py-12 bg-gray-50">
        <h2 className="text-3xl font-bold text-[#043873] mb-6">
        Acara Mendatang
        </h2>

        <div className="flex flex-col gap-8">
          {events.map((event) => (
            <div
              key={event.id}
              className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition"
            >
              <h4 className="text-xl font-semibold text-blue-800">
                {event.title}
              </h4>
              <p className="text-sm text-gray-500 mt-1">
                📅 {event.date} | 📍 {event.location}
              </p>
              <p className="text-gray-700 mt-3">{event.description}</p>
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
