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
import { IChallengeEditorEventListener } from '@models/IChallengeEditor';

export type LaunchOptions = WithControls & {
  listeners?: Partial<ISimulationEventListener>[];
  socketListener?: IClientSocketEventListener;
  preferredInputMethod?: InputMethod;
  player?: Partial<NetworkPlayerInfo>;
  rendererType?: RendererType;
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
  challengeEditorSettings?: {
    isEditing?: boolean;
    listeners?: Partial<IChallengeEditorEventListener>[];
  };
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
