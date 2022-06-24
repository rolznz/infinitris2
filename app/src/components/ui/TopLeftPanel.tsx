import FlexBox from '@/components/ui/FlexBox';
import useAppStore from '@/state/AppStore';
import React from 'react';
import ReactDOM from 'react-dom';

export function TopLeftPanel(props: React.PropsWithChildren<{}>) {
  const ref = React.useCallback((element: Element) => {
    useAppStore.getState().setTopLeftPanel(element || undefined);
  }, []);
  return (
    <FlexBox
      flexDirection="row"
      zIndex="hamburgerButton"
      sx={{
        opacity: 1,
        position: 'fixed',
        top: 0,
        left: 0,
        pointerEvents: 'none',
      }}
      justifyContent="flex-start"
      alignItems="flex-start"
      p={2}
      gap={1}
      ref={ref}
    >
      {props.children}
    </FlexBox>
  );
}

export function TopLeftPanelPortal({ children }: React.PropsWithChildren<{}>) {
  const element = useAppStore((store) => store.topLeftPanel);
  if (!element) {
    return null;
  }
  return ReactDOM.createPortal(children, element);
}
