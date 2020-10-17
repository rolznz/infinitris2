export default interface Client
{
  /**
   * Closes any connections and releases any resources used by the client.
   */
  destroy();
}