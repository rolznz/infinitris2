import ControlSettings from './ControlSettings';
import { IClientSocketEventListener } from './IClientSocketEventListener';
import InputMethod from './InputMethod';
import ISimulationEventListener from './ISimulationEventListener';
import ITutorial from './ITutorial';
import ITutorialClient from './ITutorialClient';

export default interface IInfinitrisApi {
  releaseClient(): void;
  getVersion(): string;
  launchSinglePlayer(controls?: ControlSettings): void;
  launchTutorial(
    tutorial: ITutorial,
    listener?: ISimulationEventListener,
    preferredInputMethod?: InputMethod,
    controls?: ControlSettings
  ): ITutorialClient;
  restartClient(): void; // TODO: remove
  launchDemo(): void;
  launchNetworkClient(
    url: string,
    listener: IClientSocketEventListener,
    controls?: ControlSettings
  ): void;
}
