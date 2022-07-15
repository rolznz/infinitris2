import IClient from '@models/IClient';
import { ClientApiConfig, LaunchOptions } from '@models/IClientApi';
import ISimulation from '@models/ISimulation';

export abstract class BaseClient<T extends LaunchOptions = LaunchOptions>
  implements IClient
{
  protected _clientApiConfig: ClientApiConfig;
  protected _launchOptions: T;
  protected _simulation!: ISimulation;

  constructor(clientApiConfig: ClientApiConfig, launchOptions: T) {
    this._clientApiConfig = clientApiConfig;
    this._launchOptions = launchOptions;
  }

  destroy(): void {}
  restart(): void {}

  get simulation(): ISimulation {
    return this._simulation;
  }
}
