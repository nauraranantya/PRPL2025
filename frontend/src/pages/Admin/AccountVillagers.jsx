import React, { useState, useEffect } from "react";
import AccountCard from "../../components/admin/AccountCard";
import { fetchUsers } from "../../api";
import { Trash2 } from "lucide-react";

export default function VillagersAccount() {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);

  useEffect(() => {
    async function loadUsers() {
      try {
        const data = await fetchAllUsers();
        setUsers(data);
      } catch (err) {
        console.error("Failed to fetch users:", err);
      }
    }
    loadUsers();
  }, []);

  const filteredUsers = users.filter((u) =>
    (u.email || u.phone || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const deleteUser = (id) => {
    if (window.confirm("Hapus akun ini?")) {
      setUsers((prev) => prev.filter((u) => u.id !== id));
      // TODO: call real backend delete when you add it
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

      <div className="space-y-4 mt-4">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((u) => (
            <AccountCard
              key={u.id}
              user={u}
              editPath={`/admin/akun/edit/${u.id}?returnTo=/admin/kelola-akun`}
              showAttendanceButton={false}
              onDelete={() => deleteUser(u.id)}
            />
          ))
        ) : (
          <p className="text-gray-500">Tidak ada akun ditemukan.</p>
        )}
      </div>
    </div>
  );
}
