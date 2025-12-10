import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createEvent, api } from "../../../api";


export default function EventCreation() {
  const navigate = useNavigate();

  const [bannerFiles, setBannerFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Form states
  const [title, setTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [requiresRegistration, setRequiresRegistration] = useState(false);
  const [slotsAvailable, setSlotsAvailable] = useState("");

  // Recurrence
  const [recurring, setRecurring] = useState(false);
  const [frequency, setFrequency] = useState("");
  const [interval, setInterval] = useState(1);
  const [repeatUntil, setRepeatUntil] = useState("");

  const [error, setError] = useState(null);

  const FREQ_MAP = {
    Harian: "daily",
    Mingguan: "weekly",
    Bulanan: "monthly",
    Tahunan: "yearly",
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      // 1) create event
      const payload = {
        title,
        description,
        location,
        event_date: eventDate,
        requires_registration: requiresRegistration,
        slots_available: requiresRegistration ? Number(slotsAvailable) : null,
      };

      const res = await createEvent(payload);
      if (!res.success) {
        setError("Gagal membuat acara.");
        return;
      }
      const eventId = res.data.id;

      // 2) upload banners (if any). upload one-by-one to keep memory down
      if (bannerFiles.length > 0) {
        for (let i = 0; i < bannerFiles.length; i++) {
          const f = bannerFiles[i];
          const form = new FormData();
          form.append("file", f);

          await api.post(
            `/media/${eventId}`,
            form,
            {
              headers: { "Content-Type": "multipart/form-data" },
              onUploadProgress: (progressEvent) => {
                const percent = Math.round(
                  (progressEvent.loaded * 100) / progressEvent.total
                );
                setUploadProgress(percent);
              },
            }
          );
          setUploadProgress(0);
        }
      }

      // 3) recurrence if chosen...
      if (recurring) {
        await api.post("/recurrences", {
          event_id: eventId,
          start_date: eventDate,
          frequency: FREQ_MAP[frequency],
          interval: Number(interval),
          repeat_until: repeatUntil || null,
          active: true,
        });
      }

      navigate("/admin/acara");
    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan saat menyimpan acara.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-2xl font-bold text-[#043873] mb-6">Buat Acara Baru</h1>

      <form className="bg-white shadow-md rounded-lg p-6 space-y-4" onSubmit={handleSubmit}>
        
        {/* Title */}
        <div>
          <label className="block font-medium mb-1">Judul / Nama Acara</label>
          <input className="w-full border p-2 rounded" value={title} onChange={(e)=>setTitle(e.target.value)} required />
        </div>

        {/* Date */}
        <div>
          <label className="block font-medium mb-1">Tanggal dan Waktu</label>
          <input type="datetime-local" className="w-full border p-2 rounded" value={eventDate} onChange={(e)=>setEventDate(e.target.value)} required />
        </div>

        {/* Location */}
        <div>
          <label className="block font-medium mb-1">Lokasi</label>
          <input className="w-full border p-2 rounded" value={location} onChange={(e)=>setLocation(e.target.value)} required />
        </div>

        {/* Description */}
        <div>
          <label className="block font-medium mb-1">Deskripsi</label>
          <textarea className="w-full border p-2 rounded" rows={4} value={description} onChange={(e)=>setDescription(e.target.value)} />
        </div>

        <div>
          <label className="block font-medium mb-1">Upload Banner(s) (opsional)</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => {
              setBannerFiles(Array.from(e.target.files));
            }}
          />
          {bannerFiles.length > 0 && (
            <div className="text-sm mt-2">
              {bannerFiles.length} file(s) selected
            </div>
          )}
        </div>

        {/* Registration toggle */}
        <div className="flex items-center gap-2">
          <input type="checkbox" id="reg" checked={requiresRegistration} onChange={(e)=>setRequiresRegistration(e.target.checked)} />
          <label htmlFor="reg">Memerlukan pendaftaran</label>
        </div>

        {/* Slots */}
        {requiresRegistration && (
          <div>
            <label className="block font-medium mb-1">Jumlah Slot</label>
            <input type="number" min="1" className="w-40 border p-2 rounded" value={slotsAvailable} onChange={(e)=>setSlotsAvailable(e.target.value)} required />
          </div>
        )}

        {/* Recurrence toggle */}
        <div className="flex items-center gap-2">
          <input type="checkbox" id="rec" checked={recurring} onChange={(e)=>setRecurring(e.target.checked)} />
          <label htmlFor="rec">Acara berulang</label>

          <select className="border p-2 rounded" value={frequency} disabled={!recurring} onChange={(e)=>setFrequency(e.target.value)}>
            <option value="">-- Pilih Frekuensi --</option>
            <option>Harian</option>
            <option>Mingguan</option>
            <option>Bulanan</option>
            <option>Tahunan</option>
          </select>
        </div>

        {recurring && (
          <div className="border p-4 bg-gray-50 rounded space-y-4">

            {/* Interval */}
            <div>
              <label className="block font-medium mb-1">Interval</label>
              <input type="number" className="w-20 border p-2 rounded" min={1} value={interval} onChange={(e)=>setInterval(e.target.value)} /> 
              <span className="text-sm text-gray-500 ml-2">
                (1 = setiap minggu, 2 = dua minggu sekali)
              </span>
            </div>

            {/* Repeat-until */}
            <div>
              <label className="block font-medium mb-1">Ulangi sampai (opsional)</label>
              <input type="date" className="border p-2 rounded" value={repeatUntil} onChange={(e)=>setRepeatUntil(e.target.value)} />
            </div>
          </div>
        )}

        {error && <p className="text-red-600">{error}</p>}

        <button className="bg-[#043873] text-white px-4 py-2 rounded hover:bg-blue-800">Simpan Acara</button>
      </form>
    </div>
  );
}