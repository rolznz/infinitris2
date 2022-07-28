import { Carousel } from '@/components/ui/Carousel';
import FlexBox from '@/components/ui/FlexBox';
import { ReactComponent as DiscordIcon } from '@/icons/social/Discord-Logo-White.svg';
import { borderRadiuses } from '@/theme/theme';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { FormattedMessage } from 'react-intl';

export function Announcements() {
  // TODO: consider dynamic announcements from Firestore (note: no translations)
  const slides = [
    ...(process.env.REACT_APP_DISCORD_LINK
      ? [
          <Link href="https://discord.gg/q6avMW4gbp" key="discord">
            <FlexBox
              bgcolor="background.paper"
              flexDirection="row"
              alignItems="center"
              gap={1}
              py={0}
              px={4}
              borderRadius={borderRadiuses.full}
            >
              <DiscordIcon width={32} />
              <Typography>
                <FormattedMessage
                  defaultMessage="Join our Community!"
                  description="Join discord community message"
                />
              </Typography>
            </FlexBox>
          </Link>,
        ]
      : []),
  ];

  return (
    <FlexBox position="absolute" top={50}>
      <Carousel slides={slides} showArrows={false}></Carousel>
    </FlexBox>
  );
}
