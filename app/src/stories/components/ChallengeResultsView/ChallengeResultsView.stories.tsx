import ChallengeResultsView, {
  ChallengeResultsViewProps,
} from '@/components/pages/ChallengePage/ChallengeResultsView';
import { IChallengeAttempt } from 'infinitris2-models';
import React from 'react';

import { Meta, Story } from '@storybook/react';

export default {
  title: 'Components/ChallengeResultsView',
  component: ChallengeResultsView,
  argTypes: {
    onContinue: {
      table: {
        disable: true,
      },
    },
    onRetry: {
      table: {
        disable: true,
      },
    },
  },
  decorators: [],
} as Meta;

const status: IChallengeAttempt = {
  medalIndex: 3,
  status: 'success',
  stats: {
    blocksPlaced: 1,
    linesCleared: 1,
    timeTakenMs: 1500,
  },
  userId: '',
  created: false,
  challengeId: '',
};

const Template: Story<ChallengeResultsViewProps> = (args) => (
  <ChallengeResultsView {...args} />
);

export const _ChallengeResultsView = Template.bind({});
_ChallengeResultsView.args = {
  challengeId: 'basic-movement',
  onContinue: () => alert('Continue'),
  onRetry: () => alert('Retry'),
  //status,
};
