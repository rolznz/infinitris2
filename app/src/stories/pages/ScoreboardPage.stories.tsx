import React from 'react';

import { Meta } from '@storybook/react';
import ScoreboardPage from '@/components/pages/ScoreboardPage/ScoreboardPage';

export default {
  title: 'Pages',
  component: ScoreboardPage,
  argTypes: {},
  decorators: [],
} as Meta;

export const _ScoreboardPage = () => <ScoreboardPage />;
