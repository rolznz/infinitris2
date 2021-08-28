import isMobile from '@/utils/isMobile';
import create from 'zustand';

type LoaderStore = {
  readonly stepsCompleted: number;
  readonly steps: number;
  readonly startClicked: boolean;
  increaseSteps(): void;
  increaseStepsCompleted(): void;
  setStartClicked(startClicked: boolean): void;
  reset(): void;
  isLoaded(): boolean;
};

const useLoaderStore = create<LoaderStore>((set, get) => ({
  steps: 0,
  stepsCompleted: 0,
  startClicked: false,
  increaseSteps: () => set((state) => ({ steps: state.steps + 1 })),
  increaseStepsCompleted: () =>
    set((state) => ({ stepsCompleted: state.stepsCompleted + 1 })),
  setStartClicked: (startClicked) => set(() => ({ startClicked })),
  reset: () =>
    set((_) => ({
      steps: 0,
      stepsCompleted: 0,
    })),
  isLoaded: () => get().stepsCompleted >= get().steps && get().startClicked,
}));

export default useLoaderStore;
