import React from 'react';

import { Meta } from '@storybook/react';
import { HomePage } from '@/components/pages/HomePage/HomePage';
import { HomePageBackground } from '@/components/pages/HomePage/HomePageBackground';

export default {
  title: 'Pages',
  component: HomePageBackground,
  argTypes: {},
  decorators: [],
} as Meta;

export const _HomePage = () => <HomePageBackground />;
