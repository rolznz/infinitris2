import useIngameStore from '@/state/IngameStore';
import {
  IPlayer,
  ISimulationEventListener,
  PlayerStatus,
} from 'infinitris2-models';

function updateSpawnDelay(player: IPlayer) {
  if (player.isHuman) {
    useIngameStore
      .getState()
      .setSpawnDelayDisplayVisible(
        !player.block && player.status === PlayerStatus.ingame
      );
  }
}

export const spawnDelayListener: Partial<ISimulationEventListener> = {
  onPlayerSpawnDelayChanged: updateSpawnDelay,
  onBlockCreated: (block) => updateSpawnDelay(block.player),
  onBlockDestroyed: (block) => updateSpawnDelay(block.player),
};
