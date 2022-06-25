import { parseGrid, ChallengeCellType, IChallenge } from 'infinitris2-models';
import React, { useEffect, useRef } from 'react';
import { getCellFillColor } from '../../../utils/getCellFillColor';

interface ChallengePreviewProps {
  grid: IChallenge['grid'];
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

    for (let r = 0; r < numRows; r++) {
      for (let c = 0; c < numColumns; c++) {
        const cellType =
          cellTypes[r % cellTypes.length][c % cellTypes[0].length];
        if (cellType !== ChallengeCellType.Empty) {
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
    // context.beginPath();
    // context.rect(0, 0, numColumns * cellWidth, numRows * cellHeight);
    // context.stroke();
  }, [grid, width, height]);

  return <canvas ref={canvasRef} width={width + 'px'} height={height + 'px'} />;
}
