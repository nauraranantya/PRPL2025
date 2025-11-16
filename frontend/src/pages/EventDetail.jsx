// src/pages/EventDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Calendar, MapPin, Users } from "lucide-react";
import { fetchEvent, registerParticipant } from "../api";

export default function EventDetail() {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadEvent() {
      try {
        const res = await fetchEvent(eventId);
        if (res.success) {
          setEvent(res.data);
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
    loadEvent();
  }, [eventId]);

  const handleRegister = async () => {
    if (!event) return;
    try {
      await registerParticipant(event.id, {}); // adjust payload if needed
      setIsRegistered(true);
      alert("Konfirmasi pendaftaran akan dikirim melalui WhatsApp Anda");
    } catch (err) {
      console.error(err);
      alert("Pendaftaran gagal, silakan coba lagi.");
    }
  };

  if (loading) return <p className="p-8">Memuat acara...</p>;
  if (error) return <p className="p-8 text-red-500">{error}</p>;
  if (!event) return null;

  // calculate quota left if available
  const registeredCount = event.participants?.length || 0;
  const quota = event.quota || null; // assume backend may provide a quota field
  const slotsLeft = quota ? Math.max(quota - registeredCount, 0) : null;

  // get first poster image if available
  const posterImage =
    event.media && event.media.length > 0 ? event.media[0].file_url : null;

  return (
    <div className="min-h-screen bg-gray-100 w-full">
      <div className="w-full bg-white shadow-xl border-b border-gray-200">
        {/* Header */}
        <div className="bg-blue-900 text-white px-8 py-6">
          <h2 className="text-3xl font-bold">Detail Acara</h2>
        </div>
      </div>

      <div className="w-full p-8">
        <h3 className="text-3xl font-bold text-gray-800 mb-6">{event.title}</h3>

        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-3 text-gray-700">
            <Calendar size={20} className="text-blue-600" />
            <span className="font-medium">{new Date(event.event_date).toLocaleString()}</span>
          </div>
          <div className="flex flex-col gap-3 text-gray-700">
            <div className="flex items-center gap-3">
              <MapPin size={20} className="text-red-600" />
              <span className="font-medium">{event.location || "Lokasi tidak tersedia"}</span>
            </div>
            {/* Poster */}
            {posterImage && (
              <img
                src={posterImage}
                alt="Poster Acara"
                className="mt-4 w-full max-h-[500px] object-cover rounded-lg shadow-md"
              />
            )}
          </div>
        </div>

        {/* Event Description */}
        <div className="mb-6 text-gray-700 leading-relaxed">
          <h4 className="font-semibold text-gray-800 mb-2">Deskripsi Acara</h4>
          <p>{event.description || "Deskripsi tidak tersedia."}</p>
        </div>

        {/* Registration Info */}
        <div className="mb-8">
          {event.requires_registration ? (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-2">
                <Users size={24} className="text-blue-600" />
                <h4 className="text-xl font-bold text-gray-800">
                  {registeredCount} peserta terdaftar
                </h4>
              </div>
              {quota ? (
                <p className="text-gray-600">
                  Kuota: {quota}, Sisa slot: {slotsLeft}
                </p>
              ) : (
                <p className="text-gray-600">Kuota tidak ditentukan</p>
              )}
            </div>
          ) : (
            <p className="text-gray-600">Tidak perlu registrasi</p>
          )}
        </div>

        {/* Register Button */}
        {event.requires_registration && !isRegistered && (
          <button
            onClick={handleRegister}
            className="w-full bg-blue-600 text-white py-4 rounded-lg hover:bg-blue-700 font-bold text-lg transition-colors shadow-md hover:shadow-lg"
          >
            Daftar Sekarang
          </button>
        )}

        {isRegistered && (
          <div className="bg-green-50 border-2 border-green-500 rounded-lg p-6 text-center mt-4">
            <div className="text-green-600 font-bold text-xl mb-2">✓ Terdaftar</div>
            <p className="text-gray-700">Anda sudah terdaftar untuk acara ini</p>
          </div>
        )}=
      </div>
    </div>
  );
}
