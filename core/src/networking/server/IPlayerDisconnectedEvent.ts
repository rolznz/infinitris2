import IServerMessage from "./IServerMessage";

export default interface IPlayerDisconnectedEvent extends IServerMessage
{
    playerId: number;
}