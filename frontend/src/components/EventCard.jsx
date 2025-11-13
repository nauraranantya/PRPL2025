import React from "react";
import { Link } from "react-router-dom";

export default function EventCard({ event }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition">
      <h4 className="text-xl font-semibold text-blue-800">{event.title}</h4>
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
  );
}
