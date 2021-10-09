import React from 'react';

import { Meta, Story } from '@storybook/react';
import {
  ScoreboardCard,
  ScoreboardCardProps,
} from '@/components/pages/ScoreboardPage/ScoreboardCard';

export default {
  title: 'Components/ScoreboardPage',
  component: ScoreboardCard,
  argTypes: {},
  decorators: [],
} as Meta;

const Template: Story<ScoreboardCardProps> = (args) => (
  <ScoreboardCard {...args} />
);

export const _ScoreboardCard = Template.bind({});
_ScoreboardCard.args = {};
