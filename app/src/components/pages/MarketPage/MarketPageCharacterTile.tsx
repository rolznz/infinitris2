import React from 'react';
import { Link } from '@material-ui/core';

import FlexBox from '../../ui/FlexBox';
import { ICharacter } from 'infinitris2-models';

import { Link as RouterLink } from 'react-router-dom';
import Routes from '@/models/Routes';
import { CharacterImage } from '../Characters/CharacterImage';
import { CharacterCoinStatChip } from '../Characters/CharacterStatChip';
import { DocumentSnapshot } from 'firebase/firestore';
import { zIndexes } from '@/theme';

type CharacterTileProps = {
  character: DocumentSnapshot<ICharacter>;
  size: number;
};
export const characterTileContentPortion = 0.8;
function _CharacterTile({ character, size }: CharacterTileProps) {
  return (
    <FlexBox
      width={size}
      height={size * (1 / characterTileContentPortion)}
      style={{ position: 'relative' }}
    >
      <FlexBox
        position="absolute"
        width={size * characterTileContentPortion}
        height={size * characterTileContentPortion}
        style={{
          zIndex: zIndexes.above,
        }}
      >
        <Link
          component={RouterLink}
          underline="none"
          to={`${Routes.market}/${character.id}`}
          style={{ width: '100%', height: '100%' }}
        ></Link>
      </FlexBox>
      <CharacterImage
        characterId={character.id}
        width={size * 1.2}
        thumbnail={character.data()!.thumbnail}
      />
      <FlexBox mt={-size * 0.02} mb={size * 0.02}>
        <CharacterCoinStatChip value={character.data()!.price} />
      </FlexBox>
    </FlexBox>
  );
}

export const CharacterTile = React.memo(
  _CharacterTile,
  (prevProps, nextProps) =>
    prevProps?.character?.id === nextProps?.character?.id
);
