import IServerMessage from "@core/networking/server/IServerMessage";

export default interface IClientSocketEventListener
{
    onConnect();
    onDisconnect();
    onMessage(message: IServerMessage);
}