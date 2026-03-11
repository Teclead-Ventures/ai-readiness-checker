'use client';

import { useCallback, useRef } from 'react';
import { getOrCreateSessionId, getCampaignFromSession } from '@/lib/campaign';

export function useFunnelTracking(track?: string | null) {
  const fired = useRef(new Set<string>());

  const trackStep = useCallback(
    (step: string, action: 'enter' | 'complete') => {
      const key = `${step}:${action}`;
      if (fired.current.has(key)) return;
      fired.current.add(key);

      const sessionId = getOrCreateSessionId();
      const { src } = getCampaignFromSession();

      fetch('/api/analytics/funnel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          src: src || undefined,
          track: track || undefined,
          step,
          action,
        }),
      }).catch(() => {});
    },
    [track],
  );

  return { trackStep };
}
