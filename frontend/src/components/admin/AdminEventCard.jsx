import React from "react";
import { Calendar, MapPin, Users, Eye, Edit, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

export default function EventCard({ event, onDelete }) {
  // Determine status styles
  const statusStyles = {
    Terbuka: "bg-green-600",
    Penuh: "bg-red-600",
    Selesai: "bg-gray-500",
  };

  return (
    <div className="border rounded-lg p-4 mb-4 shadow-sm bg-white">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold">{event.nama}</h3>

          {/* Date */}
          <div className="flex items-center text-sm text-gray-600 mt-1">
            <Calendar size={16} className="mr-2" />
            {event.tanggal}, {event.jam}
          </div>

          {/* Location */}
          <div className="flex items-center text-sm text-gray-600 mt-1">
            <MapPin size={16} className="mr-2" />
            {event.lokasi}
          </div>

          {/* Participant Count */}
          <div className="flex items-center text-sm text-gray-600 mt-1">
            <Users size={16} className="mr-2" />
            {event.peserta}/{event.kuota} Peserta
          </div>
        </div>

        {/* Status */}
        <span
          className={`text-white text-sm px-3 py-1 rounded-md ${statusStyles[event.status]}`}
        >
          {event.status}
        </span>
      </div>

      {/* Buttons */}
      <div className="flex gap-3 mt-4">
        <Link
          to={`/detail-acara/${event.id}`}
          className="flex items-center gap-2 border px-4 py-2 rounded-md hover:bg-gray-50"
        >
          <Eye size={18} /> Lihat
        </Link>

        <Link
          to={`/admin/acara/edit/${event.id}`}
          className="flex items-center gap-2 bg-indigo-100 px-4 py-2 rounded-md text-indigo-700 hover:bg-indigo-200"
        >
          <Edit size={18} /> Ubah
        </Link>

        <button
          onClick={() => onDelete(event.id)}
          className="flex items-center gap-2 border border-red-500 text-red-500 px-3 py-2 rounded-md hover:bg-red-50"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}
