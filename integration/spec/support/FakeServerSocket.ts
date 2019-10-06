import IServerSocket, { ValidServerMessage } from "@server/networking/IServerSocket";
import IServerSocketEventListener from "@server/networking/IServerSocketEventListener";
import IClientMessage from "@core/networking/client/IClientMessage";
import FakeClientSocket from "./FakeClientSocket";

export default class FakeServerSocket implements IServerSocket
{
    private _eventListeners: IServerSocketEventListener[];
    private _clientSockets: FakeClientSocket[];
    private _nextId: number;

    constructor()
    {
        this._eventListeners = [];
        this._clientSockets = [];
        this._nextId = 0;
    }

    /**
     * @inheritdoc
     */
    addEventListener(eventListener: IServerSocketEventListener)
    {
        this._eventListeners.push(eventListener);
    }

    /**
     * @inheritdoc
     */
    sendMessage(message: ValidServerMessage, ...socketIds: number[])
    {
        this._clientSockets
            .filter(socket => socketIds.indexOf(socket.id) >= 0)
            .forEach(socket => socket.onMessage(message));
    }

    /**
     * @inheritdoc
     */
    onClientConnect(socket: FakeClientSocket)
    {
        socket.id = this._nextId++;
        this._clientSockets.push(socket);
        this._eventListeners.forEach(eventListener => eventListener.onClientConnect(socket));
    }

    /**
     * @inheritdoc
     */
    onClientDisconnect(socket: FakeClientSocket)
    {
        this._clientSockets = this._clientSockets.filter(s => s.id !== socket.id);
        this._eventListeners.forEach(eventListener => eventListener.onClientDisconnect(socket));
    }

    /**
     * Simulate receiving a message from a real client.
     *
     * @param socket the socket that sent the message.
     * @param message the message that was sent.
     */
    receiveMessage(socket: FakeClientSocket, message: IClientMessage)
    {
        this._eventListeners.forEach(eventListener => eventListener.onClientMessage(socket, message));
    }
}