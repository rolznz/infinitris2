import Simulation from "@core/Simulation";
import IRenderer from "./rendering/IRenderer";
import MinimalRenderer from "./rendering/renderers/minimal/MinimalRenderer";
import ClientSocket from "./networking/ClientSocket";
import IServerMessage from "@core/networking/server/IServerMessage";
import IClientSocketEventListener from "./networking/IClientSocketEventListener";
import ClientMessageType from "@core/networking/client/ClientMessageType";
import ServerMessageType from "@core/networking/server/ServerMessageType";
import Grid from "@core/grid/Grid";

export default class Client implements IClientSocketEventListener
{
    private _socket: ClientSocket;
    private _renderer: IRenderer;
    private _simulation: Simulation;
    constructor(url: string)
    {
        this._socket = new ClientSocket(url, this);
        this._renderer = new MinimalRenderer();
        this._simulation = new Simulation(this._renderer);
    }

    /**
     * @inheritdoc
     */
    onConnect()
    {
        console.log("Connected");
        this._socket.sendMessage({type: ClientMessageType.JOIN_ROOM_REQUEST});
    }

    /**
     * @inheritdoc
     */
    onDisconnect()
    {
        console.log("Disconnected");
    }

    /**
     * @inheritdoc
     */
    async onMessage(message: IServerMessage)
    {
        console.log("Received message: ", message);
        if (message.type === ServerMessageType.JOIN_ROOM_RESPONSE)
        {
            await this._renderer.create();
            this._simulation.start(new Grid(undefined, undefined, this._simulation));
        }
    }
}