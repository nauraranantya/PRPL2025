// src/pages/EventDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Calendar, MapPin, Users, ArrowLeft } from "lucide-react";

import {
  fetchEvent,
  registerParticipant,
  fetchEventParticipants,
} from "../api";

import { Container, Section } from "../components/layout";

export default function EventDetail({ user }) {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [participantCount, setParticipantCount] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    loadEvent();
  }, [eventId, user]);

  async function loadEvent() {
    try {
      setLoading(true);

      const res = await fetchEvent(eventId);
      if (!res.success) return setError("Acara tidak ditemukan.");

      setEvent(res.data);

      const participants = await fetchEventParticipants(eventId);
      setParticipantCount(participants.length || 0);

      if (user) {
        const registered = participants.some((p) => p.user_id === user.id);
        setIsRegistered(registered);
      }
    } catch (err) {
      setError("Gagal memuat acara.");
    } finally {
      setLoading(false);
    }
  }

  const handleRegister = async () => {
    if (!user) return navigate("/login");

    try {
      setRegistering(true);
      await registerParticipant(event.id);

      setIsRegistered(true);
      setParticipantCount((c) => c + 1);
      alert("Berhasil mendaftar!");
    } catch {
      alert("Pendaftaran gagal.");
    } finally {
      setRegistering(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Text color="muted">Memuat acara...</Text>
      </div>
    );

  if (error)
    return (
      <Container>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-600 hover:underline mt-6"
        >
          <ArrowLeft size={20} />
          Kembali
        </button>
        <Text color="danger" className="mt-4">
          {error}
        </Text>
      </Container>
    );

  const quota = event.slots_available ?? null;
  const slotsLeft = quota ? Math.max(quota - participantCount, 0) : null;
  const isFull = quota && participantCount >= quota;

  const poster = event.media?.[0]?.file_url;

  return (
    <Section className="bg-gray-100">
      <Container className="max-w-4xl">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-600 hover:underline mb-6"
        >
          <ArrowLeft size={20} />
          Kembali
        </button>

        <div className="bg-white rounded-xl shadow overflow-hidden">
          {poster && (
            <img src={poster} alt="Poster" className="w-full h-64 object-cover" />
          )}

          <div className="p-8">
            <Heading level={1} className="mb-6">
              {event.title}
            </Heading>

            {/* Info Section */}
            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-3 text-gray-700">
                <Calendar size={20} className="text-blue-600" />
                <Text>
                  {new Date(event.event_date).toLocaleString("id-ID", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </div>

              <div className="flex items-center gap-3 text-gray-700">
                <MapPin size={20} className="text-red-600" />
                <Text>{event.location || "Lokasi tidak tersedia"}</Text>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6 pb-6 border-b">
              <Heading level={3} className="mb-2">
                Deskripsi Acara
              </Heading>
              <Text>{event.description || "Deskripsi tidak tersedia."}</Text>
            </div>

            {/* Registration */}
            {event.requires_registration && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <Users className="text-blue-600" />
                  <Heading level={3}>
                    {participantCount} peserta terdaftar
                  </Heading>
                </div>

                {quota ? (
                  <Text>
                    Kuota {quota} • Sisa slot: {slotsLeft}
                  </Text>
                ) : (
                  <Text>Kuota tidak terbatas</Text>
                )}
              </div>
            )}

            {/* Buttons */}
            {event.requires_registration ? (
              !user ? (
                <button
                  onClick={() => navigate("/login")}
                  className="w-full bg-blue-600 text-white py-4 rounded-lg font-bold"
                >
                  Login untuk Mendaftar
                </button>
              ) : isRegistered ? (
                <div className="bg-green-50 border border-green-500 p-6 text-center rounded-lg">
                  <Text color="success">✓ Anda sudah terdaftar</Text>
                </div>
              ) : isFull ? (
                <div className="bg-red-50 border border-red-500 p-6 text-center rounded-lg">
                  <Text color="danger">Kuota Penuh</Text>
                </div>
              ) : (
                <button
                  onClick={handleRegister}
                  disabled={registering}
                  className="w-full bg-blue-600 text-white py-4 rounded-lg font-bold disabled:bg-gray-400"
                >
                  {registering ? "Memproses..." : "Daftar Sekarang"}
                </button>
              )
            ) : (
              <div className="bg-gray-50 border p-6 rounded-lg text-center">
                <Text>Acara ini tidak memerlukan pendaftaran</Text>
              </div>
            )}
          </div>
        </div>
      </Container>
    </Section>
  );
}
