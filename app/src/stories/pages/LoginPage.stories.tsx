import React from 'react';

import { Meta } from '@storybook/react';
import LoginPage from '@/components/pages/LoginPage';

export default {
  title: 'Pages',
  component: LoginPage,
  argTypes: {},
  decorators: [],
} as Meta;

export const _LoginPage = () => <LoginPage />;
