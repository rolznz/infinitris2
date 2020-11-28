import create from 'zustand';

interface RoomStore extends Record<string | number | symbol, unknown> {
  connected: boolean;
  setConnected(connected: boolean): void;
  disconnected: boolean;
  setDisconnected(disconnected: boolean): void;
}

const useRoomStore = create<RoomStore>((set) => ({
  connected: false,
  setConnected: (connected: boolean) => set((_) => ({ connected })),
  disconnected: false,
  setDisconnected: (disconnected: boolean) => set((_) => ({ disconnected })),
}));

export default useRoomStore;
