import { IPlayer } from 'infinitris2-models';
import create from 'zustand';

type IngameStore = {
  readonly player?: IPlayer;
  //readonly simulation: ISimulation;
  setPlayer(player: IPlayer): void;
};

const useIngameStore = create<IngameStore>((set) => ({
  player: undefined,
  setPlayer: (player: IPlayer) => set((_) => ({ player })),
}));

export default useIngameStore;
