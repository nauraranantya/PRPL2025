// src/api.js
export const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:4000/api";

// Events
export async function fetchEvents() {
  const res = await fetch(`${API_BASE}/events`);
  return res.json();
}

export async function createEvent(data) {
  const res = await fetch(`${API_BASE}/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

// Announcements
export async function fetchAnnouncements() {
  const res = await fetch(`${API_BASE}/announcements`);
  return res.json();
}

export async function createAnnouncement(data) {
  const res = await fetch(`${API_BASE}/announcements`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}
