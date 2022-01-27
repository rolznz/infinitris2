import React from 'react';
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
  GameModeType,
  GameModeTypeValues,
  WorldType,
  WorldTypeValues,
} from 'infinitris2-models';

const schema = yup
  .object({
    numBots: yup.number().integer().lessThan(100).moreThan(-1).required(),
    dayLength: yup.number().integer().moreThan(-1).required(),
    botReactionDelay: yup
      .number()
      .positive()
      .integer()
      .lessThan(1000)
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

type FormData = {
  numBots: number;
  botReactionDelay: number;
  gridNumRows: number;
  gridNumColumns: number;
  dayLength: number;
  spectate: boolean;
  mistakeDetection: boolean;
  calculateSpawnDelays: boolean;
  preventTowers: boolean;
  worldType: WorldType;
  gameModeType: GameModeType;
};

export function SinglePlayerOptionsPage() {
  const intl = useIntl();
  const history = useHistory();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      numBots: 4,
      botReactionDelay: 25,
      gridNumRows: 18,
      gridNumColumns: 50,
      dayLength: 2000,
      spectate: false,
      mistakeDetection: true,
      calculateSpawnDelays: true,
      preventTowers: true,
      worldType: 'grass',
      gameModeType: 'infinity',
    },
    resolver: yupResolver(schema),
  });

  const onSubmit = (data: FormData) => {
    const searchParams = new URLSearchParams();
    Object.entries(data).forEach((entry) => {
      searchParams.append(entry[0], entry[1].toString());
    });
    history.push(Routes.singlePlayer + '?' + searchParams);
  };

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
            <Controller
              name="dayLength"
              control={control}
              render={({ field }) => (
                <FormControl variant="standard">
                  <InputLabel>Day Length</InputLabel>
                  <Input type="number" {...field} />
                  <p>{errors.dayLength?.message}</p>
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
            <Controller
              name="calculateSpawnDelays"
              control={control}
              render={({ field }) => (
                <FormGroup>
                  <FormControlLabel
                    control={<Switch {...field} defaultChecked={field.value} />}
                    label="Spawn Delays"
                    labelPlacement="start"
                  />
                </FormGroup>
              )}
            />
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
        </FlexBox>
      </form>
    </Page>
  );
}
