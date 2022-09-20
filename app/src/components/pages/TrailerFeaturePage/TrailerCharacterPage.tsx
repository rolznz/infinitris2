import { CharacterImage } from '@/components/pages/Characters/CharacterImage';
import { CharacterHabitatBackground } from '@/components/ui/CharacterHabitatBackground';
import FlexBox from '@/components/ui/FlexBox';
import { Page } from '@/components/ui/Page';
import { colors, getCharacterPath, ICharacter } from 'infinitris2-models';
import React from 'react';
import useSearchParam from 'react-use/lib/useSearchParam';
import useWindowSize from 'react-use/lib/useWindowSize';
import { useDocument } from 'swr-firestore';

// example: http://localhost:3000/trailer-character
export function TrailerCharacterPage() {
  const [characterId, setCharacterId] = React.useState(
    parseInt(useSearchParam('character') ?? '0')
  );
  const windowSize = useWindowSize();

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCharacterId(
        (currentCharacterId) =>
          (currentCharacterId + Math.ceil(Math.random() * colors.length)) % 768
      );
    }, 5000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  const { data: character } = useDocument<ICharacter>(
    getCharacterPath(characterId.toString())
  );

  if (!character) {
    return null;
  }

  return (
    <FlexBox position="relative">
      <FlexBox position="absolute">
        <Page background={<CharacterHabitatBackground character={character} />}>
          <FlexBox height="100%">
            <CharacterImage
              characterId={character.id}
              width={windowSize.width * 0.25}
            />
          </FlexBox>
        </Page>
      </FlexBox>
      <FlexBox position="absolute">
        <Page background={<CharacterHabitatBackground character={character} />}>
          <FlexBox height="100%">
            <CharacterImage
              characterId={character.id}
              width={windowSize.width * 0.25}
            />
          </FlexBox>
        </Page>
      </FlexBox>
    </FlexBox>
  );
}
