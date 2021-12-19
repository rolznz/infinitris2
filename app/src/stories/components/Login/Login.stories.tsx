import React from 'react';

import { Meta, Story } from '@storybook/react';
import Login, { LoginProps } from '@/components/ui/Login/Login';

export default {
  title: 'Components/Login',
  component: Login,
  argTypes: {},
  decorators: [],
} as Meta;

const Template: Story<LoginProps> = (args) => <Login {...args} />;

export const _Login = Template.bind({});
_Login.args = {};
