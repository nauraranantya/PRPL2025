// src/api.js
export const API_BASE = "http://localhost:8000/api";

// Events
export async function fetchEvents() {
  const res = await fetch(`${API_BASE}/events`);
  return res.json();
}

export async function createEvent(data) {
  const res = await fetch(`${API_BASE}/events`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.REACT_APP_ADMIN_KEY
    },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function fetchEvent(id) {
  const res = await fetch(`${API_BASE}/events/${id}`);
  return res.json();
}

export async function updateEvent(id, data) {
  const res = await fetch(`${API_BASE}/events`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.REACT_APP_ADMIN_KEY
    },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteEvent(id) {
  const res = await fetch(`${API_BASE}/events/${id}`, {
    method: "DELETE",
    headers: {
      "x-api-key": process.env.REACT_APP_ADMIN_KEY
    }
  });
  return res.json();
}