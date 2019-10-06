import ServerSocket from "./networking/ServerSocket";
import Room from "./Room";
import IServerSocketEventListener from "./networking/IServerSocketEventListener";
import IClientMessage from "@core/networking/client/IClientMessage";
import IClientSocket from "./networking/IClientSocket";
import ClientMessageType from "@core/networking/client/ClientMessageType";

export default class Server implements IServerSocketEventListener
{
    private _socket: ServerSocket;
    private _rooms: Room[];

    constructor(host: string, port: number)
    {
        this._socket = new ServerSocket(host, port, this);
        this._rooms = [new Room(this._socket.sendMessage)];
    }

    /**
     * @inheritdoc
     */
    onClientConnect(socket: IClientSocket)
    {
        console.log("Client " + socket.id + " connected");
    }

    /**
     * @inheritdoc
     */
    onClientDisconnect(socket: IClientSocket)
    {
        console.log("Client " + socket.id + " disconnected");
        if (socket.roomId !== undefined)
        {
            this._rooms[socket.roomId].removePlayer(socket.id);
        }
    }

    /**
     * @inheritdoc
     */
    onClientMessage(socket: IClientSocket, message: IClientMessage)
    {
        console.log("Received message from client " + socket.id + ":", message);
        if (socket.roomId === undefined)
        {
            if (message.type === ClientMessageType.JOIN_ROOM_REQUEST)
            {
                socket.roomId = 0;
                this._rooms[socket.roomId].addPlayer(socket.id);
                console.log("Client " + socket.id + " joined room " + socket.roomId);
            }
            else
            {
                console.error("Unsupported message received from " + socket.id + ": " + message.type);
            }
        }
        else if (socket.roomId)
        {
            this._rooms[socket.roomId].onClientMessage(socket.id, message);
        }
    }
}

// entry point
if (process.argv[process.argv.length - 1] === "launch")
{
    (() => {
        // tslint:disable-next-line: no-unused-expression
        new Server("127.0.0.1", 9001);
    })();
}