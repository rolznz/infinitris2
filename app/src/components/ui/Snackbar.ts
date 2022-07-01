import { SnackbarMessage, OptionsObject } from 'notistack';
export type EnqueueSnackbarFunction = (
  message: SnackbarMessage,
  options?: OptionsObject | undefined
) => void;
