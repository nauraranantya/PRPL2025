import React from "react";
import { Link } from "react-router-dom";

export default function EventCreation() {
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

      <h1 className="text-2xl font-bold text-[#043873] mb-6">Buat Acara Baru</h1>

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

        <div>
          <label className="block font-medium mb-1">Upload Banner (Opsional)</label>
          <input type="file" className="w-full border p-2 rounded" />
        </div>

        <div className="flex items-center gap-2">
          <input type="checkbox" id="reg" />
          <label htmlFor="reg" className="text-sm">Memerlukan pendaftaran</label>
        </div>

        <div className="flex items-center gap-2">
          <input type="checkbox" id="recurring" />
          <label htmlFor="recurring" className="text-sm">Acara berulang</label>
          <select className="border p-2 rounded">
            <option>-- Pilih Frekuensi --</option>
            <option>Harian</option>
            <option>Mingguan</option>
            <option>Bulanan</option>
            <option>Tahunan</option>
          </select>
        </div>

        <button
          type="submit"
          className="bg-[#043873] text-white px-4 py-2 rounded hover:bg-blue-800"
        >
          Simpan Acara
        </button>
      </form>
    </div>
  );
}
