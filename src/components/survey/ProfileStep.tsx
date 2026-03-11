'use client';

import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
import {
  DEV_ROLES,
  BUSINESS_ROLES,
  COMPANY_SIZES,
  DEV_LANGUAGES,
  INDUSTRIES,
  type Track,
  type SurveyFormData,
} from '@/types/survey';

interface ProfileStepProps {
  track: Track;
}

export function ProfileStep({ track }: ProfileStepProps) {
  const t = useTranslations('survey.profile');
  const tCommon = useTranslations('common');
  const { register, setValue, watch } = useFormContext<SurveyFormData>();

  const roles = track === 'dev' ? DEV_ROLES : BUSINESS_ROLES;
  const selectedRole = watch('profile.role') || undefined;
  const selectedCompanySize = watch('profile.company_size') || undefined;
  const selectedLanguages = (watch('profile.languages' as 'profile') as unknown as string[]) || [];
  const selectedIndustry = track === 'business'
    ? ((watch('profile.industry' as 'profile') as unknown as string) || undefined)
    : undefined;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">{t('title')}</h2>

      {/* Name (optional) */}
      <div className="space-y-2">
        <Label htmlFor="respondent_name">
          {t('name')} <span className="text-muted-foreground text-xs">({tCommon('optional')})</span>
        </Label>
        <Input
          id="respondent_name"
          placeholder={t('namePlaceholder')}
          className="h-11"
          {...register('respondent_name')}
        />
        <p className="text-xs text-muted-foreground">{t('nameHint')}</p>
      </div>

      {/* Role */}
      <div className="space-y-2">
        <Label>{t('role')}</Label>
        <Select
          value={selectedRole}
          onValueChange={(val) => setValue('profile.role', val ?? '')}
        >
          <SelectTrigger className="w-full h-11">
            <SelectValue placeholder={t('rolePlaceholder')} />
          </SelectTrigger>
          <SelectContent>
            {roles.map((role) => (
              <SelectItem key={role} value={role}>
                {role}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Experience Years */}
      <div className="space-y-2">
        <Label htmlFor="experience_years">{t('experience')}</Label>
        <Input
          id="experience_years"
          type="number"
          min={0}
          max={50}
          className="h-11"
          {...register('profile.experience_years', { valueAsNumber: true })}
        />
      </div>

      {/* Dev: Languages */}
      {track === 'dev' && (
        <div className="space-y-3">
          <Label>{t('languages')}</Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {DEV_LANGUAGES.map((lang) => {
              const checked = selectedLanguages.includes(lang);
              return (
                <label
                  key={lang}
                  className="flex items-center gap-2 p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors min-h-[44px]"
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={(isChecked) => {
                      const current = selectedLanguages;
                      if (isChecked) {
                        setValue('profile.languages' as 'profile', [...current, lang] as unknown as SurveyFormData['profile']);
                      } else {
                        setValue('profile.languages' as 'profile', current.filter((l: string) => l !== lang) as unknown as SurveyFormData['profile']);
                      }
                    }}
                  />
                  <span className="text-sm">{lang}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* Business: Industry */}
      {track === 'business' && (
        <div className="space-y-2">
          <Label>{t('industry')}</Label>
          <Select
            value={selectedIndustry}
            onValueChange={(val) => setValue('profile.industry' as 'profile', (val ?? '') as unknown as SurveyFormData['profile'])}
          >
            <SelectTrigger className="w-full h-11">
              <SelectValue placeholder={t('industryPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              {INDUSTRIES.map((ind) => (
                <SelectItem key={ind} value={ind}>
                  {ind}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Company Size */}
      <div className="space-y-2">
        <Label>{t('companySize')}</Label>
        <Select
          value={selectedCompanySize}
          onValueChange={(val) => setValue('profile.company_size', val ?? '')}
        >
          <SelectTrigger className="w-full h-11">
            <SelectValue placeholder={t('companySizePlaceholder')} />
          </SelectTrigger>
          <SelectContent>
            {COMPANY_SIZES.map((size) => (
              <SelectItem key={size} value={size}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
