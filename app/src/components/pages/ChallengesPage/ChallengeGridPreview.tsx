import { parseGrid, ChallengeCellType } from 'infinitris2-models';
import React, { useEffect, useRef } from 'react';
import { getCellFillColor } from '../../../utils/getCellFillColor';

interface ChallengePreviewProps {
  grid: string;
}

export default function ChallengeGridPreview({ grid }: ChallengePreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const context = canvasRef.current!.getContext('2d')!;
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    let cellTypes: ChallengeCellType[][];
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
        if (cellType !== ChallengeCellType.Empty) {
          context.fillStyle = getCellFillColor(cellType);
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

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />;
}
