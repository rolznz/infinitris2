import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import Routes from '../../models/Routes';
import { Page } from '../ui/Page';
import { FormattedMessage, useIntl } from 'react-intl';
import { Controller, useForm } from 'react-hook-form';
import Button from '@mui/material/Button';
import Input from '@mui/material/Input';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import FlexBox from '../ui/FlexBox';
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
  GameModeTypeValues,
  RoundLengthValues,
  WorldTypeValues,
} from 'infinitris2-models';
import useSinglePlayerOptionsStore, {
  SinglePlayerOptionsFormData,
  getSinglePlayerOptionsDefaultValues,
} from '@/state/SinglePlayerOptionsStore';
import {
  playSound,
  SoundKey,
  TrackNumberValues,
} from '@/components/sound/MusicPlayer';
import { launchFullscreen } from '@/utils/launchFullscreen';
import shallow from 'zustand/shallow';

const schema = yup
  .object({
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
    const searchParams = new URLSearchParams();
    Object.entries(data).forEach((entry) => {
      searchParams.append(entry[0], entry[1].toString());
    });
    history.push(Routes.singlePlayer + '?' + searchParams);
  };

  const watchedGameModeType = watch('gameModeType');

  return (
    <Page
      title={intl.formatMessage({
        defaultMessage: 'Single Player Options',
        description: 'Single Player Options page title',
      })}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <FlexBox gap={2}>
          <FlexBox flexDirection="row" flexWrap="wrap" gap={1}>
            <Controller
              name="gameModeType"
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
            />
            {watchedGameModeType !== 'infinity' && (
              <Controller
                name="roundLength"
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
          </FlexBox>
          <FlexBox flexDirection="row" flexWrap="wrap" gap={1}>
            <Controller
              name="numBots"
              control={control}
              render={({ field }) => (
                <FormControl variant="standard">
                  <InputLabel>Number of Bots</InputLabel>
                  <Input {...field} />
                  <p>{errors.numBots?.message}</p>
                </FormControl>
              )}
            />

            <Controller
              name="botReactionDelay"
              control={control}
              render={({ field }) => (
                <FormControl variant="standard">
                  <InputLabel>Bot Reaction Delay</InputLabel>
                  <Input {...field} />
                  <p>{errors.botReactionDelay?.message}</p>
                </FormControl>
              )}
            />

            <Controller
              name="botRandomReactionDelay"
              control={control}
              render={({ field }) => (
                <FormControl variant="standard">
                  <InputLabel>Bot Random Reaction Delay</InputLabel>
                  <Input {...field} />
                  <p>{errors.botRandomReactionDelay?.message}</p>
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
            <Controller
              name="mistakeDetection"
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
            {watchedGameModeType !== 'conquest' && (
              <Controller
                name="calculateSpawnDelays"
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
              name="preventTowers"
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
