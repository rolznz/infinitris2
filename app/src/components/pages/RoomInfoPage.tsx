import { RoomPageRouteParams } from '@/components/pages/RoomPage';
import FlexBox from '@/components/ui/FlexBox';
import { Page } from '@/components/ui/Page';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { getRoomPath, getServerPath, IRoom, IServer } from 'infinitris2-models';
import { Fragment } from 'react';
import { FormattedMessage } from 'react-intl';
import { useParams } from 'react-router-dom';
import { useDocument } from 'swr-firestore';
import { ReactComponent as InfoIcon } from '@/icons/i.svg';
import SvgIcon from '@mui/material/SvgIcon/SvgIcon';
import { borderColor, borderRadiuses, boxShadows } from '@/theme/theme';
import { MAX_PING, pingServer } from '@/components/hooks/useLobbyServers';
import React from 'react';

type InfoStat = { title: React.ReactNode; value: string };

export function RoomInfoPage() {
  const { id } = useParams<RoomPageRouteParams>();
  const { data: room } = useDocument<IRoom>(id ? getRoomPath(id) : null);
  const { data: server } = useDocument<IServer>(
    room ? getServerPath(room.data()!.serverId) : null
  );
  const [serverPing, setServerPing] = React.useState<number | undefined>();
  const serverUrl = server?.data()?.url;
  React.useEffect(() => {
    if (serverUrl) {
      pingServer(serverUrl, setServerPing);
    }
  }, [serverUrl]);

  const stats: InfoStat[] =
    room && server
      ? [
          {
            title: (
              <FormattedMessage
                defaultMessage="Server Name"
                description="room info: server name"
              />
            ),
            value: server?.data()!.name,
          },
          {
            title: (
              <FormattedMessage
                defaultMessage="Server Region"
                description="room info: server region"
              />
            ),
            value: server?.data()!.region,
          },
          {
            title: (
              <FormattedMessage
                defaultMessage="Connection"
                description="room info: connection quality"
              />
            ),
            value: serverPing ? `${serverPing}ms` : 'Unknown',
          },
          {
            title: (
              <FormattedMessage
                defaultMessage="Humans"
                description="room info: num humans"
              />
            ),
            value: (room?.data()!.numHumans || 0).toString(),
          },
          {
            title: (
              <FormattedMessage
                defaultMessage="Bots"
                description="room info: num bots"
              />
            ),
            value: (room?.data()!.numBots || 0).toString(),
          },
          {
            title: (
              <FormattedMessage
                defaultMessage="Spectators"
                description="room info: num spectators"
              />
            ),
            value: (room?.data()!.numSpectators || 0).toString(),
          },
          {
            title: (
              <FormattedMessage
                defaultMessage="World"
                description="room info: world"
              />
            ),
            value: room?.data()!.worldType || 'grass',
          },
          ...(room?.data()!.worldVariation
            ? [
                {
                  title: (
                    <FormattedMessage
                      defaultMessage="World Variation"
                      description="room info: world variation"
                    />
                  ),
                  value: room?.data()!.worldVariation!.toString(),
                },
              ]
            : []),
          /*{
            title: (
              <FormattedMessage
                defaultMessage="Num Bots"
                description="room info: num bots"
              />
            ),
            value: room?.data()!.numBots
          },*/
        ]
      : [];

  return (
    <Page title={room?.data()?.name} narrow>
      <FlexBox flexDirection="row" gap={1} mb={5}>
        <FlexBox
          boxShadow={boxShadows.small}
          sx={{ backgroundColor: borderColor }}
          borderRadius={borderRadiuses.full}
          padding={0.5}
        >
          <SvgIcon fontSize="small" color="primary">
            <InfoIcon />
          </SvgIcon>
        </FlexBox>
        <Typography>
          <FormattedMessage
            defaultMessage="Room info"
            description="room info subtitle"
          />
        </Typography>
      </FlexBox>
      <Grid container spacing={2} alignItems="center" justifyContent="center">
        {stats.map((stat, index) => (
          <Fragment key={index}>
            <Grid item xs={6}>
              <Typography variant="body1">{stat.title}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body1">{stat.value}</Typography>
            </Grid>
          </Fragment>
        ))}
      </Grid>
    </Page>
  );
}
