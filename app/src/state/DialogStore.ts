import useLoginStore from '@/state/LoginStore';
import create from 'zustand';

export type DialogType = 'login' | 'coinInfo' | 'impactInfo';

export const dialogAnimationLength = 500;

type DialogStore = {
  readonly dialogTypes: DialogType[];
  open(dialogType?: DialogType): void;
  close(): void;
};

const useDialogStore = create<DialogStore>((set, _get) => ({
  dialogTypes: [],
  open: (dialogType: DialogType = 'login') => {
    const executeOpen = () =>
      set((prevState) => ({
        dialogTypes: [...prevState.dialogTypes, dialogType],
      }));
    executeOpen();
    //setTimeout(executeOpen, currentDialogType ? dialogAnimationLength : 0);
  },
  close: () =>
    set((prevState) => ({
      dialogTypes: prevState.dialogTypes.slice(
        0,
        prevState.dialogTypes.length - 1
      ),
    })),
}));

export default useDialogStore;

export const openLoginDialog = () => useDialogStore.getState().open('login');
export const openCoinInfoDialog = () =>
  useDialogStore.getState().open('coinInfo');
export const openImpactInfoDialog = () =>
  useDialogStore.getState().open('impactInfo');
export const closeDialog = () => {
  const currentDialogTypes = useDialogStore.getState().dialogTypes;
  if (currentDialogTypes[currentDialogTypes.length - 1] === 'login') {
    useLoginStore.getState().reset();
  }
  useDialogStore.getState().close();
};
