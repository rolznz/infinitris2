import create from 'zustand';

export type LoaderStepName =
  | 'infinitris-client'
  | 'login'
  | 'characters'
  | 'user'
  | 'sfx'
  | 'music';

type LoaderStore = {
  readonly key: number;
  readonly stepsCompleted: string[];
  readonly steps: string[];
  readonly startClicked: boolean;
  readonly hasInitialized: boolean;
  readonly hasFinished: boolean;
  readonly delayButtonVisibility: boolean;
  readonly allStepsLoaded: boolean;
  addStep(stepName: LoaderStepName): void;
  completeStep(stepName: LoaderStepName): void;
  clickStart(delayButtonVisibility: boolean): void;
  reset(): void;
  initialize(): void;
  disableDelayButtonVisiblity(): void;
};

function calculateAllStepsLoaded(state: LoaderStore) {
  return state.steps.every((step) => state.stepsCompleted.indexOf(step) > -1);
}

const calculateHasFinished = (state: LoaderStore) => {
  console.log(
    'Loader calculateHasFinished ',
    state.steps.filter((step) => state.stepsCompleted.indexOf(step) < 0),
    state.allStepsLoaded,
    state.hasInitialized,
    state.startClicked
  );
  return state.allStepsLoaded && state.hasInitialized && state.startClicked;
};

const useLoaderStore = create<LoaderStore>((set) => ({
  delayButtonVisibility: true,
  key: 0,
  steps: [],
  stepsCompleted: [],
  allStepsLoaded: false,
  startClicked: false,
  hasInitialized: false,
  hasFinished: false,
  disableDelayButtonVisiblity: () =>
    set((_) => ({
      delayButtonVisibility: false,
    })),
  addStep: (stepName: string) =>
    set((state) => ({
      steps: [
        ...state.steps.filter((existingStep) => existingStep !== stepName),
        stepName,
      ],
      stepsCompleted: state.stepsCompleted.filter(
        (existingStep) => existingStep !== stepName
      ),
      hasFinished: false,
    })),
  completeStep: (stepName: string) =>
    set((state) => {
      const newStepsCompleted = [
        ...state.stepsCompleted.filter(
          (existingStep) => existingStep !== stepName
        ),
        stepName,
      ];
      const allStepsLoaded = calculateAllStepsLoaded({
        ...state,
        stepsCompleted: newStepsCompleted,
      });
      return {
        stepsCompleted: newStepsCompleted,
        allStepsLoaded,
        hasFinished: calculateHasFinished({
          ...state,
          allStepsLoaded,
          stepsCompleted: newStepsCompleted,
        }),
      };
    }),

  clickStart: (delayButtonVisibility: boolean) =>
    set(
      (state) =>
        ({
          startClicked: true,
          delayButtonVisibility,
          hasFinished: calculateHasFinished({ ...state, startClicked: true }),
        } as LoaderStore)
    ),
  reset: () =>
    set((state) => ({
      steps: [],
      stepsCompleted: [],
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
