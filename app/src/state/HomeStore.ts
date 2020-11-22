import create from 'zustand';
import Room from '../models/Room';

interface HomeStore extends Record<string | number | symbol, unknown>
{
  selectedRoom: Room | null;
  setSelectedRoom(selectedRoom: Room): void;
}

const useHomeStore = create<HomeStore>(set => ({
  selectedRoom: null,
  setSelectedRoom: (selectedRoom: Room) => set(_ => ({ selectedRoom })),
}));

export default useHomeStore;