import React, { useState, useEffect } from "react";
import {
  fetchEvents,
  fetchEventRoles,
  fetchEventParticipants,
  fetchAllUsers,
  assignRole,
  unassignRole
} from "../../../api";

export default function RoleEditAssign() {
  const [events, setEvents] = useState([]);
  const [roles, setRoles] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [allUsers, setAllUsers] = useState([]);

  const [selectedEvent, setSelectedEvent] = useState("");
  const [selectedRole, setSelectedRole] = useState("");

  const [searchQuery, setSearchQuery] = useState("");

  const [selectedUser, setSelectedUser] = useState("");
  const [manualUser, setManualUser] = useState("");
  const [manualPhone, setManualPhone] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchEvents().then(setEvents);
    fetchAllUsers().then(setAllUsers);
  }, []);

  useEffect(() => {
    if (selectedEvent) {
      fetchEventRoles(selectedEvent).then(setRoles);
    } else {
      setRoles([]);
      setAssignments([]);
    }
  }, [selectedEvent]);

  useEffect(() => {
    if (selectedEvent && selectedRole) {
      fetchEventParticipants(selectedEvent, selectedRole).then(setAssignments);
    } else {
      setAssignments([]);
    }
  }, [selectedRole]);

  const filteredAssignments = assignments.filter((p) =>
    p.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const findUserByPhone = () => {
    const found = allUsers.find((u) => u.phone === manualPhone);
    if (found) {
      setManualUser(found.id);
      setMessage(`User ditemukan: ${found.name}`);
    } else {
      setManualUser("");
      setMessage("Nomor tidak ditemukan.");
    }
  };

  const handleReassign = async () => {
    setMessage("");

    if (!selectedEvent) return setMessage("Pilih acara wajib diisi.");
    if (!selectedRole) return setMessage("Pilih peran wajib diisi.");

    const chosenUser = selectedUser || manualUser;
    if (!chosenUser) {
      return setMessage("Pilih peserta baru atau masukkan manual.");
    }

    try {
      setLoading(true);

      await assignRole(selectedRole, {
        pengguna_id: chosenUser,
        acara_id: selectedEvent
      });

      setMessage("Penugasan berhasil diperbarui!");

      fetchEventParticipants(selectedEvent, selectedRole).then(setAssignments);

      setSelectedUser("");
      setManualUser("");
      setManualPhone("");
    } catch (err) {
      console.error(err);
      setMessage("Gagal memperbarui penugasan.");
    } finally {
      setLoading(false);
    }
  };

  const handleUnassign = async (participantId) => {
    try {
      await unassignRole(participantId);
      setMessage("Penugasan dihapus.");

      fetchEventParticipants(selectedEvent, selectedRole).then(setAssignments);
    } catch (err) {
      console.error(err);
      setMessage("Gagal menghapus penugasan.");
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-8">
      <h2 className="text-2xl font-semibold">Edit Penugasan Peran</h2>

      {message && (
        <div className="p-3 rounded bg-yellow-100 text-gray-800">{message}</div>
      )}

      {/* Select Event */}
      <div>
        <label className="block mb-1 font-medium">Pilih Acara *</label>
        <select
          className="w-full p-2 border rounded"
          value={selectedEvent}
          onChange={(e) => setSelectedEvent(e.target.value)}
        >
          <option value="">-- pilih acara --</option>
          {events.map((ev) => (
            <option key={ev.id} value={ev.id}>
              {ev.judulAcara}
            </option>
          ))}
        </select>
      </div>

      {/* Select Role */}
      <div>
        <label className="block mb-1 font-medium">Pilih Peran *</label>
        <select
          className="w-full p-2 border rounded"
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
        >
          <option value="">-- pilih peran --</option>
          {roles.map((r) => (
            <option key={r.id} value={r.id}>
              {r.namaPeran}
            </option>
          ))}
        </select>
      </div>

      {/* Existing Assignments */}
      <div>
        <h3 className="font-semibold mb-2">Peserta yang sudah ditugaskan:</h3>

        {filteredAssignments.length === 0 ? (
          <p className="text-gray-500">Tidak ada penugasan untuk peran ini.</p>
        ) : (
          <div className="space-y-2">
            {filteredAssignments.map((p) => (
              <div
                key={p.id}
                className="flex justify-between items-center p-3 border rounded"
              >
                <span>
                  {p.name} ({p.phone})
                </span>
                <button
                  className="px-3 py-1 bg-red-500 text-white rounded"
                  onClick={() => handleUnassign(p.participantId)}
                >
                  Hapus
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Search Bar */}
      <div>
        <label className="block mb-1 font-medium">Cari nama peserta baru</label>
        <input
          className="w-full p-2 border rounded"
          type="text"
          placeholder="Cari peserta..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Manual or Registered */}
      <div>
        <h3 className="font-semibold mb-2">Pilih peserta baru:</h3>

        <select
          className="w-full p-2 border rounded"
          value={selectedUser}
          onChange={(e) => {
            setSelectedUser(e.target.value);
            setManualUser("");
          }}
        >
          <option value="">-- pilih peserta --</option>
          {allUsers.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name} ({u.phone})
            </option>
          ))}
        </select>

        <div className="mt-4">
          <label className="block mb-1 font-medium">Cari nomor telepon:</label>
          <div className="flex gap-2">
            <input
              type="text"
              className="w-full p-2 border rounded"
              placeholder="0812..."
              value={manualPhone}
              onChange={(e) => setManualPhone(e.target.value)}
            />

            <button className="px-3 py-2 bg-gray-300 rounded" onClick={findUserByPhone}>
              Cari
            </button>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-3 pt-4">
        <button className="px-4 py-2 rounded bg-gray-300">Batal</button>

        <button
          className="px-4 py-2 rounded text-white"
          style={{ backgroundColor: "#4C68D5" }}
          onClick={handleReassign}
          disabled={loading}
        >
          {loading ? "Memproses..." : "Perbarui Penugasan"}
        </button>
      </div>
    </div>
  );
}
