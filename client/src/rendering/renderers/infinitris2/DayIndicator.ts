import * as PIXI from 'pixi.js-legacy';

const specialStart = 0.95;

export class DayIndicator {
  private _graphics: PIXI.Graphics;
  private _app: PIXI.Application;
  private _lastDayProportion: number;
  private _text!: PIXI.Text;

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

    this._text = new PIXI.Text('', {
      fill: '#ffffff',
      align: 'center',
      fontSize: 22,
      dropShadow: true,
      dropShadowAngle: Math.PI / 2,
      dropShadowDistance: 1,
      dropShadowBlur: 2,
    });
    this._text.anchor.set(0.5, 0.5);
    this._app.stage.addChild(this._text);
  }

  update(dayProportion: number, secondsUntilNextDay: number) {
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

    this._text.text = Math.floor(Math.min(secondsUntilNextDay, 99)).toString();
    this._text.x = this._graphics.x + radius;
    this._text.y = this._graphics.y + radius;

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
    this.drawWedge(
      this._graphics,
      radius,
      radius,
      radius,
      -Math.min(dayProportion, 1) * 360,
      90
    );
    const maxSegments = 12;
    const numSegments = Math.ceil(dayProportion * maxSegments);
    const starSize = radius * 0.2;
    const startNumPoints = 12;
    const starDistance = radius + starSize;
    for (let i = 0; i < numSegments; i++) {
      const angle = (i / maxSegments) * Math.PI * 2 - Math.PI * 0.5;
      this._graphics.drawStar(
        radius + Math.cos(angle) * starDistance,
        radius + Math.sin(angle) * starDistance,
        startNumPoints,
        starSize
      );
    }
  }

  // adapted from https://levelup.gitconnected.com/advanced-drawing-with-pixi-js-cd3fddc1d69e
  private drawWedge(
    target: PIXI.Graphics,
    x: number,
    y: number,
    radius: number,
    arc: number,
    startAngle = 0
  ) {
    let segs = 8;
    let segAngle = arc / segs;
    let theta = -(segAngle / 180) * Math.PI;
    let angle = -(startAngle / 180) * Math.PI;
    let ax = x + Math.cos((startAngle / 180) * Math.PI) * radius;
    let ay = y + Math.sin((-startAngle / 180) * Math.PI) * radius;
    let angleMid, bx, by, cx, cy;
    target.moveTo(x, y);
    target.lineTo(ax, ay);
    for (let i = 0; i < segs; ++i) {
      angle += theta;
      angleMid = angle - theta / 2;
      bx = x + Math.cos(angle) * radius;
      by = y + Math.sin(angle) * radius;
      cx = x + Math.cos(angleMid) * (radius / Math.cos(theta / 2));
      cy = y + Math.sin(angleMid) * (radius / Math.cos(theta / 2));
      target.quadraticCurveTo(cx, cy, bx, by);
    }
    target.lineTo(x, y);
  }
}
