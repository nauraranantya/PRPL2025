// src/components/admin/AccountCard.jsx
import React from "react";
import { Link } from "react-router-dom";
import { Trash2 } from "lucide-react";

export default function AccountCard({
  user,
  editPath,
  showAttendanceButton = false,
  hadir,
  onToggleAttendance,
  onDelete,
}) {
  // Build edit path with return URL
  const defaultEditPath = `/admin/akun/edit/${user.id}?returnTo=${encodeURIComponent(window.location.pathname)}`;
  const finalEditPath = editPath || defaultEditPath;

  return (
    <div className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          {/* User Name - Prominent */}
          <h3 className="text-lg font-semibold text-gray-800 mb-1">
            {user.full_name || user.name || "Tanpa Nama"}
          </h3>
          
          {/* Contact Info */}
          <div className="space-y-1">
            {user.phone && (
              <p className="text-sm text-gray-600">📱 {user.phone}</p>
            )}
            {user.email && (
              <p className="text-sm text-gray-600">✉️ {user.email}</p>
            )}
            {!user.phone && !user.email && (
              <p className="text-sm text-gray-400 italic">Tidak ada kontak</p>
            )}
          </div>
        </div>

        {showAttendanceButton && (
          <button
            onClick={onToggleAttendance}
            className={`px-4 py-2 rounded-lg font-semibold ml-4 ${
              hadir
                ? "bg-green-100 text-green-600 border border-green-400"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            {hadir ? "Hadir" : "Tandai Hadir"}
          </button>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-3 pt-3 border-t border-gray-200">
        {/* Ubah button */}
        <Link
          to={finalEditPath}
          className="flex-1 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-md hover:bg-yellow-200 text-sm font-medium text-center transition-colors"
        >
          Ubah
        </Link>

        {/* Delete button */}
        <button
          onClick={onDelete}
          className="flex items-center justify-center w-10 h-10 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
          title="Hapus akun"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}