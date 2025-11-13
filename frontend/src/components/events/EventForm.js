import React, { useState } from "react";
import { API_BASE } from "../../api";

export default function EventForm({ onEventCreated }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    event_date: "",
    location: "",
  });
  const [message, setMessage] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...form,
      event_date: new Date(form.event_date).toISOString(),
    };

    const res = await fetch(`${API_BASE}/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": "some-super-secret-admin-api-key",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (res.ok) {
      setMessage("Acara telah dipublikasikan!");
      setForm({ title: "", description: "", event_date: "", location: "" });
      if (typeof onEventCreated === "function") onEventCreated();
    } else {
      setMessage(`Error: ${JSON.stringify(data.detail)}`);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white shadow-lg rounded-2xl p-6 mt-8">
      <h2 className="text-2xl font-bold text-gray-700 mb-4 flex items-center gap-2">
        Buat Acara Baru
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-600 font-semibold mb-1">
            Judul Acara
          </label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Contoh: Gotong Royong"
          />
        </div>

        <div>
            <label className="block text-gray-600 font-semibold mb-1">
                Tanggal & Waktu
            </label>
            <input
                type="datetime-local"
                name="event_date"
                value={form.event_date}
                onChange={handleChange}
                required
                min={new Date().toISOString().slice(0, 16)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
        </div>

        <div>
          <label className="block text-gray-600 font-semibold mb-1">
            Lokasi
          </label>
          <input
            name="location"
            value={form.location}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Contoh: Balai Desa"
          />
        </div>

        <div>
          <label className="block text-gray-600 font-semibold mb-1">
            Deskripsi
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            required
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Jelaskan detail acara..."
          />
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button
            type="button"
            onClick={() =>
              setForm({ title: "", description: "", event_date: "", location: "" })
            }
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
          >
            Batal
          </button>
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
          >
            Publikasikan Acara
          </button>
        </div>
      </form>
    </div>
  );
}