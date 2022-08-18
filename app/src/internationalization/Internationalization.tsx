import React, { useEffect } from 'react';
import { IntlProvider } from 'react-intl';
import { defaultLocale } from '.';
import useAppStore from '../state/AppStore';
import { useUser } from '../components/hooks/useUser';

function loadLocaleData(locale: string) {
  return import(`./compiled-lang/${locale}.json`);
}

export default function Internationalization({
  children,
}: React.PropsWithChildren<{}>) {
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
    <InternationalizationInternal
      children={children}
      messages={appStore.internationalization.messages}
      locale={locale}
    />
  );
}

const InternationalizationInternal = React.memo(
  ({
    children,
    messages,
    locale,
  }: React.PropsWithChildren<{
    messages: Record<string, string>;
    locale: string;
  }>) => {
    console.log('Render InternationalizationInternal');
    return (
      <IntlProvider
        messages={messages}
        locale={locale}
        defaultLocale={defaultLocale}
      >
        {children}
      </IntlProvider>
    );
  },
  (prevProps, nextProps) =>
    nextProps.locale === prevProps.locale &&
    nextProps.messages === prevProps.messages
);
