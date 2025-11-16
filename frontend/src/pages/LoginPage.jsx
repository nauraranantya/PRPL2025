import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser, fetchMe } from "../api";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState(""); // email or phone
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // Login returns user data directly from backend
      const loginResponse = await loginUser(identifier, password);

      // Fetch full user profile
      const me = await fetchMe();

      if (me.is_admin) navigate("/admin");
      else navigate("/");
    } catch (err) {
      console.error("Login error:", err);
      setError("Login gagal. Periksa kembali data Anda.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-blue-50">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">

        <h2 className="text-2xl font-bold text-center text-[#043873] mb-6">
          Masuk ke Akun Anda
        </h2>

        {error && <p className="text-red-600 text-center mb-3">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-5">

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email atau Nomor Telepon
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg p-2"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              className="w-full border border-gray-300 rounded-lg p-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#043873] text-white py-2 rounded-lg hover:bg-blue-900 transition"
          >
            Masuk
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-4">
          Belum punya akun?{" "}
          <Link to="/signup" className="text-blue-700 font-semibold hover:underline">
            Daftar
          </Link>
        </p>

      </div>
    </div>
  );
}