import React, { useEffect, useState } from "react";
import { fetchAnnouncements, deleteAnnouncement } from "../../../api";
import { Link } from "react-router-dom";
import AdminAnnouncementCard from "../../../components/admin/AdminAnnouncementCard";

import { Container, Section, PageHeader } from "../../../components/layout";

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
        const sorted = array.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        setAnnouncements(sorted);
      } else {
        setAnnouncements([]);
      }
    } catch (err) {
      setError("Gagal memuat pengumuman");
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Yakin ingin menghapus pengumuman ini?")) return;

    const res = await deleteAnnouncement(id);

    if (res.success) {
      setAnnouncements(prev => prev.filter(a => a.id !== id));
    } else {
      alert("Gagal menghapus pengumuman");
    }
  }

  return (
    <Section>
      <Container>
        <PageHeader
          title="Kelola Pengumuman"
          actions={
            <Link
              to="/admin/pengumuman/tambah"
              className="bg-blue-700 text-white px-4 py-2 rounded-md hover:bg-blue-900"
            >
              + Tambah Pengumuman
            </Link>
          }
        />

        {loading && (
          <p className="text-gray-600 text-center py-8">
            Memuat pengumuman...
          </p>
        )}

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded mb-4">
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            {announcements.length === 0 ? (
              <div className="bg-white border shadow-sm p-12 text-center rounded-lg">
                <p className="text-gray-500 mb-4">Belum ada pengumuman.</p>
                <Link
                  to="/admin/pengumuman/tambah"
                  className="bg-blue-700 text-white px-6 py-2 rounded hover:bg-blue-900"
                >
                  Buat Pengumuman Pertama
                </Link>
              </div>
            ) : (
              <div className="space-y-4 max-w-4xl mx-auto">
                {announcements.map(a => (
                  <AdminAnnouncementCard
                    key={a.id}
                    announcement={a}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </Container>
    </Section>
  );
}
