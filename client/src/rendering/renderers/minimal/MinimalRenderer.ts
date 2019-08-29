import Renderer from "../../Renderer";
import { Application, Sprite } from "pixi.js-legacy";

export default class MinimalRenderer implements Renderer
{
    private _app: Application;
    private _logo: Sprite;

    constructor()
    {
        this._create();
    }

    destroy()
    {
        window.removeEventListener("resize", this._resize);
        this._app.destroy(true);
    }

    private async _create()
    {
        this._app = new Application({
            resizeTo: window
        });
        document.body.appendChild(this._app.view);
        
        // load the texture we need
        await new Promise(resolve => {
            this._app.loader.add('logo', 'images/logo-sm.png').load((_, resources) => {
                this._logo = new Sprite(resources.logo.texture);
                this._app.stage.addChild(this._logo);
                resolve();
            });
        })
        window.addEventListener('resize', this._resize);
        this._resize();
    }

    private _resize = () =>
    {
        this._logo.x = (this._app.renderer.width - this._logo.width) / 2;
        this._logo.y = (this._app.renderer.height - this._logo.height) / 2;
    }
}