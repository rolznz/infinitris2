import { parseGrid, TutorialCellType } from 'infinitris2-models';
import React, { useEffect, useRef } from 'react';

interface TutorialPreviewProps {
  grid: string;
}

function getFillStyle(cellType: TutorialCellType): string {
  switch (cellType) {
    case TutorialCellType.Laser:
    case TutorialCellType.Deadly:
      return '#c2261f';
    case TutorialCellType.RedKey:
    case TutorialCellType.RedLock:
      return '#f00';
    case TutorialCellType.BlueKey:
    case TutorialCellType.BlueLock:
      return '#00f';
    case TutorialCellType.GreenKey:
    case TutorialCellType.GreenLock:
      return '#0f0';
    case TutorialCellType.YellowKey:
    case TutorialCellType.YellowLock:
      return '#ff0';
    case TutorialCellType.Finish:
      return '#aaffaa';
    default:
      return '#aaaaaa';
  }
}

export default function TutorialGridPreview({ grid }: TutorialPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const context = canvasRef.current!.getContext('2d')!;
    let cellTypes: TutorialCellType[][];
    try {
      cellTypes = parseGrid(grid);
    } catch (error) {
      return;
    }
    const numRows = cellTypes.length;
    const numColumns = cellTypes[0].length;
    const cellSize = Math.min(
      context.canvas.width / numColumns,
      context.canvas.height / numRows
    );

    const sx = (context.canvas.width - numColumns * cellSize) * 0.5;
    const sy = (context.canvas.height - numRows * cellSize) * 0.5;

    for (let r = 0; r < numRows; r++) {
      for (let c = 0; c < numColumns; c++) {
        const cellType = cellTypes[r][c];
        if (cellType !== TutorialCellType.Empty) {
          context.fillStyle = getFillStyle(cellType);
          context.fillRect(
            sx + c * cellSize,
            sy + r * cellSize,
            cellSize,
            cellSize
          );
        }
      }
    }
    context.beginPath();
    context.rect(sx, sy, numColumns * cellSize, numRows * cellSize);
    context.stroke();
  }, [grid]);

  return <canvas ref={canvasRef} width={100} height={100} />;
}
