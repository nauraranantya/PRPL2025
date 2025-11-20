import React, { useState, useEffect } from "react";
import { Container, Section, PageHeader } from "../../../components/layout";
import AccountCard from "../../../components/admin/AccountCard";
import { fetchAllUsers, deleteUser as deleteUserAPI } from "../../../api";

export default function VillagersAccount() {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      setLoading(true);
      const res = await fetchAllUsers();

      if (res.success) {
        setUsers(res.data);
      } else {
        setError("Gagal memuat data pengguna");
      }
    } catch (err) {
      setError("Terjadi kesalahan saat memuat data");
    } finally {
      setLoading(false);
    }
  }

  const filteredUsers = users.filter((u) => {
    const s = searchTerm.toLowerCase();
    return (
      (u.full_name || "").toLowerCase().includes(s) ||
      (u.email || "").toLowerCase().includes(s) ||
      (u.phone || "").toLowerCase().includes(s)
    );
  });

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Hapus akun ini?")) return;

    const res = await deleteUserAPI(id);
    if (res.success) {
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } else {
      alert("Gagal menghapus akun");
    }
  };

  return (
    <Section>
      <Container>
        <PageHeader title="Kelola Akun Warga" />

        <input
          type="text"
          placeholder="Cari nama/email/phone..."
          className="w-full md:w-1/2 p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-300"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {loading && (
          <div className="text-gray-600 py-8">Memuat data pengguna...</div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-4">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="space-y-4 mt-6">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((u) => (
                <AccountCard
                  key={u.id}
                  user={u}
                  editPath={`/admin/akun/edit/${u.id}?returnTo=/admin/akun`}
                  showAttendanceButton={false}
                  onDelete={() => handleDeleteUser(u.id)}
                />
              ))
            ) : (
              <p className="text-gray-500">
                {searchTerm
                  ? "Tidak ada akun yang sesuai pencarian."
                  : "Tidak ada akun ditemukan."}
              </p>
            )}
          </div>
        )}
      </Container>
    </Section>
  );
}
