import { TrackNumber, TrackNumberValues } from '@/sound/SoundManager';
import {
  SimulationSettings,
  WorldType,
  WorldVariation,
} from 'infinitris2-models';
import create from 'zustand';

export type SinglePlayerOptionsFormData = {
  numBots: number;
  botReactionDelay: number;
  botRandomReactionDelay: number;
  gridNumRows: number;
  gridNumColumns: number;
  spectate: boolean;
  isDemo: boolean;
  worldType: WorldType;
  worldVariation: WorldVariation;
  trackNumber: TrackNumber;
  simulationSettings: SimulationSettings;
};

export const getSinglePlayerOptionsDefaultValues =
  (): SinglePlayerOptionsFormData => ({
    numBots: 4,
    botReactionDelay: 15,
    botRandomReactionDelay: 25,
    gridNumRows: 16,
    gridNumColumns: 50,
    spectate: false,
    isDemo: false,

    worldType: 'grass',
    worldVariation: 0,
    trackNumber:
      TrackNumberValues[Math.floor(Math.random() * TrackNumberValues.length)],
    simulationSettings: {
      roundLength: 'medium',
      mistakeDetection: true,
      calculateSpawnDelays: true,
      preventTowers: true,
      instantDrops: true,
      gameModeType: 'infinity',
    },
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
