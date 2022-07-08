import create from 'zustand';

type LoginStore = {
  readonly isLoading: boolean;
  setIsLoading(isLoading: boolean): void;
  readonly email: string;
  setEmail(email: string): void;
  readonly invoice: string | undefined;
  setInvoice(invoice: string | undefined): void;
  readonly paymentId: string | undefined;
  setPaymentId(paymentId: string | undefined): void;
  readonly codeSent: boolean;
  setCodeSent(codeSent: boolean): void;
  readonly hasCreatedNewUser: boolean;
  setHasCreatedNewUser(hasCreatedNewUser: boolean): void;
  reset(): void;
};

const useLoginStore = create<LoginStore>((set) => ({
  ...getResetState(),
  setEmail: (email: string) => set((_) => ({ email })),
  setInvoice: (invoice: string | undefined) => set((_) => ({ invoice })),
  setPaymentId: (paymentId: string | undefined) => set((_) => ({ paymentId })),
  setIsLoading: (isLoading: boolean) => set((_) => ({ isLoading })),
  setHasCreatedNewUser: (hasCreatedNewUser: boolean) =>
    set((_) => ({ hasCreatedNewUser })),
  setCodeSent: (codeSent: boolean) => set((_) => ({ codeSent })),
  reset: () => set((_) => getResetState()),
}));

function getResetState() {
  return {
    isLoading: false,
    codeSent: false,
    email: '',
    invoice: undefined,
    paymentId: undefined,
    hasCreatedNewUser: false,
  };
}

export default useLoginStore;
