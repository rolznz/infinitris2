import IServerMessage from "./IServerMessage";

export enum JoinRoomResponseStatus
{
    OK,
    FULL,
    WRONG_PASSWORD,
}

type JoinRoomResponseData = ({
    status: JoinRoomResponseStatus.OK,
    playerId: number;
} | {
    status: JoinRoomResponseStatus.FULL | JoinRoomResponseStatus.WRONG_PASSWORD,
});

export default interface IJoinRoomResponse extends IServerMessage
{
    data: JoinRoomResponseData;
}