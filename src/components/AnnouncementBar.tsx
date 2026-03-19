import { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client/core';
import { useAnnouncement } from '../context/AnnouncementContext';

const GET_ANNOUNCEMENT = gql`
  query GetAnnouncementBar {
    announcementBar {
      id
      text
      linkUrl
    }
  }
`;

const barClass = 'py-2 px-4 text-center text-white text-sm font-medium tracking-wider uppercase';
const barStyle = { background: 'linear-gradient(90deg, #ff7bb6, #ff4f9c)' };

export function AnnouncementBar() {
  const { override } = useAnnouncement() ?? {};
  const { data } = useQuery(GET_ANNOUNCEMENT, { errorPolicy: 'ignore' });
  const announcement = data?.announcementBar;

  const hasOverride = Array.isArray(override) && override.length > 0 && override.some((m) => (m.text ?? '').trim());
  const items = hasOverride
    ? override!.filter((m) => (m.text ?? '').trim())
    : announcement ? [{ text: announcement.text, linkUrl: announcement.linkUrl ?? undefined }] : [];

  const [currentIndex, setCurrentIndex] = useState(0);
  useEffect(() => setCurrentIndex(0), [items.length]);
  useEffect(() => {
    if (items.length <= 1) return;
    const id = setInterval(() => setCurrentIndex((i) => (i + 1) % items.length), 4000);
    return () => clearInterval(id);
  }, [items.length]);

  if (items.length === 0) return null;

  const current = items[currentIndex % items.length];
  return (
    <div className={barClass} style={barStyle}>
      {current.linkUrl ? (
        <a href={current.linkUrl} className="hover:underline">
          {current.text}
        </a>
      ) : (
        <span>{current.text}</span>
      )}
    </div>
  );
}
