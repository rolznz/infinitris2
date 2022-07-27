import { IScoreboardEntry } from 'infinitris2-models';
import React from 'react';
import FlexBox from '@/components/ui/FlexBox';
import { CharacterImage } from '../Characters/CharacterImage';
import { PlacingStar } from '../Characters/PlacingStar';
import { CharacterStatList } from '../Characters/CharacterStatList';
import { DocumentSnapshot } from 'firebase/firestore';
import { Link as RouterLink } from 'react-router-dom';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { characterTileContentPortion } from '../MarketPage/MarketPageCharacterTile';
import { zIndexes } from '@/theme/theme';
import Routes from '@/models/Routes';
import useAuthStore from '@/state/AuthStore';
import { DEFAULT_CHARACTER_ID } from '@/state/LocalUserStore';

export type ScoreboardCardProps = {
  entry: DocumentSnapshot<IScoreboardEntry>;
  placing: number;
};

const linkStyle = { width: '100%', height: '100%' };

export function ScoreboardCard({ entry, placing }: ScoreboardCardProps) {
  const isSmallScreen = useMediaQuery(`(max-width:600px)`);
  const width = isSmallScreen ? 220 : 250;
  const starOffset = isSmallScreen ? 50 : 60;
  const characterId = entry.data()?.characterId || DEFAULT_CHARACTER_ID;
  const isMe = useAuthStore().user?.uid === entry.id;

  return (
    <FlexBox mb={8} mx={-2.5}>
      <Typography variant="h4" align="center">
        {entry.data()!.nickname}
      </Typography>
      <FlexBox position="relative" mt={-1}>
        <FlexBox
          position="absolute"
          width={width * characterTileContentPortion}
          height={width * characterTileContentPortion}
          zIndex={zIndexes.above}
          /*style={{
          zIndex: zIndexes.above,
        }}*/
        >
          <Link
            component={RouterLink}
            underline="none"
            to={`${Routes.market}/${characterId}`}
            style={linkStyle}
          >
            <div style={linkStyle} />
          </Link>
        </FlexBox>
        <CharacterImage
          characterId={characterId}
          width={width}
          strongShadow={isMe}
        />
        <PlacingStar placing={placing} offset={starOffset} />
      </FlexBox>
      <FlexBox mt={-3}>
        <CharacterStatList
          networkImpact={entry.data()!.networkImpact}
          coins={entry.data()!.coins}
        />
      </FlexBox>
    </FlexBox>
  );
}
