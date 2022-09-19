import { useHistory } from 'react-router-dom';
import Routes from '../../../models/Routes';
import useSinglePlayerOptionsStore, {
  SinglePlayerOptionsFormData,
} from '@/state/SinglePlayerOptionsStore';

import {
  GameModeType,
  GameModeTypeValues,
  WorldType,
  WorldVariation,
} from 'infinitris2-models';

import lodashMerge from 'lodash.merge';
import { launchSinglePlayer } from '@/components/pages/SinglePlayerPage/SinglePlayerPage';
import { ReactComponent as SettingsIcon } from '@/icons/settings.svg';
import { RoomCarouselSlideProps } from '@/components/ui/RoomCarousel/RoomCarouselSlide';
import { RoomCarousel } from '@/components/ui/RoomCarousel/RoomCarousel';
import { FormattedMessage } from 'react-intl';
import React from 'react';

export function SinglePlayerGameModePickerPage() {
  const history = useHistory();
  const formData = useSinglePlayerOptionsStore((store) => store.formData);

  const slides: RoomCarouselSlideProps[] = React.useMemo(() => {
    return GameModeTypeValues.filter((gameMode) => gameMode !== 'battle').map(
      (gameModeType) => {
        const slideProps: RoomCarouselSlideProps = {
          simulationSettings: {
            gameModeType,
            gameModeSettings:
              gameModeType === 'conquest'
                ? {
                    hasConversions: true,
                    hasRounds: true,
                  }
                : undefined,
          },
          id: gameModeType,
          worldType: getWorldType(gameModeType),
          worldVariation: getWorldVariation(gameModeType),
        };
        return slideProps;
      }
    );
  }, []);

  const onSubmit = () => {
    launchSinglePlayer(history);
  };

  return (
    <RoomCarousel
      title={
        <FormattedMessage
          defaultMessage="Single Player"
          description="Single player page title"
        />
      }
      secondaryIcon={<SettingsIcon />}
      secondaryIconLink={Routes.singlePlayerOptions}
      onPlay={onSubmit}
      slides={slides}
      initialStep={0}
      onChangeSlide={(step) => {
        useSinglePlayerOptionsStore.getState().setFormData(
          lodashMerge(formData, {
            simulationSettings: slides[step].simulationSettings,
            worldType: getWorldType(GameModeTypeValues[step]),
          } as SinglePlayerOptionsFormData)
        );
      }}
    />
  );
}
function getWorldType(gameModeType: GameModeType): WorldType {
  return gameModeType === 'conquest'
    ? 'desert'
    : gameModeType === 'race'
    ? 'space'
    : gameModeType === 'battle' || gameModeType === 'column-conquest'
    ? 'volcano'
    : 'grass';
}
function getWorldVariation(_gameModeType: GameModeType): WorldVariation {
  return '0'; //gameModeType === 'column-conquest' ? '4' : '0';
}
