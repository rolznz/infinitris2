import Player from "@core/player/Player";
import IBlockEventListener from "@core/block/IBlockEventListener";

export default class ControllablePlayer extends Player
{
    constructor(playerId: number, eventListener: IBlockEventListener)
    {
        super(playerId, eventListener);
    }
}