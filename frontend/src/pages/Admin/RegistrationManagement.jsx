import React, { useEffect, useState } from "react";
import {
  fetchEvents,
  fetchEventParticipants,
  registerParticipantByAdmin,
  deleteParticipant,
} from "../../api";

export default function RegistrationManagement() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState("");

  const [participants, setParticipants] = useState([]);

  // New input fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Load all events
  useEffect(() => {
    async function load() {
      const res = await fetchEvents();
      setEvents(res.data ?? []);
    }
    load();
  }, []);

  // Load participants when event changes
  useEffect(() => {
    if (!selectedEvent) return;
    loadParticipants();
  }, [selectedEvent]);

  async function loadParticipants() {
    const res = await fetchEventParticipants(selectedEvent);
    console.log("Participants data:", res); // Debug log
    setParticipants(res ?? []);
  }

  // Admin registers participant: requires name AND (email OR phone)
  const handleRegister = async () => {
    // Validate: name is required
    if (!name.trim()) {
      return alert("Nama wajib diisi!");
    }

    // Validate: at least email or phone
    if (!email.trim() && !phone.trim()) {
      return alert("Isi minimal Email atau No. Telepon!");
    }

    try {
      await registerParticipantByAdmin(
        selectedEvent,
        name.trim(),
        email.trim() || null,
        phone.trim() || null
      );

      // Reset form
      setName("");
      setEmail("");
      setPhone("");

      await loadParticipants();
      alert("Peserta berhasil didaftarkan!");
    } catch (err) {
      console.error("Registration error:", err);
      alert(err.response?.data?.detail || "Gagal mendaftarkan peserta.");
    }
  };

  const handleRemove = async (id) => {
    if (!window.confirm("Yakin hapus dari daftar?")) return;

    await deleteParticipant(id);
    await loadParticipants();
  };

  return (
    <div className="space-y-6">

      {/* Event Dropdown */}
      <div>
        <label className="font-semibold mb-2 block">Pilih Acara</label>
        <select
          className="border p-2 rounded w-64"
          value={selectedEvent}
          onChange={(e) => setSelectedEvent(e.target.value)}
        >
          <option value="">-- Pilih Acara --</option>
          {events.map((ev) => (
            <option key={ev.id} value={ev.id}>
              {ev.title}
            </option>
          ))}
        </select>
      </div>

      {/* Add Participant */}
      {selectedEvent && (
        <div className="p-4 bg-white shadow rounded">
          <h3 className="font-bold mb-2">Tambah Peserta Baru</h3>

          <p className="text-sm text-gray-600 mb-3">
            <strong>Nama wajib diisi.</strong> Kemudian isi minimal Email atau No. Telepon.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Nama Lengkap *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border p-2 rounded"
              required
            />

            <input
              type="email"
              placeholder="Email (opsional jika ada telepon)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border p-2 rounded"
            />

            <input
              type="text"
              placeholder="No. Telepon (opsional jika ada email)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="border p-2 rounded"
            />
          </div>

          <button
            onClick={handleRegister}
            className="mt-3 bg-blue-600 text-white px-4 py-2 rounded"
          >
            Tambah Peserta
          </button>
        </div>
      )}

      {/* Participant List */}
      {selectedEvent && (
        <div className="space-y-4">
          <h3 className="font-bold text-lg">Peserta Terdaftar</h3>

          {participants.length === 0 && (
            <p className="text-gray-500">Belum ada peserta.</p>
          )}

          {participants.map((p) => (
            <div
              key={p.id}
              className="border rounded p-4 flex justify-between items-center bg-white"
            >
              <div>
                <p><strong>Nama:</strong> {p.user_full_name || "Tidak diketahui"}</p>
                <p><strong>Email:</strong> {p.user_email || "-"}</p>
                <p><strong>Telepon:</strong> {p.user_phone || "-"}</p>
              </div>

              <button
                onClick={() => handleRemove(p.id)}
                className="text-white bg-red-600 px-4 py-1 rounded"
              >
                Hapus
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}