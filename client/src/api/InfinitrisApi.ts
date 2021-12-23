import IInfinitrisApi, { LaunchOptions } from '@models/IInfinitrisApi';
import IClient from '../../../models/src/IClient';
import DemoClient from '../client/DemoClient';
import NetworkClient from '../client/NetworkClient';
import SinglePlayerClient from '../client/singleplayer/SinglePlayerClient';
import ChallengeClient from '@src/client/singleplayer/ChallengeClient';
import AIPlayer from '@core/player/AIPlayer';
import InputMethod from '@models/InputMethod';
import { exampleChallenges } from '@models/exampleChallenges';
import ControlSettings from '@models/ControlSettings';
import IPlayer from '@models/IPlayer';
import { IChallenge } from '@models/IChallenge';
import ISimulation from '@models/ISimulation';
import { colors } from '@models/colors';
import { stringToHex } from '@models/util/stringToHex';

export default class InfinitrisApi implements IInfinitrisApi {
  private _client?: IClient;

  constructor() {
    console.log('Infinitris Client');
    console.log(`Build ${__VERSION__}`);
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
      const otherPlayers: IPlayer[] = [];
      const numBots = parseInt(params.get('numBots') || '0');
      for (let i = 0; i < numBots; i++) {
        otherPlayers.push(
          new AIPlayer(
            i + 1,
            'Bot ' + (i + 1),
            stringToHex(
              colors[Math.floor(Math.random() * (colors.length - 1))].hex
            )
          )
        );
      }

      this.launchSinglePlayer({ controls, otherPlayers });
    } else if (params.has('url')) {
      this.launchNetworkClient(params.get('url') as string, {
        controls,
      });
    } else if (params.has('demo')) {
      this.launchDemo();
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
          onBlockCreated() {},
          onBlockCreateFailed() {},
          onBlockMoved() {},
          //onBlockWrapped() {},
          onBlockDied() {},
          onBlockPlaced() {},
          onLineCleared() {},
          onCellBehaviourChanged() {},
        },
        preferredInputMethod,
        controls,
      });
    } else {
      return false;
    }

    return true;
  };

  /**
   * Runs the game in demo mode.
   */
  launchDemo = () => {
    this.releaseClient();
    this._client = new DemoClient();
  };

  /**
   * Runs the game in single player mode with no connection to a server.
   */
  launchSinglePlayer = (options: LaunchOptions) => {
    this.releaseClient();
    this._client = new SinglePlayerClient(options);
  };

  /**
   * Runs the game in challenge mode with no connection to a server.
   */
  launchChallenge = (challenge: IChallenge, options: LaunchOptions) => {
    this.releaseClient();
    const challengeClient = new ChallengeClient(challenge, options);
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
    this._client = new NetworkClient(
      url,
      options.socketListener,
      options.controls,
      options.player
    );
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
