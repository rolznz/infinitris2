import useIngameStore from '@/state/IngameStore';
import {
  IPlayer,
  ISimulationEventListener,
  PlayerStatus,
} from 'infinitris2-models';

function updateSpawnDelay(player: IPlayer) {
  if (player.isControllable) {
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
  onEndRound: () => {
    const player = useIngameStore.getState().simulation?.followingPlayer;
    if (player) {
      updateSpawnDelay(player);
    }
  },
};
