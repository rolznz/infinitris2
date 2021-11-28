import create from 'zustand';

type DialogType = 'login' | 'coinInfo' | 'impactInfo';

type DialogStore = {
  readonly dialogType?: DialogType;
  //readonly pr?: DialogType;
  open(dialogType?: DialogType): void;
  close(): void;
};

const useDialogStore = create<DialogStore>((set) => ({
  dialog: null,
  open: (dialogType: DialogType = 'login') => set((_) => ({ dialogType })),
  close: () => set((_) => ({ dialogType: undefined })),
}));

export default useDialogStore;

export const openLoginDialog = () => useDialogStore.getState().open('login');
export const openCoinInfoDialog = () =>
  useDialogStore.getState().open('coinInfo');
export const openImpactInfoDialog = () =>
  useDialogStore.getState().open('impactInfo');
export const closeDialog = () => useDialogStore.getState().close();
