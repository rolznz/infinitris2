import { playSound, SoundKey } from '@/components/sound/MusicPlayer';
import { IBlock, ISimulationEventListener } from 'infinitris2-models';

export const sfxListener: Partial<ISimulationEventListener> = {
  onBlockCreated(block: IBlock) {
    if (block.player.isHuman) {
      playSound(SoundKey.spawn);
    }
  },
  onBlockCreateFailed() {},

  onBlockPlaced(block: IBlock) {
    if (block.player.isHuman) {
      playSound(SoundKey.place);
    }
  },
  onBlockDied(block: IBlock) {
    if (block.player.isHuman) {
      playSound(SoundKey.death);
    }
  },
  onBlockMoved(block: IBlock, dx: number, dy: number, dr: number) {
    if (block.player.isHuman && !block.isDropping) {
      if (dr !== 0) {
        playSound(SoundKey.rotate);
      } else if (dx !== 0 || dy !== 0) {
        playSound(SoundKey.move);
      }
    }
  },
  onBlockDropped(block: IBlock) {
    if (block.player.isHuman) {
      playSound(SoundKey.drop);
    }
  },
};