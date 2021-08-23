import create from 'zustand';

type LoaderStore = {
  readonly stepsCompleted: number;
  readonly steps: number;
  increaseSteps(): void;
  increaseStepsCompleted(): void;
  reset(): void;
  isLoaded(): boolean;
};

const useLoaderStore = create<LoaderStore>((set, get) => ({
  steps: 0,
  stepsCompleted: 0,
  increaseSteps: () => {
    set((state) => ({ steps: state.steps + 1 }));
  },
  increaseStepsCompleted: () => {
    set((state) => ({ stepsCompleted: state.stepsCompleted + 1 }));
  },
  reset: () =>
    set((_) => ({
      steps: 0,
      stepsCompleted: 0,
    })),
  isLoaded: () => get().stepsCompleted >= get().steps,
}));

export default useLoaderStore;
