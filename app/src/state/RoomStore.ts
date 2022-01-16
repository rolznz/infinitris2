import create from 'zustand';

type RoomStore = {
  connected: boolean;
  setConnected(connected: boolean): void;
  disconnected: boolean;
  setDisconnected(disconnected: boolean): void;
  hasLaunched: boolean;
  setLaunched(hasLaunched: boolean): void;
};

const useRoomStore = create<RoomStore>((set) => ({
  connected: false,
  setConnected: (connected: boolean) => set((_) => ({ connected })),
  disconnected: false,
  setDisconnected: (disconnected: boolean) => set((_) => ({ disconnected })),
  hasLaunched: false,
  setLaunched: (hasLaunched: boolean) => set((_) => ({ hasLaunched })),
}));

export default useRoomStore;
