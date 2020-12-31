import Tutorial, { tutorials } from '@models/Tutorial';
import IInfinitrisApi from '@models/IInfinitrisApi';
import IClientSocketEventListener from '@src/networking/IClientSocketEventListener';
import IClient from '../client/Client';
import DemoClient from '../client/DemoClient';
import NetworkClient from '../client/NetworkClient';
import SinglePlayerClient from '../client/singleplayer/SinglePlayerClient';
import TutorialClient from '@src/client/singleplayer/TutorialClient';
import { ISimulationEventListener } from 'models';

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
    if (params.has('single-player')) {
      this.launchSinglePlayer();
    } else if (params.has('url')) {
      this.launchNetworkClient(params.get('url') as string);
    } else if (params.has('demo')) {
      this.launchDemo();
    } else if (params.has('tutorial')) {
      this.launchTutorial(tutorials[0], {
        onSimulationInit: (simulation) => {
          simulation.startInterval();
        },
        onSimulationStep() {},
        onBlockCreated() {},
        onBlockMoved() {},
        onBlockDied() {},
        onBlockPlaced() {},
        onLineCleared() {},
      });
    } else {
      this._invalidUrl(url);
    }
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
  launchSinglePlayer = () => {
    this.releaseClient();
    this._client = new SinglePlayerClient();
  };

  /**
   * Runs the game in tutorial mode with no connection to a server.
   */
  launchTutorial = (
    tutorial: Tutorial,
    listener?: ISimulationEventListener
  ) => {
    this.releaseClient();
    this._client = new TutorialClient(tutorial, listener);
  };

  /**
   * Launches the client in multiplayer mode and connects to a server.
   * @param url the url of the websocket server to connect to.
   */
  launchNetworkClient = (
    url: string,
    listener?: IClientSocketEventListener
  ) => {
    this.releaseClient();
    this._client = new NetworkClient(url, listener);
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
