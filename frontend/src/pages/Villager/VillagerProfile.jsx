// src/pages/Villager/VillagerProfile.jsx
import React, { useState, useEffect } from "react";
import { updateUser, fetchMe } from "../../api";
import { User, Mail, Phone, Lock } from "lucide-react";

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
      setError(null);
      setSuccess(false);

      // Prepare update payload (only send fields that changed)
      const updatePayload = {
        full_name: form.full_name,
        email: form.email || null,
        phone: form.phone || null,
      };

      // Only include password if user entered one
      if (form.password) {
        updatePayload.password = form.password;
      }

      // Use /users/me endpoint for self-update
      const res = await updateUser("me", updatePayload);

      if (res.success) {
        // Refresh user data
        const meResponse = await fetchMe();
        const updatedUser = meResponse.data || meResponse;
        
        sessionStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
        
        setSuccess(true);
        setForm({ ...form, password: "" }); // Clear password field
        
        alert("Profil berhasil diperbarui!");
      } else {
        setError("Gagal memperbarui profil");
      }
    } catch (err) {
      console.error("Failed to update profile:", err);
      setError("Terjadi kesalahan saat menyimpan data");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-[#043873] mb-6">Profil Saya</h1>

      {/* User Info Card */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <User size={32} className="text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">{user?.full_name}</h2>
            <p className="text-sm text-gray-500">Warga Desa</p>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Edit Profil</h3>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            Profil berhasil diperbarui!
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <User size={18} />
                Nama Lengkap
              </div>
            </label>
            <input
              type="text"
              name="full_name"
              value={form.full_name}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              disabled={saving}
            />
          </div>

          {/* Email */}
          <div>
            <label className="block font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <Mail size={18} />
                Email
              </div>
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={saving}
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <Phone size={18} />
                Nomor Telepon
              </div>
            </label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={saving}
            />
          </div>

          {/* Password */}
          <div>
            <label className="block font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <Lock size={18} />
                Kata Sandi Baru (opsional)
              </div>
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Kosongkan jika tidak ingin mengubah"
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={saving}
            />
            <p className="text-sm text-gray-500 mt-1">
              Kosongkan jika tidak ingin mengubah kata sandi
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-[#043873] text-white py-3 rounded-lg hover:bg-blue-900 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {saving ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </form>
      </div>
    </div>
  );
}