import IServerMessage from "@core/networking/server/IServerMessage";

export default interface IClientSocketEventListener
{
    /**
     * Triggered when the client first connects to the server.
     */
    onConnect();

    /**
     * Triggered when the client is disconnected from the server.
     *
     * This may occur if:
     * - there is a network issue
     * - the client was banned from the server
     */
    onDisconnect();

    /**
     * Triggered when the client receives a message from the server
     * @param message the received message
     */
    onMessage(message: IServerMessage);
}