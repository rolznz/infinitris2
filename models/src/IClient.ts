import ISimulation from '@models/ISimulation';

export default interface IClient {
  /**
   * Closes any connections and releases any resources used by the client.
   */
  destroy(): void;

  /**
   * Resets the client to its initial state
   */
  restart(): void;

  get simulation(): ISimulation;
}
