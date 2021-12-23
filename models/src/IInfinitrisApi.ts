import ControlSettings from './ControlSettings';
import { IClientSocketEventListener } from './IClientSocketEventListener';
import InputMethod from './InputMethod';
import ISimulationEventListener from './ISimulationEventListener';
import { IChallenge } from './IChallenge';
import IChallengeClient from './IChallengeClient';
import IPlayer from './IPlayer';
import { RendererType } from './RendererType';

export type LaunchOptions = {
  listener?: ISimulationEventListener;
  socketListener?: IClientSocketEventListener;
  preferredInputMethod?: InputMethod;
  controls?: ControlSettings;
  player?: IPlayer;
  rendererType?: RendererType;
  otherPlayers?: IPlayer[]; // AI & network players
};

export default interface IInfinitrisApi {
  releaseClient(): void;
  getVersion(): string;
  launchSinglePlayer(options: LaunchOptions): void;
  launchChallenge(
    challenge: IChallenge,
    options: LaunchOptions
  ): IChallengeClient;
  restartClient(): void; // TODO: remove
  launchDemo(): void;
  launchNetworkClient(url: string, options: LaunchOptions): void;
}
