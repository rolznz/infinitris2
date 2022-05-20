import FlexBox from '@/components/ui/FlexBox';
import { FormattedMessage, useIntl } from 'react-intl';
import { ReactComponent as TickIcon } from '@/icons/tick.svg';
import { setNickname } from '@/state/updateUser';
import React from 'react';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Input from '@mui/material/Input';
import Button from '@mui/material/Button';
import { useUser } from '@/components/hooks/useUser';
import { LocalUser } from '@/state/LocalUserStore';

const schema = yup
  .object({
    nickname: yup
      .string()
      .min(2)
      .max(15)
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

  const onSubmit = React.useCallback(
    async (data: NicknameFormData) => {
      setIsLoading(true);
      if (!(await setNickname(data.nickname))) {
        toast(
          intl.formatMessage({
            defaultMessage:
              'Failed to set nickname. Nickname might already be in use.',
            description: 'Failed to set nickname toast message',
          }),
          {}
        );
      }
      setIsLoading(false);
    },
    [intl]
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
    currentNicknameValue !== defaultNickname && currentNicknameValue.length > 1;

  if (currentNicknameValue.toLowerCase() !== currentNicknameValue) {
    setValue('nickname', currentNicknameValue.toLowerCase(), {
      shouldValidate: true,
    });
  }

  return (
    <FlexBox position="relative" zIndex="above">
      <form onSubmit={handleSubmit(onSubmit)}>
        <FlexBox
          flexDirection="row"
          gap={1}
          alignItems="center"
          justifyContent="center"
        >
          <Controller
            name="nickname"
            control={control}
            render={({ field }) => (
              <FormControl variant="standard" fullWidth>
                <InputLabel>
                  <FormattedMessage
                    defaultMessage="Nickname"
                    description="Nickname field label text"
                  />
                </InputLabel>
                <Input {...field} fullWidth inputProps={{ maxLength: 15 }} />
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

      {!isDirty && user.readOnly?.nickname && (
        <FlexBox position="absolute" right={0} flexDirection="row" gap={1}>
          <TickIcon /> verified
        </FlexBox>
      )}
    </FlexBox>
  );
}
