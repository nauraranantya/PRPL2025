import React, { useEffect, useState } from "react";
import { fetchAnnouncements, deleteAnnouncement } from "../../../api";
import { Link } from "react-router-dom";

export default function AnnouncementManagement() {
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    fetchAnnouncements().then(setAnnouncements);
  }, []);

  async function handleDelete(id) {
    if (!window.confirm("Yakin ingin menghapus pengumuman ini?")) return;

    await deleteAnnouncement(id);
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#043873]">
          Kelola Pengumuman
        </h1>

        <Link
          to="/admin/pengumuman/tambah"
          className="bg-[#043873] text-white px-4 py-2 rounded hover:bg-blue-900"
        >
          + Tambah Pengumuman
        </Link>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        {announcements.length === 0 ? (
          <p className="text-gray-600 text-center py-4">
            Belum ada pengumuman.
          </p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-left border-b">
                <th className="p-3 font-semibold">Judul</th>
                <th className="p-3 font-semibold w-40">Aksi</th>
              </tr>
            </thead>

            <tbody>
              {announcements.map((a) => (
                <tr key={a.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{a.title}</td>

                  <td className="p-3 flex gap-3">
                    <Link
                      to={`/admin/pengumuman/edit/${a.id}`}
                      className="px-3 py-1 rounded text-white bg-green-600 hover:bg-green-700"
                    >
                      Edit
                    </Link>

                    <button
                      onClick={() => handleDelete(a.id)}
                      className="px-3 py-1 rounded text-white bg-red-600 hover:bg-red-700"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
