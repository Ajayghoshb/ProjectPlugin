import React, { useState, useEffect } from 'react';
import PlugIt from '../../components/PlugIt';
import CustomReportModule from '../../components/CustomReportModule';

export type TeamsRoute = 'collection' | 'settings' | 'custom-report';

export function TeamsRouter() {
  const [activeRoute, setActiveRoute] = useState<TeamsRoute>('collection');

  useEffect(() => {
    const hash = window.location.hash || '';
    if (hash.includes('custom-report')) {
      setActiveRoute('custom-report');
    } else if (hash.includes('settings')) {
      setActiveRoute('settings');
    } else {
      setActiveRoute('collection');
    }
  }, []);

  return (
    <div className="teams-router-root h-full bg-slate-950">
      {activeRoute === 'custom-report' ? (
        <CustomReportModule />
      ) : (
        <PlugIt />
      )}
    </div>
  );
}
