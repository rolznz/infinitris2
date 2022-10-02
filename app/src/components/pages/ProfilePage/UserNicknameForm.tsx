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
  lockFilter,
} from '@/theme/theme';

const createSchema = (allowEmpty: boolean | undefined) => {
  let schema = yup.object({
    nickname: yup
      .string()
      .min(allowEmpty ? 0 : 2)
      .max(10)
      .matches(/^[a-z0-9 ]*$/),
  });
  if (!allowEmpty) {
    schema = schema.required();
  }
  return schema;
};

type NicknameFormData = {
  nickname: string;
};

type UserNicknameFormProps = {
  autoFocus?: boolean;
  allowEmpty?: boolean;
  variant?: 'update' | 'play';
  onSubmit?(): void;
};

export function UserNicknameForm({
  onSubmit,
  autoFocus,
  allowEmpty,
  variant = 'update',
}: UserNicknameFormProps) {
  const intl = useIntl();
  const [isLoading, setIsLoading] = React.useState(false);
  const user = useUser();
  const { enqueueSnackbar } = useSnackbar();

  const onSubmitInternal = React.useCallback(
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
      onSubmit?.();
    },
    [enqueueSnackbar, intl, onSubmit]
  );

  const defaultNickname =
    (user.id ? user.readOnly?.nickname : (user as LocalUser).nickname) || '';

  const schema = React.useMemo(() => createSchema(allowEmpty), [allowEmpty]);

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
      <form onSubmit={handleSubmit(onSubmitInternal)}>
        <FlexBox
          flexDirection="row"
          gap={1}
          alignItems="center"
          justifyContent="center"
        >
          <FlexBox
            width={
              variant === 'play'
                ? 280
                : currentNicknameValue.length > 1
                ? (currentNicknameValue.length + 1) * 14 + 75
                : 200
            }
          >
            <Controller
              name="nickname"
              control={control}
              render={({ field }) => (
                <FormControl variant="standard">
                  {!allowEmpty && (
                    <InputLabel
                      sx={
                        currentNicknameValue.length < 2
                          ? { ml: 2, mt: 1.5 }
                          : {}
                      }
                    >
                      <FormattedMessage
                        defaultMessage="Choose Nickname"
                        description="Nickname field label text"
                      />
                    </InputLabel>
                  )}
                  <Input
                    {...field}
                    autoFocus={autoFocus}
                    placeholder="Choose Nickname"
                    inputProps={{ maxLength: 10 }}
                    endAdornment={
                      currentNicknameValue.length > 1 ? (
                        <InputAdornment
                          position="end"
                          sx={{ cursor: 'pointer' }}
                          onClick={() =>
                            alert(
                              'Premium players can secure a nickname. Once secured, this tick will turn blue.'
                            )
                          }
                        >
                          <VerifiedIcon
                            style={{
                              marginTop: -2,
                              filter: hasAdornment
                                ? dropShadows.xs
                                : lockFilter,
                              opacity: hasAdornment ? undefined : 0.2,
                            }}
                          />
                        </InputAdornment>
                      ) : undefined
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
          {(isDirty || allowEmpty) && (
            <Button
              type="submit"
              color="primary"
              variant="contained"
              disabled={!isValid || isLoading}
            >
              {variant === 'update' ? (
                <FormattedMessage
                  defaultMessage="Update"
                  description="Update nickname button text"
                />
              ) : (
                <FormattedMessage
                  defaultMessage="Play"
                  description="Update nickname play button text"
                />
              )}
            </Button>
          )}
        </FlexBox>
      </form>
    </FlexBox>
  );
}
