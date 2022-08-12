import { useIsLandscape } from '@/components/hooks/useIsLandscape';
import {
  parseGrid,
  ChallengeCellType,
  IChallenge,
  wrap,
} from 'infinitris2-models';
import React, { useEffect, useRef } from 'react';
import { getCellFillColor } from '../../../utils/getCellFillColor';

interface ChallengePreviewProps {
  grid: IChallenge['grid'];
  allRows?: boolean;
  width?: number;
  numRows?: number;
  aspectRatio?: number;
}

const imageCache = {} as Record<ChallengeCellType, HTMLImageElement>;

// TODO: remove (only generate previews serverside)
async function getChallengeCellImage(
  cellType: ChallengeCellType
): Promise<HTMLImageElement | undefined> {
  switch (cellType) {
    case ChallengeCellType.Full:
      return loadImage(cellType, 'fill');
    case ChallengeCellType.RockGenerator:
      return loadImage(cellType, 'rock-generator');
    case ChallengeCellType.RedKey:
      return loadImage(cellType, 'key_red');
    case ChallengeCellType.BlueKey:
      return loadImage(cellType, 'key_blue');
    case ChallengeCellType.GreenKey:
      return loadImage(cellType, 'key_green');
    case ChallengeCellType.YellowKey:
      return loadImage(cellType, 'key_yellow');
    case ChallengeCellType.RedLock:
      return loadImage(cellType, 'lock_red');
    case ChallengeCellType.BlueLock:
      return loadImage(cellType, 'lock_blue');
    case ChallengeCellType.GreenLock:
      return loadImage(cellType, 'lock_green');
    case ChallengeCellType.YellowLock:
      return loadImage(cellType, 'lock_yellow');
    case ChallengeCellType.ReverseRedLock:
      return loadImage(cellType, 'reverse_lock_red');
    case ChallengeCellType.ReverseBlueLock:
      return loadImage(cellType, 'reverse_lock_blue');
    case ChallengeCellType.ReverseGreenLock:
      return loadImage(cellType, 'reverse_lock_green');
    case ChallengeCellType.ReverseYellowLock:
      return loadImage(cellType, 'reverse_lock_yellow');
    case ChallengeCellType.RedSwitch:
      return loadImage(cellType, 'switch_red_on');
    case ChallengeCellType.BlueSwitch:
      return loadImage(cellType, 'switch_blue_on');
    case ChallengeCellType.GreenSwitch:
      return loadImage(cellType, 'switch_green_on');
    case ChallengeCellType.YellowSwitch:
      return loadImage(cellType, 'switch_yellow_on');
    case ChallengeCellType.Checkpoint:
      return loadImage(cellType, 'checkpoint');
    case ChallengeCellType.SpawnLocation:
      return loadImage(cellType, 'spawn');
    case ChallengeCellType.Finish:
      return loadImage(cellType, 'finish');
    case ChallengeCellType.Infection:
      return loadImage(cellType, 'virus');
    case ChallengeCellType.Wafer:
      return loadImage(cellType, 'wafer');
    case ChallengeCellType.Deadly:
      return loadImage(cellType, 'deadly');
    case ChallengeCellType.GestureMoveLeft:
      return loadImage(cellType, 'gesture_left');
    case ChallengeCellType.GestureMoveRight:
      return loadImage(cellType, 'gesture_right');
    case ChallengeCellType.GestureMoveDown:
      return loadImage(cellType, 'gesture_down');
    case ChallengeCellType.GestureDrop:
      return loadImage(cellType, 'gesture_drop');
    case ChallengeCellType.GestureRotateClockwise:
      return loadImage(cellType, 'gesture_rotate_clockwise');
    case ChallengeCellType.GestureRotateAnticlockwise:
      return loadImage(cellType, 'gesture_rotate_anticlockwise');
    case ChallengeCellType.GestureRotateDownClockwise:
      return loadImage(cellType, 'gesture_rotate_down_clockwise');
    case ChallengeCellType.GestureRotateDownAnticlockwise:
      return loadImage(cellType, 'gesture_rotate_down_anticlockwise');
    default:
      return undefined;
  }
}

async function loadImage(
  cellType: ChallengeCellType,
  filename: string
): Promise<HTMLImageElement> {
  if (imageCache[cellType]) {
    return imageCache[cellType];
  }
  //console.log('Loading image: ' + filename);
  return new Promise((resolve) => {
    const img = new Image(); // Create new img element
    img.addEventListener('load', function () {
      imageCache[cellType] = img;
      //console.log('Loaded ' + filename);
      resolve(img);
    });
    img.addEventListener('error', function () {
      // fallback to non-world image (temporary hack, challenge previews should not be generated client-side)
      img.src = `/client/images/cells/${filename}.png`;
    });
    img.src = `/client/images/cells/grass/${filename}.png`;
  });
}

export function ChallengeGridPartialPreview({
  grid: gridObject,
  allRows,
  width,
  numRows = 16,
  aspectRatio = 3 / 4,
}: ChallengePreviewProps) {
  const isLandscape = useIsLandscape();
  width = width || (isLandscape ? 200 : 165);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const grid =
    (typeof gridObject === 'string' ? (gridObject as string) : undefined) ||
    '0';
  let cellTypes: ChallengeCellType[][];
  try {
    cellTypes = parseGrid(grid);
  } catch (error) {
    cellTypes = [[ChallengeCellType.Full]];
  }
  numRows = allRows ? cellTypes.length : numRows;

  const numColumns = Math.round(numRows * aspectRatio); //cellTypes[0].length;
  const height = width * (numRows / numColumns);

  useEffect(() => {
    (async () => {
      const context = canvasRef.current!.getContext('2d')!;
      context.clearRect(0, 0, context.canvas.width, context.canvas.height);

      const cellWidth = context.canvas.width / numColumns;
      const cellHeight = context.canvas.height / numRows;
      const spawnLocationCellPosition = { row: 0, column: 0 };

      for (let r = 0; r < cellTypes.length; r++) {
        for (let c = 0; c < cellTypes[0].length; c++) {
          if (cellTypes[r][c] === ChallengeCellType.SpawnLocation) {
            spawnLocationCellPosition.row = r;
            spawnLocationCellPosition.column = c;
            break;
          }
        }
      }
      if (spawnLocationCellPosition.row + numRows > cellTypes.length) {
        spawnLocationCellPosition.row = Math.max(cellTypes.length - numRows, 0);
      }

      for (let r = 0; r < numRows; r++) {
        for (let c = 0; c < numColumns; c++) {
          const sr =
            spawnLocationCellPosition.row + r; /* - Math.floor(numRows / 4)*/

          const cellType =
            sr < cellTypes.length
              ? cellTypes[wrap(sr, cellTypes.length)][
                  wrap(
                    spawnLocationCellPosition.column +
                      c -
                      Math.floor(numColumns / 2),
                    cellTypes[0].length
                  )
                ]
              : ChallengeCellType.Full;
          if (cellType !== ChallengeCellType.Empty) {
            const image = await getChallengeCellImage(cellType);
            if (image) {
              context.drawImage(
                image,
                c * cellWidth,
                r * cellHeight,
                cellWidth,
                cellHeight
              );
            } else {
              context.fillStyle = getCellFillColor(cellType);
              context.fillRect(
                c * cellWidth,
                r * cellHeight,
                cellWidth,
                cellHeight
              );
            }
          }
        }
      }
    })();
  }, [grid, width, height, numColumns, numRows, cellTypes]);

  return <canvas ref={canvasRef} width={width + 'px'} height={height + 'px'} />;
}
