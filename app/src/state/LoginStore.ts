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
  readonly viewingBenefits: boolean;
  setViewingBenefits(viewingBenefits: boolean): void;
  reset(): void;
};

const useLoginStore = create<LoginStore>((set) => ({
  ...getResetState(),
  setEmail: (email: string) => set((_) => ({ email })),
  setInvoice: (invoice: string | undefined) => set((_) => ({ invoice })),
  setPaymentId: (paymentId: string | undefined) => set((_) => ({ paymentId })),
  setIsLoading: (isLoading: boolean) => set((_) => ({ isLoading })),
  setCodeSent: (codeSent: boolean) => set((_) => ({ codeSent })),
  setViewingBenefits: (viewingBenefits: boolean) =>
    set((_) => ({ viewingBenefits })),
  reset: () => set((_) => getResetState()),
}));

function getResetState() {
  return {
    isLoading: false,
    codeSent: false,
    email: '',
    invoice: undefined,
    paymentId: undefined,
    viewingBenefits: false,
  };
}

export default useLoginStore;
