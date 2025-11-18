import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  fetchEvent,
  updateEvent,
  deleteEvent,
  uploadEventMedia,
  deleteEventMedia,
  api,
} from "../../../api";

export default function EventEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Event fields
  const [title, setTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [requiresRegistration, setRequiresRegistration] = useState(false);
  const [slotsAvailable, setSlotsAvailable] = useState("");

  // Media
  const [bannerFiles, setBannerFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [mediaList, setMediaList] = useState([]);

  // Recurrence
  const [recurrence, setRecurrence] = useState(null);
  const [recurringEnabled, setRecurringEnabled] = useState(false);
  const [frequency, setFrequency] = useState("");
  const [interval, setInterval] = useState(1);
  const [repeatUntil, setRepeatUntil] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const FREQ_LABELS = {
    daily: "Harian",
    weekly: "Mingguan",
    monthly: "Bulanan",
    yearly: "Tahunan",
  };

  const FREQ_OPTIONS = {
    Harian: "daily",
    Mingguan: "weekly",
    Bulanan: "monthly",
    Tahunan: "yearly",
  };

  /* -----------------------------------------------------
     LOAD EVENT + RECURRENCE
  ----------------------------------------------------- */
  useEffect(() => {
    async function load() {
      try {
        const res = await fetchEvent(id);
        if (!res.success) {
          setError("Tidak dapat memuat detail acara.");
          return;
        }

        const ev = res.data;

        setTitle(ev.title);
        setLocation(ev.location);
        setDescription(ev.description);
        setRequiresRegistration(ev.requires_registration);
        setSlotsAvailable(ev.slots_available || "");

        // Set media list
        setMediaList(ev.media || []);

        // Format datetime-local
        if (ev.event_date) {
          const dt = new Date(ev.event_date);
          setEventDate(dt.toISOString().slice(0, 16));
        }

        // Recurrence
        const r = await api.get(`/recurrences?event_id=${id}`);
        if (r.data.success && r.data.data.length > 0) {
          const rec = r.data.data[0];
          setRecurrence(rec);
          setRecurringEnabled(true);

          setFrequency(FREQ_LABELS[rec.frequency] || "");
          setInterval(rec.interval);
          setRepeatUntil(rec.repeat_until ? rec.repeat_until.slice(0, 10) : "");
        }
      } catch (err) {
        console.error(err);
        setError("Terjadi kesalahan saat mengambil data.");
      }

      setLoading(false);
    }

    load();
  }, [id]);

  /* -----------------------------------------------------
     SAVE EVENT
  ----------------------------------------------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      title,
      location,
      description,
      event_date: eventDate ? new Date(eventDate).toISOString() : null,
      requires_registration: requiresRegistration,
      slots_available: requiresRegistration ? Number(slotsAvailable) : null,
    };

    try {
      const res = await updateEvent(id, payload);

      if (!res.success) {
        alert("Gagal memperbarui acara.");
        return;
      }

      // === Recurrence update ===
      if (recurringEnabled) {
        const rPayload = {
          frequency: FREQ_OPTIONS[frequency],
          interval: Number(interval),
          repeat_until: repeatUntil || null,
          active: true,
        };

        if (recurrence) {
          await api.put(`/recurrences/${recurrence.id}`, rPayload);
        } else {
          await api.post("/recurrences", {
            event_id: id,
            start_date: eventDate,
            ...rPayload,
          });
        }
      } else {
        if (recurrence) {
          await api.put(`/recurrences/${recurrence.id}`, { active: false });
        }
      }

      navigate("/admin/acara");
    } catch (err) {
      console.error(err);
      alert("Tidak dapat terhubung ke server.");
    }
  };

  /* -----------------------------------------------------
     DELETE EVENT
  ----------------------------------------------------- */
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

  /* -----------------------------------------------------
     Upload new banners
  ----------------------------------------------------- */
  const handleUploadBanners = async () => {
    if (bannerFiles.length === 0) return alert("Pilih gambar dulu.");

    for (let i = 0; i < bannerFiles.length; i++) {
      const file = bannerFiles[i];

      const r = await uploadEventMedia(id, file);
      if (r.success) {
        setMediaList((prev) => [r.data, ...prev]);
      }
    }

    setBannerFiles([]);
  };

  /* -----------------------------------------------------
     RENDER
  ----------------------------------------------------- */
  if (loading) return <div className="p-8">Memuat data...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <Link
        to="/admin/kelola-acara"
        className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
      >
        ← Kembali
      </Link>

      <h1 className="text-2xl font-bold text-[#043873] my-6">Edit Acara</h1>

      <form className="bg-white shadow p-6 rounded space-y-4" onSubmit={handleSubmit}>
        {/* Title */}
        <div>
          <label className="block font-medium">Judul Acara</label>
          <input
            className="w-full border p-2 rounded"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        {/* Date */}
        <div>
          <label className="block font-medium">Tanggal & Waktu</label>
          <input
            type="datetime-local"
            className="w-full border p-2 rounded"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            required
          />
        </div>

        {/* Location */}
        <div>
          <label className="block font-medium">Lokasi</label>
          <input
            className="w-full border p-2 rounded"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block font-medium">Deskripsi</label>
          <textarea
            className="w-full border p-2 rounded"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>
        </div>

        {/* Existing posters */}
        <div className="mt-3">
          <label className="font-medium">Poster Saat Ini</label>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
            {mediaList.length === 0 && <p className="text-gray-500">Belum ada poster.</p>}

            {mediaList.map((m) => (
              <div key={m.id} className="relative group">
                <img
                  src={m.file_url}
                  alt="poster"
                  className="w-full h-32 object-cover rounded border"
                  loading="lazy"
                />

                <button
                  type="button"
                  className="absolute top-1 right-1 bg-red-600 text-white text-xs rounded-full p-1 opacity-90 hover:opacity-100"
                  onClick={async () => {
                    if (!window.confirm("Hapus gambar ini?")) return;
                    await deleteEventMedia(m.id);
                    setMediaList((prev) => prev.filter((x) => x.id !== m.id));
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Upload new */}
        <div className="mt-4">
          <label className="block font-medium">Tambah Poster Baru</label>

          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setBannerFiles(Array.from(e.target.files))}
          />

          {bannerFiles.length > 0 && (
            <button
              type="button"
              onClick={handleUploadBanners}
              className="mt-2 px-3 py-1 bg-blue-600 text-white rounded"
            >
              Upload {bannerFiles.length} File
            </button>
          )}
        </div>

        {/* Registration */}
        <div className="flex items-center gap-2 mt-4">
          <input
            type="checkbox"
            checked={requiresRegistration}
            onChange={(e) => setRequiresRegistration(e.target.checked)}
          />
          <label>Memerlukan pendaftaran</label>
        </div>

        {requiresRegistration && (
          <div>
            <label className="block font-medium mb-1">Jumlah Slot</label>
            <input
              type="number"
              className="w-28 border p-2 rounded"
              value={slotsAvailable}
              min="1"
              onChange={(e) => setSlotsAvailable(e.target.value)}
              required
            />
          </div>
        )}

        {/* Recurrence */}
        <div className="flex items-center gap-2 pt-4 border-t mt-4">
          <input
            type="checkbox"
            checked={recurringEnabled}
            onChange={(e) => setRecurringEnabled(e.target.checked)}
          />
          <label>Acara Berulang</label>
        </div>

        {recurringEnabled && (
          <div className="space-y-3 border p-4 bg-gray-50 rounded">
            <div>
              <label className="block font-medium">Frekuensi</label>
              <select
                className="border p-2 rounded"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
              >
                <option value="">-- Pilih --</option>
                <option>Harian</option>
                <option>Mingguan</option>
                <option>Bulanan</option>
                <option>Tahunan</option>
              </select>
            </div>

            <div>
              <label className="block font-medium">Interval</label>
              <input
                type="number"
                className="w-20 border p-2 rounded"
                min="1"
                value={interval}
                onChange={(e) => setInterval(e.target.value)}
              />
            </div>

            <div>
              <label className="block font-medium">Ulangi sampai (opsional)</label>
              <input
                type="date"
                className="border p-2 rounded"
                value={repeatUntil}
                onChange={(e) => setRepeatUntil(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-6">
          <Link to="/admin/acara" className="bg-gray-300 px-4 py-2 rounded">
            Batal
          </Link>

          <button className="bg-[#043873] text-white px-4 py-2 rounded">
            Simpan Perubahan
          </button>

          <button
            type="button"
            className="bg-red-500 text-white px-4 py-2 rounded"
            onClick={handleDelete}
          >
            Hapus Acara
          </button>
        </div>
      </form>
    </div>
  );
}