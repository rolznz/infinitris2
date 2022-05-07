import { InputMethod } from './InputMethod';
import ISimulationEventListener from './ISimulationEventListener';
import { IChallenge } from './IChallenge';
import IChallengeClient from './IChallengeClient';
import { NetworkPlayerInfo } from './IPlayer';
import { RendererType } from './RendererType';
import { SimulationSettings } from './SimulationSettings';
import { RendererQuality } from './RendererQuality';
import { WorldType, WorldVariation } from '@models/WorldType';
import { WithControls } from '@models/IUser';
import { IClientSocketEventListener } from '@models/networking/client/IClientSocketEventListener';
import { ICharacter } from '@models/ICharacter';
import { GridLineType } from '@models/IGrid';

export type SaveGridFunction = (grid: string) => void;

export type LaunchOptions = WithControls & {
  listeners?: Partial<ISimulationEventListener>[];
  socketListener?: IClientSocketEventListener;
  preferredInputMethod?: InputMethod;
  player?: Partial<NetworkPlayerInfo>;
  rendererType?: RendererType;
  //otherPlayers?: IPlayer[]; // AI & network players
  numBots?: number;
  botReactionDelay?: number;
  botRandomReactionDelay?: number;
  gridNumRows?: number;
  gridNumColumns?: number;
  simulationSettings?: SimulationSettings;
  rendererQuality?: RendererQuality;
  spectate?: boolean;
  worldType?: WorldType;
  worldVariation?: WorldVariation;
  roomIndex?: number;
  useFallbackUI?: boolean;
  isDemo?: boolean;
  allCharacters?: ICharacter[];
  gridLineType?: GridLineType;
  challengeEditorEnabled?: boolean;
  challengeEditorIsEditing?: boolean;
  onSaveGrid?: SaveGridFunction;
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
