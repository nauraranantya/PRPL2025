import React, { useState, useEffect } from "react";
import { updateUser, fetchMe } from "../../api";
import { User, Mail, Phone, Lock } from "lucide-react";
import { Section, Container, Card, PageHeader } from "../../components/layout";
import { Heading, Text } from "../../components/ui";

export default function VillagerProfile({ user, setUser }) {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        full_name: user.full_name || "",
        email: user.email || "",
        phone: user.phone || "",
        password: "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setSuccess(false);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      const payload = {
        full_name: form.full_name,
        email: form.email || null,
        phone: form.phone || null,
      };

      if (form.password) payload.password = form.password;

      const res = await updateUser("me", payload);
      if (!res.success) return setError("Gagal memperbarui profil");

      const me = await fetchMe();
      setUser(me.data || me);
      sessionStorage.setItem("user", JSON.stringify(me.data));

      setSuccess(true);
      setForm({ ...form, password: "" });
    } catch {
      setError("Terjadi kesalahan saat menyimpan data");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Section>
      <Container>

        <PageHeader
          title="Profil Saya"
          subtitle="Kelola informasi akun Anda"
        />

        {/* Avatar Card */}
        <Card className="p-6 mb-8 flex items-center gap-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <User size={32} className="text-blue-600" />
          </div>
          <div>
            <Heading level={3}>{user?.full_name}</Heading>
            <Text className="text-gray-500">Warga Desa</Text>
          </div>
        </Card>

        {/* Edit Form Card */}
        <Card className="p-6">
          <Heading level={4} className="mb-4">
            Edit Profil
          </Heading>

          {error && (
            <Card className="bg-red-50 border-red-300 text-red-700 p-3 mb-4">
              {error}
            </Card>
          )}

          {success && (
            <Card className="bg-green-50 border-green-300 text-green-700 p-3 mb-4">
              Profil berhasil diperbarui!
            </Card>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="font-medium flex items-center gap-2 mb-1">
                <User size={18} /> Nama Lengkap
              </label>
              <input
                type="text"
                name="full_name"
                value={form.full_name}
                onChange={handleChange}
                required
                className="w-full p-3 border rounded-lg"
              />
            </div>

            <div>
              <label className="font-medium flex items-center gap-2 mb-1">
                <Mail size={18} /> Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg"
              />
            </div>

            <div>
              <label className="font-medium flex items-center gap-2 mb-1">
                <Phone size={18} /> Nomor Telepon
              </label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg"
              />
            </div>

            <div>
              <label className="font-medium flex items-center gap-2 mb-1">
                <Lock size={18} /> Kata Sandi Baru (opsional)
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Kosongkan jika tidak ingin mengubah"
                className="w-full p-3 border rounded-lg"
              />
              <Text className="text-sm text-gray-500 mt-1">
                Kosongkan jika tidak ingin mengubah kata sandi
              </Text>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-[#043873] text-white py-3 rounded-lg hover:bg-blue-900 transition"
            >
              {saving ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </form>
        </Card>

      </Container>
    </Section>
  );
}
