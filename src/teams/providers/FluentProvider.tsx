import React, { ReactNode } from 'react';
import { TeamsTheme } from '../types/teams.types';

interface FluentProviderProps {
  children: ReactNode;
  theme?: TeamsTheme;
}

export function FluentProvider({ children, theme = 'default' }: FluentProviderProps) {
  return (
    <div className={`fluent-provider-root theme-${theme}`}>
      {children}
    </div>
  );
}
