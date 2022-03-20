import { leaderboardListener } from '@/game/listeners/leaderboardListener';
import { sfxListener } from '@/game/listeners/sfxListener';
import { ISimulationEventListener } from 'infinitris2-models';

export const coreGameListeners: Partial<ISimulationEventListener>[] = [
  sfxListener,
  leaderboardListener,
];
