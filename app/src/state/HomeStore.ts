import create from 'zustand';
import Room from 'infinitris2-models/src/Room';

type HomeStore = {
  readonly selectedRoom: Room | null;
  setSelectedRoom(selectedRoom: Room): void;
};

const useHomeStore = create<HomeStore>((set) => ({
  selectedRoom: null,
  setSelectedRoom: (selectedRoom: Room) => set((_) => ({ selectedRoom })),
}));

export default useHomeStore;
