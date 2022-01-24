import ControlSettings from './ControlSettings';
import { IClientSocketEventListener } from './IClientSocketEventListener';
import InputMethod from './InputMethod';
import ISimulationEventListener from './ISimulationEventListener';
import { IChallenge } from './IChallenge';
import IChallengeClient from './IChallengeClient';
import { IPlayer } from './IPlayer';
import { RendererType } from './RendererType';
import { SimulationSettings } from './SimulationSettings';
import { RendererQuality } from './RendererQuality';
import { WorldType } from '@models/WorldType';

export type LaunchOptions = {
  listener?: ISimulationEventListener;
  socketListener?: IClientSocketEventListener;
  preferredInputMethod?: InputMethod;
  controls?: ControlSettings;
  player?: IPlayer;
  rendererType?: RendererType;
  //otherPlayers?: IPlayer[]; // AI & network players
  numBots?: number;
  botReactionDelay?: number;
  gridNumRows?: number;
  gridNumColumns?: number;
  simulationSettings?: SimulationSettings;
  rendererQuality?: RendererQuality;
  spectate?: boolean;
  worldType?: WorldType;
};

export default interface IClientApi {
  releaseClient(): void;
  getVersion(): string;
  launchSinglePlayer(options: LaunchOptions): void;
  launchChallenge(
    challenge: IChallenge,
    options: LaunchOptions
  ): IChallengeClient;
  restartClient(): void; // TODO: remove
  launchNetworkClient(url: string, options: LaunchOptions): void;
}