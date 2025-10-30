import React, {useState, useEffect} from 'react';
import { fetchEvents } from './api';
import EventList from './components/EventList';
import SearchBar from './components/SearchBar';
import EventForm from "./components/EventForm";

export default function App(){
  const [events, setEvents] = useState([]);
  const [q, setQ] = useState('');

  async function load(){
    const res = await fetchEvents({ q, upcoming: true });
    if(res.success) setEvents(res.data);
  }

  useEffect(()=>{ load() }, [q]);

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Daftar Acara Desa</h1>
      <EventForm />
      <SearchBar value={q} onChange={setQ} onSubmit={load} />
      <EventList events={events} />
    </div>
  )
}
