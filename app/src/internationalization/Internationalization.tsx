import React, { useEffect } from 'react';
import { IntlProvider } from 'react-intl';
import { defaultLocale } from '.';
import useAppStore from '../state/AppStore';
import { useUser } from '../state/UserStore';

function loadLocaleData(locale: string) {
  return import(`./compiled-lang/${locale}.json`);
}

export default function Internationalization(
  props: React.PropsWithChildren<{}>
) {
  const appStore = useAppStore();
  const locale = useUser().locale || defaultLocale;
  const setInternationalizationMessages =
    appStore.setInternationalizationMessages;
  useEffect(() => {
    (async () => {
      setInternationalizationMessages(await loadLocaleData(locale));
    })();
  }, [locale, setInternationalizationMessages]);

  if (!Object.keys(appStore.internationalization.messages).length) {
    return null;
  }

  return (
    <IntlProvider
      messages={appStore.internationalization.messages}
      locale={locale}
      defaultLocale={defaultLocale}
    >
      {props.children}
    </IntlProvider>
  );
}
