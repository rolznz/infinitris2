import React from 'react';

import { Meta } from '@storybook/react';
import AffiliateProgramPage from '@/components/pages/AffiliateProgramPage/AffiliateProgramPage';

export default {
  title: 'Pages',
  component: AffiliateProgramPage,
  argTypes: {},
  decorators: [],
} as Meta;

export const _AffiliateProgramPage = () => <AffiliateProgramPage />;
