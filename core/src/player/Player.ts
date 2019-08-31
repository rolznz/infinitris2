export default abstract class Player
{
    private _id: number;
    constructor(id: number)
    {
        this._id = id;
    }

    get id() { return this._id; }
}