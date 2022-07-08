import FlexBox from '@/components/ui/FlexBox';
import { FormattedMessage, useIntl } from 'react-intl';
import { ReactComponent as VerifiedIcon } from '@/icons/verified.svg';
import { setNickname } from '@/state/updateUser';
import React from 'react';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm } from 'react-hook-form';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Input from '@mui/material/Input';
import Button from '@mui/material/Button';
import { useUser } from '@/components/hooks/useUser';
import { LocalUser } from '@/state/LocalUserStore';
import { useSnackbar } from 'notistack';
import InputAdornment from '@mui/material/InputAdornment';
import {
  borderColorLight,
  borderRadiuses,
  colors,
  dropShadows,
} from '@/theme/theme';

const schema = yup
  .object({
    nickname: yup
      .string()
      .min(2)
      .max(10)
      .matches(/^[a-z0-9 ]+$/),
  })
  .required();

type NicknameFormData = {
  nickname: string;
};

export function UserNicknameForm() {
  const intl = useIntl();
  const [isLoading, setIsLoading] = React.useState(false);
  const user = useUser();
  const { enqueueSnackbar } = useSnackbar();

  const onSubmit = React.useCallback(
    async (data: NicknameFormData) => {
      setIsLoading(true);
      if (!(await setNickname(data.nickname))) {
        enqueueSnackbar(
          intl.formatMessage({
            defaultMessage:
              'Failed to set nickname. Nickname might already be in use.',
            description: 'Failed to set nickname toast message',
          }),
          {
            variant: 'error',
          }
        );
      }
      setIsLoading(false);
    },
    [enqueueSnackbar, intl]
  );

  const defaultNickname =
    (user.id ? user.readOnly?.nickname : (user as LocalUser).nickname) || '';

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue,
  } = useForm<NicknameFormData>({
    defaultValues: {
      nickname: defaultNickname,
    },
    resolver: yupResolver(schema),
    mode: 'onChange',
  });

  const currentNicknameValue = watch('nickname');
  const isDirty =
    currentNicknameValue !== defaultNickname &&
    (currentNicknameValue.length > 1 || defaultNickname.length > 1);

  if (currentNicknameValue.toLowerCase() !== currentNicknameValue) {
    setValue('nickname', currentNicknameValue.toLowerCase(), {
      shouldValidate: true,
    });
  }

  const hasAdornment = !isDirty && user.readOnly?.nickname;

  return (
    <FlexBox flexDirection="row" zIndex="above" gap={1}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FlexBox
          flexDirection="row"
          gap={1}
          alignItems="center"
          justifyContent="center"
        >
          <FlexBox
            width={
              currentNicknameValue.length > 1
                ? (currentNicknameValue.length + 1) * 14 +
                  (hasAdornment ? 40 : 0) +
                  35
                : 200
            }
          >
            <Controller
              name="nickname"
              control={control}
              render={({ field }) => (
                <FormControl variant="standard">
                  <InputLabel
                    sx={
                      currentNicknameValue.length < 2 ? { ml: 2, mt: 1.5 } : {}
                    }
                  >
                    <FormattedMessage
                      defaultMessage="Nickname"
                      description="Nickname field label text"
                    />
                  </InputLabel>
                  <Input
                    {...field}
                    inputProps={{ maxLength: 10 }}
                    endAdornment={
                      hasAdornment && (
                        <InputAdornment position="end">
                          <VerifiedIcon
                            style={{ marginTop: -2, filter: dropShadows.xs }}
                          />
                        </InputAdornment>
                      )
                    }
                    sx={{
                      backgroundColor: borderColorLight,
                      px: 2,
                      py: 0,
                      borderRadius: borderRadiuses.full,
                      fontSize: '28px',
                      color: colors.white,
                    }}
                  />
                  {currentNicknameValue?.length > 1 && errors.nickname && (
                    <p>
                      {
                        /*errors.nickname?.message*/ 'Pleace choose only letters, numbers and spaces.'
                      }
                    </p>
                  )}
                </FormControl>
              )}
            />
          </FlexBox>
          {isDirty && (
            <Button
              type="submit"
              color="primary"
              variant="contained"
              disabled={!isValid || isLoading}
            >
              <FormattedMessage
                defaultMessage="Update"
                description="Update nickname button text"
              />
            </Button>
          )}
        </FlexBox>
      </form>
    </FlexBox>
  );
}
