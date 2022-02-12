import IClient from '@models/IClient';
import { ClientApiConfig, LaunchOptions } from '@models/IClientApi';

export abstract class BaseClient implements IClient {
  protected _clientApiConfig: ClientApiConfig;
  protected _launchOptions: LaunchOptions;

  constructor(clientApiConfig: ClientApiConfig, launchOptions: LaunchOptions) {
    this._clientApiConfig = clientApiConfig;
    this._launchOptions = launchOptions;
  }

  destroy(): void {}
  restart(): void {}
}
