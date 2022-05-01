import React from 'react';

import FlexBox from '../../ui/FlexBox';
import { ICharacter } from 'infinitris2-models';
//import { gold, zIndexes } from '@/theme';
//import { ReactComponent as CoinIcon } from '@/icons/coin.svg';
import useWindowSize from 'react-use/lib/useWindowSize';
//import useDialogStore from '@/state/DialogStore';
import { CharacterImage } from '../Characters/CharacterImage';
import { DocumentSnapshot } from 'firebase/firestore';

/*const useStyles = makeStyles((theme) => ({
  coin: {
    '&:hover': {
      cursor: 'pointer',
    },
  },
}));*/

type LargeCharacterTileProps = {
  character: DocumentSnapshot<ICharacter>;
};
export function LargeCharacterTile({ character }: LargeCharacterTileProps) {
  const windowSize = useWindowSize();
  const isLandscape = windowSize.width > windowSize.height;
  const size =
    Math.min(windowSize.width, windowSize.height) -
    (isLandscape ? windowSize.width * 0.25 : 0);
  //const openDialog = useDialogStore((store) => store.open);
  //const styles = useStyles();
  return (
    <FlexBox>
      <CharacterImage characterId={character.id} width={size} />

      {/*<FlexBox
        className={styles.coin}
        style={{ position: 'relative' }}
        onClick={() => openDialog('login')}
      >
        <SvgIcon style={{ fontSize: '100px', position: 'absolute' }}>
          <CoinIcon />
        </SvgIcon>
        <Typography
          variant="h1"
          style={{
            color: gold,
            fontWeight: 700,
            marginTop: '7px',
            fontSize:
              60 - character.data()!.price.toString().length * 10 + 'px',
            zIndex: zIndexes.above,
          }}
        >
          {character.data()!.price}
        </Typography>
        </FlexBox>*/}
    </FlexBox>
  );
}
