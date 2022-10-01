import FlexBox from '@/components/ui/FlexBox';
import { colors } from '@/theme/theme';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { FormattedMessage, useIntl } from 'react-intl';
import QRCode from 'react-qr-code';
import { useCopyToClipboard } from 'react-use';
import { useTheme } from '@mui/material/styles';
import isMobile from '@/utils/isMobile';
import { useSnackbar } from 'notistack';
import * as bolt11 from 'bolt11';

type LightningQRProps = {
  value: string;
};

export function LightningQR({ value }: LightningQRProps) {
  const [, copy] = useCopyToClipboard();
  const intl = useIntl();
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const priceInSats =
    parseInt(bolt11.decode(value).millisatoshis || '0') / 1000;
  return (
    <FlexBox>
      <QRCode
        value={value}
        level="L"
        fgColor={colors.white}
        bgColor={theme.palette.text.secondary}
        onClick={() => {
          copy(value);
          enqueueSnackbar(
            intl.formatMessage({
              defaultMessage: 'Address copied to clipboard',
              description:
                'Lightning Donation Address copied to clipboard toast message',
            })
          );
        }}
      />
      <Typography align="center" variant="body1" mt={1}>
        <FormattedMessage
          defaultMessage="Price: {priceInSats, plural, =1 {# satoshi} other {# satoshis}}"
          values={{ priceInSats }}
        />
      </Typography>
      {isMobile() && (
        <Typography align="center" variant="caption" mt={1}>
          Tap to copy
        </Typography>
      )}
      <Typography align="center" variant="caption">
        <Link href="https://www.coinbase.com/converter/sats/usd">
          check conversion rates
        </Link>
        {' • '}
        Payments powered by <Link href="https://lnbits.com/">lnbits</Link>
      </Typography>
    </FlexBox>
  );
}
