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
  GameModeTypeValues,
} from 'infinitris2-models';
import useChallengeEditorStore from '@/state/ChallengeEditorStore';
import FlexBox from '@/components/ui/FlexBox';
import { doc, getFirestore, setDoc } from 'firebase/firestore';
import useAuthStore from '@/state/AuthStore';
import { showLoginPrompt } from '@/utils/showLoginPrompt';
import { v4 as uuidv4 } from 'uuid';
import { useHistory } from 'react-router-dom';
import Routes from '@/models/Routes';
import Link from '@mui/material/Link/Link';
import { Link as RouterLink } from 'react-router-dom';
import Select from '@mui/material/Select/Select';
import MenuItem from '@mui/material/MenuItem';
import shallow from 'zustand/shallow';
import removeUndefinedValues from '@/utils/removeUndefinedValues';
import { createNewChallenge } from '@/components/pages/CreateChallengePage/createNewChallenge';
import { useUser } from '@/components/hooks/useUser';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import { Typography } from '@mui/material';
import { getLastCompletedGrid } from '@/components/pages/ChallengePage/ChallengePage';
import { useSnackbar } from 'notistack';
import {
  ChallengesPageSortType,
  challengesPageSortParam,
} from '@/components/pages/ChallengesPage/ChallengesPage';
import { useDocument, UseDocumentOptions } from 'swr-firestore';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const exportChallenge = () => {
  const challenge = useChallengeEditorStore.getState().challenge!;
  const okExportProps: Partial<IChallenge> = {
    grid: challenge.grid,
    simulationSettings: challenge.simulationSettings,
    worldType: challenge.worldType,
    worldVariation: challenge.worldVariation,
    title: challenge.title,
    description: challenge.description,
    finishCriteria: challenge.finishCriteria,
    rewardCriteria: challenge.rewardCriteria,
  };
  window.prompt('Exported Challenge JSON', JSON.stringify(okExportProps));
};

const schema = yup.object({
  title: yup
    .string()
    .optional()
    .max(16)
    .matches(/^[a-z0-9 ]*$/),
});

type SettingsFormData = Pick<
  IChallenge,
  | 'title'
  | 'simulationSettings'
  | 'worldType'
  | 'worldVariation'
  | 'isOfficial'
  | 'priority'
  | 'isTemplate'
>;

type ChallengeEditorSettingsFormProps = {
  challenge: IChallenge;
  updateFormKey(): void;
};

const usePublishedChallengeSettings: UseDocumentOptions = {
  listen: true,
};

export function ChallengeEditorSettingsForm({
  challenge,
  updateFormKey,
}: ChallengeEditorSettingsFormProps) {
  const [setChallenge, setChallengeId, existingChallengeId] =
    useChallengeEditorStore(
      (store) => [store.setChallenge, store.setChallengeId, store.challengeId],
      shallow
    );
  const [isLoading, setIsLoading] = React.useState(false);
  const [challengeIdToPublish, setChallengeIdToPublish] = React.useState<
    string | undefined
  >(undefined);
  const { data: publishedChallenge } = useDocument<IChallenge>(
    challengeIdToPublish ? getChallengePath(challengeIdToPublish) : null,
    usePublishedChallengeSettings
  );
  const challengeHasBeenCreated = publishedChallenge?.data?.()?.created;
  const userId = useAuthStore((store) => store.user?.uid);
  const user = useUser();
  const isAdmin = user.readOnly?.isAdmin;
  const intl = useIntl();
  const history = useHistory();
  const { enqueueSnackbar } = useSnackbar();
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

  const [skipCompleteChallenge, setSkipCompleteChallenge] =
    React.useState(false);
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
      console.log('Set challenge: ', {
        ...challenge,
        ...watchedValues,
      });
    }
  }, [valuesSame, setChallenge, watchedValues, challenge]);

  React.useEffect(() => {
    if (challengeIdToPublish && challengeHasBeenCreated) {
      setChallengeIdToPublish(undefined);
      setChallenge(undefined);
      setChallengeId(undefined);
      setIsLoading(false);
      reset();
      enqueueSnackbar('Challenge Published Successfully!');
      const sortLatest: ChallengesPageSortType = 'latest';
      history.push(
        challenge.isTemplate || challenge.isOfficial
          ? Routes.newChallenge
          : `${Routes.challenges}?${challengesPageSortParam}=${sortLatest}`
      );
    }
  }, [
    setChallenge,
    reset,
    history,
    setChallengeId,
    challengeIdToPublish,
    challengeHasBeenCreated,
    enqueueSnackbar,
    challenge.isTemplate,
    challenge.isOfficial,
  ]);

  const { title } = watch();
  if (title && title.toLowerCase() !== title) {
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

  const importChallenge = React.useCallback(() => {
    const json = window.prompt('Enter challenge JSON');
    if (!json) {
      enqueueSnackbar('Invalid JSON', { variant: 'error' });
      return;
    }
    const parsed = JSON.parse(json);
    const importedChallenge = { ...createNewChallenge(), ...parsed };
    console.log('IMPORTED CHALLENGE:', importedChallenge);
    updateFormKey();
    setChallenge(importedChallenge);
  }, [setChallenge, updateFormKey, enqueueSnackbar]);

  const resetChallenge = React.useCallback(() => {
    if (window.confirm('Are you sure you wish to create a new challenge?')) {
      reset();
      setChallenge(undefined);
      setChallengeId(undefined);
    }
  }, [reset, setChallenge, setChallengeId]);

  const onSubmit = React.useCallback(
    async (data: SettingsFormData) => {
      if (!userId) {
        showLoginPrompt(enqueueSnackbar, intl);
        return;
      }
      setIsLoading(true);

      if (getLastCompletedGrid() !== challenge.grid && !skipCompleteChallenge) {
        enqueueSnackbar(
          'Please test and complete the challenge first to ensure it is completable',
          { variant: 'error' }
        );
        return;
      }
      if (
        window.confirm(
          'Are you sure you wish to publish this challenge?\n\nPublished challenges cannot be edited.\n\nCost: 1 coin\n\nYour account will be topped back up to 3 coins every 24 hours.'
        )
      ) {
        let challengeToPublish: IChallenge = {
          ...challenge,
          title: data.title,
          isPublished: true,
        };
        if (!existingChallengeId) {
          // only set the user ID for new challenges
          challengeToPublish = {
            ...challengeToPublish,
            userId,
          };
        }
        if (challengeToPublish.isTemplate) {
          challengeToPublish = {
            ...challengeToPublish,
            // remove official flag to not show up in either story mode or community challenges
            // TODO: this feels a bit hacky, maybe story mode challenges should have an isStoryMode property
            isOfficial: undefined,
          };
        }

        const challengeId = existingChallengeId || uuidv4();
        console.log('Challenge to publish', challengeToPublish, challengeId);

        try {
          await setDoc(
            doc(getFirestore(), getChallengePath(challengeId)),
            removeUndefinedValues(challengeToPublish),
            { merge: true }
          );

          setChallengeIdToPublish(challengeId);
        } catch (error) {
          console.error('Failed to publish challenge', error);
          enqueueSnackbar('Failed to publish challenge', { variant: 'error' });
          setIsLoading(false);
        }
      }
    },
    [
      userId,
      challenge,
      skipCompleteChallenge,
      enqueueSnackbar,
      intl,
      existingChallengeId,
    ]
  );

  return (
    <FlexBox>
      {existingChallengeId && (
        <Typography color="red">
          WARNING: You are updating an existing challenge
        </Typography>
      )}
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
                  {!!title?.length && <p>{errors.title?.message}</p>}
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

            {isAdmin && (
              <FlexBox my={2} border="1px solid red" p={2}>
                <Typography>Admin Settings</Typography>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={skipCompleteChallenge}
                      onChange={(event) =>
                        setSkipCompleteChallenge(event.target.checked)
                      }
                    />
                  }
                  label={'skip complete challenge check'}
                />
                <Controller
                  name="isTemplate"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Checkbox
                          {...field}
                          defaultChecked={!!challenge.isTemplate}
                        />
                      }
                      label={'Save as Template'}
                    />
                  )}
                />
                <Controller
                  name="isOfficial"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Checkbox
                          {...field}
                          defaultChecked={!!challenge.isOfficial}
                        />
                      }
                      label={'Official (Story Mode)'}
                    />
                  )}
                />
                <Controller
                  name="simulationSettings.gameModeType"
                  control={control}
                  render={({ field }) => (
                    <FormControl variant="standard" fullWidth>
                      <InputLabel>Game Mode</InputLabel>
                      <Select {...field}>
                        {GameModeTypeValues.map((value) => (
                          <MenuItem key={value} value={value}>
                            {value}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </FlexBox>
            )}
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
            {isLoading && <LoadingSpinner />}
          </FlexBox>
        </FlexBox>
      </form>
      <FlexBox mt={4} flexDirection="row" flexWrap="wrap" gap={1}>
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
        <Link component={RouterLink} to={Routes.newChallenge}>
          <Button color="secondary" variant="contained">
            <FormattedMessage
              defaultMessage="Load Challenge"
              description="Load challenge button text"
            />
          </Button>
        </Link>
        <Button
          color="secondary"
          variant="contained"
          onClick={() => exportChallenge()}
        >
          <FormattedMessage
            defaultMessage="Export Challenge"
            description="Export challenge button text"
          />
        </Button>
        <Button
          color="secondary"
          variant="contained"
          onClick={() => importChallenge()}
        >
          <FormattedMessage
            defaultMessage="Import Challenge"
            description="Import challenge button text"
          />
        </Button>
      </FlexBox>
    </FlexBox>
  );
}
