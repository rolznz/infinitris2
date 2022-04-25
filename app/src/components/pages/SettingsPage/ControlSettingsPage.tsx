import React, { useEffect, useState } from 'react';
import FlexBox from '../../ui/FlexBox';

import { FormattedMessage, useIntl } from 'react-intl';
import SettingsRow from './SettingsRow';
import {
  AdjustableInputMethod,
  getUserFriendlyKeyText,
  InputAction,
} from 'infinitris2-models';
import useKeyPress from 'react-use/lib/useKeyPress';
import { Page } from '@/components/ui/Page';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import useSearchParam from 'react-use/lib/useSearchParam';
import { Typography } from '@mui/material';
import { useUser } from '@/state/useUser';
import { resetControls, updateControl } from '@/state/updateUser';

let initialJoypadAxesValues: number[] = [];

export default function ControlSettingsPage() {
  const intl = useIntl();
  const adjustableInputType = useSearchParam('type') as AdjustableInputMethod;
  const user = useUser();
  const [editingInputAction, setEditingInputAction] = useState<
    InputAction | undefined
  >(undefined);
  const [isDown, lastKeyPressedEvent] = useKeyPress(() => true);
  const [gamepadConnected, setGamepadConnected] = React.useState(false);

  React.useEffect(() => {
    if (adjustableInputType === 'gamepad') {
      const onConnected = () => {
        setGamepadConnected(true);
      };
      const onDisconnected = () => {
        setGamepadConnected(false);
      };
      window.addEventListener('gamepadconnected', onConnected);
      window.addEventListener('gamepaddisconnected', onDisconnected);
      return () => {
        window.removeEventListener('gamepadconnected', onConnected);
        window.removeEventListener('gamepaddisconnected', onDisconnected);
      };
    }
  }, [adjustableInputType]);

  React.useEffect(() => {
    if (editingInputAction && adjustableInputType === 'gamepad') {
      const timeout = setInterval(() => {
        const gamepads = navigator.getGamepads?.() || [];
        const gamepad = gamepads?.[0];
        if (!gamepad) {
          return;
        }
        for (let i = 0; i < gamepad.buttons.length; i++) {
          if (gamepad.buttons[i].pressed) {
            setEditingInputAction(undefined);
            updateControl(
              user,
              adjustableInputType,
              editingInputAction,
              `button_${i}`
            );
          }
        }
        if (
          !initialJoypadAxesValues ||
          initialJoypadAxesValues.length !== gamepad.axes.length
        ) {
          initialJoypadAxesValues = gamepad.axes.slice();
        }
        for (let i = 0; i < gamepad.axes.length; i++) {
          if (gamepad.axes[i] !== initialJoypadAxesValues[i]) {
            setEditingInputAction(undefined);
            updateControl(
              user,
              adjustableInputType,
              editingInputAction,
              `axis_${i}_${gamepad.axes[i]}`
            );
          }
        }
      }, 100);

      return () => {
        clearInterval(timeout);
      };
    }
  }, [adjustableInputType, editingInputAction, user]);

  useEffect(() => {
    if (editingInputAction && isDown && lastKeyPressedEvent) {
      setEditingInputAction(undefined);
      if (adjustableInputType === 'keyboard') {
        updateControl(
          user,
          adjustableInputType,
          editingInputAction,
          lastKeyPressedEvent?.key
        );
      }
    }
  }, [
    adjustableInputType,
    isDown,
    editingInputAction,
    lastKeyPressedEvent,
    user,
  ]);

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
      case InputAction.Chat:
        return (
          <FormattedMessage
            defaultMessage="Chat"
            description="Chat action text"
          />
        );
      case InputAction.Esc:
        return (
          <FormattedMessage
            defaultMessage="Esc"
            description="Esc action text"
          />
        );
      default:
        throw new Error('unknown input action: ' + inputAction);
    }
  }

  return (
    <Page
      title={intl.formatMessage({
        defaultMessage: 'Control Settings',
        description: 'Control Settings page title',
      })}
    >
      {editingInputAction ? (
        <FormattedMessage
          defaultMessage="Press a key for {inputAction}"
          description="Press a key for the selected input action"
          values={{ inputAction: editingInputAction }}
        />
      ) : (
        <FlexBox width={300} maxWidth="100%">
          {adjustableInputType === 'gamepad' && (
            <>
              <Typography pb={2}>
                <FormattedMessage
                  defaultMessage="Gamepad {connected}"
                  description="Gamepad connected status"
                  values={{
                    connected: gamepadConnected ? (
                      <span style={{ color: '#00ff00' }}>CONNECTED</span>
                    ) : (
                      <span style={{ color: '#ff0000' }}>DISCONNECTED</span>
                    ),
                  }}
                />
              </Typography>
              {!gamepadConnected && (
                <Typography pb={2} textAlign="center">
                  <FormattedMessage
                    defaultMessage="Try disconnecting and reconnecting your bluetooth gamepad."
                    description="Gamepad disconnected help"
                  />
                </Typography>
              )}
            </>
          )}
          <Grid
            container
            spacing={2}
            alignItems="center"
            justifyContent="center"
          >
            {(Object.values(InputAction) as InputAction[]).map(
              (inputAction) => {
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
                        {getUserFriendlyKeyText(
                          user[`controls_${adjustableInputType}`]?.[
                            inputAction
                          ] || 'Unset'
                        )}
                      </Button>
                    }
                  />
                );
              }
            )}
          </Grid>
          <Box mb={10} />
          <FlexBox flex={1} justifyContent="flex-end" mb={4}>
            {adjustableInputType === 'keyboard' && (
              <Button
                variant="contained"
                color="secondary"
                onClick={() =>
                  window.confirm(
                    'Are you sure you wish to reset your controls?'
                  ) && resetControls(adjustableInputType)
                }
              >
                <FormattedMessage
                  defaultMessage="Reset Controls"
                  description="Reset Controls button text"
                />
              </Button>
            )}
          </FlexBox>
        </FlexBox>
      )}
    </Page>
  );
}
