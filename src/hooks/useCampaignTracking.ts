'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  storeCampaign,
  getCampaignFromSession,
  hasCampaignVisitRecorded,
  markCampaignVisitRecorded,
} from '@/lib/campaign';

export function useCampaignTracking(): { src: string | null; cid: string | null } {
  const searchParams = useSearchParams();
  const recorded = useRef(false);

  const src = searchParams.get('src') || getCampaignFromSession().src;
  const cid = searchParams.get('cid') || getCampaignFromSession().cid;

  useEffect(() => {
    const urlSrc = searchParams.get('src');
    const urlCid = searchParams.get('cid');
    const isRedirected = searchParams.get('_v') === '1';

    if (urlSrc) {
      storeCampaign(urlSrc, urlCid);
    }

    // Record visit client-side only if:
    // - src is present in URL
    // - NOT redirected from /c/ (which already recorded server-side)
    // - Not already recorded this session
    if (urlSrc && !isRedirected && !hasCampaignVisitRecorded() && !recorded.current) {
      recorded.current = true;
      fetch('/api/campaign/visits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          src: urlSrc,
          cid: urlCid || undefined,
          path: window.location.pathname,
        }),
      })
        .then(() => markCampaignVisitRecorded())
        .catch(() => {});
    }
  }, [searchParams]);

  return { src, cid };
}
