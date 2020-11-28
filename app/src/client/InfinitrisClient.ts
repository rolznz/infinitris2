// TODO: reuse from ../client
export interface IClientSocketEventListener {
  onConnect(): void;
  onDisconnect(): void;
  onMessage(message: any): void;
}

export default interface InfinitrisClient {
  releaseClient(): void;
  getVersion(): string;
  launchSinglePlayer(): void;
  launchDemo(): void;
  launchNetworkClient(url: string, listener: IClientSocketEventListener): void;
}
