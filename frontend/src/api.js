// src/api.js
import axios from "axios";

export const API_BASE = "http://localhost:8000/api";

/* ---------------------------------------------------
   AXIOS INSTANCE
--------------------------------------------------- */
export const api = axios.create({
  baseURL: API_BASE,
});

// Confirm interceptors are loaded
console.log("API.js loaded – interceptors active");

/* ---------------------------------------------------
   REQUEST INTERCEPTOR – attach access token
--------------------------------------------------- */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* ---------------------------------------------------
   RESPONSE INTERCEPTOR – auto refresh token
--------------------------------------------------- */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    // Handle expired token
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

      const refresh_token = localStorage.getItem("refresh_token");
      if (!refresh_token) {
        console.error("No refresh token available");
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        const res = await axios.post(`${API_BASE}/auth/refresh`, {
          refresh_token,
        });

        localStorage.setItem("access_token", res.data.access_token);
        localStorage.setItem("refresh_token", res.data.refresh_token);

        // Update the failed request with new token
        original.headers.Authorization = `Bearer ${res.data.access_token}`;

        // Retry the original request
        return api(original);
      } catch (err) {
        console.error("Refresh failed → logging out");
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

/* ---------------------------------------------------
   AUTH
--------------------------------------------------- */
export async function loginUser(identifier, password) {
  const id = String(identifier).trim();

  const res = await api.post("/auth/login", {
    identifier: id,
    password,
  });

  localStorage.setItem("access_token", res.data.access_token);
  localStorage.setItem("refresh_token", res.data.refresh_token);

  return res.data;
}

export async function signupEmail(data) {
  const res = await api.post("/auth/signup/email", data);
  return res.data;
}

export async function signupPhone(data) {
  const res = await api.post("/auth/signup/phone", data);
  return res.data;
}

export async function fetchMe() {
  // Let the interceptor handle the token automatically
  const res = await api.get("/auth/me");
  return res.data;
}

/* ---------------------------------------------------
   USERS
--------------------------------------------------- */
export async function fetchAllUsers() {
  const res = await api.get("/users");
  return res.data;
}

export async function fetchUser(id) {
  const res = await api.get(`/users/${id}`);
  return res.data;
}

/* ---------------------------------------------------
   EVENTS
--------------------------------------------------- */
export async function fetchEvents() {
  const res = await api.get("/events");
  return res.data;
}

export async function fetchEvent(id) {
  const res = await api.get(`/events/${id}`);
  return res.data;
}

export async function createEvent(data) {
  const res = await api.post(`/events`, data);
  return res.data;
}

export async function updateEvent(id, data) {
  const res = await api.put(`/events/${id}`, data);
  return res.data;
}

export async function deleteEvent(id) {
  const res = await api.delete(`/events/${id}`);
  return res.data;
}

/* ---------------------------------------------------
   PARTICIPANTS
--------------------------------------------------- */
export async function fetchEventParticipants(eventId) {
  const res = await api.get(`/events/${eventId}/participants`);
  return res.data;
}

export async function registerParticipant(eventId, data) {
  const res = await api.post(`/events/${eventId}/participants`, data);
  return res.data;
}

export async function deleteParticipant(id) {
  const res = await api.delete(`/participants/${id}`);
  return res.data;
}

/* ---------------------------------------------------
   ROLES
--------------------------------------------------- */
export async function fetchRoles() {
  const res = await api.get("/roles");
  return res.data;
}

export async function fetchEventRoles(eventId) {
  const res = await api.get(`/roles/${eventId}`);
  return res.data;
}

export async function createRole(data) {
  const res = await api.post("/roles", data);
  return res.data;
}

export async function deleteRole(roleId) {
  const res = await api.delete(`/roles/${roleId}`);
  return res.data;
}

export async function assignRole(data) {
  const res = await api.post("/role-assign/assign", data);
  return res.data;
}

/* ---------------------------------------------------
   ANNOUNCEMENTS
--------------------------------------------------- */
export async function fetchAnnouncements() {
  const res = await api.get("/announcements");
  return res.data;
}

export async function fetchAnnouncement(id) {
  const res = await api.get(`/announcements/${id}`);
  return res.data;
}

export async function createAnnouncement(data) {
  const res = await api.post("/announcements", data);
  return res.data;
}

export async function updateAnnouncement(id, data) {
  const res = await api.put(`/announcements/${id}`, data);
  return res.data;
}

export async function deleteAnnouncement(id) {
  const res = await api.delete(`/announcements/${id}`);
  return res.data;
}