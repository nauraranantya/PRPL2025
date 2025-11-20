import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, MapPin, Clock } from "lucide-react";
import { fetchEvents, fetchEventParticipants } from "../../api";
import { Section, Container, PageHeader, Card } from "../../components/layout";
import { Heading, Text } from "../../components/ui";

export default function MyEvents({ user }) {
  const [myEvents, setMyEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) loadMyEvents();
  }, [user]);

  async function loadMyEvents() {
    try {
      setLoading(true);
      setError(null);

      const eventsRes = await fetchEvents();
      if (!eventsRes.success) return setError("Gagal memuat acara");

      const all = eventsRes.data || [];
      const registered = [];

      for (const event of all) {
        const participants = await fetchEventParticipants(event.id);
        const isRegistered = participants.some((p) => p.user_id === user.id);
        if (isRegistered) registered.push(event);
      }

      registered.sort((a, b) => new Date(a.event_date) - new Date(b.event_date));
      setMyEvents(registered);
    } catch (err) {
      setError("Terjadi kesalahan saat memuat data");
    } finally {
      setLoading(false);
    }
  }

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  const formatTime = (date) =>
    new Date(date).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });

  const isUpcoming = (d) => new Date(d) >= new Date();

  return (
    <Section>
      <Container>

        <PageHeader
          title="Acara Saya"
          subtitle="Daftar acara yang Anda ikuti"
        />

        {loading && (
          <Text className="text-center py-10 text-gray-600">
            Memuat acara Anda...
          </Text>
        )}

        {error && (
          <Card className="border-red-300 bg-red-50 text-red-700 p-4 mb-6">
            {error}
          </Card>
        )}

        {myEvents.length === 0 && !loading ? (
          <Card className="p-10 text-center">
            <Text className="text-gray-500 mb-4">
              Anda belum terdaftar di acara manapun.
            </Text>
            <Link
              to="/daftar-acara"
              className="inline-block bg-[#043873] text-white px-6 py-2 rounded-lg hover:bg-blue-900 transition"
            >
              Lihat Acara Tersedia
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {myEvents.map((e) => {
              const upcoming = isUpcoming(e.event_date);

              return (
                <Link to={`/detail-acara/${e.id}`} key={e.id}>
                  <Card className="p-5 hover:shadow-lg transition">
                    <div className="flex justify-between">
                      <div>
                        <Heading level={3} className="mb-2">
                          {e.title}
                        </Heading>

                        <div className="space-y-1 text-gray-600 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar size={16} /> {formatDate(e.event_date)}
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock size={16} /> {formatTime(e.event_date)}
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin size={16} /> {e.location}
                          </div>
                        </div>
                      </div>

                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium h-fit ${
                          upcoming
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {upcoming ? "Mendatang" : "Selesai"}
                      </span>
                    </div>

                    {e.description && (
                      <Text className="text-sm text-gray-600 mt-3 line-clamp-2">
                        {e.description}
                      </Text>
                    )}
                  </Card>
                </Link>
              );
            })}
          </div>
        )}

      </Container>
    </Section>
  );
}
