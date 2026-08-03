import React, { useState } from 'react';
import PlugIt from '../../components/PlugIt';

export type TeamsRoute = 'collection' | 'settings';

export function TeamsRouter() {
  const [activeRoute, setActiveRoute] = useState<TeamsRoute>('collection');

  return (
    <div className="teams-router-root space-y-4">
      {/* Reuses PlugIt Teams AI Meeting Intelligence Plugin Module */}
      <PlugIt />
    </div>
  );
}
