import * as PIXI from 'pixi.js-legacy';

const starStart = 0.8;
const specialStart = 0.95;

export class DayIndicator {
  private _graphics: PIXI.Graphics;
  private _app: PIXI.Application;
  private _lastDayProportion: number;

  constructor(app: PIXI.Application) {
    this._app = app;
    this._graphics = new PIXI.Graphics();
    this._lastDayProportion = 0;
  }

  destroy() {
    // TODO: release graphics
  }

  addChildren() {
    this._app.stage.addChild(this._graphics);
  }

  update(dayProportion: number) {
    if (Math.abs(dayProportion - this._lastDayProportion) < 0.005) {
      return;
    }
    this._graphics.clear();
    const padding = Math.floor(
      Math.min(this._app.renderer.width, this._app.renderer.height) * 0.03
    );

    const radius = padding;

    this._graphics.x =
      this._app.renderer.width - this._graphics.width - padding - radius * 2;
    this._graphics.y = padding;

    const isSpecial = dayProportion >= specialStart;

    if (!isSpecial) {
      this._graphics.beginFill(0x000000, 0.1);
      this._render(1, padding, radius);
    }
    this._graphics.beginFill(
      isSpecial
        ? 0xffcc00 + Math.floor((dayProportion - specialStart) * 100000)
        : 0xffdd00
    );
    this._render(dayProportion * (1 / specialStart), padding, radius);
  }
  private _render(dayProportion: number, padding: number, radius: number) {
    const arcStartAngle = -Math.PI * 0.5;

    this._graphics.arc(
      radius,
      radius,
      radius,
      arcStartAngle,
      Math.min(dayProportion / starStart, 1) * Math.PI * 2 + arcStartAngle
    );
    if (dayProportion > starStart) {
      const maxSegments = 12;
      const numSegments = Math.ceil(
        ((dayProportion - starStart) / (1 - starStart)) * maxSegments
      );
      const starSize = radius * 0.2;
      const startNumPoints = 12;
      const starDistance = radius + starSize;
      for (let i = 0; i < numSegments; i++) {
        const angle = (i / maxSegments) * Math.PI * 2 + arcStartAngle;
        this._graphics.drawStar(
          radius + Math.cos(angle) * starDistance,
          radius + Math.sin(angle) * starDistance,
          startNumPoints,
          starSize
        );
      }
    }
  }
}
