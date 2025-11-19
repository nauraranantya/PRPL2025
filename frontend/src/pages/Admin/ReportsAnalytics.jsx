import React, { useEffect, useState } from "react";
import {
  fetchEvents,
  attendanceReport,
  fetchEventParticipants,
  exportAttendanceExcel,
  exportAttendancePDF,
} from "../../api";
import { Calendar, FileSpreadsheet, FileText } from "lucide-react";

export default function ReportsAnalytics() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState("");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [summary, setSummary] = useState({
    totalEvents: 0,
    totalParticipants: 0,
    attendanceRate: 0,
    activeParticipants: 0,
  });

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    const res = await fetchEvents();
    setEvents(res.data ?? []);
  }

  async function applyFilter() {
    if (!selectedEvent || !startDate || !endDate) {
      alert("Pilih acara dan periode terlebih dahulu");
      return;
    }

    // === Fetch Participants ===
    const pRes = await fetchEventParticipants(selectedEvent);
    const participants = pRes.data ?? pRes ?? [];

    // === Fetch Attendance Report ===
    const aRes = await attendanceReport({
      event_id: selectedEvent,
      start_date: startDate,
      end_date: endDate,
    });

    const attendanceRows = aRes.data ?? aRes ?? [];

    const totalParticipants = participants.length;
    const totalPresent = attendanceRows.reduce(
      (sum, r) => sum + r.attended_count,
      0
    );

    const attendanceRate =
      totalParticipants > 0
        ? Math.round((totalPresent / totalParticipants) * 100)
        : 0;

    const activeParticipants = attendanceRows.length;

    setSummary({
      totalEvents: 1,
      totalParticipants,
      attendanceRate,
      activeParticipants,
    });
  }

  const handleExportExcel = () => {
    if (!selectedEvent) return alert("Pilih acara terlebih dahulu");
    exportAttendanceExcel(selectedEvent, startDate, endDate);
  };

  const handleExportPDF = () => {
    if (!selectedEvent) return alert("Pilih acara terlebih dahulu");
    exportAttendancePDF(selectedEvent, startDate, endDate);
  };

  return (
    <div className="space-y-6 p-6">
      <h2 className="text-2xl font-bold">Laporan & Analitik</h2>

      {/* Event Selector */}
      <div className="bg-blue-900 text-white p-4 rounded-lg flex justify-between items-center shadow">
        <div className="text-lg font-semibold">
          {selectedEvent
            ? events.find((ev) => ev.id === selectedEvent)?.title
            : "Pilih Acara"}
        </div>
        <select
          className="p-2 rounded text-black"
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

      {/* Date Filter */}
      <div className="bg-white p-4 rounded-lg shadow space-y-3">
        <h3 className="font-bold text-lg">Periode Laporan</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-gray-600 block">Dari</label>
            <input
              type="date"
              className="border p-2 rounded w-full"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div>
            <label className="text-gray-600 block">Sampai</label>
            <input
              type="date"
              className="border p-2 rounded w-full"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        <button
          onClick={applyFilter}
          className="w-full bg-indigo-600 text-white py-3 rounded-lg mt-3 font-semibold"
        >
          Terapkan Filter
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
        <SummaryCard label="Total Acara" value={summary.totalEvents} />
        <SummaryCard label="Total Peserta" value={summary.totalParticipants} />
        <SummaryCard
          label="Tingkat Kehadiran"
          value={`${summary.attendanceRate}%`}
        />
        <SummaryCard
          label="Peserta Aktif"
          value={summary.activeParticipants}
        />
      </div>

      {/* Report Buttons */}
      <div className="space-y-3 mt-4">
        <ReportButton label="Laporan Kehadiran Lengkap" />
        <ReportButton label="Laporan Partisipasi Per Acara" />
        <ReportButton label="Data Peserta Aktif" />

        <button
          onClick={handleExportExcel}
          className="w-full bg-indigo-700 text-white py-3 rounded-lg font-semibold flex items-center gap-2 justify-center"
        >
          <FileSpreadsheet size={18} /> Export Semua Data (Excel)
        </button>

        <button
          onClick={handleExportPDF}
          className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold flex items-center gap-2 justify-center"
        >
          <FileText size={18} /> Export Semua Data (PDF)
        </button>
      </div>
    </div>
  );
}

function SummaryCard({ label, value }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow text-center">
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-gray-600">{label}</div>
    </div>
  );
}

function ReportButton({ label }) {
  return (
    <button className="w-full bg-white border p-3 rounded-lg shadow flex justify-between">
      <span>{label}</span>
      <Calendar size={18} />
    </button>
  );
}