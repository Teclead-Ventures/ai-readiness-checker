'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';

interface ConsentBannerProps {
  onAccept: () => void;
  onDecline: () => void;
}

export function ConsentBanner({ onAccept, onDecline }: ConsentBannerProps) {
  const t = useTranslations('consent');
  const [checked, setChecked] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto backdrop-blur-[4px] bg-black/40">
      <div className="relative z-10 mx-4 mt-24 mb-8 w-full max-w-[600px] rounded-xl border-2 border-primary bg-card p-6 shadow-2xl sm:mt-[15vh]">
        <h2 className="text-xl font-bold text-primary mb-4">
          {t('title')}
        </h2>

        <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
          <p>{t('intro')}</p>
          <p>{t('legalBasis')}</p>
          <p>
            {t('moreInfo')}{' '}
            <a
              href="/datenschutz"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline underline-offset-2 hover:text-primary/80"
            >
              {t('privacyLink')}
            </a>
            .
          </p>
        </div>

        <label className="mt-6 flex items-start gap-3 cursor-pointer group">
          <Checkbox
            checked={checked}
            onCheckedChange={setChecked}
            className="mt-0.5 shrink-0"
          />
          <span className="text-sm text-foreground leading-relaxed select-none">
            {t('checkboxLabel')}
          </span>
        </label>

        <div className="mt-6 flex items-center justify-end gap-3">
          <Button
            variant="ghost"
            onClick={onDecline}
            className="text-muted-foreground hover:text-foreground"
          >
            {t('decline')}
          </Button>
          <Button
            onClick={onAccept}
            disabled={!checked}
            className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold"
          >
            {t('accept')}
          </Button>
        </div>
      </div>
    </div>
  );
}
