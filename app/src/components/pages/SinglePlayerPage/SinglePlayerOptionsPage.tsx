import { useHistory } from 'react-router-dom';
import { Page } from '../../ui/Page';
import { FormattedMessage, useIntl } from 'react-intl';
import { Controller, useForm } from 'react-hook-form';
import Button from '@mui/material/Button';
import Input from '@mui/material/Input';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import FlexBox from '../../ui/FlexBox';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  FormControlLabel,
  FormGroup,
  MenuItem,
  Select,
  Switch,
} from '@mui/material';
import {
  blockLayoutSets,
  GameModeTypeValues,
  RoundLengthValues,
  WorldTypeValues,
  WorldVariationValues,
} from 'infinitris2-models';
import useSinglePlayerOptionsStore, {
  SinglePlayerOptionsFormData,
  getSinglePlayerOptionsDefaultValues,
} from '@/state/SinglePlayerOptionsStore';
import { playSound, SoundKey } from '@/sound/SoundManager';
import { launchFullscreen } from '@/utils/launchFullscreen';
import shallow from 'zustand/shallow';
import { launchSinglePlayer } from '@/components/pages/SinglePlayerPage/SinglePlayerPage';
import React from 'react';
import { RoomCarouselSlide } from '@/components/ui/RoomCarousel/RoomCarouselSlide';

const schema = yup
  .object({
    simulationSettings: yup.object({
      botSettings: yup.object({
        numBots: yup.number().integer().lessThan(100).moreThan(-1).required(),
        botReactionDelay: yup
          .number()
          .positive()
          .integer()
          .lessThan(1000)
          .required(),
        botRandomReactionDelay: yup
          .number()
          .integer()
          .lessThan(1000)
          .moreThan(-1)
          .required(),
      }),
    }),
    gridNumRows: yup
      .number()
      .positive()
      .integer()
      .lessThan(300)
      .moreThan(7)
      .required(),
    gridNumColumns: yup
      .number()
      .positive()
      .integer()
      .lessThan(1000)
      .moreThan(4)
      .required(),
  })
  .required();

export function SinglePlayerOptionsPage() {
  const intl = useIntl();
  const history = useHistory();
  const [formData, setFormData, resetFormData] = useSinglePlayerOptionsStore(
    (store) => [store.formData, store.setFormData, store.reset],
    shallow
  );
  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<SinglePlayerOptionsFormData>({
    defaultValues: formData,
    resolver: yupResolver(schema),
  });

  function executeResetForm() {
    // reset the store
    resetFormData();
    // reset the form
    reset(getSinglePlayerOptionsDefaultValues());
  }

  const onSubmit = (data: SinglePlayerOptionsFormData) => {
    playSound(SoundKey.click);
    launchFullscreen();
    setFormData(data);
    launchSinglePlayer(history);
  };

  const watchedValues = watch();
  const valuesSame = shallow(formData, watchedValues);
  React.useEffect(() => {
    if (!valuesSame) {
      setFormData(watchedValues);
    }
  }, [valuesSame, setFormData, watchedValues]);
  const watchedGameModeType = watch('simulationSettings.gameModeType');
  const watchedSpectate = watch('spectate');

  return (
    <Page
      title={intl.formatMessage({
        defaultMessage: 'Single Player Options',
        description: 'Single Player Options page title',
      })}
      background={
        <FlexBox position="fixed" top={0} zIndex="below" sx={{ opacity: 0.75 }}>
          <RoomCarouselSlide
            gameModeType={formData.simulationSettings.gameModeType!}
            key={'custom'}
            worldType={formData.worldType}
            worldVariation={formData.worldVariation}
          />
        </FlexBox>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <FlexBox gap={2}>
          <FlexBox flexDirection="row" flexWrap="wrap" gap={1}>
            <Controller
              name="simulationSettings.gameModeType"
              control={control}
              render={({ field }) => (
                <FormControl variant="standard">
                  <InputLabel>Game Mode</InputLabel>
                  <Select {...field}>
                    {GameModeTypeValues.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />
            <Controller
              name="worldType"
              control={control}
              render={({ field }) => (
                <FormControl variant="standard">
                  <InputLabel>World</InputLabel>
                  <Select {...field}>
                    {WorldTypeValues.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />
            <Controller
              name="worldVariation"
              control={control}
              render={({ field }) => (
                <FormControl variant="standard">
                  <InputLabel>Variation</InputLabel>
                  <Select {...field}>
                    {WorldVariationValues.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />
            {/* <Controller
              name="trackNumber"
              control={control}
              render={({ field }) => (
                <FormControl variant="standard">
                  <InputLabel>Music Track</InputLabel>
                  <Select {...field}>
                    {TrackNumberValues.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type !== 'bonus' ? 'Track' : ''} {type}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            /> */}
            {watchedGameModeType === 'conquest' && (
              <Controller
                name="simulationSettings.roundLength"
                control={control}
                render={({ field }) => (
                  <FormControl variant="standard">
                    <InputLabel>Round Length</InputLabel>
                    <Select {...field}>
                      {RoundLengthValues.map((type) => (
                        <MenuItem key={type} value={type}>
                          {type}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            )}
            <Controller
              name="simulationSettings.layoutSetId"
              control={control}
              render={({ field }) => (
                <FormControl variant="standard" fullWidth>
                  <InputLabel>Layout Set</InputLabel>
                  <Select {...field}>
                    {blockLayoutSets.map((set) => (
                      <MenuItem key={set.id} value={set.id}>
                        {set.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />
          </FlexBox>
          <FlexBox flexDirection="row" flexWrap="wrap" gap={1}>
            <Controller
              name="simulationSettings.botSettings.numBots"
              control={control}
              render={({ field }) => (
                <FormControl variant="standard">
                  <InputLabel>Number of Bots</InputLabel>
                  <Input {...field} />
                  <p>
                    {errors.simulationSettings?.botSettings?.numBots?.message}
                  </p>
                </FormControl>
              )}
            />

            <Controller
              name="simulationSettings.botSettings.botReactionDelay"
              control={control}
              render={({ field }) => (
                <FormControl variant="standard">
                  <InputLabel>Bot Reaction Delay</InputLabel>
                  <Input {...field} />
                  <p>
                    {
                      errors.simulationSettings?.botSettings?.botReactionDelay
                        ?.message
                    }
                  </p>
                </FormControl>
              )}
            />

            <Controller
              name="simulationSettings.botSettings.botRandomReactionDelay"
              control={control}
              render={({ field }) => (
                <FormControl variant="standard">
                  <InputLabel>Bot Random Reaction Delay</InputLabel>
                  <Input {...field} />
                  <p>
                    {
                      errors.simulationSettings?.botSettings
                        ?.botRandomReactionDelay?.message
                    }
                  </p>
                </FormControl>
              )}
            />

            <Controller
              name="gridNumRows"
              control={control}
              render={({ field }) => (
                <FormControl variant="standard">
                  <InputLabel>Grid Rows</InputLabel>
                  <Input {...field} />
                  <p>{errors.gridNumRows?.message}</p>
                </FormControl>
              )}
            />
            <Controller
              name="gridNumColumns"
              control={control}
              render={({ field }) => (
                <FormControl variant="standard">
                  <InputLabel>Grid Columns</InputLabel>
                  <Input {...field} />
                  <p>{errors.gridNumColumns?.message}</p>
                </FormControl>
              )}
            />
          </FlexBox>
          <FlexBox flexDirection="row" flexWrap="wrap" gap={1}>
            <Controller
              name="spectate"
              control={control}
              render={({ field }) => (
                <FormGroup>
                  <FormControlLabel
                    control={<Switch {...field} defaultChecked={field.value} />}
                    label="Spectate"
                    labelPlacement="start"
                  />
                </FormGroup>
              )}
            />
            {watchedSpectate && (
              <Controller
                name="isDemo"
                control={control}
                render={({ field }) => (
                  <FormGroup>
                    <FormControlLabel
                      control={
                        <Switch {...field} defaultChecked={field.value} />
                      }
                      label="Demo"
                      labelPlacement="start"
                    />
                  </FormGroup>
                )}
              />
            )}
            <Controller
              name="simulationSettings.instantDrops"
              control={control}
              render={({ field }) => (
                <FormGroup>
                  <FormControlLabel
                    control={<Switch {...field} defaultChecked={field.value} />}
                    label="Instant Drops"
                    labelPlacement="start"
                  />
                </FormGroup>
              )}
            />
            <Controller
              name="simulationSettings.mistakeDetection"
              control={control}
              render={({ field }) => (
                <FormGroup>
                  <FormControlLabel
                    control={<Switch {...field} defaultChecked={field.value} />}
                    label="Mistake Detection"
                    labelPlacement="start"
                  />
                </FormGroup>
              )}
            />
            {watchedGameModeType === 'infinity' && (
              <Controller
                name="simulationSettings.calculateSpawnDelays"
                control={control}
                render={({ field }) => (
                  <FormGroup>
                    <FormControlLabel
                      control={
                        <Switch {...field} defaultChecked={field.value} />
                      }
                      label="Spawn Delays"
                      labelPlacement="start"
                    />
                  </FormGroup>
                )}
              />
            )}
            <Controller
              name="simulationSettings.preventTowers"
              control={control}
              render={({ field }) => (
                <FormGroup>
                  <FormControlLabel
                    control={<Switch {...field} defaultChecked={field.value} />}
                    label="Tower Prevention"
                    labelPlacement="start"
                  />
                </FormGroup>
              )}
            />
          </FlexBox>
          <Button
            autoFocus
            type="submit"
            color="primary"
            variant="contained"
            sx={{ mt: 2 }}
          >
            <FormattedMessage
              defaultMessage="Play"
              description="Single Player Options page - play button"
            />
          </Button>
          <Button
            color="secondary"
            variant="contained"
            sx={{ mt: 2 }}
            onClick={executeResetForm}
          >
            <FormattedMessage
              defaultMessage="Reset"
              description="Single Player Options page - reset form button"
            />
          </Button>
        </FlexBox>
      </form>
    </Page>
  );
}
