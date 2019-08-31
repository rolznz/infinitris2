import IClientMessage from "@core/networking/client/IClientMessage";
import IClientSocket from "./IClientSocket";

export default interface IServerSocketEventListener
{
    onClientConnect(socket: IClientSocket);
    onClientDisconnect(socket: IClientSocket);
    onClientMessage(socket: IClientSocket, message: IClientMessage);
}