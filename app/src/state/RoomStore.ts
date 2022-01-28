import { IClientSocket } from 'infinitris2-models';
import create from 'zustand';

type RoomStore = {
  connected: boolean;
  setConnected(connected: boolean): void;
  disconnected: boolean;
  setDisconnected(disconnected: boolean): void;
  hasLaunched: boolean;
  setLaunched(hasLaunched: boolean): void;
  socket?: IClientSocket;
  setSocket(socket: IClientSocket): void;
};

const useRoomStore = create<RoomStore>((set) => ({
  socket: undefined,
  setSocket: (socket: IClientSocket) => set((_) => ({ socket })),
  connected: false,
  setConnected: (connected: boolean) => set((_) => ({ connected })),
  disconnected: false,
  setDisconnected: (disconnected: boolean) => set((_) => ({ disconnected })),
  hasLaunched: false,
  setLaunched: (hasLaunched: boolean) => set((_) => ({ hasLaunched })),
}));

export default useRoomStore;
