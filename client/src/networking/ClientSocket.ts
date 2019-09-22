import IJoinRoomRequest from "@core/networking/client/IJoinRoomRequest";
import IServerMessage from "@core/networking/server/IServerMessage";
import IClientSocketEventListener from "./IClientSocketEventListener";

type ValidClientMessage = IJoinRoomRequest;

export default class ClientSocket
{
    private _socket: WebSocket;
    private _eventListeners: IClientSocketEventListener[];
    constructor(url: string, ...eventListeners: IClientSocketEventListener[])
    {
        this._socket = new WebSocket(url);
        this._eventListeners = eventListeners;

        this._socket.onopen = this._onConnect;
        this._socket.onclose = this._onDisconnect;
        this._socket.onmessage = this._onMessage;
    }

    /**
     * Closes this socket's connection to the server.
     */
    disconnect()
    {
        this._socket.close();
    }

    /**
     * Sends a message to the server.
     * @param message the message to send.
     */
    sendMessage(message: ValidClientMessage)
    {
        this._socket.send(JSON.stringify(message));
    }

    private _onConnect = () =>
    {
        this._eventListeners.forEach(listener => listener.onConnect());
    }

    private _onDisconnect = () =>
    {
        this._eventListeners.forEach(listener => listener.onDisconnect());
    }

    private _onMessage = (event: MessageEvent) =>
    {
        const serverMessage: IServerMessage = JSON.parse(event.data);
        this._eventListeners.forEach(listener => listener.onMessage(serverMessage));
    }
}