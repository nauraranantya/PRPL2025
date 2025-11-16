import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signupEmail, signupPhone } from "../api";

export default function SignupPage() {
  const [identifier, setIdentifier] = useState(""); // email OR phone
  const [fullName, setFullName] = useState("");   
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!identifier || !fullName || !password) {
      setError("Semua field wajib diisi.");
      return;
    }

    const isEmail = identifier.includes("@");

    try {
      let res;

      if (isEmail) {
        res = await signupEmail({
          email: identifier,
          password,
          full_name: fullName,
        });
      } else {
        res = await signupPhone({
          phone: identifier,
          password,
          full_name: fullName,
        });
      }

      if (!res || !res.id) {
        setError("Signup gagal.");
        return;
      }

      alert("Akun berhasil dibuat!");
      navigate("/login");

    } catch (err) {
      console.error(err);
      setError("Signup gagal. Periksa kembali data Anda.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-blue-50">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-[#043873] mb-6">
          Buat Akun Baru
        </h2>

        {error && <p className="text-red-600 text-center mb-3">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Lengkap
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-300"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          {/* Email or Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alamat Email atau Nomor Telepon
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-300"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-300"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#043873] text-white py-2 rounded-lg hover:bg-blue-900 transition"
          >
            Daftar
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-4">
          Sudah memiliki akun?{" "}
          <Link to="/login" className="text-blue-700 font-semibold hover:underline">
            Masuk
          </Link>
        </p>
      </div>
    </div>
  );
}