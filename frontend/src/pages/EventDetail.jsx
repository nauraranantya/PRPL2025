// src/pages/EventDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Calendar, MapPin, Users, ArrowLeft } from "lucide-react";
import { fetchEvent, registerParticipant, fetchEventParticipants } from "../api";

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
    loadEventData();
  }, [eventId, user]);

  async function loadEventData() {
    try {
      setLoading(true);
      const res = await fetchEvent(eventId);
      
      if (res.success) {
        setEvent(res.data);
        
        // Load participants
        const participants = await fetchEventParticipants(eventId);
        setParticipantCount(participants.length || 0);
        
        // Check if current user is already registered
        if (user && participants.length > 0) {
          const alreadyRegistered = participants.some(
            (p) => p.user_id === user.id
          );
          setIsRegistered(alreadyRegistered);
        }
      } else {
        setError("Acara tidak ditemukan.");
      }
    } catch (err) {
      console.error(err);
      setError("Gagal memuat acara.");
    } finally {
      setLoading(false);
    }
  }

  const handleRegister = async () => {
    if (!user) {
      alert("Silakan login terlebih dahulu untuk mendaftar");
      navigate("/login");
      return;
    }

    if (!event) return;

    try {
      setRegistering(true);
      
      // Use your friend's simpler API call
      await registerParticipant(event.id);

      setIsRegistered(true);
      setParticipantCount((prev) => prev + 1);
      alert("Berhasil mendaftar! Konfirmasi akan dikirim melalui WhatsApp Anda.");
    } catch (err) {
      console.error(err);
      alert("Pendaftaran gagal, silakan coba lagi.");
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-600">Memuat acara...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-600 hover:underline mb-4"
        >
          <ArrowLeft size={20} />
          Kembali
        </button>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!event) return null;

  // Use your friend's backend field (slots_available)
  const quota = event.slots_available ?? null;
  const slotsLeft = quota ? Math.max(quota - participantCount, 0) : null;
  const isFull = quota && participantCount >= quota;

  // Get first poster image if available
  const posterImage = event.media && event.media.length > 0 ? event.media[0].file_url : null;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto p-6 lg:p-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-600 hover:underline mb-6"
        >
          <ArrowLeft size={20} />
          Kembali
        </button>

        {/* Event Card */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Poster Image */}
          {posterImage && (
            <img
              src={posterImage}
              alt="Poster Acara"
              className="w-full h-64 object-cover"
            />
          )}

          {/* Content */}
          <div className="p-6 lg:p-8">
            {/* Title */}
            <h1 className="text-3xl font-bold text-gray-800 mb-6">{event.title}</h1>

            {/* Event Info */}
            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-3 text-gray-700">
                <Calendar size={20} className="text-blue-600 flex-shrink-0" />
                <span className="font-medium">
                  {new Date(event.event_date).toLocaleDateString("id-ID", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>

              <div className="flex items-center gap-3 text-gray-700">
                <MapPin size={20} className="text-red-600 flex-shrink-0" />
                <span className="font-medium">{event.location || "Lokasi tidak tersedia"}</span>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6 pb-6 border-b">
              <h3 className="font-semibold text-gray-800 mb-2 text-lg">Deskripsi Acara</h3>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {event.description || "Deskripsi tidak tersedia."}
              </p>
            </div>

            {/* Registration Info */}
            {event.requires_registration && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <Users size={24} className="text-blue-600" />
                  <h3 className="text-xl font-bold text-gray-800">
                    {participantCount} peserta terdaftar
                  </h3>
                </div>
                {quota ? (
                  <p className="text-gray-600">
                    Kuota: {quota} orang • Sisa slot: {slotsLeft}
                  </p>
                ) : (
                  <p className="text-gray-600">Kuota tidak terbatas</p>
                )}
              </div>
            )}

            {/* Register Button */}
            {event.requires_registration && (
              <>
                {!user ? (
                  <button
                    onClick={() => navigate("/login")}
                    className="w-full bg-blue-600 text-white py-4 rounded-lg hover:bg-blue-700 font-bold text-lg transition-colors shadow-md hover:shadow-lg"
                  >
                    Login untuk Mendaftar
                  </button>
                ) : isRegistered ? (
                  <div className="bg-green-50 border-2 border-green-500 rounded-lg p-6 text-center">
                    <div className="text-green-600 font-bold text-xl mb-2">✓ Sudah Terdaftar</div>
                    <p className="text-gray-700">Anda sudah terdaftar untuk acara ini</p>
                  </div>
                ) : isFull ? (
                  <div className="bg-red-50 border-2 border-red-500 rounded-lg p-6 text-center">
                    <div className="text-red-600 font-bold text-xl mb-2">Kuota Penuh</div>
                    <p className="text-gray-700">Maaf, kuota peserta sudah terpenuhi</p>
                  </div>
                ) : (
                  <button
                    onClick={handleRegister}
                    disabled={registering}
                    className="w-full bg-blue-600 text-white py-4 rounded-lg hover:bg-blue-700 font-bold text-lg transition-colors shadow-md hover:shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {registering ? "Memproses..." : "Daftar Sekarang"}
                  </button>
                )}
              </>
            )}

            {!event.requires_registration && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                <p className="text-gray-600 font-medium">Acara ini tidak memerlukan pendaftaran</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}