import * as WebSocket from "ws";

export default interface IClientSocket extends WebSocket
{
    id: number;
    isAlive: boolean;
    roomId: number;
}
