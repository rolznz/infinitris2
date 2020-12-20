export interface IClientSocketEventListener {
  onConnect(): void;
  onDisconnect(): void;
  onMessage(message: any): void;
}
