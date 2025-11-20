import { useTranslation } from 'react-i18next';
import { SegmentedControl, type SegmentedControlOption } from '@/components/ui';
import { updateUserLanguage } from '@/lib/api/user';
import { languages } from '@/lib/locale.config';

type LanguageCode = (typeof languages)[number]['code'];

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const currentLanguageCode = i18n.language.split('-')[0];
  const languageList = languages.map((language) => ({
    code: language.code,
    icon: language.icon,
    label: language.name,
    shortLabel: language.short,
    name: language.name,
  }));

  const fallbackCode = languages[0].code;
  const normalizedLanguage = (
    languageList.some((language) => language.code === currentLanguageCode)
      ? currentLanguageCode
      : fallbackCode
  ) as LanguageCode;

  const options: SegmentedControlOption<LanguageCode>[] = languageList.map((language) => ({
    value: language.code,
    label: (
      <>
        <span aria-hidden>{language.icon}</span>
        <span>{language.shortLabel}</span>
      </>
    ),
  }));

  return (
    <SegmentedControl
      variant="secondary"
      value={normalizedLanguage}
      onValueChange={(languageCode) => {
        // Update frontend language immediately
        i18n.changeLanguage(languageCode);

        // Sync to backend (fire and forget - don't block UI)
        updateUserLanguage(languageCode).catch((error) => {
          console.error('Failed to update user language preference', error);
        });
      }}
      options={options}
    />
  );
}
