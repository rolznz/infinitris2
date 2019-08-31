import Simulation from "@core/Simulation";
import ISimulationEventListener from "@core/ISimulationEventListener";
import NetworkPlayer from "@core/player/NetworkPlayer";
import IClientMessage from "@core/networking/client/IClientMessage";
import { SendServerMessageFunction } from "./networking/ServerSocket";
import ServerMessageType from "@core/networking/server/ServerMessageType";
import IJoinRoomResponse, { JoinRoomResponseStatus } from "@core/networking/server/IJoinRoomResponse";
import IPlayerConnectedEvent from "@core/networking/server/IPlayerConnectedEvent";
import IPlayerDisconnectedEvent from "@core/networking/server/IPlayerDisconnectedEvent";

export default class Room implements ISimulationEventListener
{
    private _sendMessage: SendServerMessageFunction;
    private _simulation: Simulation;

    constructor(sendMessage: SendServerMessageFunction)
    {
        this._sendMessage = sendMessage;
        this._simulation = new Simulation(this);
        this._simulation.start();
    }

    addPlayer(player: NetworkPlayer)
    {
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

    onClientMessage(playerId: number, message: IClientMessage)
    {
        console.log("Room received message from player " + playerId + ":", message);
    }
}