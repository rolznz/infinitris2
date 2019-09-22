import IClientMessage from "@core/networking/client/IClientMessage";
import IClientSocket from "./IClientSocket";

export default interface IServerSocketEventListener
{
    /**
     * Triggered when a new client connects.
     *
     * @param socket the connection to the client.
     */
    onClientConnect(socket: IClientSocket);

    /**
     * Triggered when an existing client disconnects.
     * @param socket the connection to the client.
     */
    onClientDisconnect(socket: IClientSocket);

    /**
     * Triggered when the client sends a message to the server.
     *
     * @param socket the connection to the client.
     * @param message the message sent by the client.
     */
    onClientMessage(socket: IClientSocket, message: IClientMessage);
}