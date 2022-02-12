import { InputMethod } from './InputMethod';
import ISimulationEventListener from './ISimulationEventListener';
import { IChallenge } from './IChallenge';
import IChallengeClient from './IChallengeClient';
import { NetworkPlayerInfo } from './IPlayer';
import { RendererType } from './RendererType';
import { SimulationSettings } from './SimulationSettings';
import { RendererQuality } from './RendererQuality';
import { WorldType } from '@models/WorldType';
import { WithControls } from '@models/IUser';
import { IClientSocketEventListener } from '@models/networking/client/IClientSocketEventListener';
import { type } from 'os';

export type LaunchOptions = WithControls & {
  listener?: ISimulationEventListener;
  socketListener?: IClientSocketEventListener;
  preferredInputMethod?: InputMethod;
  player?: Partial<NetworkPlayerInfo>;
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
  roomId?: number;
};

export type ClientApiConfig = {
  imagesRootUrl: string;
};

export default interface IClientApi {
  setConfig(config: ClientApiConfig): void;
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
