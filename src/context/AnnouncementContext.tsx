import { createContext, useContext, useState, ReactNode } from 'react';

export interface AnnouncementMessage {
  text: string;
  linkUrl?: string;
}

interface AnnouncementContextValue {
  override: AnnouncementMessage[] | null;
  setOverride: (v: AnnouncementMessage[] | null) => void;
}

const AnnouncementContext = createContext<AnnouncementContextValue | null>(null);

export function AnnouncementProvider({ children }: { children: ReactNode }) {
  const [override, setOverride] = useState<AnnouncementMessage[] | null>(null);
  return (
    <AnnouncementContext.Provider value={{ override, setOverride }}>
      {children}
    </AnnouncementContext.Provider>
  );
}

export function useAnnouncement() {
  const ctx = useContext(AnnouncementContext);
  return ctx;
}
