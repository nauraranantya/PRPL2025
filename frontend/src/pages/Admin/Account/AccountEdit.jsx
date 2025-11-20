import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate, useLocation } from "react-router-dom";
import { fetchUser, updateUser } from "../../../api";
import { Container, Section, PageHeader } from "../../../components/layout";

export default function AccountEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = new URLSearchParams(location.search).get("returnTo") || "/admin/akun";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    email: "",
  });

  useEffect(() => {
    async function loadUser() {
      try {
        setLoading(true);
        const res = await fetchUser(id);

        if (res.success && res.data) {
          setForm({
            full_name: res.data.full_name || "",
            phone: res.data.phone || "",
            email: res.data.email || "",
          });
        } else {
          setError("Gagal memuat data pengguna");
        }
      } catch (err) {
        setError("Terjadi kesalahan saat memuat data");
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, [id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await updateUser(id, form);
      if (res.success) {
        alert("Data akun berhasil diperbarui!");
        navigate(returnTo);
      } else {
        setError("Gagal memperbarui data akun");
      }
    } catch (err) {
      setError("Terjadi kesalahan saat menyimpan data");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Section>
        <Container>
          <PageHeader title="Memuat Data..." />
        </Container>
      </Section>
    );
  }

  return (
    <Section>
      <Container>
        <PageHeader
          title="Edit Data Akun"
          actions={
            <Link
              to={returnTo}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            >
              ← Kembali
            </Link>
          }
        />

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-md rounded-lg p-6 space-y-4 max-w-md mx-auto"
        >
          <div>
            <label className="block font-medium mb-1">Nama Lengkap</label>
            <input
              type="text"
              name="full_name"
              value={form.full_name}
              onChange={handleChange}
              className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500"
              required
              disabled={saving}
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Nomor Telepon</label>
            <input
              type="text"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500"
              required
              disabled={saving}
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500"
              disabled={saving}
            />
          </div>

          <button
            type="submit"
            className="bg-[#043873] text-white w-full p-2 rounded hover:bg-blue-800 disabled:bg-gray-400"
            disabled={saving}
          >
            {saving ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </form>
      </Container>
    </Section>
  );
}
