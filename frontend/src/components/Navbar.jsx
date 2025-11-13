import React from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="flex justify-between items-center py-4 px-8 bg-blue-800 text-white shadow-md">
      <h1 className="text-2xl font-bold tracking-wide">
        <span className="inline-flex items-center gap-2">
          Acara Desa
        </span>
      </h1>

      <div className="space-x-6">
        <Link
          to="/login"
          className="font-semibold hover:text-blue-200 transition"
        >
          Masuk
        </Link>
        <Link
          to="/signup"
          className="bg-white text-blue-800 px-4 py-2 rounded-lg font-semibold hover:bg-blue-100 transition"
        >
          Daftar
        </Link>
      </div>
    </nav>
  );
}
