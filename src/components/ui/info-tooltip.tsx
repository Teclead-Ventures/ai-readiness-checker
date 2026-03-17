'use client';

import { HelpCircle } from 'lucide-react';
import type { ReactNode } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';

interface InfoTooltipProps {
  content: string | ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
}

/**
 * A small "?" icon that shows an explanatory tooltip on hover/focus.
 * Orange, clearly visible, properly aligned with inline text.
 */
export function InfoTooltip({ content, side = 'top' }: InfoTooltipProps) {
  return (
    <TooltipProvider delay={150}>
      <Tooltip>
        <TooltipTrigger
          render={
            <button
              type="button"
              aria-label="Mehr Informationen"
              className="inline-flex h-5 w-5 shrink-0 cursor-help items-center justify-center rounded-full
                bg-primary/15 text-primary/80
                transition-all hover:bg-primary/25 hover:text-primary
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                align-middle relative top-[-1px]"
            >
              <HelpCircle className="h-4 w-4" />
            </button>
          }
        />
        <TooltipContent
          side={side}
          className="max-w-[240px] text-center leading-relaxed text-xs bg-popover border-border text-popover-foreground shadow-lg"
        >
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
