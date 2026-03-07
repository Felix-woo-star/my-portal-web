import { getRequestConfig } from 'next-intl/server';
import { routing } from '@/i18n/routing';

export default getRequestConfig(async ({ requestLocale }) => {
    // This typically corresponds to the `[locale]` segment
    const requestedLocale = await requestLocale;
    const locale = requestedLocale && routing.locales.includes(requestedLocale as (typeof routing.locales)[number])
        ? requestedLocale
        : routing.defaultLocale;

    // Ensure that a valid locale is used
    try {
        return {
            locale,
            messages: (await import(`../../messages/${locale}.json`)).default
        };
    } catch (error) {
        console.error(`Failed to load messages for locale ${locale}:`, error);
        return {
            locale,
            messages: {}
        };
    }
});
