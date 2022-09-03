import { useHistory } from 'react-router-dom';
import Routes from '../../../models/Routes';
import useSinglePlayerOptionsStore, {
  getSinglePlayerOptionsDefaultValues,
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

  const advancedOptionsChanged =
    JSON.stringify(formData) !==
    JSON.stringify(getSinglePlayerOptionsDefaultValues());

  const slides: RoomCarouselSlideProps[] = React.useMemo(() => {
    return !advancedOptionsChanged
      ? GameModeTypeValues.filter((gameMode) => gameMode !== 'battle').map(
          (gameModeType) => ({
            gameModeType,
            id: gameModeType,
            worldType: getWorldType(gameModeType),
            worldVariation: getWorldVariation(gameModeType),
          })
        )
      : [
          {
            gameModeType: formData.simulationSettings.gameModeType!,
            id: JSON.stringify(formData),
            worldType: formData.worldType,
            worldVariation: formData.worldVariation,
          },
        ];
  }, [formData, advancedOptionsChanged]);

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
      initialStep={
        GameModeTypeValues.indexOf(formData.simulationSettings.gameModeType!) ||
        0
      }
      onChangeSlide={(step) => {
        if (!advancedOptionsChanged) {
          useSinglePlayerOptionsStore.getState().setFormData(
            lodashMerge(formData, {
              simulationSettings: {
                gameModeType: GameModeTypeValues[step],
              },
              worldType: getWorldType(GameModeTypeValues[step]),
            } as SinglePlayerOptionsFormData)
          );
        }
      }}
    />
  );
}
function getWorldType(gameModeType: GameModeType): WorldType {
  return gameModeType === 'conquest'
    ? 'desert'
    : gameModeType === 'race' || gameModeType === 'column-conquest'
    ? 'space'
    : gameModeType === 'battle'
    ? 'volcano'
    : 'grass';
}
function getWorldVariation(gameModeType: GameModeType): WorldVariation {
  return gameModeType === 'column-conquest' ? '4' : '0';
}
