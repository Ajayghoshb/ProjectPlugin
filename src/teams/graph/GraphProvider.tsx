import React, { createContext, useContext, ReactNode } from 'react';
import { UserService, OrganizationService, CalendarService, MeetingService, PresenceService, TeamsService } from './services/GraphDomainServices';

export interface GraphContextContract {
  userService: typeof UserService;
  organizationService: typeof OrganizationService;
  calendarService: typeof CalendarService;
  meetingService: typeof MeetingService;
  presenceService: typeof PresenceService;
  teamsService: typeof TeamsService;
}

export const initialGraphContext: GraphContextContract = {
  userService: UserService,
  organizationService: OrganizationService,
  calendarService: CalendarService,
  meetingService: MeetingService,
  presenceService: PresenceService,
  teamsService: TeamsService
};

export const GraphContext = createContext<GraphContextContract>(initialGraphContext);

interface GraphProviderProps {
  children: ReactNode;
}

export function GraphProvider({ children }: GraphProviderProps) {
  return (
    <GraphContext.Provider value={initialGraphContext}>
      {children}
    </GraphContext.Provider>
  );
}

export function useGraph(): GraphContextContract {
  return useContext(GraphContext);
}
