import createBehaviourFromChallengeCellType from '@core/grid/cell/behaviours/createBehaviourFromChallengeCellType';
import ChallengeCellType, {
  getChallengeCellTypeDescription,
} from '@models/ChallengeCellType';
import {
  IChallengeEditor,
  IChallengeEditorEventListener,
} from '@models/IChallengeEditor';
import InputAction, {
  CustomizableInputAction,
  HardCodedInputAction,
  InputActionListener,
  InputActionWithData,
  KeyPressActionWithData,
  MouseClickActionWithData,
} from '@models/InputAction';
import ISimulation from '@models/ISimulation';
import { stringifyGrid } from '@models/util/stringifyGrid';
import ChallengeClient from '@src/client/singleplayer/ChallengeClient';
import { BaseRenderer } from '@src/rendering/BaseRenderer';

export class ChallengeEditor implements IChallengeEditor {
  private _isEditing: boolean;
  private _simulation?: ISimulation;
  //private _renderer?: BaseRenderer;
  private _client: ChallengeClient;
  private _challengeCellType: ChallengeCellType;
  private _eventListeners: Partial<IChallengeEditorEventListener>[];

  constructor(
    client: ChallengeClient,
    eventListeners?: Partial<IChallengeEditorEventListener>[],
    isEditing = true
  ) {
    this._client = client;
    this._isEditing = isEditing;
    this._challengeCellType = ChallengeCellType.Full;
    this._eventListeners = eventListeners || [];
  }
  get challengeCellType(): ChallengeCellType {
    return this._challengeCellType;
  }
  set challengeCellType(challengeCellType: ChallengeCellType) {
    if (this._challengeCellType === challengeCellType) {
      return;
    }
    this._challengeCellType = challengeCellType;
    this._eventListeners?.forEach((eventListener) =>
      eventListener.onChangeChallengeCellType?.(this)
    );
  }
  get inputActionListener(): InputActionListener {
    return this._actionListener;
  }

  get isEditing(): boolean {
    return this._isEditing;
  }
  set isEditing(isEditing: boolean) {
    if (this._isEditing === isEditing || !this._simulation) {
      return;
    }
    this._isEditing = isEditing;
    if (this._isEditing) {
      this._client.restart();
    } else {
      this._saveGrid();
      this._simulation.startInterval();
    }
    this._eventListeners.forEach((eventListener) =>
      eventListener.onToggleIsEditing?.(this)
    );
  }

  set simulation(simulation: ISimulation) {
    this._simulation = simulation;
  }

  // set renderer(renderer: BaseRenderer) {
  //   this._renderer = renderer;
  // }

  _actionListener = (action: InputActionWithData) => {
    if (!this._simulation) {
      return;
    }
    if (
      action.type === HardCodedInputAction.MouseClick &&
      this._isEditing /** || editWhilePlayingEnabled (Desktop only) */
    ) {
      const mouseClickAction = action as MouseClickActionWithData;
      if (mouseClickAction.data.cell) {
        if (mouseClickAction.data.button === 0) {
          createBehaviourFromChallengeCellType(
            mouseClickAction.data.cell,
            this._simulation.grid,
            this._challengeCellType
          );
          this._saveGrid();
        } else if (mouseClickAction.data.button === 2) {
          createBehaviourFromChallengeCellType(
            mouseClickAction.data.cell,
            this._simulation.grid,
            ChallengeCellType.Empty
          );
          this._saveGrid();
        }
      }
    }

    /*if (this._isEditing) {
    }*/

    // TODO: only enable these hotkeys in dev mode once app has a better UI
    if (action.type === HardCodedInputAction.KeyDown) {
      const keyPressActionWithData = action as KeyPressActionWithData;
      if (
        keyPressActionWithData.data.ctrlKey &&
        keyPressActionWithData.data.shiftKey &&
        keyPressActionWithData.data.altKey &&
        keyPressActionWithData.data.key === 'T'
      ) {
        const newCellTypeNumberString = prompt(
          'Enter new cell type:\n' +
            Object.values(ChallengeCellType)
              .map(
                (type, index) =>
                  `${index}: ${getChallengeCellTypeDescription(type)}`
              )
              .join('\n'),
          Object.values(ChallengeCellType)
            .indexOf(this._challengeCellType)
            .toString()
        );
        if (newCellTypeNumberString) {
          const numberValue = parseInt(newCellTypeNumberString);
          this.challengeCellType =
            Object.values(ChallengeCellType)[numberValue];
        }
      }

      if (
        keyPressActionWithData.data.ctrlKey &&
        keyPressActionWithData.data.shiftKey &&
        keyPressActionWithData.data.altKey &&
        keyPressActionWithData.data.key === 'G'
      ) {
        const newGridSizeResponse = prompt(
          'Enter new grid size (rows, columns)',
          this._simulation.grid.numRows + ',' + this._simulation.grid.numColumns
        );
        const newGridSizeParts = newGridSizeResponse
          ?.split(',')
          .map((part) => part.trim());
        if (newGridSizeParts?.length === 2) {
          const rows = parseInt(newGridSizeParts[0]);
          const cols = parseInt(newGridSizeParts[1]);
          this.setGridSize(rows, cols);
        }
      }

      if (
        keyPressActionWithData.data.ctrlKey &&
        keyPressActionWithData.data.shiftKey &&
        keyPressActionWithData.data.altKey &&
        keyPressActionWithData.data.key === 'J'
      ) {
        alert(stringifyGrid(this._simulation.grid));
      }
    }

    if (action.type === HardCodedInputAction.KeyDown) {
      const keyPressActionWithData = action as KeyPressActionWithData;
      if (
        keyPressActionWithData.data.ctrlKey &&
        keyPressActionWithData.data.shiftKey &&
        keyPressActionWithData.data.altKey &&
        keyPressActionWithData.data.key === 'E'
      ) {
        this.isEditing = !this.isEditing;
      }
    }
  };

  setGridSize(numRows: number, numColumns: number): void {
    this._simulation!.grid.resize(numRows, numColumns);
    this._saveGrid();
    // FIXME: shouldn't have to restart everything when changing the grid size
    // renderer needs to pick up new grid changes and rerender properly
    this._client.restart();
    // TODO: should show the challenge info screen instead?
    if (!this._isEditing) {
      this._client.simulation.startInterval();
    }
  }

  private _saveGrid() {
    (this._client.challenge.grid as string) = stringifyGrid(
      this._simulation!.grid
    );
    this._eventListeners?.forEach((eventListener) =>
      eventListener.onSaveGrid?.(this, this._client.challenge.grid)
    );
  }
}
