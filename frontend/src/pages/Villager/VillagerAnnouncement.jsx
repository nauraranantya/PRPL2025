import React, { useEffect, useState } from "react";
import { fetchAnnouncements } from "../../api";
import AnnouncementCard from "../../components/announcements/AnnouncementCard";
import { Section, Container, PageHeader } from "../../components/layout";
import { Text } from "../../components/ui";

export default function VillagersAnnouncement() {
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    fetchAnnouncements().then((res) => {
      if (res.success) setAnnouncements(res.data);
    });
  }, []);

  return (
    <Section>
      <Container>

        <PageHeader
          title="Pengumuman Desa"
          subtitle="Informasi terbaru seputar kegiatan dan pemberitahuan penting"
        />

        <div className="flex flex-col gap-6">
          {announcements.length === 0 ? (
            <Text className="text-gray-500">Belum ada pengumuman.</Text>
          ) : (
            announcements.map((ann) => (
              <AnnouncementCard key={ann.id} ann={ann} />
            ))
          )}
        </div>

      </Container>
    </Section>
  );
}
