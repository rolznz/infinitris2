import FlexBox from '@/components/ui/FlexBox';
import { useUser } from '@/components/hooks/useUser';
import { CharacterImage } from '../Characters/CharacterImage';
import { CharacterStatList } from '../Characters/CharacterStatList';
import { PlacingStar } from '../Characters/PlacingStar';
import { Link as RouterLink } from 'react-router-dom';
import Routes from '@/models/Routes';
import { DEFAULT_CHARACTER_ID } from '@/state/LocalUserStore';
import Link from '@mui/material/Link';
import useAuthStore from '@/state/AuthStore';
import { useDocument } from 'swr-firestore';
import { getScoreboardEntryPath, IScoreboardEntry } from 'infinitris2-models';

export function ProfilePageCharacterCard() {
  const userId = useAuthStore((store) => store.user?.uid);
  const user = useUser();
  const characterId = user.selectedCharacterId || DEFAULT_CHARACTER_ID;
  const { data: scoreboardEntry } = useDocument<IScoreboardEntry>(
    userId ? getScoreboardEntryPath(userId) : null
  );

  return (
    <FlexBox>
      <FlexBox mt={-2} position="relative">
        <CharacterImage characterId={characterId} width={400} />
        <FlexBox position="absolute" padding="15%" width="100%" height="100%">
          <Link
            component={RouterLink}
            underline="none"
            to={Routes.market}
            width="100%"
            height="100%"
          ></Link>
        </FlexBox>
        <PlacingStar
          placing={scoreboardEntry?.data()?.placing}
          offset={90}
          scale={1.7}
          linkToScoreboard
        />
      </FlexBox>
      <FlexBox mt={-5}>
        <CharacterStatList
          networkImpact={user.readOnly?.networkImpact}
          coins={user.readOnly?.coins}
        />
      </FlexBox>
    </FlexBox>
  );
}
