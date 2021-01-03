import { IRoom } from 'infinitris2-models';
import create from 'zustand';

type HomeStore = {
  readonly selectedRoom: IRoom | null;
  setSelectedRoom(selectedRoom: IRoom): void;
};

const useHomeStore = create<HomeStore>((set) => ({
  selectedRoom: null,
  setSelectedRoom: (selectedRoom: IRoom) => set((_) => ({ selectedRoom })),
}));

export default useHomeStore;
