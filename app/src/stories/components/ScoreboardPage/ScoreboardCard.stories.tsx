import React from 'react';

import { Meta, Story } from '@storybook/react';
import {
  ScoreboardCard,
  ScoreboardCardProps,
} from '@/components/pages/ScoreboardPage/ScoreboardCard';
import FlexBox from '@/components/ui/FlexBox';

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
_ScoreboardCard.args = {
  entry: {
    coins: 123,
    networkImpact: 55,
    nickname: 'Ahgaaaaaaaaaaaa',
    numBadges: 14,
  },
  placing: 1,
};

export const _ScoreboardCards = () => {
  return (
    <FlexBox flexDirection="row" flexWrap="wrap" gridGap="10px">
      {[1, 2, 3, 4, 99, 100, 999, 1000].map((placing) => (
        <ScoreboardCard
          key={placing}
          placing={placing}
          entry={{
            coins: 123,
            networkImpact: 55,
            nickname: 'Ahgaaaaaaaaaaaa',
            numBadges: 14,
          }}
        />
      ))}
    </FlexBox>
  );
};
