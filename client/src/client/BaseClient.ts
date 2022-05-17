import IClient from '@models/IClient';
import { ClientApiConfig, LaunchOptions } from '@models/IClientApi';
import ISimulation from '@models/ISimulation';

export abstract class BaseClient implements IClient {
  protected _clientApiConfig: ClientApiConfig;
  protected _launchOptions: LaunchOptions;
  protected _simulation!: ISimulation;

  constructor(clientApiConfig: ClientApiConfig, launchOptions: LaunchOptions) {
    this._clientApiConfig = clientApiConfig;
    this._launchOptions = launchOptions;
  }

  destroy(): void {}
  restart(): void {}

  get simulation(): ISimulation {
    return this._simulation;
  }
}
