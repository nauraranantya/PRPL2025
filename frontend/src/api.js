// Frontend API helper
// Default backend address for local development
export const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:4000/api';

export async function fetchEvents({ q, upcoming } = {}){
  const params = new URLSearchParams();
  if(q) params.set('q', q);
  if(upcoming) params.set('upcoming','true');
  const res = await fetch(`${API_BASE}/events?${params.toString()}`);
  return res.json();
}
