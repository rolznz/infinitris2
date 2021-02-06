import React, { useEffect } from 'react';
import { Typography, Grid, Box, Button } from '@material-ui/core';

import FlexBox from '../../layout/FlexBox';
import useDemo from '../../hooks/useDemo';
import { FormattedMessage } from 'react-intl';
import useUserStore from '../../../state/UserStore';
import SettingsRow from './SettingsRow';
import { getUserFriendlyKeyText, InputAction } from 'infinitris2-models';
import { useState } from 'react';
import { useKeyPress } from 'react-use';

export default function ControlSettingsPage() {
  useDemo();
  const userStore = useUserStore();
  const { user, resetControls, updateControl } = userStore;
  const [editingInputAction, setEditingInputAction] = useState<
    InputAction | undefined
  >(undefined);
  const [isDown, lastKeyPressedEvent] = useKeyPress(
    (event: KeyboardEvent) => true
  );

  useEffect(() => {
    if (editingInputAction && isDown && lastKeyPressedEvent) {
      setEditingInputAction(undefined);
      updateControl(editingInputAction, lastKeyPressedEvent?.key);
    }
  }, [isDown, editingInputAction, lastKeyPressedEvent, updateControl]);

  function getInputActionMessage(inputAction: InputAction) {
    // TODO: is there a way to reduce duplication here?
    // [React Intl] Messages must be statically evaluate-able for extraction.
    switch (inputAction) {
      case InputAction.Drop:
        return (
          <FormattedMessage
            defaultMessage="Drop"
            description="Drop action text"
          />
        );
      case InputAction.MoveDown:
        return (
          <FormattedMessage
            defaultMessage="Move Down"
            description="MoveDown action text"
          />
        );
      case InputAction.MoveLeft:
        return (
          <FormattedMessage
            defaultMessage="Move Left"
            description="MoveLeft action text"
          />
        );
      case InputAction.MoveRight:
        return (
          <FormattedMessage
            defaultMessage="Move Right"
            description="MoveRight action text"
          />
        );
      case InputAction.RotateClockwise:
        return (
          <FormattedMessage
            defaultMessage="Rotate Clockwise"
            description="RotateClockwise action text"
          />
        );
      case InputAction.RotateAnticlockwise:
        return (
          <FormattedMessage
            defaultMessage="Rotate Anticlockwise"
            description="RotateAnticlockwise action text"
          />
        );
      default:
        throw new Error('unknown input action: ' + inputAction);
    }
  }

  return (
    <>
      <FlexBox flex={1} justifyContent="flex-start">
        <Typography variant="h6">
          <FormattedMessage
            defaultMessage="Control Settings"
            description="Control Settings Header"
          />
        </Typography>
        <Box mb={2} />
        {editingInputAction ? (
          <FormattedMessage
            defaultMessage="Press a key for {inputAction}"
            description="Press a key for the selected input action"
            values={{ inputAction: editingInputAction }}
          />
        ) : (
          <FlexBox width={300} height="100%">
            <Grid container spacing={2} alignItems="center" justify="center">
              {(Object.values(InputAction) as InputAction[]).map(
                (inputAction) => {
                  console.log(user.controls);
                  console.log(user.controls[inputAction]);
                  return (
                    <SettingsRow
                      key={inputAction}
                      left={getInputActionMessage(inputAction)}
                      right={
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => setEditingInputAction(inputAction)}
                        >
                          {getUserFriendlyKeyText(user.controls[inputAction])}
                        </Button>
                      }
                    />
                  );
                }
              )}
            </Grid>
            <Box mb={4} />
            <FlexBox flex={1} justifyContent="flex-end" mb={4}>
              <Button
                variant="contained"
                color="secondary"
                onClick={() =>
                  window.confirm(
                    'Are you sure you wish to reset your controls?'
                  ) && resetControls()
                }
              >
                <FormattedMessage
                  defaultMessage="Reset Controls"
                  description="Reset Controls button text"
                />
              </Button>
            </FlexBox>
          </FlexBox>
        )}
      </FlexBox>
    </>
  );
}
