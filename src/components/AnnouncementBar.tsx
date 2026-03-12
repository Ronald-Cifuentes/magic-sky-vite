import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client/core';

const GET_ANNOUNCEMENT = gql`
  query GetAnnouncementBar {
    announcementBar {
      id
      text
      linkUrl
    }
  }
`;

export function AnnouncementBar() {
  const { data } = useQuery(GET_ANNOUNCEMENT);
  const announcement = data?.announcementBar;

  if (!announcement?.text) return null;

  return (
    <div
      className="bg-gradient-to-r from-primary-light to-primary py-2 px-4 text-center text-white text-sm font-medium tracking-wider uppercase"
      style={{ background: 'linear-gradient(90deg, #ff7bb6, #ff4f9c)' }}
    >
      {announcement.linkUrl ? (
        <a href={announcement.linkUrl} className="hover:underline">
          {announcement.text}
        </a>
      ) : (
        <span>{announcement.text}</span>
      )}
    </div>
  );
}
