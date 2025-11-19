import React, { useState, useEffect } from "react";
import AccountCard from "../../components/admin/AccountCard";
import { fetchAllUsers, deleteUser as deleteUserAPI } from "../../api";

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
      setError(null);
      
      const res = await fetchAllUsers();
      
      if (res.success) {
        setUsers(res.data);
      } else {
        setError("Gagal memuat data pengguna");
      }
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setError("Terjadi kesalahan saat memuat data");
    } finally {
      setLoading(false);
    }
  }

  const filteredUsers = users.filter((u) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (u.full_name || "").toLowerCase().includes(searchLower) ||
      (u.email || "").toLowerCase().includes(searchLower) ||
      (u.phone || "").toLowerCase().includes(searchLower)
    );
  });

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Hapus akun ini?")) return;

    try {
      const res = await deleteUserAPI(id);
      
      if (res.success) {
        // Remove from local state
        setUsers((prev) => prev.filter((u) => u.id !== id));
        alert("Akun berhasil dihapus");
      } else {
        alert("Gagal menghapus akun");
      }
    } catch (err) {
      console.error("Failed to delete user:", err);
      alert("Terjadi kesalahan saat menghapus akun");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#043873]">Kelola Akun Warga</h1>

      <input
        type="text"
        placeholder="Cari nama/email/phone..."
        className="w-full md:w-1/2 p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-300"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {loading && (
        <div className="text-center py-8 text-gray-600">
          Memuat data pengguna...
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-4 mt-4">
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
              {searchTerm ? "Tidak ada akun yang cocok dengan pencarian." : "Tidak ada akun ditemukan."}
            </p>
          )}
        </div>
      )}
    </div>
  );
}