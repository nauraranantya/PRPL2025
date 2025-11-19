import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser, fetchMe } from "../api";

export default function LoginPage({ setUser }) {
  const [identifier, setIdentifier] = useState(""); // email or phone
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Login returns tokens
      await loginUser(identifier, password);

      // Fetch full user profile
      const meResponse = await fetchMe();
      const userData = meResponse.data || meResponse;

      // Use sessionStorage consistently
      sessionStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);

      // Redirect based on role
      if (userData.is_admin) {
        navigate("/admin");
      } else {
        // FIXED: Redirect villagers to sidebar page
        navigate("/");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Login gagal. Periksa kembali data Anda.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-blue-50">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-[#043873] mb-6">
          Masuk ke Akun Anda
        </h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email atau Nomor Telepon
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kata Sandi
            </label>
            <input
              type="password"
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#043873] text-white py-2 rounded-lg hover:bg-blue-900 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? "Memproses..." : "Masuk"}
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