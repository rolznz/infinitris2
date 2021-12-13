import { IChallenge } from 'infinitris2-models';

import { v4 as uuidv4 } from 'uuid';
import { WithId } from '@/models/WithId';

export function createNewChallenge(): WithId<IChallenge> {
  return {
    id: uuidv4(),
    grid: `
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
000000000
0XX0X0XX0
X00X0XX0X
FFFFFFFFF`.trim(),
    created: false,
  };
}
