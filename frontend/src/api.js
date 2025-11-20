import axios from "axios";

export const API_BASE = "http://localhost:8000/api";

/* ---------------------------------------------------
   AXIOS INSTANCE
--------------------------------------------------- */
export const api = axios.create({
  baseURL: API_BASE,
});

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
  const res = await api.post("/auth/login", { identifier: id, password });
  
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

export async function updateUser(id, data) {
  const res = await api.put(`/users/${id}`, data);
  return res.data;
}

export async function deleteUser(id) {
  const res = await api.delete(`/users/${id}`);
  return res.data;
}

/* ---------------------------------------------------
   EVENTS
--------------------------------------------------- */
export async function fetchEvents(params = {}) {
  const res = await api.get("/events", { params });
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

export async function uploadEventMedia(eventId, file) {
  const form = new FormData();
  form.append("file", file);
  const res = await api.post(`/media/${eventId}`, form);
  return res.data;
}

export async function deleteEventMedia(mediaId) {
  const res = await api.delete(`/media/${mediaId}`);
  return res.data;
}

/* ---------------------------------------------------
   PARTICIPANTS
--------------------------------------------------- */
export async function fetchEventParticipants(eventId) {
  const res = await api.get(`/participants/${eventId}`);
  return res.data;
}

// User registers themselves for an event
export async function registerParticipant(eventId) {
  const res = await api.post(`/events/${eventId}/register`, null);
  return res.data;
}

// Admin registers any user for an event
export async function registerParticipantByAdmin(eventId, name, email, phone) {
  const res = await api.post(`/events/${eventId}/register-admin`, {
    full_name: name,
    email: email,
    phone: phone
  });
  return res.data;
}

export async function deleteParticipant(id) {
  const res = await api.delete(`/participants/${id}`);
  return res.data;
}

export async function assignRole(participantId, roleId) {
  const res = await api.put(`/participants/${participantId}/assign-role/${roleId}`);
  return res.data;
}

export async function unassignRole(participantId) {
  const res = await api.put(`/participants/${participantId}/unassign-role`);
  return res.data;
}

/* ---------------------------------------------------
   ROLES
--------------------------------------------------- */
export async function fetchRoles(eventId = null) {
  const params = eventId ? { event_id: eventId } : {};
  const res = await api.get("/roles", { params });
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

/* ---------------------------------------------------
   ATTENDANCE
--------------------------------------------------- */
export async function markAttendance(participantId, eventId) {
  const res = await api.post(`/attendance`, {
    event_id: eventId,
    participant_id: participantId,
    attended_at: new Date().toISOString(),
    notes: null
  });
  return res.data;
}

export async function deleteAttendance(attendanceId) {
  const res = await api.delete(`/attendance/${attendanceId}`);
  return res.data;
}

export async function fetchEventAttendance(eventId) {
  const res = await api.get(`/attendance`, {
    params: { event_id: eventId }
  });
  return res.data;
}

export async function attendanceReport(params) {
  const res = await api.get(`/attendance/report`, { params });
  return res.data;
}

export async function bulkMarkAttendance(eventId, rows) {
  const res = await api.post(`/attendance/events/${eventId}/bulk`, rows);
  return res.data;
}

export async function fetchMyAttendance(eventId) {
  const res = await api.get(`/attendance/events/${eventId}/me`);
  return res.data;
}

export async function monthlyAttendanceReport(opts) {
  const res = await api.get(`/attendance/reports/monthly`, { params: opts });
  return res.data;
}

export async function exportAttendanceCSV(params) {
  return api.get(`/attendance/reports/export`, { 
    params, 
    responseType: "blob" 
  });
}

export function exportAttendanceExcel(eventId, start, end) {
  const url = `${API_BASE}/attendance/export/excel?event_id=${eventId}&start_date=${start}&end_date=${end}`;
  window.open(url, "_blank");
}

export function exportAttendancePDF(eventId, start, end) {
  const url = `${API_BASE}/attendance/export/pdf?event_id=${eventId}&start_date=${start}&end_date=${end}`;
  window.open(url, "_blank");
}

/* ---------------------------------------------------
   DASHBOARD STATS
--------------------------------------------------- */
export async function fetchDashboardStats() {
  try {
    // Fetch all data in parallel
    const [eventsRes, rolesRes] = await Promise.all([
      fetchEvents(),
      fetchRoles()
    ]);

    // Get all events
    const events = eventsRes.data || eventsRes || [];
    
    // Filter upcoming events
    const upcomingEvents = events.filter(
      (e) => new Date(e.event_date) >= new Date()
    );

    // Fetch participants for all upcoming events
    const participantPromises = upcomingEvents.map(event => 
      fetchEventParticipants(event.id).catch(() => [])
    );
    const participantsArrays = await Promise.all(participantPromises);

    // Calculate TOTAL registrations
    let totalRegistrations = 0;
    participantsArrays.forEach(participants => {
      totalRegistrations += (participants || []).length;
    });

    // Calculate active roles (participants with assigned roles in upcoming events)
    let activeRolesCount = 0;
    participantsArrays.forEach(participants => {
      (participants || []).forEach(p => {
        if (p.role_id) activeRolesCount++;
      });
    });

    const roles = rolesRes.data || rolesRes || [];

    return {
      success: true,
      data: {
        total_participants: totalRegistrations,
        active_roles: activeRolesCount,
        total_roles: roles.length
      }
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return {
      success: false,
      data: {
        total_participants: 0,
        active_roles: 0,
        total_roles: 0
      }
    };
  }
}