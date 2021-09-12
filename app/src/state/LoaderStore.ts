import create from 'zustand';

type LoaderStore = {
  readonly key: number;
  readonly stepsCompleted: number;
  readonly steps: number;
  readonly startClicked: boolean;
  readonly hasInitialized: boolean;
  readonly hasFinished: boolean;
  increaseSteps(): void;
  increaseStepsCompleted(): void;
  clickStart(resetLoader: boolean): void;
  reset(): void;
  initialize(): void;
};

const calculateHasFinished = (state: LoaderStore) => {
  return (
    state.stepsCompleted >= state.steps &&
    state.hasInitialized &&
    state.startClicked
  );
};

const useLoaderStore = create<LoaderStore>((set) => ({
  key: 0,
  steps: 0,
  stepsCompleted: 0,
  startClicked: false,
  hasInitialized: false,
  hasFinished: false,
  increaseSteps: () =>
    set((state) => ({
      steps: state.steps + 1,
      hasFinished: calculateHasFinished({ ...state, steps: state.steps + 1 }),
    })),
  increaseStepsCompleted: () =>
    set((state) => ({
      stepsCompleted: state.stepsCompleted + 1,
      hasFinished: calculateHasFinished({
        ...state,
        stepsCompleted: state.stepsCompleted + 1,
      }),
    })),
  clickStart: (resetLoader) =>
    set(
      (state) =>
        ({
          startClicked: true,
          hasFinished: resetLoader
            ? false
            : calculateHasFinished({ ...state, startClicked: true }),
          ...(resetLoader
            ? { steps: 0, stepsCompleted: 0, key: state.key + 1 }
            : {}),
        } as LoaderStore)
    ),
  reset: () =>
    set((_) => ({
      steps: 0,
      stepsCompleted: 0,
      hasFinished: false,
    })),
  initialize: () =>
    setTimeout(() => {
      set((state) => ({
        hasInitialized: true,
        hasFinished: calculateHasFinished({ ...state, hasInitialized: true }),
      }));
    }, 500),
}));

export default useLoaderStore;
