import ControlSettings from './ControlSettings';
import { IClientSocketEventListener } from './IClientSocketEventListener';
import InputMethod from './InputMethod';
import ISimulationEventListener from './ISimulationEventListener';
import { IChallenge } from './IChallenge';
import IChallengeClient from './IChallengeClient';
import IPlayer from './IPlayer';

export default interface IInfinitrisApi {
  releaseClient(): void;
  getVersion(): string;
  launchSinglePlayer(controls?: ControlSettings, playerInfo?: IPlayer): void;
  launchChallenge(
    challenge: IChallenge,
    listener?: ISimulationEventListener,
    preferredInputMethod?: InputMethod,
    controls?: ControlSettings,
    player?: IPlayer
  ): IChallengeClient;
  restartClient(): void; // TODO: remove
  launchDemo(): void;
  launchNetworkClient(
    url: string,
    listener: IClientSocketEventListener,
    controls?: ControlSettings,
    player?: IPlayer
  ): void;
}
