import React, { useState, useEffect, ReactNode } from 'react';
import { TeamsLogger } from '../services/TeamsLogger';

interface Props {
  children: ReactNode;
}

export function TeamsErrorBoundary({ children }: Props) {
  const [hasError, setHasError] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  useEffect(() => {
    const errorHandler = (event: ErrorEvent) => {
      TeamsLogger.error('Unhandled runtime error in Teams App:', event.error);
      setHasError(true);
      setErrorDetails(event.error?.message || 'Unknown runtime exception');
    };

    window.addEventListener('error', errorHandler);
    return () => window.removeEventListener('error', errorHandler);
  }, []);

  if (hasError) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-800 font-sans text-xs space-y-2">
        <strong className="font-bold text-sm block">Microsoft Teams App Error</strong>
        <p>An unexpected runtime error occurred inside the Teams application context.</p>
        {errorDetails && <pre className="p-2 bg-red-100 rounded text-[11px] font-mono overflow-x-auto">{errorDetails}</pre>}
      </div>
    );
  }

  return <>{children}</>;
}
