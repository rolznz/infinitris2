import create from 'zustand';

type RouterStore = {
  readonly length: number;
  push(change?: number): void;
};

const useRouterStore = create<RouterStore>((set) => ({
  length: 0,
  push: (change = 1) => set((current) => ({ length: current.length + change })),
}));

export default useRouterStore;
