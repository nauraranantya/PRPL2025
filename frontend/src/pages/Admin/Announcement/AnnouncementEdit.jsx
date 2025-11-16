import React, { useEffect, useState } from "react";
import { fetchAnnouncement, updateAnnouncement } from "../../../api";
import { useParams, useNavigate } from "react-router-dom";

export default function AnnouncementEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetchAnnouncement(id);

      if (res.success) {
        setTitle(res.data.title);
        setBody(res.data.body);
      }

      setLoading(false);
    }

    load();
  }, [id]);

  async function handleSubmit(e) {
    e.preventDefault();

    const payload = { title, body };

    const res = await updateAnnouncement(id, payload);

    if (res.success) {
      navigate("/admin/pengumuman");
    } else {
      alert("Gagal memperbarui pengumuman");
    }
  }

  if (loading) return <p>Memuat data...</p>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h2 className="text-2xl font-bold mb-4 text-[#043873]">Edit Pengumuman</h2>

      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded-lg p-6 space-y-4 max-w-xl"
      >
        <div>
          <label className="block font-medium mb-1">Judul</label>
          <input
            className="w-full border rounded p-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Isi</label>
          <textarea
            className="w-full border rounded p-2"
            rows={5}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
          ></textarea>
        </div>

        <button
          type="submit"
          className="bg-[#043873] text-white px-4 py-2 rounded hover:bg-blue-900 transition"
        >
          Update
        </button>
      </form>
    </div>
  );
}