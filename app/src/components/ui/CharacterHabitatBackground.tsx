import FlexBox from '@/components/ui/FlexBox';
import { zIndexes } from '@/theme/theme';
import { DocumentSnapshot } from 'firebase/firestore';
import { ICharacter } from 'infinitris2-models';

type CharacterHabitatBackgroundProps = {
  character: DocumentSnapshot<ICharacter> | undefined;
};
export function CharacterHabitatBackground({
  character,
}: CharacterHabitatBackgroundProps) {
  return (
    <FlexBox zIndex={zIndexes.below}>
      {character && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            right: 0,
            width: '100%',
            height: '100%',
            background: `url(${process.env.REACT_APP_IMAGES_ROOT_URL}/habitats/${character.id}.svg)`,
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
            pointerEvents: 'none',
          }}
        ></div>
      )}
      {character && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            right: 0,
            width: '100vw',
            height: '100vh',
            background: `url(${
              process.env.REACT_APP_IMAGES_ROOT_URL
            }/patterns/${character.data()!.patternFilename})`,
            backgroundRepeat: 'repeat',
            backgroundSize: Math.max(window.innerWidth, window.innerHeight) / 4,
            opacity: 0.2,
            pointerEvents: 'none',
          }}
        ></div>
      )}
    </FlexBox>
  );
}
