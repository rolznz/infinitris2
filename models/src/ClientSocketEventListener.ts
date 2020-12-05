export interface ClientSocketEventListener {
  onConnect(): void;
  onDisconnect(): void;
  onMessage(message: any): void;
}
