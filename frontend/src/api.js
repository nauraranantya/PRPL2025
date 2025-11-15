export const API_BASE = "http://localhost:8000/api";
import axios from "axios";

// Account
export async function fetchUsers() {
  const res = await axios.get(`${API_BASE}/users`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    },
  });
  return res.data;
}
export async function fetchUser(id) {
  const res = await axios.get(`${API_BASE}/users/${id}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    },
  });
  return res.data;
}  

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

// Roles
export async function fetchEventRoles(eventId) {
  const res = await fetch(`${API_BASE}/roles/${eventId}`);
  return res.json();
} 

export async function fetchAllUsers() {
  const res = await fetch(`${API_BASE}/users`);
  return res.json();
}   

export async function fetchEventParticipants(eventId) {
  const res = await fetch(`${API_BASE}/events/${eventId}/participants`);
  return res.json();
}

export async function assignRole(data) {
  const res = await fetch(`${API_BASE}/role-assign/assign`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.REACT_APP_ADMIN_KEY
    },
    body: JSON.stringify(data),
  });
  return res.json();
} 

// Announcements
export async function fetchAnnouncements() {
  const res = await axios.get(`${API_BASE}/announcements`);
  return res.data;
}

export async function fetchAnnouncement(id) {
  const res = await axios.get(`${API_BASE}/announcements/${id}`);
  return res.data;
}

export async function createAnnouncement({title, body}) {
  const res = await axios.post(
    `${API_BASE}/announcements`,
    { title, body },
    {
      headers: {
        "x-api-key": process.env.REACT_APP_ADMIN_KEY,
      },
    }
  );
  return res.data;
}

export async function updateAnnouncement(id, title, body) {
  const res = await axios.put(
    `${API_BASE}/announcements/${id}`,
    { title, body },
    {
      headers: { "x-api-key": process.env.REACT_APP_ADMIN_KEY },
    }
  );
  return res.data;
}

export async function deleteAnnouncement(id) {
  const res = await axios.delete(`${API_BASE}/announcements/${id}`, {
    headers: { "x-api-key": process.env.REACT_APP_ADMIN_KEY },
  });
  return res.data;
}