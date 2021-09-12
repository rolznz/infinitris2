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
  clickStart(): void;
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
  clickStart: () =>
    set(
      (state) =>
        ({
          startClicked: true,
          hasFinished: calculateHasFinished({ ...state, startClicked: true }),
        } as LoaderStore)
    ),
  reset: () =>
    set((state) => ({
      steps: 0,
      stepsCompleted: 0,
      hasFinished: false,
      key: state.key + 1,
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
