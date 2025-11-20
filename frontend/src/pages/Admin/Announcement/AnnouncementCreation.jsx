import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createAnnouncement } from "../../../api";

import { Container, Section, PageHeader } from "../../../components/layout";

export default function AnnouncementCreation() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const res = await createAnnouncement({ title, body });

    if (res?.success) navigate("/admin/pengumuman");
    else setError("Gagal membuat pengumuman");
  };

  return (
    <Section>
      <Container>
        <PageHeader title="Buat Pengumuman Baru" />

        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-md rounded-lg p-6 space-y-4 max-w-xl mx-auto"
        >
          <div>
            <label className="block font-medium mb-1">Judul Pengumuman</label>
            <input
              type="text"
              className="w-full border p-2 rounded"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Isi Pengumuman</label>
            <textarea
              className="w-full border p-2 rounded"
              rows={5}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
            ></textarea>
          </div>

          {error && <p className="text-red-600">{error}</p>}

          <button
            type="submit"
            className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-900"
          >
            Unggah Pengumuman
          </button>
        </form>
      </Container>
    </Section>
  );
}
