import { GameModeType, RoundLength, WorldType } from 'infinitris2-models';
import create from 'zustand';

export type SinglePlayerOptionsFormData = {
  numBots: number;
  botReactionDelay: number;
  botRandomReactionDelay: number;
  gridNumRows: number;
  gridNumColumns: number;
  dayLength: number;
  spectate: boolean;
  mistakeDetection: boolean;
  calculateSpawnDelays: boolean;
  preventTowers: boolean;
  worldType: WorldType;
  gameModeType: GameModeType;
  roundLength: RoundLength;
};

export const getSinglePlayerOptionsDefaultValues =
  (): SinglePlayerOptionsFormData => ({
    numBots: 4,
    botReactionDelay: 15,
    botRandomReactionDelay: 25,
    gridNumRows: 18,
    gridNumColumns: 50,
    dayLength: 2000,
    spectate: false,
    mistakeDetection: true,
    calculateSpawnDelays: true,
    preventTowers: true,
    worldType: 'grass',
    gameModeType: 'infinity',
    roundLength: 'medium',
  });

type SinglePlayerOptionsStore = {
  formData: SinglePlayerOptionsFormData;
  setFormData(formData: SinglePlayerOptionsFormData): void;
  reset(): void;
};

const useSinglePlayerOptionsStore = create<SinglePlayerOptionsStore>((set) => ({
  formData: getSinglePlayerOptionsDefaultValues(),
  setFormData: (formData: SinglePlayerOptionsFormData) =>
    set((_) => ({ formData })),
  reset: () =>
    set((_) => ({ formData: getSinglePlayerOptionsDefaultValues() })),
}));

export default useSinglePlayerOptionsStore;
