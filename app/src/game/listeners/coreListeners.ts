import { leaderboardListener } from '@/game/listeners/leaderboardListener';
import { roundListener } from '@/game/listeners/roundListener';
import { sfxListener } from '@/game/listeners/sfxListener';
import { simulationMessageListener } from '@/game/listeners/simulationMessageListener';
import { spawnDelayListener } from '@/game/listeners/spawnDelayListener';
import { ISimulationEventListener } from 'infinitris2-models';

export const coreGameListeners: Partial<ISimulationEventListener>[] = [
  sfxListener,
  leaderboardListener,
  roundListener,
  spawnDelayListener,
  simulationMessageListener,
];
