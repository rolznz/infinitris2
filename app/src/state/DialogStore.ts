import useLoginStore from '@/state/LoginStore';
import create from 'zustand';

export type DialogType = 'login' | 'coinInfo' | 'impactInfo';

export const dialogAnimationLength = 500;

type DialogStore = {
  readonly dialogTypes: DialogType[];
  readonly loginRedirectToProfile: boolean;
  open(dialogType?: DialogType, loginRedirectToProfile?: boolean): void;
  close(): void;
};

const useDialogStore = create<DialogStore>((set, _get) => ({
  loginRedirectToProfile: true,
  dialogTypes: [],
  open: (dialogType: DialogType = 'login', loginRedirectToProfile = true) => {
    const executeOpen = () =>
      set((prevState) => ({
        dialogTypes: [...prevState.dialogTypes, dialogType],
        loginRedirectToProfile,
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

export const openLoginDialog = (loginRedirectToProfile?: boolean) =>
  useDialogStore.getState().open('login', loginRedirectToProfile);
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
