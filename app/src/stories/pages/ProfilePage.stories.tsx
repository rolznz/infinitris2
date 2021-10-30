import React from 'react';

import { Meta } from '@storybook/react';
import ProfilePage from '@/components/pages/ProfilePage/ProfilePage';

export default {
  title: 'Pages',
  component: ProfilePage,
  argTypes: {},
  decorators: [],
} as Meta;

export const _ProfilePage = () => <ProfilePage />;
