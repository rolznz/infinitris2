import Client from "./Client";
import SinglePlayerClient from "./SinglePlayerClient";
import "../styles/client.css";
import "url-search-params-polyfill";
import ClientSocket from "./networking/ClientSocket";

/**
 * Entry point
 *
 * @see window.infinitris2
 *
 * @param url the browser url, containing configuration options such as:
 *  - single-player=true Launch the game in single player mode
 *  - url=ws%3A%2F%2F127.0.0.1%3A9001 Connect to the websocket server running at this url
 */
export function main(url: string)
{
    const params = new URLSearchParams(url.substring(url.indexOf("?") + 1));
    if (params.get("single-player") === "true")
    {
        exports.launchSinglePlayer();
    }
    else if (params.has("url"))
    {
        exports.launchClient(params.get("url"));
    }
    else
    {
        exports.invalidUrl();
    }
}

/**
 * Called when the url provided is invalid.
 */
export function invalidUrl()
// tslint:disable-next-line: no-empty
{
}

/**
 * Runs the game in single player mode with no connection to a server.
 */
export function launchSinglePlayer()
{
    // tslint:disable-next-line: no-unused-expression
    new SinglePlayerClient();
}

/**
 * Launches the client in multiplayer mode and connects to a server.
 * @param url the url of the websocket server to connect to.
 */
export function launchClient(url: string)
{
    // tslint:disable-next-line: no-unused-expression
    new Client(new ClientSocket(url));
}

if (module.hot) {
    module.hot.accept();
}

/**
 * Export entrypoint
 */
(window as any).infinitris2 = main;