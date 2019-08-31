export default interface IRenderer
{
    /**
     * Permanently destroys the renderer (Unattaching it from the DOM, removing listeners, etc).
     */
    destroy();
}