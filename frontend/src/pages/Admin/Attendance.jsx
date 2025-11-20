import React, { useEffect, useState } from "react";
import {
  fetchEvents,
  fetchEventParticipants,
  fetchEventAttendance,
  markAttendance,
  deleteAttendance,
  attendanceReport
} from "../../api";

export default function AttendanceManagement() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState("");

  const [participants, setParticipants] = useState([]);
  const [attendance, setAttendance] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reportRows, setReportRows] = useState([]);

  useEffect(() => {
    async function load() {
      const res = await fetchEvents();
      setEvents(res.data ?? []);
    }
    load();
  }, []);

  useEffect(() => {
    if (!selectedEvent) return;
    loadData();
  }, [selectedEvent]);

  async function loadData() {
    try {
      const pRes = await fetchEventParticipants(selectedEvent);
      console.log("Participants response:", pRes); // Debug log
      
      // Handle both response formats
      setParticipants(pRes.data ?? pRes ?? []);

      const aRes = await fetchEventAttendance(selectedEvent);
      console.log("Attendance response:", aRes); // Debug log
      setAttendance(aRes.data ?? aRes ?? []);
    } catch (error) {
      console.error("Error loading data:", error);
      setParticipants([]);
      setAttendance([]);
    }
  }

  const toggleAttendance = async (participant) => {
    const existing = attendance.find((a) => a.participant_id === participant.id);

    try {
      if (existing) {
        await deleteAttendance(existing.id);
      } else {
        // Pass participant ID and event ID
        await markAttendance(participant.id, selectedEvent);
      }
      await loadData();
    } catch (error) {
      console.error("Error toggling attendance:", error);
      alert(error.response?.data?.detail || "Gagal mengubah status kehadiran");
    }
  };

  const filtered = participants.filter((p) =>
    p.user_full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const generateReport = async () => {
    try {
      const res = await attendanceReport({
        event_id: selectedEvent,
        start_date: startDate || null,
        end_date: endDate || null,
      });
      setReportRows(res.data ?? res ?? []);
    } catch (error) {
      console.error("Error generating report:", error);
      alert("Gagal membuat laporan");
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Manajemen Kehadiran</h2>

      {/* Select Event */}
      <select
        className="border p-2 rounded w-64"
        value={selectedEvent}
        onChange={(e) => setSelectedEvent(e.target.value)}
      >
        <option value="">-- Pilih Acara --</option>
        {events.map((ev) => (
          <option key={ev.id} value={ev.id}>{ev.title}</option>
        ))}
      </select>

      {selectedEvent && (
        <>
          <input
            className="border p-2 rounded w-64"
            placeholder="Cari peserta…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <div className="space-y-4 mt-4">
            {filtered.length === 0 && (
              <p className="text-gray-500">
                {searchTerm ? "Tidak ada peserta yang cocok dengan pencarian" : "Belum ada peserta terdaftar"}
              </p>
            )}

            {filtered.map((p) => {
              const hadir = attendance.some((a) => a.participant_id === p.id);

              return (
                <div
                  key={p.id}
                  className="bg-white border p-3 rounded flex justify-between"
                >
                  <div>
                    <p><strong>{p.user_full_name || "Nama tidak tersedia"}</strong></p>
                    <p className="text-sm text-gray-500">
                      {p.user_email || p.user_phone || p.user_id}
                    </p>
                  </div>

                  <button
                    onClick={() => toggleAttendance(p)}
                    className={`px-4 py-1 rounded text-white ${
                      hadir ? "bg-green-700" : "bg-blue-600"
                    }`}
                  >
                    {hadir ? "Hadir" : "Tandai Hadir"}
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}