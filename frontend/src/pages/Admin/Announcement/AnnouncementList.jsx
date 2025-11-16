import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchAnnouncements } from "../../../api";
import AnnouncementCard from "../../../components/announcements/AnnouncementCard";

export default function AnnouncementList() {
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetchAnnouncements();
        if (res.success) setAnnouncements(res.data);
      } catch (err) {
        console.error("Failed to load announcements:", err);
      }
    }
    load();
  }, []);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">Daftar Pengumuman</h1>

        <Link
          to="/admin/announcements/create"
          className="px-4 py-2 rounded bg-blue-600 text-white"
        >
          Buat Pengumuman
        </Link>
      </div>

      <div className="flex flex-col gap-5">
        {announcements.length === 0 && (
          <p className="text-gray-500">Belum ada pengumuman.</p>
        )}

        {announcements.map((ann) => (
          <AnnouncementCard key={ann.id} ann={ann} />
        ))}
      </div>
    </div>
  );
}
