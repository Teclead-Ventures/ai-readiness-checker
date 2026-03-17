'use client';

import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';
import type { FieldPath } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BUSINESS_ROLES,
  COMPANY_SIZES,
  DEV_LANGUAGES,
  DEV_ROLES,
  INDUSTRIES,
  type SurveyFormData,
  type Track,
} from '@/types/survey';

interface ProfileStepProps {
  track: Track;
}

export function ProfileStep({ track }: ProfileStepProps) {
  const t = useTranslations('survey.profile');
  const tCommon = useTranslations('common');
  const { control } = useFormContext<SurveyFormData>();

  const roles = track === 'dev' ? DEV_ROLES : BUSINESS_ROLES;

  return (
    <div className="space-y-6">
      <h2 className="text-xl sm:text-[1.875rem] font-bold font-display hyphens-auto">{t('title')}</h2>

      {/* Name (optional) */}
      <FormField
        control={control}
        name="respondent_name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {t('name')}{' '}
              <span className="text-muted-foreground text-xs">({tCommon('optional')})</span>
            </FormLabel>
            <FormControl>
              <Input placeholder={t('namePlaceholder')} className="h-11" {...field} />
            </FormControl>
            <FormDescription>{t('nameHint')}</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Role */}
      <FormField
        control={control}
        name={'profile.role' as FieldPath<SurveyFormData>}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('role')}</FormLabel>
            <Select value={field.value as string} onValueChange={field.onChange}>
              <FormControl>
                <SelectTrigger className="w-full h-11">
                  <SelectValue placeholder={t('rolePlaceholder')} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Experience Years */}
      <FormField
        control={control}
        name={'profile.experience_years' as FieldPath<SurveyFormData>}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('experience')}</FormLabel>
            <FormControl>
              <Input
                type="number"
                min={0}
                max={50}
                className="h-11"
                name={field.name}
                ref={field.ref}
                onBlur={field.onBlur}
                value={field.value as number}
                onChange={(e) => {
                  const n = e.target.valueAsNumber;
                  field.onChange(isNaN(n) ? 0 : n);
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Dev: Languages */}
      {track === 'dev' && (
        <FormField
          control={control}
          name={'profile.languages' as FieldPath<SurveyFormData>}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('languages')}</FormLabel>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {DEV_LANGUAGES.map((lang) => {
                  const selected = (field.value as string[]) ?? [];
                  const checked = selected.includes(lang);
                  return (
                    <label
                      key={lang}
                      className="flex items-center gap-2 p-3 rounded-lg border border-border bg-card cursor-pointer hover:bg-card/80 transition-colors min-h-[2.75rem]"
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(isChecked) =>
                          field.onChange(
                            isChecked
                              ? [...selected, lang]
                              : selected.filter((l) => l !== lang),
                          )
                        }
                      />
                      <span className="text-sm">{lang}</span>
                    </label>
                  );
                })}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {/* Business: Industry */}
      {track === 'business' && (
        <FormField
          control={control}
          name={'profile.industry' as FieldPath<SurveyFormData>}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('industry')}</FormLabel>
              <Select value={(field.value as string) ?? ''} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="w-full h-11">
                    <SelectValue placeholder={t('industryPlaceholder')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {INDUSTRIES.map((ind) => (
                    <SelectItem key={ind} value={ind}>
                      {ind}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {/* Company Size */}
      <FormField
        control={control}
        name={'profile.company_size' as FieldPath<SurveyFormData>}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('companySize')}</FormLabel>
            <Select value={(field.value as string) ?? ''} onValueChange={field.onChange}>
              <FormControl>
                <SelectTrigger className="w-full h-11">
                  <SelectValue placeholder={t('companySizePlaceholder')} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {COMPANY_SIZES.map((size) => (
                  <SelectItem key={size} value={size}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
