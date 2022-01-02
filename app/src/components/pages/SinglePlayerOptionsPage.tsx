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

const schema = yup
  .object({
    numBots: yup.number().integer().lessThan(100).moreThan(-1).required(),
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
      gridNumRows: 20,
      gridNumColumns: 50,
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
      narrow
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <FlexBox>
          <Controller
            name="numBots"
            control={control}
            render={({ field }) => (
              <FormControl variant="standard">
                <InputLabel htmlFor="component-simple">
                  Number of Bots
                </InputLabel>
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
                <InputLabel htmlFor="component-simple">
                  Bot Reaction Delay
                </InputLabel>
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
                <InputLabel htmlFor="component-simple">Grid Rows</InputLabel>
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
                <InputLabel htmlFor="component-simple">Grid Columns</InputLabel>
                <Input {...field} />
                <p>{errors.gridNumColumns?.message}</p>
              </FormControl>
            )}
          />

          <Button
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
