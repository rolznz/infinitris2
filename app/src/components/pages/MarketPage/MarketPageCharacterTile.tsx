import React from 'react';

import FlexBox from '../../ui/FlexBox';
import { ICharacter, WithId } from 'infinitris2-models';

import { Link as RouterLink } from 'react-router-dom';
import Routes from '@/models/Routes';
import { CharacterImage } from '../Characters/CharacterImage';
import { CharacterCoinStatChip } from '../Characters/CharacterStatChip';
import { zIndexes } from '@/theme/theme';
//import { ReactComponent as TickIcon } from '@/icons/tick.svg';
//import SvgIcon from '@mui/material/SvgIcon';
import Link from '@mui/material/Link';
//import { SxProps, Theme } from '@mui/material/styles';
import { setSelectedCharacterId } from '@/state/updateUser';

type CharacterTileProps = {
  character: WithId<ICharacter>;
  size: number;
  isPurchased: boolean;
  isSelected: boolean;
};
export const characterTileContentPortion = 0.8;

const linkStyle = {
  width: '100%',
  height: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
};

// const tickIconSx: SxProps<Theme> = {
//   filter: dropShadows.small,
// };

function _CharacterTile({
  character,
  size,
  isPurchased,
  isSelected,
}: CharacterTileProps) {
  const hasLink = !isPurchased || isSelected;
  const onClick = React.useCallback(
    (event: React.MouseEvent<unknown>) => {
      if (isPurchased && !isSelected) {
        setSelectedCharacterId(character.id);
        event.preventDefault();
      }
    },
    [isPurchased, isSelected, character.id]
  );
  return (
    <FlexBox
      width={size}
      height={size * (1 / (characterTileContentPortion - 0.2))}
      position="relative"
    >
      <FlexBox
        position="absolute"
        width={size * characterTileContentPortion}
        height={size * characterTileContentPortion}
        zIndex={zIndexes.above}
        mt={-size * characterTileContentPortion * 0.05}
        /*style={{
          zIndex: zIndexes.above,
        }}*/
        onClick={onClick}
        sx={{
          cursor: 'pointer',
        }}
      >
        {hasLink && (
          <Link
            component={RouterLink}
            underline="none"
            to={
              !isPurchased || isSelected
                ? `${Routes.market}/${character.id}`
                : '#'
            }
            style={linkStyle}
          />
        )}
      </FlexBox>
      <CharacterImage
        characterId={character.id}
        width={size * 1.2}
        thumbnail={character.thumbnail}
        strongShadow={isSelected}
      />
      <FlexBox mt={-size * 0.02} mb={size * 0.02}>
        <CharacterCoinStatChip value={character.price} />
      </FlexBox>
    </FlexBox>
  );
}

export const CharacterTile = React.memo(
  _CharacterTile,
  (prevProps, nextProps) =>
    prevProps?.character?.id === nextProps?.character?.id
);
