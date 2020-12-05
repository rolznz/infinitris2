import { Tutorial } from '../index';
import { ClientSocketEventListener } from './ClientSocketEventListener';

export default interface InfinitrisApi {
  releaseClient(): void;
  getVersion(): string;
  launchSinglePlayer(tutorial?: Tutorial): void;
  launchDemo(): void;
  launchNetworkClient(url: string, listener: ClientSocketEventListener): void;
}
