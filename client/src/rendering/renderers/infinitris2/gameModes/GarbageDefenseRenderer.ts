import {
  ConquestEvent,
  GameModeEvent,
  GarbageDefenseEvent,
} from '@models/GameModeEvent';
import { BaseRenderer } from '@src/rendering/BaseRenderer';
import { IRenderableEntity } from '@src/rendering/IRenderableEntity';
import { IGameModeRenderer } from '@src/rendering/renderers/infinitris2/gameModes/GameModeRenderer';
import * as PIXI from 'pixi.js-legacy';
import {
  conquestCanPlace,
  ConquestCanPlaceResult,
} from '@core/gameModes/ConquestGameMode';
import { wrap } from '@models/util/wrap';
import IBlock from '@models/IBlock';
import { debounce } from 'ts-debounce';

interface IRenderableFreeCell extends IRenderableEntity<PIXI.Graphics> {}

export class GarbageDefenseRenderer implements IGameModeRenderer {
  //private _freeRenderableCells!: { [rowColumnId: number]: IRenderableFreeCell };
  private _renderer: BaseRenderer;

  constructor(renderer: BaseRenderer) {
    //this._freeRenderableCells = {};
    this._renderer = renderer;
    this._renderer.simulation!.addEventListener(this);
  }
  onGameModeEvent(event: GarbageDefenseEvent): void {
    if (event.type === 'garbageWarning') {
      for (const cell of event.cells) {
        for (let row = cell.row; row >= 0; row--) {
          for (let i = 0; i < 1; i++) {
            this._renderer.emitParticle(
              cell.column + 0.5,
              row + 0.5,
              0xff0000,
              'capture'
            );
          }
        }
      }
    }
  }

  onSimulationStep() {
    if (!this._renderer.simulation) {
      return;
    }
  }
  onNextRound() {}
  resize(): void {}
}
