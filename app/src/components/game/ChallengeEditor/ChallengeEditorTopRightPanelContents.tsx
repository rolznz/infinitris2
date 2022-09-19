import { IconSwitch } from '@/components/ui/IconSwitch';
import EditIcon from '@mui/icons-material/Edit';
import { ReactComponent as PlayArrowIcon } from '@/icons/play2.svg';
import useChallengeEditorStore from '@/state/ChallengeEditorStore';
import shallow from 'zustand/shallow';
import {
  borderColor,
  borderRadiuses,
  boxShadows,
  colors,
  spacing,
} from '@/theme/theme';
import FlexBox from '@/components/ui/FlexBox';
import useIngameStore from '@/state/IngameStore';
import Button from '@mui/material/Button/Button';
import React from 'react';
import Select from '@mui/material/Select/Select';
import {
  ChallengeCellType,
  getCellTypePreviewImageUrl,
  isChallengeCellTypeEnabled,
} from 'infinitris2-models';
import MenuItem from '@mui/material/MenuItem/MenuItem';
import { getChallengeCellTypeDescription } from 'infinitris2-models';
import Link from '@mui/material/Link';
import { Link as RouterLink } from 'react-router-dom';
import Routes from '@/models/Routes';
import IconButton from '@mui/material/IconButton';
import { ReactComponent as SettingsIcon } from '@/icons/settings.svg';
import SvgIcon from '@mui/material/SvgIcon/SvgIcon';

export function ChallengeEditorTopRightPanelContents() {
  return (
    <FlexBox
      flexDirection="row"
      gap={1}
      bgcolor="background.paper"
      boxShadow={boxShadows.small}
      borderRadius={borderRadiuses.base}
      p={spacing.small}
      sx={{ pointerEvents: 'all' }}
    >
      <ChallengeEditorSettingsButton />
      <ChallengeEditorGridSize />
      <ChallengeEditorCellTypePicker />
      <ChallengeEditorToggle />
    </FlexBox>
  );
}

function ChallengeEditorSettingsButton() {
  const isEditing = useChallengeEditorStore((store) => store.isEditing);
  if (!isEditing) {
    return null;
  }

  return (
    <Link component={RouterLink} to={Routes.createChallenge}>
      <IconButton>
        <SvgIcon color="primary">
          <SettingsIcon />
        </SvgIcon>
      </IconButton>
    </Link>
  );
}

function ChallengeEditorToggle() {
  const [isEditing] = useChallengeEditorStore(
    (store) => [store.isEditing],
    shallow
  );
  return (
    <IconSwitch
      checked={!isEditing}
      checkediconStyle={{ color: colors.green }}
      iconStyle={{ color: colors.blue }}
      checkedIcon={<PlayArrowIcon />}
      icon={<EditIcon />}
      onChange={(event) => {
        useChallengeEditorStore.getState().editor!.isEditing = !isEditing;
        event.target.blur();
      }}
    />
  );
}

function ChallengeEditorGridSize() {
  const isEditing = useChallengeEditorStore((store) => store.isEditing);
  const simulation = useIngameStore((store) => store.simulation);
  if (!simulation || !isEditing) {
    return null;
  }
  return (
    <Button
      variant="outlined"
      onClick={() => {
        const newGridSizeResponse = prompt(
          'Enter new grid size (rows, columns, atRow, atColumn)',
          simulation.grid.numRows + ',' + simulation.grid.numColumns + ',0,0'
        );
        const newGridSizeParts = newGridSizeResponse
          ?.split(',')
          .map((part) => part.trim());
        if (newGridSizeParts?.length === 4) {
          const rows = parseInt(newGridSizeParts[0]);
          const cols = parseInt(newGridSizeParts[1]);
          const atRow = parseInt(newGridSizeParts[2]);
          const atColumn = parseInt(newGridSizeParts[3]);

          useChallengeEditorStore
            .getState()
            .editor?.setGridSize(rows, cols, atRow, atColumn);
        }
      }}
    >
      {simulation?.grid.numRows}x{simulation?.grid.numColumns}
    </Button>
  );
}

function ChallengeEditorCellTypePicker() {
  const isEditing = useChallengeEditorStore((store) => store.isEditing);
  const editor = useChallengeEditorStore((store) => store.editor);
  const challengeCellType = useChallengeEditorStore(
    (store) => store.challengeCellType
  );
  const challengeCellTypes = React.useMemo(() => {
    const _challengeCellTypes = Object.values(ChallengeCellType).filter(
      isChallengeCellTypeEnabled
    );
    _challengeCellTypes.sort(orderChallengeCellTypes);
    return _challengeCellTypes;
  }, []);
  const challenge = useChallengeEditorStore((store) => store.challenge);
  if (!editor || !isEditing) {
    return null;
  }
  return (
    <Select
      variant="outlined"
      value={challengeCellType}
      onChange={(event) => {
        editor.challengeCellType = event.target.value as ChallengeCellType;
      }}
      sx={{ flexDirection: 'row', flexWrap: 'wrap', gap: 1 }}
    >
      {challengeCellTypes.map((challengeCellType) => {
        const imageUrl = getCellTypePreviewImageUrl(
          challengeCellType,
          challenge?.worldType,
          challenge?.worldVariation
        );
        return (
          <MenuItem key={challengeCellType} value={challengeCellType}>
            <FlexBox flexDirection="row" gap={1}>
              <FlexBox
                width={36}
                height={36}
                bgcolor={borderColor}
                borderRadius={borderRadiuses.base}
                overflow="hidden"
              >
                {imageUrl && (
                  <img src={imageUrl} alt="" width={28} height={28} />
                )}
              </FlexBox>
              {getChallengeCellTypeDescription(challengeCellType)}
            </FlexBox>
          </MenuItem>
        );
      })}
    </Select>
  );
}

const orderChallengeCellTypes = (
  a: ChallengeCellType,
  b: ChallengeCellType
) => {
  const orderedCellTypes = [
    ChallengeCellType.Empty,
    ChallengeCellType.Full,
    ChallengeCellType.SpawnLocation,
    ChallengeCellType.Finish,
    ChallengeCellType.Checkpoint,
  ];

  for (const cellType of orderedCellTypes) {
    if (a === cellType || b === cellType) {
      return a === cellType ? -1 : 1;
    }
  }
  return 0;
};
