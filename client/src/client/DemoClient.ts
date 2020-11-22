import IRenderer from "@src/rendering/IRenderer";
import IClient from "./Client";
import DemoRenderer from "@src/rendering/renderers/demo/DemoRenderer";

export default class DemoClient implements IClient
{
  private _renderer: IRenderer;
  constructor()
  {
    this._create();
  }

  /**
   * @inheritdoc
   */
  destroy() {
    this._renderer.destroy();
  }

  private async _create()
  {
    this._renderer = new DemoRenderer();
    await this._renderer.create();
  }
}