import ChallengeResultsView, {
  ChallengeResultsViewProps,
} from '@/components/pages/ChallengePage/ChallengeResultsView';
import { ChallengeStatus } from 'infinitris2-models';
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

const status: ChallengeStatus = {
  medalIndex: 3,
  code: 'success',
  stats: {
    blocksPlaced: 1,
    linesCleared: 1,
    timeTaken: 1500,
  },
};

const Template: Story<ChallengeResultsViewProps> = (args) => (
  <ChallengeResultsView {...args} />
);

export const _ChallengeResultsView = Template.bind({});
_ChallengeResultsView.args = {
  challengeId: 'basic-movement',
  onContinue: () => alert('Continue'),
  onRetry: () => alert('Retry'),
  status,
};
