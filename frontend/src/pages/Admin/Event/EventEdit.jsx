import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { fetchEvent, updateEvent, deleteEvent } from "../../../api";

export default function EventEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  // State fields to be filled with existing values
  const [title, setTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load existing event on mount
  useEffect(() => {
    async function load() {
      try {
        const res = await fetchEvent(id);

        if (res.success) {
          const ev = res.data;

          setTitle(ev.title || "");
          setLocation(ev.location || "");
          setDescription(ev.description || "");

          // Format datetime for input[type=datetime-local]
          if (ev.event_date) {
            const dt = new Date(ev.event_date);
            setEventDate(dt.toISOString().slice(0, 16)); 
          }
        } else {
          setError("Tidak dapat memuat detail acara.");
        }
      } catch (err) {
        setError("Terjadi kesalahan saat mengambil data.");
      }
      setLoading(false);
    }

    load();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      title,
      location,
      description,
      event_date: eventDate ? new Date(eventDate).toISOString() : null,
    };

    try {
      const res = await updateEvent(id, payload);
      if (res.success) {
        navigate("/admin/acara");
      } else {
        alert("Gagal memperbarui acara.");
      }
    } catch (err) {
      alert("Tidak dapat menghubungi server.");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Hapus acara ini?")) return;

    try {
      const res = await deleteEvent(id);
      if (res.success) {
        navigate("/acara");
      } else {
        alert("Gagal menghapus acara.");
      }
    } catch (err) {
      alert("Tidak dapat menghubungi server.");
    }
  };

  if (loading) return <div className="p-8">Memuat data acara...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;

  return (
      <div className="min-h-screen bg-gray-100 p-8">

        <h1 className="text-2xl font-bold text-[#043873] mb-6">Ubah Acara</h1>

        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6 space-y-4">
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

          <div className="flex justify-end gap-3">
            <Link
              to="/admin/acara"
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
              onClick={handleDelete}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Hapus Acara
            </button>
          </div>
        </form>
      </div>
  );
}