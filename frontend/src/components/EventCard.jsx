// src/components/EventCard.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function EventCard({ event }) {
  // Safely extract poster inside the component
  const poster = event?.media?.length > 0 ? event.media[0].file_url : null;

  return (
    <article className="bg-white border rounded-xl shadow-sm hover:shadow-md transition">
      <div className="flex flex-col sm:flex-row gap-4 p-6">
        {/* Left side - Content */}
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-blue-800">
            {event.title}
          </h3>

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

        {/* Right side - Image */}
        <div className="sm:w-48 sm:flex-shrink-0">
          <img
            src={poster || "/placeholder.jpg"}
            alt={event.title}
            className="w-full h-32 sm:h-full object-cover rounded"
            loading="lazy"
          />
        </div>
      </div>
    </article>
  );
}