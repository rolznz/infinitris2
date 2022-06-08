import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm } from 'react-hook-form';
import { FormattedMessage, useIntl } from 'react-intl';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Input from '@mui/material/Input';
import Button from '@mui/material/Button';
import React from 'react';
import {
  blockLayoutSets,
  getChallengePath,
  IChallenge,
  WorldTypeValues,
  WorldVariationValues,
} from 'infinitris2-models';
import useChallengeEditorStore from '@/state/ChallengeEditorStore';
import FlexBox from '@/components/ui/FlexBox';
import { doc, getFirestore, setDoc } from 'firebase/firestore';
import useAuthStore from '@/state/AuthStore';
import { showLoginPrompt } from '@/utils/showLoginMessage';
import { v4 as uuidv4 } from 'uuid';
import { useHistory } from 'react-router-dom';
import Routes from '@/models/Routes';
import Link from '@mui/material/Link/Link';
import { Link as RouterLink } from 'react-router-dom';
import Select from '@mui/material/Select/Select';
import MenuItem from '@mui/material/MenuItem';
import shallow from 'zustand/shallow';
import removeUndefinedValues from '@/utils/removeUndefinedValues';

const schema = yup.object({
  title: yup
    .string()
    .optional()
    .max(20)
    .matches(/^[a-z0-9 ]*$/),
});

type SettingsFormData = Pick<
  IChallenge,
  'title' | 'simulationSettings' | 'worldType' | 'worldVariation'
>;

type ChallengeEditorSettingsFormProps = {
  challenge: IChallenge;
};

export function ChallengeEditorSettingsForm({
  challenge,
}: ChallengeEditorSettingsFormProps) {
  const setChallenge = useChallengeEditorStore((store) => store.setChallenge);
  const [isLoading, setIsLoading] = React.useState(false);
  const userId = useAuthStore((store) => store.user?.uid);
  const intl = useIntl();
  const history = useHistory();
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
    reset,
  } = useForm<SettingsFormData>({
    defaultValues: challenge,
    resolver: yupResolver(schema),
    mode: 'onChange',
  });

  const watchedValues = watch();
  const valuesSame = shallow(challenge, {
    ...challenge,
    ...watchedValues,
  });
  React.useEffect(() => {
    if (!valuesSame) {
      setChallenge({
        ...challenge,
        ...watchedValues,
      });
    }
  }, [valuesSame, setChallenge, watchedValues, challenge]);

  const { title } = watch();
  if (title.toLowerCase() !== title) {
    setValue('title', title.toLowerCase(), { shouldValidate: true });
  }
  /*React.useEffect(() => {
    const existingChallenge = useChallengeEditorStore.getState().challenge;
    if (existingChallenge) {
      setChallenge({
        ...existingChallenge,
        title,
      });
    }
  }, [setChallenge, title]);*/

  const resetChallenge = React.useCallback(() => {
    if (window.confirm('Are you sure you wish to create a new challenge?')) {
      reset();
      setChallenge(undefined);
    }
  }, [reset, setChallenge]);

  const onSubmit = React.useCallback(
    async (data: SettingsFormData) => {
      if (!userId) {
        showLoginPrompt(intl);
        return;
      }
      setIsLoading(true);

      if (
        window.confirm(
          'Are you sure you wish to publish this challenge?\n\nPublished challenges cannot be edited.\n\nCost: 1 coin'
        )
      ) {
        const challengeToPublish: IChallenge = {
          ...challenge,
          title: data.title,
          userId,
          isPublished: true,
        };

        const challengeId = uuidv4();

        try {
          await setDoc(
            doc(getFirestore(), getChallengePath(challengeId)),
            removeUndefinedValues(challengeToPublish)
          );

          setChallenge(undefined);
          reset();
          history.push(Routes.challenges);
        } catch (error) {
          console.error('Failed to publish challenge', error);
          alert('Failed to publish challenge.');
        }
      }

      setIsLoading(false);
    },
    [userId, intl, challenge, setChallenge, reset, history]
  );

  return (
    <FlexBox>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FlexBox>
          <FlexBox justifyContent="flex-start" alignItems="flex-start" mb={2}>
            <Controller
              name="title"
              control={control}
              render={({ field }) => (
                <FormControl variant="standard" fullWidth>
                  <InputLabel>
                    <FormattedMessage
                      defaultMessage="Challenge Title"
                      description="Challenge Title field label text"
                    />
                  </InputLabel>
                  <Input
                    {...field}
                    fullWidth
                    inputProps={{ maxLength: 15, placeholder: 'New Challenge' }}
                  />
                  {!!title.length && <p>{errors.title?.message}</p>}
                </FormControl>
              )}
            />
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
            <Controller
              name="worldType"
              control={control}
              render={({ field }) => (
                <FormControl variant="standard" fullWidth>
                  <InputLabel>World</InputLabel>
                  <Select {...field}>
                    {WorldTypeValues.map((worldType) => (
                      <MenuItem key={worldType} value={worldType}>
                        {worldType}
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
                <FormControl variant="standard" fullWidth>
                  <InputLabel>World Variation</InputLabel>
                  <Select {...field}>
                    {WorldVariationValues.map((variation) => (
                      <MenuItem key={variation} value={variation}>
                        {variation}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />
          </FlexBox>
          <FlexBox mt={1}>
            <Button
              type="submit"
              color="primary"
              variant="contained"
              disabled={!isValid || isLoading}
            >
              <FormattedMessage
                defaultMessage="Publish"
                description="Publish challenge button text"
              />
            </Button>
          </FlexBox>
        </FlexBox>
      </form>
      <FlexBox mt={4} flexDirection="row" gap={1}>
        <Button
          color="secondary"
          variant="contained"
          onClick={() => resetChallenge()}
        >
          <FormattedMessage
            defaultMessage="Reset Challenge"
            description="Reset challenge button text"
          />
        </Button>
        <Link component={RouterLink} to={Routes.loadChallenge}>
          <Button color="secondary" variant="contained">
            <FormattedMessage
              defaultMessage="Load Challenge"
              description="Load challenge button text"
            />
          </Button>
        </Link>
      </FlexBox>
    </FlexBox>
  );
}
