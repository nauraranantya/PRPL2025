// src/components/AccountCard.jsx
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
  return (
    <div className="bg-white p-4 rounded-lg shadow flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <div>
          <p className="font-semibold">{user.name}</p>
          <p className="text-sm text-gray-500">{user.phone}</p>
          {user.email && <p className="text-sm text-gray-500">{user.email}</p>}
        </div>

        {showAttendanceButton && (
          <button
            onClick={onToggleAttendance}
            className={`px-4 py-2 rounded-lg font-semibold ${
              hadir
                ? "bg-green-100 text-green-600 border border-green-400"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            {hadir ? "Hadir" : "Tandai Hadir"}
          </button>
        )}
      </div>

      {/* Action buttons under info */}
      <div className="flex items-center gap-3 pt-2 border-t border-gray-200 mt-2">
        {/* Ubah button */}
        <Link
          to={`/admin/akun/edit/${user.id}`}
          className="flex-[2] px-3 py-2 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 text-sm font-medium text-center"
        >
          Ubah
        </Link>

        {/* Delete button */}
        <button
          onClick={onDelete}
          className="flex items-center justify-center w-10 h-10 bg-red-100 text-red-700 rounded hover:bg-red-200"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}
