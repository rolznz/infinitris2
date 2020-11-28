export default interface IClient {
  /**
   * Closes any connections and releases any resources used by the client.
   */
  destroy();
}
