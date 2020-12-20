import { ISimulationEventListener, Tutorial } from '../index';
import { IClientSocketEventListener } from './IClientSocketEventListener';

export default interface IInfinitrisApi {
  releaseClient(): void;
  getVersion(): string;
  launchSinglePlayer(): void;
  launchTutorial(tutorial: Tutorial, listener?: ISimulationEventListener): void;
  launchDemo(): void;
  launchNetworkClient(url: string, listener: IClientSocketEventListener): void;
}
