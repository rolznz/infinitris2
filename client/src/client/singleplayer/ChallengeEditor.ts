import createBehaviourFromChallengeCellType from '@core/grid/cell/behaviours/createBehaviourFromChallengeCellType';
import ChallengeCellType, {
  getChallengeCellTypeDescription,
} from '@models/ChallengeCellType';
import { SaveGridFunction } from '@models/IClientApi';
import InputAction, {
  CustomizableInputAction,
  HardCodedInputAction,
  InputActionWithData,
  KeyPressActionWithData,
  MouseClickActionWithData,
} from '@models/InputAction';
import ISimulation from '@models/ISimulation';
import { stringifyGrid } from '@models/util/stringifyGrid';
import ChallengeClient from '@src/client/singleplayer/ChallengeClient';
import { ActionListener } from '@src/input/Input';
import { BaseRenderer } from '@src/rendering/BaseRenderer';

export class ChallengeEditor {
  private _isEditing: boolean;
  private _simulation?: ISimulation;
  private _renderer?: BaseRenderer;
  private _client: ChallengeClient;
  private _challengeCellType: ChallengeCellType;
  private _onSaveGrid?: SaveGridFunction;

  constructor(client: ChallengeClient, onSaveGrid?: SaveGridFunction) {
    this._client = client;
    this._isEditing = true;
    this._challengeCellType = ChallengeCellType.Full;
    this._onSaveGrid = onSaveGrid;
  }

  get inputListener(): ActionListener {
    return this._actionListener;
  }
  get isEnabled(): boolean {
    return this._isEditing;
  }

  get isEditing(): boolean {
    return this._isEditing;
  }
  set isEditing(isEditing: boolean) {
    this._isEditing = isEditing;
    if (!this._simulation) {
      return;
    }
    if (this._isEditing) {
      this._client.restart();
    } else {
      this._saveGrid();
      this._simulation.startInterval();
    }
  }

  set simulation(simulation: ISimulation) {
    this._simulation = simulation;
  }

  set renderer(renderer: BaseRenderer) {
    this._renderer = renderer;
  }

  _actionListener = (action: InputActionWithData) => {
    if (!this._simulation) {
      return;
    }
    if (action.type === HardCodedInputAction.MouseClick) {
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

    if (this._isEditing) {
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
            this._challengeCellType =
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
            this._simulation.grid.numRows +
              ',' +
              this._simulation.grid.numColumns
          );
          const newGridSizeParts = newGridSizeResponse
            ?.split(',')
            .map((part) => part.trim());
          if (newGridSizeParts?.length === 2) {
            const rows = parseInt(newGridSizeParts[0]);
            const cols = parseInt(newGridSizeParts[1]);
            this._simulation.grid.resize(rows, cols);
            this._saveGrid();
            // FIXME: shouldn't have to restart everything when changing the grid size
            // renderer needs to pick up new grid changes and rerender properly
            this._client.restart();
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

  private _saveGrid() {
    (this._client.challenge.grid as string) = stringifyGrid(
      this._simulation!.grid
    );
    this._onSaveGrid?.(this._client.challenge.grid);
  }
}
