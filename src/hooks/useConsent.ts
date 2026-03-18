'use client';

import { useState, useCallback } from 'react';

const CONSENT_KEY = 'arc_consent' as const;

export type ConsentState = 'pending' | 'accepted' | 'declined';

function readConsent(): ConsentState {
  if (typeof window === 'undefined') return 'pending';
  const value = localStorage.getItem(CONSENT_KEY);
  if (value === 'accepted') return 'accepted';
  if (value === 'declined') return 'declined';
  return 'pending';
}

export function useConsent(): {
  consent: ConsentState;
  accept: () => void;
  decline: () => void;
  reset: () => void;
} {
  const [consent, setConsent] = useState<ConsentState>(readConsent);

  const accept = useCallback(() => {
    localStorage.setItem(CONSENT_KEY, 'accepted');
    setConsent('accepted');
  }, []);

  const decline = useCallback(() => {
    localStorage.setItem(CONSENT_KEY, 'declined');
    setConsent('declined');
  }, []);

  const reset = useCallback(() => {
    localStorage.removeItem(CONSENT_KEY);
    sessionStorage.removeItem('arc_campaign_src');
    sessionStorage.removeItem('arc_campaign_cid');
    sessionStorage.removeItem('arc_session_id');
    sessionStorage.removeItem('arc_visit_recorded');
    setConsent('pending');
  }, []);

  return { consent, accept, decline, reset };
}

export function hasConsent(): boolean {
  return readConsent() === 'accepted';
}
