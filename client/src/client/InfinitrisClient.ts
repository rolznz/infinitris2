import ClientSocket from "@src/networking/ClientSocket";
import Client from "./Client";
import NetworkClient from "./NetworkClient";
import SinglePlayerClient from "./SinglePlayerClient";

export default class InfinitrisClient
{
  private _client: Client;
  /**
   * Launches a game based on the given URL.
   * @param url the browser url, containing configuration options such as:
   *  - single-player=true Launch the game in single player mode
   *  - url=ws%3A%2F%2F127.0.0.1%3A9001 Connect to the websocket server running at this url
   */
  loadUrl(url: string)
  {
      const params = new URLSearchParams(url.substring(url.indexOf("?") + 1));
      if (params.get("single-player") === "true")
      {
          this.launchSinglePlayer();
      }
      else if (params.has("url"))
      {
          this.launchNetworkClient(params.get("url"));
      }
      else
      {
          this._invalidUrl(url);
      }
  }

  /**
   * Runs the game in single player mode with no connection to a server.
   */
  launchSinglePlayer()
  {
      this.releaseClient();
      this._client = new SinglePlayerClient();
  }

  /**
   * Launches the client in multiplayer mode and connects to a server.
   * @param url the url of the websocket server to connect to.
   */
  launchNetworkClient(url: string)
  {
    this.releaseClient();
    this._client = new NetworkClient(url);
  }

  /**
   * Closes any connections and releases any resources used by the client.
   */
  releaseClient() {
    if (this._client)
    {
      this._client.destroy();
    }
    this._client = null;
  }

  private _invalidUrl(url: string)
  {
    console.error("Invalid URL: ", url);
  }
}