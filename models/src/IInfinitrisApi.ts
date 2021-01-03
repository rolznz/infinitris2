import { IClientSocketEventListener } from './IClientSocketEventListener';
import InputMethod from './InputMethod';
import ISimulationEventListener from './ISimulationEventListener';
import ITutorial from './ITutorial';
import ITutorialClient from './ITutorialClient';

export default interface IInfinitrisApi {
  releaseClient(): void;
  getVersion(): string;
  launchSinglePlayer(): void;
  launchTutorial(
    tutorial: ITutorial,
    listener?: ISimulationEventListener,
    preferredInputMethod?: InputMethod
  ): ITutorialClient;
  restartClient(): void;
  launchDemo(): void;
  launchNetworkClient(url: string, listener: IClientSocketEventListener): void;
}
