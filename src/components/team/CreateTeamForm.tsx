'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ShareLinks } from './ShareLinks';

const createTeamSchema = z.object({
  name: z.string().min(1),
  created_by_name: z.string().min(1),
  created_by_email: z.string().email().optional().or(z.literal('')),
  track_preset: z.enum(['both', 'dev', 'business']),
  anonymous: z.boolean(),
  language: z.enum(['en', 'de']),
});

type CreateTeamFormData = z.infer<typeof createTeamSchema>;

export function CreateTeamForm() {
  const t = useTranslations('team');
  const tc = useTranslations('common');
  const [createdTeamId, setCreatedTeamId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateTeamFormData>({
    resolver: zodResolver(createTeamSchema),
    defaultValues: {
      name: '',
      created_by_name: '',
      created_by_email: '',
      track_preset: 'both',
      anonymous: false,
      language: 'en',
    },
  });

  const trackPreset = watch('track_preset');
  const anonymous = watch('anonymous');
  const language = watch('language');

  const onSubmit = async (data: CreateTeamFormData) => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          created_by_email: data.created_by_email || undefined,
        }),
      });
      if (!res.ok) throw new Error('Failed to create team');
      const team = await res.json();
      setCreatedTeamId(team.id);
    } catch {
      setError(tc('error'));
    } finally {
      setSubmitting(false);
    }
  };

  if (createdTeamId) {
    return <ShareLinks teamId={createdTeamId} />;
  }

  return (
    <Card className="w-full max-w-lg mx-auto bg-white rounded-xl border border-gray-200 p-8">
      <CardHeader>
        <CardTitle>{t('create.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Team name */}
          <div className="space-y-1.5">
            <Label htmlFor="name">{t('create.name')} *</Label>
            <Input
              id="name"
              placeholder={t('create.namePlaceholder')}
              {...register('name')}
              aria-invalid={!!errors.name}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{tc('required')}</p>
            )}
          </div>

          {/* Manager name */}
          <div className="space-y-1.5">
            <Label htmlFor="created_by_name">{t('create.managerName')} *</Label>
            <Input
              id="created_by_name"
              placeholder={t('create.managerNamePlaceholder')}
              {...register('created_by_name')}
              aria-invalid={!!errors.created_by_name}
            />
            {errors.created_by_name && (
              <p className="text-xs text-destructive">{tc('required')}</p>
            )}
          </div>

          {/* Manager email */}
          <div className="space-y-1.5">
            <Label htmlFor="created_by_email">
              {t('create.managerEmail')}
            </Label>
            <Input
              id="created_by_email"
              type="email"
              placeholder={t('create.managerEmailPlaceholder')}
              {...register('created_by_email')}
            />
          </div>

          {/* Track preset */}
          <div className="space-y-1.5">
            <Label>{t('create.trackPreset')}</Label>
            <Select
              value={trackPreset}
              onValueChange={(val) =>
                setValue('track_preset', val as CreateTeamFormData['track_preset'])
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="both">{t('create.trackBoth')}</SelectItem>
                <SelectItem value="dev">{t('create.trackDev')}</SelectItem>
                <SelectItem value="business">{t('create.trackBusiness')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Anonymous mode */}
          <div className="flex items-center justify-between gap-4">
            <div>
              <Label>{t('create.anonymous')}</Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t('create.anonymousDesc')}
              </p>
            </div>
            <Switch
              checked={anonymous}
              onCheckedChange={(checked) => setValue('anonymous', checked)}
            />
          </div>

          {/* Language */}
          <div className="space-y-1.5">
            <Label>{tc('language')}</Label>
            <Select
              value={language}
              onValueChange={(val) =>
                setValue('language', val as 'en' | 'de')
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">{tc('english')}</SelectItem>
                <SelectItem value="de">{tc('german')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <Button
            type="submit"
            className="w-full bg-[#FFAB54] text-[#121212] font-bold hover:bg-[#FFAB54]/90 rounded-lg py-3"
            disabled={submitting}
          >
            {submitting ? tc('loading') : t('create.submit')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
