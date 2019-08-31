import IClientMessage from "@core/networking/client/IClientMessage";
import IJoinRoomResponse from "@core/networking/server/IJoinRoomResponse";
import IPlayerConnectedEvent from "@core/networking/server/IPlayerConnectedEvent";
import IPlayerDisconnectedEvent from "@core/networking/server/IPlayerDisconnectedEvent";
import IServerSocketEventListener from "./IServerSocketEventListener";
import {Server as WebSocketServer, Data as WebSocketData} from "ws";
import IClientSocket from "./IClientSocket";

const HEARTBEAT_TIMEOUT = 30000;

export type ValidServerMessage = IJoinRoomResponse | IPlayerConnectedEvent | IPlayerDisconnectedEvent;
export type SendServerMessageFunction = (message: ValidServerMessage, ...socketIds: number[]) => void;

export default class ServerSocket
{
    private _sockets: {[id: number]: IClientSocket};
    private _nextSocketId: number;
    private _socketServer: WebSocketServer;
    private _eventListeners: IServerSocketEventListener[];
    constructor(host: string, port: number, ...eventListeners: IServerSocketEventListener[])
    {
        this._nextSocketId = 0;
        this._sockets = {};
        this._socketServer = new WebSocketServer({ host, port });
        this._socketServer.on("connection", this._onClientConnect);
        this._eventListeners = eventListeners;
    }

    sendMessage = (message: ValidServerMessage, ...socketIds: number[]) =>
    {
        socketIds.forEach(socketId => {
            const socket: IClientSocket | null = this._sockets[socketId];
            if (socket)
            {
                socket.send(JSON.stringify(message));
            }
        });
    }

    private _onClientConnect = (socket: IClientSocket) =>
    {
        socket.id = this._nextSocketId++;
        this._sockets[socket.id] = socket;

        const heartbeat = () => socket.isAlive = true;
        heartbeat();

        const checkHeartbeat = setInterval(() => {
            if (!socket.isAlive)
            {
                this._onClientDisconnect(socket, checkHeartbeat);
            }
            else
            {
                socket.isAlive = false;
                socket.ping();
            }
          }, HEARTBEAT_TIMEOUT);

        socket.on("close", () => this._onClientDisconnect(socket, checkHeartbeat));
        socket.on("message", (message) => this._onClientMessage(socket, message));
        socket.on("pong", () => heartbeat());

        this._eventListeners.forEach(listener => listener.onClientConnect(socket));
    }

    private _onClientDisconnect = (socket: IClientSocket, checkHeartbeat: NodeJS.Timeout) =>
    {
        this._eventListeners.forEach(listener => listener.onClientDisconnect(socket));
        clearInterval(checkHeartbeat);
        delete this._sockets[socket.id];
        socket.terminate();
    }

    private _onClientMessage = (socket: IClientSocket, event: WebSocketData) =>
    {
        const message: IClientMessage = JSON.parse(event as string);
        this._eventListeners.forEach(listener => listener.onClientMessage(socket, message));
    }
}