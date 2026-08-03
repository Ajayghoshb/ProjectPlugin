import React, { createContext, useContext, ReactNode } from 'react';
import { TeamsTabContext, TeamsMeetingContext } from './TeamsContext.models';
import { TeamsContextService } from './TeamsContextService';

interface TeamsContextState {
  tabContext: TeamsTabContext;
  meetingContext: TeamsMeetingContext;
}

const initialContext: TeamsContextState = {
  tabContext: TeamsContextService.getTabContext(),
  meetingContext: TeamsContextService.getMeetingContext()
};

export const TeamsContextAbstraction = createContext<TeamsContextState>(initialContext);

export function TeamsContextProvider({ children }: { children: ReactNode }) {
  return React.createElement(
    TeamsContextAbstraction.Provider,
    { value: initialContext },
    children
  );
}

export function useTeamsTabContext(): TeamsTabContext {
  return useContext(TeamsContextAbstraction).tabContext;
}

