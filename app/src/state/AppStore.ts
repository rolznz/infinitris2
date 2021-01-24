import { IInfinitrisApi } from 'infinitris2-models';
import create from 'zustand';

type AppStore = {
  readonly returnToUrl?: string;
  readonly clientApi?: IInfinitrisApi;
  readonly isDemo: boolean;
  readonly internationalization: {
    messages: Record<string, string>;
  };
  setIsDemo(isDemo: boolean): void;
  setClientApi(clientApi: IInfinitrisApi): void;
  setReturnToUrl(returnToUrl?: string): void;
  setInternationalizationMessages(messages: Record<string, string>): void;
};

const useAppStore = create<AppStore>((set) => ({
  clientApi: undefined,
  isDemo: false,
  returnToUrl: undefined,
  internationalization: {
    messages: {},
  },
  setInternationalizationMessages: (messages: Record<string, string>) =>
    set((state) => ({
      internationalization: { ...state.internationalization, messages },
    })),
  setIsDemo: (isDemo: boolean) => set((_) => ({ isDemo })),
  setClientApi: (client: IInfinitrisApi) => set((_) => ({ clientApi: client })),
  setReturnToUrl: (returnToUrl?: string) => set((_) => ({ returnToUrl })),
}));

export default useAppStore;
