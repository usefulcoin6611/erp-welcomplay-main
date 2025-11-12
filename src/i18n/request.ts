import {getRequestConfig} from 'next-intl/server';
import {cookies} from 'next/headers';

export default getRequestConfig(async () => {
  // Get locale from cookies, default to 'id' (Indonesian)
  const store = await cookies();
  const locale = store.get('locale')?.value || 'id';

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default
  };
});