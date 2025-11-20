// src/pages/LandingPage.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Hero from "../components/Hero";
import EventCard from "../components/EventCard";
import Footer from "../components/Footer";
import { fetchEvents } from "../api";

import { Container, Section, PageHeader } from "../components/layout";
import { Heading, Text } from "../components/ui";

export default function LandingPage() {
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);

  const heroImages = [
    "/assets/hero1.jpg",
    "/assets/hero2.jpg",
    "/assets/hero3.jpg",
  ];

  useEffect(() => {
    async function loadEvents() {
      try {
        const res = await fetchEvents({ upcoming: true });

        if (res.success) {
          const validEvents = res.data
            .filter((e) => !e.is_cancelled)
            .sort((a, b) => new Date(a.event_date) - new Date(b.event_date));

          setUpcoming(validEvents.slice(0, 3));
        }
      } catch (err) {
        console.error("Failed to fetch events:", err);
      }

      setLoading(false);
    }

    loadEvents();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Hero images={heroImages} />

      <Section>
        <Container>
          <PageHeader
            title="Acara Mendatang"
            actions={
              <Link
                to="/daftar-acara"
                className="text-blue-600 hover:underline text-base"
              >
                Lihat Semua Acara →
              </Link>
            }
          />

          {loading ? (
            <Text color="muted">Memuat acara...</Text>
          ) : upcoming.length === 0 ? (
            <Text color="muted">Tidak ada acara mendatang.</Text>
          ) : (
            <div className="flex flex-col gap-6">
              {upcoming.map((ev) => (
                <EventCard key={ev.id} event={ev} />
              ))}
            </div>
          )}
        </Container>
      </Section>

      <Footer />
    </div>
  );
}
