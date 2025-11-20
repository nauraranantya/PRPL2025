// src/pages/EventList.jsx
import React, { useEffect, useState } from "react";
import Footer from "../components/Footer";
import EventCard from "../components/EventCard";
import { fetchEvents } from "../api";
import { FiSearch } from "react-icons/fi";

import { Container, Section, PageHeader } from "../components/layout";
import { Text } from "../components/ui";

export default function EventList() {
  const [events, setEvents] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetchEvents();
        if (res.success) {
          const sorted = res.data.sort(
            (a, b) => new Date(a.event_date) - new Date(b.event_date)
          );
          setEvents(sorted);
          setFiltered(sorted);
        }
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    }
    load();
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setFiltered(events);
      return;
    }
    const q = query.toLowerCase();
    setFiltered(events.filter((e) => e.title.toLowerCase().includes(q)));
  }, [query, events]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Section>
        <Container>
          <PageHeader title="Daftar Acara" />

          {/* Search Bar */}
          <div className="mt-6 flex items-center gap-2 border rounded-lg p-3 bg-white">
            <FiSearch size={20} />
            <input
              type="text"
              placeholder="Cari acara…"
              className="w-full outline-none"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          {/* Events List */}
          <div className="mt-8 flex flex-col gap-6 pb-16">
            {loading && <Text color="muted">Memuat acara...</Text>}

            {!loading && filtered.length === 0 && (
              <Text color="muted">Tidak ada acara ditemukan.</Text>
            )}

            {!loading &&
              filtered.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
          </div>
        </Container>
      </Section>

      <Footer />
    </div>
  );
}
