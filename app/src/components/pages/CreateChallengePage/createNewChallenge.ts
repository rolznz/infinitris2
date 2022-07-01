import { IChallenge } from 'infinitris2-models';

export function createNewChallenge(): IChallenge {
  return {
    title: '',
    userId: '',
    grid: `
000s00000
000000000
000000000
000000000
000000000
000000000
000000000
000000000
000000000
000000000
000000000
000000000
000000000
0XX0X0XX0
X00X0XX0X
FFFFFFFFF`.trim(),
    created: false,
    isOfficial: false,
  };
}
