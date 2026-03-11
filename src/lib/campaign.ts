import { nanoid } from 'nanoid';

const CAMPAIGN_SRC_KEY = 'arc_campaign_src';
const CAMPAIGN_CID_KEY = 'arc_campaign_cid';
const SESSION_ID_KEY = 'arc_session_id';
const VISIT_RECORDED_KEY = 'arc_visit_recorded';

function isClient(): boolean {
  return typeof window !== 'undefined';
}

export function storeCampaign(src: string, cid?: string | null): void {
  if (!isClient()) return;
  sessionStorage.setItem(CAMPAIGN_SRC_KEY, src);
  if (cid) sessionStorage.setItem(CAMPAIGN_CID_KEY, cid);
}

export function getCampaignFromSession(): { src: string | null; cid: string | null } {
  if (!isClient()) return { src: null, cid: null };
  return {
    src: sessionStorage.getItem(CAMPAIGN_SRC_KEY),
    cid: sessionStorage.getItem(CAMPAIGN_CID_KEY),
  };
}

export function getOrCreateSessionId(): string {
  if (!isClient()) return '';
  let id = sessionStorage.getItem(SESSION_ID_KEY);
  if (!id) {
    id = nanoid(12);
    sessionStorage.setItem(SESSION_ID_KEY, id);
  }
  return id;
}

export function hasCampaignVisitRecorded(): boolean {
  if (!isClient()) return false;
  return sessionStorage.getItem(VISIT_RECORDED_KEY) === '1';
}

export function markCampaignVisitRecorded(): void {
  if (!isClient()) return;
  sessionStorage.setItem(VISIT_RECORDED_KEY, '1');
}
