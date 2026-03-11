'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckIcon, CopyIcon } from 'lucide-react';

function CopyButton({ value }: { value: string }) {
  const t = useTranslations('common');
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button size="sm" onClick={handleCopy} className="shrink-0 bg-[#121212] text-white hover:bg-gray-800 rounded-lg">
      {copied ? (
        <>
          <CheckIcon className="size-4 mr-1" />
          {t('copied')}
        </>
      ) : (
        <>
          <CopyIcon className="size-4 mr-1" />
          {t('copy')}
        </>
      )}
    </Button>
  );
}

interface ShareLinksProps {
  teamId: string;
}

export function ShareLinks({ teamId }: ShareLinksProps) {
  const t = useTranslations('team');
  const appUrl = typeof window !== 'undefined'
    ? (process.env.NEXT_PUBLIC_APP_URL || window.location.origin)
    : (process.env.NEXT_PUBLIC_APP_URL || '');

  const shareLink = `${appUrl}/team/${teamId}/survey`;
  const resultsLink = `${appUrl}/team/${teamId}`;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('created.title')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm font-medium mb-1">{t('created.shareLink')}</p>
          <p className="text-xs text-muted-foreground mb-2">{t('created.shareLinkDesc')}</p>
          <div className="flex gap-2">
            <Input value={shareLink} readOnly className="flex-1 text-sm" />
            <CopyButton value={shareLink} />
          </div>
        </div>
        <div>
          <p className="text-sm font-medium mb-1">{t('created.resultsLink')}</p>
          <p className="text-xs text-muted-foreground mb-2">{t('created.resultsLinkDesc')}</p>
          <div className="flex gap-2">
            <Input value={resultsLink} readOnly className="flex-1 text-sm" />
            <CopyButton value={resultsLink} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
