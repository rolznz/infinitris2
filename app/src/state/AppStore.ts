import { IClientApi } from 'infinitris2-models';
import create from 'zustand';

type AppStore = {
  readonly returnToUrl?: string;
  readonly clientApi?: IClientApi;
  readonly internationalization: {
    messages: Record<string, string>;
  };
  readonly topLeftPanel: Element | undefined;
  setClientApi(clientApi: IClientApi): void;
  setReturnToUrl(returnToUrl?: string): void;
  setInternationalizationMessages(messages: Record<string, string>): void;
  setTopLeftPanel(topLeftPanel: Element | undefined): void;
};

const useAppStore = create<AppStore>((set) => ({
  clientApi: undefined,
  isDemo: false,
  returnToUrl: undefined,
  topLeftPanel: undefined,
  internationalization: {
    messages: {},
  },
  setInternationalizationMessages: (messages: Record<string, string>) =>
    set((state) => ({
      internationalization: { ...state.internationalization, messages },
    })),
  setClientApi: (client: IClientApi) => set((_) => ({ clientApi: client })),
  setReturnToUrl: (returnToUrl?: string) => set((_) => ({ returnToUrl })),
  setTopLeftPanel: (topLeftPanel: Element | undefined) =>
    set((_) => ({ topLeftPanel })),
}));

export default useAppStore;
