import { INITIAL_FALL_DELAY } from '@core/block/Block';
import { wrap, wrappedDistance } from '@core/utils/wrap';
import { GameModeEvent } from '@models/GameModeEvent';
import IBlock from '@models/IBlock';
import ICell from '@models/ICell';
import ICellBehaviour from '@models/ICellBehaviour';
import { IGameMode } from '@models/IGameMode';
import IGrid from '@models/IGrid';
import { IPlayer, PlayerStatus } from '@models/IPlayer';
import ISimulation from '@models/ISimulation';

type ConquestGameModeState = {};
type PlayerAppearance = {
  color: number;
  patternFilename: string | undefined;
  characterId: string | undefined;
};

export class ConquestGameMode implements IGameMode<ConquestGameModeState> {
  private _simulation: ISimulation;
  private _lastCalculationTime: number;
  private _lastPlayerPlaced: IPlayer | undefined;
  private _lastMoveWasMistake: { [playerId: number]: boolean };
  private _temporarilyDeadPlayers: { [playerId: number]: boolean };
  private _originalPlayerAppearances: { [playerId: number]: PlayerAppearance };

  constructor(simulation: ISimulation) {
    this._simulation = simulation;
    this._lastCalculationTime = 0;
    this._lastMoveWasMistake = [];
    this._temporarilyDeadPlayers = [];
    this._originalPlayerAppearances = [];
  }

  get hasRounds(): boolean {
    return this._simulation.settings.gameModeSettings?.hasRounds ?? false;
  }
  get hasConversions(): boolean {
    return this._simulation.settings.gameModeSettings?.hasConversions ?? false;
  }
  get hasHealthbars(): boolean {
    return false;
  }
  get hasLineClearReward(): boolean {
    return false;
  }
  get hasBlockPlacementReward(): boolean {
    return false;
  }
  get shouldNewPlayerSpectate(): boolean {
    return !this.hasRounds || !this.hasConversions;
  }

  step(): void {}

  onLinesCleared() {
    this._calculateKnockouts();
  }
  onBlockCreated(block: IBlock) {
    this._temporarilyDeadPlayers[block.player.id] = false;
  }
  onBlockRemoved() {
    this._calculateKnockouts();
  }
  onBlockDied(block: IBlock) {
    this._lastMoveWasMistake[block.player.id] = true;
  }
  onBlockPlaced(block: IBlock) {
    this._lastMoveWasMistake[block.player.id] = false;
    this._lastPlayerPlaced = block.player;
    // area capture
    const lineClearRowsToCheck: number[] = [];
    const touchingTowerRow = this._simulation.grid.getTowerRow() + 1;
    const cellsTouchingTowerRow = block.cells.filter(
      (cell) => cell.row === touchingTowerRow
    );
    for (const cellTouchingTowerRow of cellsTouchingTowerRow) {
      for (
        let i = 1;
        i < Math.floor(this._simulation.grid.numColumns / 2 - 1);
        i++
      ) {
        for (const direction of [-1, 1]) {
          const neighbour = this._simulation.grid.getNeighbour(
            cellTouchingTowerRow,
            i * direction,
            0
          );
          if (neighbour && neighbour.player === block.player) {
            for (
              let r = touchingTowerRow;
              r < this._simulation.grid.numRows;
              r++
            ) {
              for (let dx = 0; dx <= i; dx++) {
                const cellToFill = this._simulation.grid.getNeighbour(
                  cellTouchingTowerRow,
                  dx * direction,
                  r - touchingTowerRow
                );
                if (cellToFill && cellToFill.player !== block.player) {
                  this._simulation.onGameModeEvent({
                    type: 'cellAreaCapture',
                    column: cellToFill.column,
                    row: cellToFill.row,
                    color: block.player.color,
                  });
                  cellToFill.rerenderDelay = Math.random() * 500;
                  cellToFill.place(block.player);
                  lineClearRowsToCheck.push(cellToFill.row);
                }
              }
            }
            break;
          }
        }
      }
    }
    this._simulation.grid.checkLineClears(
      lineClearRowsToCheck.filter((row, i, rows) => rows.indexOf(row) === i)
    );
  }
  onPlayerKilled(victim: IPlayer, attacker: IPlayer) {
    if (this.hasConversions && attacker) {
      // if a player gets killed,
      this._originalPlayerAppearances[victim.id] = {
        color: attacker.color,
        patternFilename: attacker.patternFilename,
        characterId: attacker.characterId,
      };
      this._updatePlayerAppearance(victim, attacker);
    }
  }
  onPlayerChangeStatus(player: IPlayer) {
    if (
      this.hasConversions &&
      player.status === PlayerStatus.ingame &&
      this._simulation.activePlayers.some(
        (other) => other !== player && other.color === player.color
      )
    ) {
      // players who get converted already have one more more cells to play on
      player.isFirstBlock = false;
    }
  }

  onEndRound() {
    for (const player of this._simulation.nonSpectatorPlayers) {
      if (this._originalPlayerAppearances[player.id]) {
        this._updatePlayerAppearance(
          player,
          this._originalPlayerAppearances[player.id]
        );
        delete this._originalPlayerAppearances[player.id];
      }
    }
  }

  private _calculateKnockouts() {
    const activePlayers = this._simulation.activePlayers;
    for (const player of activePlayers) {
      if (!player.isFirstBlock) {
        // TODO: optimize - this is checking every single cell in the grid
        const placableCellsCount = this._simulation.grid.reducedCells.filter(
          (cell) =>
            conquestCanPlace(player, this._simulation, cell, false).canPlace
        ).length;
        if (placableCellsCount === 0) {
          if (this._lastPlayerPlaced) {
            this._simulation.onPlayerKilled(player, this._lastPlayerPlaced);
          }
          if (!this.hasRounds) {
            this._temporarilyDeadPlayers[player.id] = true;
          }
          if (!this._simulation.isNetworkClient) {
            player.status = PlayerStatus.knockedOut;

            let conversionsEndRound = false;
            if (
              this.hasConversions &&
              this._simulation.activePlayers.every(
                (v, _, a) => v.color === a[0].color
              )
            ) {
              // everyone is on the same team now, knock out all players except the winner
              conversionsEndRound = true;
              // TODO: leave the player that has been active the longest (the winner)
              const winner = this._simulation.activePlayers.find(
                (activePlayer, _, a) =>
                  !a.some(
                    (other) =>
                      other.lastStatusChangeTime <
                      activePlayer.lastStatusChangeTime
                  )
              );
              this._simulation.activePlayers
                .filter((activePlayer) => activePlayer !== winner)
                .forEach((player) => (player.status = PlayerStatus.knockedOut));
            }

            if (
              !this.hasRounds ||
              (this.hasConversions && !conversionsEndRound)
            ) {
              // instantly switch state back - will cause the player to reset
              player.status = PlayerStatus.ingame;
            }
          }
        } else {
          player.score = placableCellsCount;
        }
      } else {
        player.score = 0;
      }
    }
  }
  private _updatePlayerAppearance(
    player: IPlayer,
    appearance: PlayerAppearance
  ) {
    player.color = appearance.color;
    player.patternFilename = appearance.patternFilename;
    player.characterId = appearance.characterId;
    player.requiresFullRerender = true;
  }

  onNextRound() {
    this._lastCalculationTime = 0;
    this._lastPlayerPlaced = undefined;
    this._lastMoveWasMistake = [];

    /*// FIXME: remove
    setTimeout(() => {
      const towerRow = this._simulation.grid.getTowerRow();
      for (const column of [8, 9, 19]) {
        for (let row = towerRow; row < this._simulation.grid.numRows; row++) {
          this._simulation.grid.cells[row][column].place(
            this._simulation.followingPlayer
          );
        }
      }
    }, 100);*/
  }

  serialize(): ConquestGameModeState {
    return {};
  }

  deserialize(state: ConquestGameModeState) {}

  checkMistake(player: IPlayer, cells: ICell[], isMistake: boolean): boolean {
    if (isMistake) {
      return true;
    }

    isMistake = true;
    for (const cell of cells) {
      if (conquestCanPlace(player, this._simulation, cell).canPlace) {
        isMistake = false;
        break;
      }
    }
    return isMistake;
  }

  getSpawnDelay(player: IPlayer) {
    if (this._temporarilyDeadPlayers[player.id]) {
      return 5000;
    } else if (this._lastMoveWasMistake[player.id]) {
      return 1000;
    } else {
      return 0;
    }
  }
  getFallDelay(player: IPlayer) {
    return player.isFirstBlock
      ? INITIAL_FALL_DELAY
      : INITIAL_FALL_DELAY -
          (player.score / this._simulation.grid.numColumns) *
            0.35 *
            INITIAL_FALL_DELAY;
  }
}

export type ConquestCanPlaceResult = {
  canPlace: boolean;
  isStalemate: boolean;
};

let _forgivingTowerRows: { row: number; checkTimeMs: number }[] = [];

export function conquestCanPlace(
  player: IPlayer,
  simulation: ISimulation,
  cell: ICell,
  isForgiving = true
): ConquestCanPlaceResult {
  if (
    !cell.isEmpty &&
    (!isForgiving || !cell.wasRecentlyPlaced(simulation.forgivingPlacementTime))
  ) {
    return { canPlace: false, isStalemate: false };
  }

  // check for stalemates - the cell is within two towers that touch the ceiling
  // in the below scenario, no one would be able to place between A's blocks because they are touching the tower height.
  // instead, make that entire gap free for all players to drop.
  //  ------------------
  //  AA              AA
  //  AA              AA
  //  AA              AA
  //  AA              AA

  // due to tower height not being forgiving (it can change instantly, we store all recent tower heights)
  // TODO: make this more efficient (don't recalculate every single check) and remove use of global _forgivingTowerRows

  const currentTowerRow = simulation.grid.getTowerRow();
  const currentTowerRowEntry = {
    row: currentTowerRow,
    checkTimeMs: Date.now(),
  };
  if (isForgiving) {
    _forgivingTowerRows = _forgivingTowerRows.filter(
      (entry) =>
        entry.row !== currentTowerRow &&
        entry.checkTimeMs > Date.now() - simulation.forgivingPlacementTime
    );
    _forgivingTowerRows.push(currentTowerRowEntry);
  }
  let forgivingTowerRows = isForgiving
    ? _forgivingTowerRows
    : [currentTowerRowEntry];

  if (
    cell.row <=
    forgivingTowerRows.find(
      (towerRow) =>
        !forgivingTowerRows.some((other) => other.row < towerRow.row)
    )!.row
  ) {
    // cell is above tower height
    return { canPlace: false, isStalemate: false };
  }

  // only allow placement anywhere if first block
  if (
    player.isFirstBlock &&
    (cell.isEmpty ||
      (isForgiving &&
        cell.wasRecentlyPlaced(simulation.forgivingPlacementTime)))
  ) {
    return { canPlace: true, isStalemate: false };
  }

  for (const forgivingTowerRow of forgivingTowerRows) {
    const touchingTowerHeightRow = forgivingTowerRow.row + 1;
    if (cell.row >= touchingTowerHeightRow) {
      const towerColumns: (number | undefined)[] = [undefined, undefined];
      for (
        let columnOffset = 1;
        columnOffset < Math.floor(simulation.grid.numColumns / 2 - 1);
        columnOffset++
      ) {
        for (let i = 0; i < towerColumns.length; i++) {
          if (towerColumns[i] !== undefined) {
            continue;
          }
          const wrappedColumn = wrap(
            cell.column + columnOffset * (i === 0 ? 1 : -1),
            simulation.grid.numColumns
          );
          const touchingTowerHeightCell =
            simulation.grid.cells[touchingTowerHeightRow][wrappedColumn];
          if (
            !touchingTowerHeightCell.isEmpty &&
            touchingTowerHeightCell.player
          ) {
            towerColumns[i] = wrappedColumn;
          }
        }
      }
      if (
        towerColumns[0] !== undefined &&
        towerColumns[1] !== undefined &&
        towerColumns[0] !== towerColumns[1] &&
        isBetweenShortestPath(
          cell.column,
          towerColumns[0],
          towerColumns[1],
          simulation.grid.numColumns
        )
      ) {
        return { canPlace: true, isStalemate: true };
      }
    }
  }

  // allow a player (B) to place on a column next to any of their cells, as long as one of their cells on a neighbour column is above
  // where "X" is player B's next block
  //   BB
  //   AB
  //   ABBB
  //   AAAB
  //   AAAB
  // XXAAAB
  // XXAAAB

  let canPlace = false;
  [-1, 1, 0].forEach((neighbourDirection) => {
    const neighbourColumn = wrap(
      cell.column + neighbourDirection,
      simulation.grid.numColumns
    );
    for (
      let row = 0;
      row < Math.min(cell.row + 2, simulation.grid.numRows);
      row++
    ) {
      const neighbour = simulation.grid.cells[row][neighbourColumn];
      canPlace =
        canPlace ||
        ((neighbour.player?.color === player.color ||
          (isForgiving &&
            neighbour.wasRecentlyPlaced(simulation.forgivingPlacementTime) &&
            playerHasNearbyCell(player, neighbour, simulation))) &&
          // discard diagonal items
          [
            [-1, 0],
            [1, 0],
            [0, -1],
          ].some((neighbourDirection) => {
            const neighbourNeighbour = simulation.grid.getNeighbour(
              neighbour,
              neighbourDirection[0],
              neighbourDirection[1]
            );
            return (
              neighbourNeighbour?.isEmpty ||
              (isForgiving &&
                neighbourNeighbour?.wasRecentlyPlaced(
                  simulation.forgivingPlacementTime
                ))
            );
          }));
    }
  });

  return { canPlace, isStalemate: false };
}
function isBetweenShortestPath(
  column: number,
  columnA: number,
  columnB: number,
  numColumns: number
) {
  const distanceBetweenTowers = wrappedDistance(columnA, columnB, numColumns);
  const distanceToTowerA = wrappedDistance(column, columnA, numColumns);
  const distanceToTowerB = wrappedDistance(column, columnB, numColumns);

  return distanceToTowerA + distanceToTowerB <= distanceBetweenTowers;
}
function playerHasNearbyCell(
  player: IPlayer,
  neighbour: ICell,
  simulation: ISimulation
): boolean {
  return [
    [1, 0],
    [-1, 0],
    [0, -1],
    [0, 1],
  ].some(
    (direction) =>
      simulation.grid.getNeighbour(neighbour, direction[0], direction[1])
        ?.player?.color === player.color
  );
}
