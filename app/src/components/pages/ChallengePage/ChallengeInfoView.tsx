import { EndRoundDisplayOverlay } from '@/components/game/EndRoundDisplay/EndRoundDisplay';
import useContinueButton from '@/components/hooks/useContinueButton';
import { ChallengeTopAttempts } from '@/components/pages/ChallengePage/ChallengeTopAttempts';
import { getOfficialChallengeTitle } from '@/components/pages/StoryModePage/StoryModePage';
import { textShadows, zIndexes } from '@/theme/theme';
import isMobile from '@/utils/isMobile';
import { SxProps } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import {
  getVariationHueRotation,
  IChallenge,
  IChallengeAttempt,
  WorldVariationValues,
} from 'infinitris2-models';
import React from 'react';
import { FormattedMessage } from 'react-intl';
//import { useUser } from '../../../state/UserStore';
import useTrue from '../../hooks/useTrue';
import FlexBox from '../../ui/FlexBox';
//import finishLineImage from './assets/finish.svg';
import grassScrollImage from './assets/scroll_grass.svg';
import desertScrollImage from './assets/scroll_desert.svg';
import spaceScrollImage from './assets/scroll_space.svg';

export interface ChallengeInfoViewProps {
  onReceivedInput(): void;
  challenge: IChallenge;
  challengeId: string;
  viewOtherReplay(attempt: IChallengeAttempt): void;
}

const titleSx: SxProps = {
  textShadow: textShadows.base,
};

function splitTitle(title: string) {
  let split = title.split(' ');
  while (split.length > 2) {
    let newSplit: string[] = [];
    for (let i = 0; i < split.length; i += 2) {
      newSplit.push((split[i] + ' ' + (split[i + 1] ?? '')).trim());
    }
    split = newSplit;
  }
  return split;
}

export default function ChallengeInfoView({
  onReceivedInput,
  viewOtherReplay,
  challenge,
  challengeId,
}: ChallengeInfoViewProps) {
  //const user = useUser();
  const [scrollLoaded, setScrollLoaded] = React.useState(false);

  const [hasReceivedInput, continueButton] = useContinueButton(
    undefined,
    <FormattedMessage
      defaultMessage="Play"
      description="Challenge Info Play button text"
    />,
    undefined,
    undefined,
    'large',
    '4vh'
  );
  const hueRotation = getVariationHueRotation(
    WorldVariationValues.indexOf(challenge.worldVariation || '0')
  );

  useTrue(hasReceivedInput, onReceivedInput);
  //const translation = challenge?.translations?.[user.locale];
  const challengeTitle = challenge.isOfficial
    ? getOfficialChallengeTitle(challenge)
    : challenge.title || 'Untitled';

  return (
    <FlexBox zIndex={zIndexes.above} width="100%" height="100%">
      <EndRoundDisplayOverlay>
        <FlexBox
          zIndex={zIndexes.above}
          position="relative"
          height={isMobile() ? '90vh' : '80vh'}
        >
          <img
            alt=""
            src={
              challenge.worldType === 'space'
                ? spaceScrollImage
                : challenge.worldType === 'desert'
                ? desertScrollImage
                : grassScrollImage
            }
            height="100%"
            onLoad={() => setScrollLoaded(true)}
            style={{ filter: `hue-rotate(${hueRotation}deg)` }}
          />
          {scrollLoaded && (
            <>
              <FlexBox position="absolute" top="8vh">
                <Typography
                  variant="h1"
                  fontSize="8vh"
                  whiteSpace="pre-line"
                  color="#FFD541"
                  sx={titleSx}
                >
                  {challenge.isOfficial ? (
                    <FormattedMessage
                      defaultMessage="STORY MODE"
                      description="Challenge info - STORY MODE"
                    />
                  ) : (
                    <FormattedMessage
                      defaultMessage="Challenge"
                      description="Challenge info - Community challenge"
                    />
                  )}
                </Typography>
              </FlexBox>
              <FlexBox
                position="absolute"
                top={isMobile() ? '27vh' : '23vh'}
                height="15vh"
              >
                <Typography
                  variant="h1"
                  fontSize="8vh"
                  textAlign="center"
                  sx={titleSx}
                >
                  {isMobile()
                    ? challengeTitle
                    : splitTitle(challengeTitle).map((part, index) => (
                        <React.Fragment key={index}>
                          {part}
                          <br />
                        </React.Fragment>
                      ))}
                </Typography>
              </FlexBox>
              <FlexBox
                position="absolute"
                bottom={isMobile() ? '28vh' : '24vh'}
              >
                <ChallengeTopAttempts
                  challengeId={challengeId}
                  challenge={challenge}
                  viewReplay={viewOtherReplay}
                />
              </FlexBox>
              <FlexBox position="absolute" bottom={isMobile() ? '3vh' : '6vh'}>
                {continueButton}
              </FlexBox>
            </>
          )}
        </FlexBox>
      </EndRoundDisplayOverlay>
    </FlexBox>
  );
}

/*!isViewingReplay &&
              (challenge.simulationSettings?.gameModeType &&
              challenge.simulationSettings?.gameModeType !== 'infinity' ? (
                <Typography variant="h6" mt={2}>
                  <GameModeDescription
                    gameModeType={challenge.simulationSettings?.gameModeType}
                  />
                </Typography>
              ) : (
                <FlexBox
                  flexDirection="row"
                  gap={1}
                  justifyContent="center"
                  alignItems="center"
                  mt={2}
                >
                  <Typography variant="h6">
                    <FormattedMessage
                      defaultMessage="Get to the finish line"
                      description="Get to the finish line challenge help info"
                    />
                  </Typography>
                  <img src={finishLineImage} alt="" width={30}></img>
                </FlexBox>
              ))*/
/*<Typography variant="caption">
          <FormattedMessage
            defaultMessage="Attempt: #{attemptCount}"
            description="Number of times the user has attempted this challenge"
            values={{
              attemptCount:
                (user.challengeAttempts[challenge.id]?.length || 0) + 1,
            }}
          />
          </Typography>*/
/* <Typography variant="body1" style={{ whiteSpace: 'pre-wrap' }}>
          {translation?.description || challenge?.description || (
            <FormattedMessage
              defaultMessage="No description provided"
              description="No description provided"
            />
          )}
        </Typography> */
