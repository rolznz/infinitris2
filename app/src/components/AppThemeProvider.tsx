import { Theme, ThemeProvider, StyledEngineProvider } from '@mui/material';
import useDarkMode from '@/components/hooks/useDarkMode';
import { darkTheme } from '@/theme/darkTheme';
import { lightTheme } from '@/theme/lightTheme';
import React from 'react';
import usePrevious from 'react-use/lib/usePrevious';

export function AppThemeProvider({ children }: React.PropsWithChildren<{}>) {
  const isDarkMode = useDarkMode();
  const prevIsDarkMode = usePrevious(isDarkMode);
  const nextTheme = isDarkMode ? darkTheme : lightTheme;
  const [appTheme, setAppTheme] = React.useState<Theme>(nextTheme);

  React.useEffect(() => {
    if (prevIsDarkMode !== undefined && isDarkMode !== prevIsDarkMode) {
      console.log('Reset app theme');
      // create a copy of the theme to refresh all components within the app
      setAppTheme({ ...nextTheme });
    }
  }, [isDarkMode, prevIsDarkMode, nextTheme]);

  return <AppThemeProviderInternal children={children} appTheme={appTheme} />;
}

const AppThemeProviderInternal = React.memo(
  ({ children, appTheme }: React.PropsWithChildren<{ appTheme: Theme }>) => {
    return (
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={appTheme}>{children}</ThemeProvider>
      </StyledEngineProvider>
    );
  },
  (prev, next) => prev.appTheme === next.appTheme
);
