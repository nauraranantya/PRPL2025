import React from "react";
import { Calendar, MapPin, Users, Eye, Edit, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

export default function EventCard({ event, participantCount, onDelete }) {
  // Format date and time
  const formattedDate = new Date(event.event_date).toLocaleDateString("id-ID");
  const formattedTime = new Date(event.event_date).toLocaleTimeString("id-ID", { 
    hour: "2-digit", 
    minute: "2-digit" 
  });

  // Determine status
  const isLoadingCount = participantCount === undefined;
  const maxParticipants = event.max_participants;
  const isFull = maxParticipants && participantCount >= maxParticipants;
  const status = isFull ? "Penuh" : "Terbuka";

  // Status styles
  const statusStyles = {
    Terbuka: "bg-green-600",
    Penuh: "bg-red-600",
    Selesai: "bg-gray-500",
  };

  // Format participant display
  const formatParticipantCount = () => {
    if (isLoadingCount) {
      return <span className="text-gray-400">Memuat...</span>;
    }
    
    // If no quota (unlimited), just show count
    if (!maxParticipants) {
      return `${participantCount} Peserta`;
    }
    
    // Show count/quota
    return `${participantCount}/${maxParticipants} Peserta`;
  };

  return (
    <div className="border rounded-lg p-4 mb-4 shadow-sm bg-white hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-800">{event.title}</h3>

          {/* Date */}
          <div className="flex items-center text-sm text-gray-600 mt-2">
            <Calendar size={16} className="mr-2 flex-shrink-0" />
            <span>{formattedDate}, {formattedTime}</span>
          </div>

          {/* Location */}
          <div className="flex items-center text-sm text-gray-600 mt-1">
            <MapPin size={16} className="mr-2 flex-shrink-0" />
            <span>{event.location || "Lokasi tidak tersedia"}</span>
          </div>

          {/* Participant Count */}
          <div className="flex items-center text-sm text-gray-600 mt-1">
            <Users size={16} className="mr-2 flex-shrink-0" />
            <span>{formatParticipantCount()}</span>
          </div>
        </div>

        {/* Status */}
        <span
          className={`text-white text-xs font-medium px-3 py-1 rounded-full whitespace-nowrap ml-4 ${
            statusStyles[status] || "bg-gray-500"
          }`}
        >
          {status}
        </span>
      </div>

      {/* Buttons */}
      <div className="flex gap-3 mt-4 flex-wrap">
        <Link
          to={`/detail-acara/${event.id}`}
          className="flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors text-gray-700 text-sm"
        >
          <Eye size={18} /> Lihat
        </Link>

        <Link
          to={`/admin/acara/edit/${event.id}`}
          className="flex items-center gap-2 bg-indigo-100 px-4 py-2 rounded-md text-indigo-700 hover:bg-indigo-200 transition-colors text-sm font-medium"
        >
          <Edit size={18} /> Ubah
        </Link>

        <button
          onClick={() => onDelete(event.id)}
          className="flex items-center gap-2 border border-red-500 text-red-500 px-3 py-2 rounded-md hover:bg-red-50 transition-colors text-sm"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}