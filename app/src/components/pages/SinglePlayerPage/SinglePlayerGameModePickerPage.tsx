import { useHistory } from 'react-router-dom';
import Routes from '../../../models/Routes';
import useSinglePlayerOptionsStore from '@/state/SinglePlayerOptionsStore';

import { GameModeTypeValues } from 'infinitris2-models';

import lodashMerge from 'lodash.merge';
import { launchSinglePlayer } from '@/components/pages/SinglePlayerPage/SinglePlayerPage';
import { ReactComponent as SettingsIcon } from '@/icons/settings.svg';
import { RoomCarouselSlideProps } from '@/components/ui/RoomCarousel/RoomCarouselSlide';
import { RoomCarousel } from '@/components/ui/RoomCarousel/RoomCarousel';
import { FormattedMessage } from 'react-intl';

const slides: RoomCarouselSlideProps[] = GameModeTypeValues.map(
  (gameModeType) => ({
    gameModeType,
    key: gameModeType,
    worldType: gameModeType === 'conquest' ? 'desert' : 'grass',
    worldVariation: gameModeType === 'race' ? 1 : 0,
  })
);

export function SinglePlayerGameModePickerPage() {
  const history = useHistory();
  const formData = useSinglePlayerOptionsStore((store) => store.formData);

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
      initialStep={GameModeTypeValues.indexOf(
        formData.simulationSettings.gameModeType!
      )}
      onChangeSlide={(step) =>
        useSinglePlayerOptionsStore.getState().setFormData(
          lodashMerge(formData, {
            simulationSettings: {
              gameModeType: GameModeTypeValues[step],
            },
          })
        )
      }
    />
  );
}
