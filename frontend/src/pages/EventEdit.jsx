import React from "react";
import { Link } from "react-router-dom";

export default function EventEdit() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="mb-6">
        <Link
          to="/kelola-acara"
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
        >
          ← Back to Event Management
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-[#043873] mb-6">Ubah Acara</h1>

      <form className="bg-white shadow-md rounded-lg p-6 space-y-4">
        <div>
          <label className="block font-medium mb-1">Judul / Nama Acara</label>
          <input type="text" className="w-full border p-2 rounded" />
        </div>

        <div>
          <label className="block font-medium mb-1">Tanggal dan Waktu</label>
          <input type="datetime-local" className="w-full border p-2 rounded" />
        </div>

        <div>
          <label className="block font-medium mb-1">Lokasi</label>
          <input type="text" className="w-full border p-2 rounded" />
        </div>

        <div>
          <label className="block font-medium mb-1">Deskripsi</label>
          <textarea className="w-full border p-2 rounded" rows="4"></textarea>
        </div>

        <div className="flex justify-end gap-3">
          <Link
            to="/kelola-acara"
            className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
          >
            Batal
          </Link>
          <button
            type="submit"
            className="bg-[#043873] text-white px-4 py-2 rounded hover:bg-blue-800"
          >
            Perbarui Acara
          </button>
          <button
            type="button"
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Hapus Acara
          </button>
        </div>
      </form>
    </div>
  );
}
