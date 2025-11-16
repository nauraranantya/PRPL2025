import React, { useEffect, useState } from "react";
import { fetchAnnouncements } from "../../api";
import AnnouncementCard from "../../components/announcements/AnnouncementCard";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

export default function VillagersAnnouncement() {
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    async function load() {
      const res = await fetchAnnouncements();
      if (res.success) setAnnouncements(res.data);
    }
    load();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">

      <div className="px-8 md:px-20 py-12">
        <h2 className="text-3xl font-bold mb-6 text-[#043873]">
          Pengumuman Desa
        </h2>

        <div className="flex flex-col gap-6">
          {announcements.length === 0 && (
            <p className="text-gray-500">Belum ada pengumuman.</p>
          )}

          {announcements.map((ann) => (
            <AnnouncementCard key={ann.id} ann={ann} />
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}
