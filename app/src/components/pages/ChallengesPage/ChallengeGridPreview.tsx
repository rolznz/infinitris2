import FlexBox from '@/components/ui/FlexBox';
import { Typography } from '@mui/material';
import { parseGrid, ChallengeCellType, IChallenge } from 'infinitris2-models';
import React, { useEffect, useRef } from 'react';
import { getCellFillColor } from '../../../utils/getCellFillColor';

interface ChallengePreviewProps {
  grid: IChallenge['grid'];
  width: number;
  height: number;
}

export default function ChallengeGridPreview({
  grid: gridObject,
  width,
  height,
}: ChallengePreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const grid =
    (typeof gridObject === 'string' ? (gridObject as string) : undefined) ||
    '0';

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
    const cellWidth = context.canvas.width / numColumns;
    const cellHeight = context.canvas.height / numRows;

    for (let r = 0; r < numRows; r++) {
      for (let c = 0; c < numColumns; c++) {
        const cellType = cellTypes[r][c];
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
    context.beginPath();
    context.rect(0, 0, numColumns * cellWidth, numRows * cellHeight);
    context.stroke();
  }, [grid, width, height]);

  return <canvas ref={canvasRef} width={width + 'px'} height={height + 'px'} />;
}

type FittedChallengeGridPreviewProps = {
  grid: IChallenge['grid'];
  maxWidth: number;
  maxHeight: number;
};

export function FittedChallengeGridPreview({
  grid: gridObject,
  maxWidth,
  maxHeight,
}: FittedChallengeGridPreviewProps) {
  const grid =
    (typeof gridObject === 'string' ? (gridObject as string) : undefined) ||
    '0';
  let challengeCells;
  try {
    challengeCells = parseGrid(grid);
  } catch (e) {
    return (
      <FlexBox
        width={maxWidth}
        height={maxHeight}
        sx={{
          backgroundColor: '#ff0000AA',
        }}
      >
        <Typography fontSize={maxWidth / 5 + 'px'}>
          Invalid
          <br />
          Grid
        </Typography>
      </FlexBox>
    );
  }
  const width = challengeCells[0].length;
  const height = challengeCells.length;

  const scale = Math.min(maxWidth / width, maxHeight / height);

  return (
    <ChallengeGridPreview
      grid={grid}
      width={width * scale}
      height={height * scale}
    />
  );
}
