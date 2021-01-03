import IRenderer from '@src/rendering/IRenderer';
import IClient from '../../../models/src/IClient';
import DemoRenderer from '@src/rendering/renderers/demo/DemoRenderer';

export default class DemoClient implements IClient {
  // FIXME: restructure to not require definite assignment
  private _renderer!: IRenderer;
  constructor() {
    this._create();
  }

  restart(): void {
    throw new Error('Method not implemented.');
  }

  /**
   * @inheritdoc
   */
  destroy() {
    this._renderer.destroy();
  }

  private async _create() {
    this._renderer = new DemoRenderer();
    await this._renderer.create();
  }
}
