import { cookies } from 'next/headers';
import { getRequestConfig } from 'next-intl/server';

import { APP_TIME_ZONE, LOCALE_COOKIE } from '@/shared/const/app.const';
import { EN_MESSAGES } from '@/shared/const/messages-en.const';
import { KA_MESSAGES } from '@/shared/const/messages-ka.const';
import { resolveLocale } from '@/shared/utils/locale';

// Locale comes from the visitor's cookie (set by LocaleSwitcher); everyone else gets Georgian.
// Registered with next-intl in next.config.ts.
export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const locale = resolveLocale(cookieStore.get(LOCALE_COOKIE)?.value);
  return {
    locale,
    messages: locale === 'en' ? EN_MESSAGES : KA_MESSAGES,
    timeZone: APP_TIME_ZONE,
  };
});
