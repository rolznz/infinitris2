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
}

const imageCache = {} as Record<ChallengeCellType, HTMLImageElement>;

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
    case ChallengeCellType.SpawnLocation:
      return loadImage(cellType, 'spawn');
    case ChallengeCellType.Finish:
      return loadImage(cellType, 'finish');
    case ChallengeCellType.Infection:
      return loadImage(cellType, 'virus');
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
  console.log('Loading image: ' + filename);
  return new Promise((resolve) => {
    const img = new Image(); // Create new img element
    img.addEventListener('load', function () {
      imageCache[cellType] = img;
      console.log('Loaded ' + filename);
      resolve(img);
    });
    img.src = `/client/images/cells/grass/${filename}.png`;
  });
}

export function ChallengeGridPartialPreview({
  grid: gridObject,
}: ChallengePreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const grid =
    (typeof gridObject === 'string' ? (gridObject as string) : undefined) ||
    '0';
  const numRows = 16; //cellTypes.length;
  const numColumns = 12; //cellTypes[0].length;
  const width = 200;
  const height = width * (numRows / numColumns);

  useEffect(() => {
    (async () => {
      const context = canvasRef.current!.getContext('2d')!;
      context.clearRect(0, 0, context.canvas.width, context.canvas.height);
      let cellTypes: ChallengeCellType[][];
      try {
        cellTypes = parseGrid(grid);
      } catch (error) {
        return;
      }
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
      for (let r = 0; r < numRows; r++) {
        for (let c = 0; c < numColumns; c++) {
          const cellType =
            cellTypes[
              wrap(
                spawnLocationCellPosition.row +
                  r /* - Math.floor(numRows / 4)*/,
                cellTypes.length
              )
            ][
              wrap(
                spawnLocationCellPosition.column +
                  c -
                  Math.floor(numColumns / 2),
                cellTypes[0].length
              )
            ];
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
  }, [grid, width, height]);

  return <canvas ref={canvasRef} width={width + 'px'} height={height + 'px'} />;
}
