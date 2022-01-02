import create from 'zustand';

export type DialogType = 'login' | 'coinInfo' | 'impactInfo';

export const dialogAnimationLength = 500;

type DialogStore = {
  readonly dialogType?: DialogType;
  //readonly pr?: DialogType;
  open(dialogType?: DialogType): void;
  close(): void;
};

const useDialogStore = create<DialogStore>((set, get) => ({
  dialog: null,
  open: (dialogType: DialogType = 'login') => {
    const currentDialogType = get().dialogType;
    if (currentDialogType) {
      get().close();
    }
    const executeOpen = () => set((_) => ({ dialogType }));
    setTimeout(executeOpen, currentDialogType ? dialogAnimationLength : 0);
  },
  close: () => set((_) => ({ dialogType: undefined })),
}));

export default useDialogStore;

export const openLoginDialog = () => useDialogStore.getState().open('login');
export const openCoinInfoDialog = () =>
  useDialogStore.getState().open('coinInfo');
export const openImpactInfoDialog = () =>
  useDialogStore.getState().open('impactInfo');
export const closeDialog = () => useDialogStore.getState().close();
