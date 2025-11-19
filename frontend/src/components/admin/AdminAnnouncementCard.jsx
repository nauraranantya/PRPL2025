// src/components/admin/AdminAnnouncementCard.jsx
import React from "react";
import { Calendar, FileText, Edit, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

export default function AdminAnnouncementCard({ announcement, onDelete }) {
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Truncate content for preview
  const getContentPreview = (text, maxLength = 150) => {
    if (!text) return "Tidak ada konten";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + "...";
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="mb-3">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          {announcement.title}
        </h3>

        {/* Date */}
        <div className="flex items-center text-sm text-gray-500">
          <Calendar size={16} className="mr-2" />
          <span>{formatDate(announcement.created_at)}</span>
        </div>
      </div>

      {/* Content Preview */}
      <div className="mb-4 pb-4 border-b border-gray-200">
        <div className="flex items-start text-sm text-gray-600">
          <FileText size={16} className="mr-2 mt-0.5 flex-shrink-0" />
          <p className="line-clamp-3">{getContentPreview(announcement.body)}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Link
          to={`/admin/pengumuman/edit/${announcement.id}`}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 transition-colors text-sm font-medium"
        >
          <Edit size={18} />
          Edit
        </Link>

        <button
          onClick={() => onDelete(announcement.id)}
          className="flex items-center justify-center gap-2 px-4 py-2 border border-red-500 text-red-500 rounded-md hover:bg-red-50 transition-colors text-sm font-medium"
        >
          <Trash2 size={18} />
          Hapus
        </button>
      </div>
    </div>
  );
}