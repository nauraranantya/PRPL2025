import React from "react";

export default function LogoutModal({ onConfirm, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-md w-80">
        <h2 className="text-lg font-bold mb-3">Konfirmasi</h2>
        <p className="text-gray-700 mb-6">Apakah Anda yakin ingin keluar?</p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Batal
          </button>

          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Keluar
          </button>
        </div>
      </div>
    </div>
  );
}
