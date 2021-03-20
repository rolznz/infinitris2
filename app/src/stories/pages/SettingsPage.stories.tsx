import React from 'react';

import { Meta } from '@storybook/react';
import SettingsPage from '@/components/pages/SettingsPage/SettingsPage';

export default {
  title: 'Pages',
  component: SettingsPage,
  argTypes: {},
  decorators: [],
} as Meta;

export const _SettingsPage = () => <SettingsPage />;
