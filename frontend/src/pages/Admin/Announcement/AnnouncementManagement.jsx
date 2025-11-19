import React, { useEffect, useState } from "react";
import { fetchAnnouncements, deleteAnnouncement } from "../../../api";
import { Link } from "react-router-dom";
import AdminAnnouncementCard from "../../../components/admin/AdminAnnouncementCard";

export default function AnnouncementManagement() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAnnouncements();
  }, []);

  async function loadAnnouncements() {
    try {
      setLoading(true);
      setError(null);

      const res = await fetchAnnouncements();
      const array = res?.data;

      if (Array.isArray(array)) {
        // Sort by date, newest first
        const sorted = array.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        setAnnouncements(sorted);
      } else {
        console.error("Announcements is not an array:", array);
        setAnnouncements([]);
      }
    } catch (err) {
      console.error("Failed to fetch announcements:", err);
      setError("Gagal memuat pengumuman");
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Yakin ingin menghapus pengumuman ini?")) return;

    try {
      const res = await deleteAnnouncement(id);
      
      if (res.success) {
        setAnnouncements((prev) => prev.filter((a) => a.id !== id));
        alert("Pengumuman berhasil dihapus");
      } else {
        alert("Gagal menghapus pengumuman");
      }
    } catch (err) {
      console.error("Failed to delete announcement:", err);
      alert("Terjadi kesalahan saat menghapus pengumuman");
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#043873]">
          Kelola Pengumuman
        </h1>

        <Link
          to="/admin/pengumuman/tambah"
          className="bg-[#043873] text-white px-5 py-2.5 rounded-md hover:bg-blue-900 transition-colors font-medium"
        >
          + Tambah Pengumuman
        </Link>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12 text-gray-600">
          Memuat pengumuman...
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Content */}
      {!loading && !error && (
        <>
          {announcements.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <p className="text-gray-500 mb-4">Belum ada pengumuman.</p>
              <Link
                to="/admin/pengumuman/tambah"
                className="inline-block bg-[#043873] text-white px-6 py-2 rounded-md hover:bg-blue-900 transition-colors"
              >
                Buat Pengumuman Pertama
              </Link>
            </div>
          ) : (
            <div className="space-y-4 max-w-4xl mx-auto">
              {announcements.map((announcement) => (
                <AdminAnnouncementCard
                  key={announcement.id}
                  announcement={announcement}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}