import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { MeetingEntity, MeetingSyncStatus } from './models/meeting.models';
import { MeetingRepository } from './MeetingRepository';
import { MeetingSynchronizationService } from './MeetingSynchronizationService';

export interface MeetingContextContract {
  meetings: MeetingEntity[];
  loading: boolean;
  syncStatus: MeetingSyncStatus | null;
  triggerSync: () => Promise<void>;
}

export const initialMeetingContext: MeetingContextContract = {
  meetings: [],
  loading: true,
  syncStatus: null,
  triggerSync: async () => {}
};

export const MeetingContext = createContext<MeetingContextContract>(initialMeetingContext);

interface MeetingProviderProps {
  children: ReactNode;
}

export function MeetingProvider({ children }: MeetingProviderProps) {
  const [meetings, setMeetings] = useState<MeetingEntity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [syncStatus, setSyncStatus] = useState<MeetingSyncStatus | null>(null);

  const loadMeetings = async () => {
    setLoading(true);
    const data = await MeetingRepository.getAllMeetings();
    setMeetings(data);
    setLoading(false);
  };

  const handleSync = async () => {
    setLoading(true);
    await MeetingSynchronizationService.triggerSync('Manual');
    await loadMeetings();
  };

  useEffect(() => {
    loadMeetings();
  }, []);

  return (
    <MeetingContext.Provider value={{ meetings, loading, syncStatus, triggerSync: handleSync }}>
      {children}
    </MeetingContext.Provider>
  );
}

export function useMeetings(): MeetingContextContract {
  return useContext(MeetingContext);
}
