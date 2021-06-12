import IChallenge from '../IChallenge';

const outsideTheBox: IChallenge = {
  isOfficial: true,
  title: 'Outside The Box',
  description: '',
  locale: 'en',
  isMandatory: true,
  isPublished: true,
  priority: 7000,
  finishCriteria: {},
  rewardCriteria: {
    gold: {
      maxBlocksPlaced: 10,
    },
    silver: {
      maxBlocksPlaced: 20,
    },
  },
  grid: `
000000000000000
000000000000000
000000000000000
000000000000000
000000000000000
000000000rrrrrr
000000000rbbbbr
000000000rb00br
000000000rb00br
000000000rbFFbr
000000000rbXXbr
000000000rbbbbr
000000000rbBbbr
000000000rrrrrr
000000000000000
000000000000000
000000000000000
000000000000000
000000000000000
XXX0XXXXXXXXXXX
R0000000X00X00X
`,
};

export default outsideTheBox;
