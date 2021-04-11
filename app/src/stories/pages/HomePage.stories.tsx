import React from 'react';

import { Meta } from '@storybook/react';
import HomePage from '@/components/pages/HomePage';

export default {
  title: 'Pages',
  component: HomePage,
  argTypes: {},
  decorators: [],
} as Meta;

export const _HomePage = () => <HomePage />;
