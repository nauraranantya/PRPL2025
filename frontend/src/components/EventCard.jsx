// src/components/EventCard.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function EventCard({ event }) {
  // Safely extract poster inside the component
  const poster = event?.media?.length > 0 ? event.media[0].file_url : null;

  return (
    <article className="bg-white p-4 rounded-lg shadow-sm">
      <img
        src={poster || "/placeholder.jpg"}
        alt={event.title}
        className="w-full h-44 object-cover rounded"
        loading="lazy"
      />

      <h3 className="text-lg font-semibold text-blue-800 mt-3">
        {event.title}
      </h3>

      <p className="text-sm text-gray-500 mt-1">
        📅 {new Date(event.event_date).toLocaleString()} | 📍{" "}
        {event.location || "—"}
      </p>

      <p className="text-gray-700 mt-3 line-clamp-3">{event.description}</p>

      <Link
        to={`/daftar-acara/${event.id}`}
        className="inline-block mt-4 text-blue-700 font-semibold hover:underline"
      >
        Lihat Detail →
      </Link>
    </article>
  );
}