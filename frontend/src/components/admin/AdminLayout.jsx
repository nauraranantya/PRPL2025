import React, { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { fetchMe } from "../../api";

export default function AdminLayout() {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const location = useLocation();

  useEffect(() => {
    async function checkAuth() {
      const token = localStorage.getItem("access_token");

      if (!token) {
        setAuthorized(false);
        setLoading(false);
        return;
      }

      try {
        const me = await fetchMe();

        if (me.is_admin === true) {
          setAuthorized(true);
        } else {
          setAuthorized(false);
        }

      } catch (err) {
        console.error("Auth check failed:", err);
        setAuthorized(false);
      }

      setLoading(false);
    }

    checkAuth();
  }, [location]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Mengecek akses...</p>
      </div>
    );
  }

  // No token → send to login
  if (!authorized) {
    const token = localStorage.getItem("access_token");
    if (!token) {
      return <Navigate to="/login" replace />;
    }

    // Logged in but not admin → bounce to home
    return <Navigate to="/" replace />;
  }

  // Authorized admin → continue to admin pages
  return <Outlet />;
}