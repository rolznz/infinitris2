import { InputMethod } from './InputMethod';
import ISimulationEventListener from './ISimulationEventListener';
import { IChallenge } from './IChallenge';
import IChallengeClient from './IChallengeClient';
import { NetworkPlayerInfo } from './IPlayer';
import { RendererType } from './RendererType';
import { SimulationSettings } from './SimulationSettings';
import { RendererQuality } from './RendererQuality';
import { WorldType, WorldVariation } from '@models/WorldType';
import { CustomDAS, WithControls } from '@models/IUser';
import { IClientSocketEventListener } from '@models/networking/client/IClientSocketEventListener';
import { ICharacter } from '@models/ICharacter';
import { BlockShadowType, GridLineType } from '@models/IGrid';
import { IChallengeEditorEventListener } from '@models/IChallengeEditor';
import { IChallengeEventListener } from '@models/IChallengeEventListener';
import { ChallengeAttemptRecording } from '@models/IChallengeAttempt';

export type RendererSettings = {
  rendererType?: RendererType;
  rendererQuality?: RendererQuality;
  blockShadowType?: BlockShadowType;
  gridLineType?: GridLineType;
  showFaces?: boolean;
  showPatterns?: boolean;
  showNicknames?: boolean;
};

export type LaunchOptions = WithControls &
  CustomDAS & {
    listeners?: Partial<ISimulationEventListener>[];
    socketListener?: IClientSocketEventListener;
    preferredInputMethod?: InputMethod;
    player?: Partial<NetworkPlayerInfo>;
    rendererSettings?: RendererSettings;
    gridNumRows?: number;
    gridNumColumns?: number;
    simulationSettings?: SimulationSettings;
    spectate?: boolean;
    worldType?: WorldType;
    worldVariation?: WorldVariation;
    roomIndex?: number;
    useFallbackUI?: boolean;
    isDemo?: boolean;
    allCharacters?: ICharacter[];
    showUI?: boolean;
    teachAllControls?: boolean;
  };

export type ChallengeLaunchOptions = LaunchOptions & {
  challengeEditorSettings?: {
    isEditing?: boolean;
    listeners?: Partial<IChallengeEditorEventListener>[];
  };
  recording?: ChallengeAttemptRecording;
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
    listener: IChallengeEventListener,
    options: ChallengeLaunchOptions
  ): IChallengeClient;
  restartClient(): void; // TODO: remove
  launchNetworkClient(url: string, options: LaunchOptions): void;
}
