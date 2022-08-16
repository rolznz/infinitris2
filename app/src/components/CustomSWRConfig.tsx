import { orderedStringify } from '@/utils/orderedStringify';
import React from 'react';
import { SWRConfig } from 'swr';

function _CustomSWRConfig({ children }: React.PropsWithChildren<{}>) {
  return (
    <SWRConfig
      value={{
        compare: (a, b) => orderedStringify(a) === orderedStringify(b),
      }}
    >
      {children}
    </SWRConfig>
  );
}

export const CustomSWRConfig = React.memo(_CustomSWRConfig, () => true);
