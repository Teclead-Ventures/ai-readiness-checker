import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

const BOT_PATTERNS = [
  'Googlebot',
  'bingbot',
  'Baiduspider',
  'YandexBot',
  'DuckDuckBot',
  'Slurp',
  'facebookexternalhit',
  'Twitterbot',
  'LinkedInBot',
];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const cid = request.nextUrl.searchParams.get('cid') || '';

  const ua = request.headers.get('user-agent') || '';
  const isBot = BOT_PATTERNS.some((bot) => ua.includes(bot));

  if (!isBot) {
    try {
      const supabase = createServerClient();
      await supabase.from('campaign_visits').insert({
        src: slug,
        cid: cid || null,
        path: '/c/' + slug,
      });
    } catch {
      // Non-blocking — don't prevent redirect on tracking failure
    }
  }

  const redirectUrl = new URL('/', request.url);
  redirectUrl.searchParams.set('src', slug);
  if (cid) redirectUrl.searchParams.set('cid', cid);
  redirectUrl.searchParams.set('_v', '1');

  return NextResponse.redirect(redirectUrl, 307);
}
