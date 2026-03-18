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

  return { consent, accept, decline };
}

export function hasConsent(): boolean {
  return readConsent() === 'accepted';
}
