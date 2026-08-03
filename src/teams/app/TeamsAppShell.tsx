import React, { ReactNode } from 'react';
import { TeamsProvider } from '../providers/TeamsProvider';
import { FluentProvider } from '../providers/FluentProvider';
import { TeamsErrorBoundary } from '../providers/TeamsErrorBoundary';
import { TeamsAuthProvider } from '../auth/TeamsAuthProvider';
import { TeamsAuthGuard } from '../auth/TeamsAuthGuard';
import { GraphProvider } from '../graph/GraphProvider';
import { MeetingProvider } from '../meetings/MeetingProvider';
import { TeamsBootstrap } from './TeamsBootstrap';
import { TeamsLayout } from './TeamsLayout';
import { TeamsRouter } from './TeamsRouter';

interface TeamsAppShellProps {
  children?: ReactNode;
}

export function TeamsAppShell({ children }: TeamsAppShellProps) {
  return (
    <TeamsErrorBoundary>
      <TeamsProvider>
        <FluentProvider>
          <TeamsAuthProvider>
            <GraphProvider>
              <MeetingProvider>
                <TeamsBootstrap>
                  <TeamsLayout>
                    <TeamsAuthGuard>
                      {children || <TeamsRouter />}
                    </TeamsAuthGuard>
                  </TeamsLayout>
                </TeamsBootstrap>
              </MeetingProvider>
            </GraphProvider>
          </TeamsAuthProvider>
        </FluentProvider>
      </TeamsProvider>
    </TeamsErrorBoundary>
  );
}
