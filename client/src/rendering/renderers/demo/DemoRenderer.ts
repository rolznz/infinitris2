import IRenderer from '../../IRenderer';
import {
  Application,
  ParticleContainer,
  Renderer,
  Sprite,
} from 'pixi.js-legacy';
import Simulation from '@core/Simulation';
import IBlock from '@models/IBlock';
const imagesDirectory = 'client/images';

type Snowflake = {
  vx: number;
  ax: number;
  vy: number;
  _width: number;
  _height: number;
} & Sprite;

export default class DemoRenderer implements IRenderer {
  // FIXME: restructure to not require definite assignment
  private _app!: Application;
  private _snowflakes!: Snowflake[];

  /**
   * @inheritdoc
   */
  async create() {
    this._app = new Application({
      resizeTo: window,
      transparent: true,
    });
    this._app.view.classList.add('demo');
    document.body.appendChild(this._app.view);

    this._app.loader.add(`${imagesDirectory}/bg.png`);
    this._app.loader.add(`${imagesDirectory}/snow.png`);
    await new Promise((resolve) => this._app.loader.load(resolve));

    const bg = Sprite.from(
      this._app.loader.resources[`${imagesDirectory}/bg.png`].texture
    );
    bg.x = 0;
    bg.y = 0;
    bg.width = this._app.view.width;
    bg.height = this._app.view.height;
    this._app.stage.addChild(bg);

    const spriteCount = this._app.renderer instanceof Renderer ? 100 : 100;

    const snowflakesParticleContainer = new ParticleContainer(spriteCount, {
      //scale: true,
      position: true,
      rotation: true,
      uvs: true,
      //alpha: true,
    });
    this._app.stage.addChild(snowflakesParticleContainer);

    this._snowflakes = [];
    for (let i = 0; i < spriteCount; i++) {
      // create a new Sprite
      const snowflake = Sprite.from(
        this._app.loader.resources[`${imagesDirectory}/snow.png`].texture
      ) as Snowflake;

      // set the anchor point so the texture is centerd on the sprite
      snowflake.anchor.set(0.5);

      // scatter them all
      snowflake.y =
        Math.random() * this._app.screen.height * 1.5 -
        this._app.screen.height * 0.5;

      this._resetSnowflake(snowflake);

      this._snowflakes.push(snowflake);

      snowflakesParticleContainer.addChild(snowflake);
    }
    this._app.ticker.add(this._tick);
  }

  private _resetSnowflake(snowflake: Snowflake) {
    snowflake.x = Math.random() * this._app.screen.width;
    snowflake.rotation = Math.random() * Math.PI * 2;
    snowflake.width = snowflake.height = 50 + Math.random() * 200;
    snowflake.alpha = 0.5 - snowflake.width * 0.0001;

    snowflake.vy = 0.9 + Math.random() * 0.1;
    snowflake.vx = (Math.random() - 0.5) * 0.02;
    snowflake.ax = (Math.random() - 0.5) * 0.0002;
  }

  private _tick = () => {
    for (const snowflake of this._snowflakes) {
      snowflake.transform.position.y += snowflake.vy;
      snowflake.transform.position.x += snowflake.vx;
      snowflake.vx += snowflake.ax;
      snowflake.alpha *= 0.9;
      if (
        snowflake.transform.position.y - snowflake._height >
        this._app.screen.height
      ) {
        snowflake.transform.position.y = -snowflake.height;
        this._resetSnowflake(snowflake);
      }
    }
  };

  /**
   * @inheritdoc
   */
  destroy() {
    if (this._app) {
      this._app.destroy(true);
    }
  }

  /**
   * @inheritdoc
   */
  onSimulationInit(simulation: Simulation) {
    throw new Error('Method not implemented.');
  }

  /**
   * @inheritdoc
   */
  onSimulationStep(simulation: Simulation) {
    throw new Error('Method not implemented.');
  }

  /**
   * @inheritdoc
   */
  onBlockCreated(block: IBlock) {
    throw new Error('Method not implemented.');
  }

  /**
   * @inheritdoc
   */
  onBlockPlaced(block: IBlock) {
    throw new Error('Method not implemented.');
  }

  /**
   * @inheritdoc
   */
  onBlockMoved(block: IBlock) {
    throw new Error('Method not implemented.');
  }

  /**
   * @inheritdoc
   */
  onBlockWrapped(block: IBlock, wrapIndexChange: number) {
    throw new Error('Method not implemented.');
  }

  /**
   * @inheritdoc
   */
  onBlockDied(block: IBlock) {
    throw new Error('Method not implemented.');
  }

  /**
   * @inheritdoc
   */
  onLineCleared(row: number) {
    throw new Error('Method not implemented.');
  }
}
