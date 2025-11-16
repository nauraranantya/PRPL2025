import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createEvent } from "../../../api";

export default function EventCreation() {
  const navigate = useNavigate();

  // Form states
  const [title, setTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [requiresRegistration, setRequiresRegistration] = useState(false);
  const [recurring, setRecurring] = useState(false);
  const [frequency, setFrequency] = useState("");
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const payload = {
      title,
      description,
      location,
      event_date: eventDate,
      requires_registration: requiresRegistration,
      recurrence_pattern: recurring ? frequency.toLowerCase() : null
    };

    try {
      const res = await createEvent(payload);

      if (res.success) {
        navigate("/admin/acara");
      } else {
        setError("Gagal membuat acara");
      }
    } catch (err) {
      setError("Terjadi kesalahan saat menyimpan acara");
    }
  };

  return (
      <div className="min-h-screen bg-gray-100 p-8">
        <h1 className="text-2xl font-bold text-[#043873] mb-6">Buat Acara Baru</h1>

        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-md rounded-lg p-6 space-y-4"
        >
          <div>
            <label className="block font-medium mb-1">Judul / Nama Acara</label>
            <input
              type="text"
              className="w-full border p-2 rounded"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Tanggal dan Waktu</label>
            <input
              type="datetime-local"
              className="w-full border p-2 rounded"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Lokasi</label>
            <input
              type="text"
              className="w-full border p-2 rounded"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Deskripsi</label>
            <textarea
              className="w-full border p-2 rounded"
              rows="4"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
          </div>

          <div>
            <label className="block font-medium mb-1">
              Upload Banner (Opsional)
            </label>
            <input type="file" className="w-full border p-2 rounded" disabled />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="reg"
              checked={requiresRegistration}
              onChange={(e) => setRequiresRegistration(e.target.checked)}
            />
            <label htmlFor="reg" className="text-sm">
              Memerlukan pendaftaran
            </label>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="recurring"
              checked={recurring}
              onChange={(e) => setRecurring(e.target.checked)}
            />
            <label htmlFor="recurring" className="text-sm">
              Acara berulang
            </label>
            <select
              className="border p-2 rounded"
              value={frequency}
              disabled={!recurring}
              onChange={(e) => setFrequency(e.target.value)}
            >
              <option value="">-- Pilih Frekuensi --</option>
              <option>Harian</option>
              <option>Mingguan</option>
              <option>Bulanan</option>
              <option>Tahunan</option>
            </select>
          </div>

          {error && <div className="text-red-600">{error}</div>}

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