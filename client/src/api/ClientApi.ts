import IClientApi, { ClientApiConfig, LaunchOptions } from '@models/IClientApi';
import IClient from '@models/IClient';
import NetworkClient from '../client/NetworkClient';
import SinglePlayerClient from '../client/singleplayer/SinglePlayerClient';
import ChallengeClient from '@src/client/singleplayer/ChallengeClient';
import { InputMethod } from '@models/InputMethod';
import { exampleChallenges } from '@models/exampleChallenges';
import ControlSettings from '@models/ControlSettings';
import { IChallenge } from '@models/IChallenge';
import ISimulation from '@models/ISimulation';
import { RendererType } from '@models/RendererType';
import { GameModeType } from '@models/GameModeType';
import { SimulationSettings } from '@models/SimulationSettings';
import { IClientChatMessage } from '@models/networking/client/IClientChatMessage';
import { ClientMessageType } from '@models/networking/client/ClientMessageType';
import { colors } from '@models/colors';
import { stringToHex } from '@models/util/stringToHex';
import { WorldType } from '@models/WorldType';

export default class ClientApi implements IClientApi {
  private _client?: IClient;
  private _config: ClientApiConfig;

  constructor() {
    console.log('Infinitris Client');
    console.log(`Build ${__VERSION__}`);
    this._config = {
      imagesRootUrl: process.env.IMAGES_ROOT_URL || '/',
    };
  }

  setConfig(config: ClientApiConfig) {
    this._config = config;
  }

  /**
   * Launches a game based on the given URL.
   * @param url the browser url, containing configuration options such as:
   *  - single-player=true Launch the game in single player mode
   *  - url=ws%3A%2F%2F127.0.0.1%3A9001 Connect to the websocket server running at this url
   */
  loadUrl = (url: string) => {
    const params = new URLSearchParams(url.substring(url.indexOf('?') + 1));
    const controlsString = params.get('controls') as string;
    const controls = (
      controlsString ? JSON.parse(controlsString) : undefined
    ) as ControlSettings;
    const preferredInputMethod: InputMethod =
      (params.get('input') as InputMethod) || 'keyboard';

    if (params.has('single-player')) {
      const numBots = parseInt(params.get('numBots') || '0');
      const botReactionDelay = parseInt(params.get('botReactionDelay') || '20');
      const spectate = params.get('spectate') === 'true';
      const worldType = (params.get('world') as WorldType) ?? undefined;
      const rendererType = params.get('renderer') as RendererType;
      const gameModeType = params.get('gameMode') as GameModeType;
      const simulationSettings: SimulationSettings = {
        gameModeType,
      };

      this.launchSinglePlayer({
        controls_keyboard: controls,
        numBots,
        botReactionDelay,
        spectate,
        rendererType,
        simulationSettings,
        worldType,
        player: {
          characterId: '487',
          patternFilename: 'pattern_5.png',
        },
      });
    } else if (params.has('url')) {
      this.launchNetworkClient(params.get('url') as string, {
        controls_keyboard: controls,
        roomId: parseInt(params.get('roomId') || '0'),
        player: {
          characterId: '487',
          patternFilename: 'pattern_5.png',
          nickname: 'Me',
          color: stringToHex(colors[5].hex),
        },
        socketListener: {
          onConnect: (socket) => {
            (window as any).chat = (message: string) => {
              const chatMessage: IClientChatMessage = {
                message,
                type: ClientMessageType.CHAT,
              };
              socket.sendMessage(chatMessage);
            };
          },
          onDisconnect: () => {},
          onMessage: () => {},
        },
      });
    } else if (params.has('challengeId')) {
      const challengeId = params.get('challengeId')!;
      const challenge = exampleChallenges[challengeId];
      if (!challenge) {
        throw new Error('Could not find challenge matching ID: ' + challengeId);
      }
      this.launchChallenge(challenge, {
        listener: {
          onSimulationInit: (simulation: ISimulation) => {
            simulation.startInterval();
          },
          onSimulationStep() {},
          onSimulationNextRound() {},
          onBlockCreated() {},
          onBlockCreateFailed() {},
          onBlockMoved() {},
          onBlockDestroyed() {},
          onBlockDied() {},
          onBlockDropped() {},
          onBlockPlaced() {},
          onPlayerCreated() {},
          onPlayerDestroyed() {},
          onPlayerToggleChat() {},
          onPlayerToggleSpectating() {},
          onLineCleared() {},
          onGridCollapsed() {},
          onCellBehaviourChanged() {},
          onCellIsEmptyChanged() {},
          onGridReset() {},
        },
        preferredInputMethod,
        controls_keyboard: controls,
      });
    } else {
      return false;
    }

    return true;
  };

  /**
   * Runs the game in single player mode with no connection to a server.
   */
  launchSinglePlayer = (options: LaunchOptions) => {
    this.releaseClient();
    this._client = new SinglePlayerClient(this._config, options);
  };

  /**
   * Runs the game in challenge mode with no connection to a server.
   */
  launchChallenge = (challenge: IChallenge, options: LaunchOptions) => {
    this.releaseClient();
    const challengeClient = new ChallengeClient(
      this._config,
      challenge,
      options
    );
    this._client = challengeClient;
    return challengeClient;
  };

  restartClient = () => {
    this._client?.restart();
  };

  /**
   * Launches the client in multiplayer mode and connects to a server.
   * @param url the url of the websocket server to connect to.
   */
  launchNetworkClient = (url: string, options: LaunchOptions) => {
    this.releaseClient();
    this._client = new NetworkClient(this._config, url, options);
  };

  /**
   * Closes any connections and releases any resources used by the client.
   */
  releaseClient = () => {
    if (this._client) {
      this._client.destroy();
    }
    this._client = undefined;
  };

  /**
   * Returns the client app version.
   */
  getVersion = (): string => {
    return __VERSION__;
  };

  private _invalidUrl(url: string) {
    console.error('Invalid URL: ', url);
  }
}
