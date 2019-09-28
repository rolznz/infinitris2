import Simulation from "@core/Simulation";
import ISimulationEventListener from "@core/ISimulationEventListener";
import NetworkPlayer from "@core/player/NetworkPlayer";
import IClientMessage from "@core/networking/client/IClientMessage";
import { SendServerMessageFunction } from "./networking/ServerSocket";
import ServerMessageType from "@core/networking/server/ServerMessageType";
import IJoinRoomResponse, { JoinRoomResponseStatus } from "@core/networking/server/IJoinRoomResponse";
import IPlayerConnectedEvent from "@core/networking/server/IPlayerConnectedEvent";
import IPlayerDisconnectedEvent from "@core/networking/server/IPlayerDisconnectedEvent";
import Grid from "@core/grid/Grid";
import Block from "@core/block/Block";

export default class Room implements ISimulationEventListener
{
    private _sendMessage: SendServerMessageFunction;
    private _simulation: Simulation;

    constructor(sendMessage: SendServerMessageFunction)
    {
        this._sendMessage = sendMessage;
        this._simulation = new Simulation(this);
        this._simulation.start(new Grid(undefined, undefined, this._simulation));
    }

    get simulation(): Simulation { return this._simulation; }

    /**
     * Creates a player and adds it to the room and the room's simulation.
     *
     * @param playerId the id of the player to add.
     */
    addPlayer(playerId: number)
    {
        const player = new NetworkPlayer(playerId, this._simulation);
        const currentPlayerIds: number[] = this._simulation.getPlayerIds();
        this._simulation.addPlayer(player);

        const joinRoomResponse: IJoinRoomResponse =
        {
            type: ServerMessageType.JOIN_ROOM_RESPONSE,
            data: {
                status: JoinRoomResponseStatus.OK,
                playerId: player.id,
            },
        };

        this._sendMessage(joinRoomResponse, player.id);

        const newPlayerMessage: IPlayerConnectedEvent = {
            type: ServerMessageType.PLAYER_CONNECTED,
            playerId: player.id,
        };

        this._sendMessage(newPlayerMessage, ...currentPlayerIds);
    }

    /**
     * Removes a player from the room and the room's simulation.
     *
     * @param playerId the id of the player to remove.
     */
    removePlayer(playerId: number)
    {
        this._simulation.removePlayer(playerId);
        const playerIds: number[] = this._simulation.getPlayerIds();
        const playerDisconnectedMessage: IPlayerDisconnectedEvent = {
            type: ServerMessageType.PLAYER_DISCONNECTED,
            playerId,
        };
        this._sendMessage(playerDisconnectedMessage, ...playerIds);
    }

    /**
     * Triggered when a message is received from a client.
     *
     * @param playerId the id of the player.
     * @param message the message the client sent.
     */
    onClientMessage(playerId: number, message: IClientMessage)
    {
        console.log("Room received message from player " + playerId + ":", message);
    }

    /**
     * @inheritdoc
     */
    onSimulationStarted(grid: Grid)
    // tslint:disable-next-line: no-empty
    {
    }

    /**
     * @inheritdoc
     */
    onBlockCreated(block: Block)
    // tslint:disable-next-line: no-empty
    {
    }

    /**
     * @inheritdoc
     */
    onBlockPlaced(block: Block)
    // tslint:disable-next-line: no-empty
    {
    }

    /**
     * @inheritdoc
     */
    onBlockMoved(block: Block)
    // tslint:disable-next-line: no-empty
    {
    }

    /**
     * @inheritdoc
     */
    onLineCleared(row: number)
    // tslint:disable-next-line: no-empty
    {
    }
}