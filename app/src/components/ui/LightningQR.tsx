import FlexBox from '@/components/ui/FlexBox';
import { colors } from '@/theme/theme';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { useIntl } from 'react-intl';
import QRCode from 'react-qr-code';
import { toast } from 'react-toastify';
import { useCopyToClipboard } from 'react-use';
import { useTheme } from '@mui/material/styles';
import isMobile from '@/utils/isMobile';

type LightningQRProps = {
  value: string;
};

export function LightningQR({ value }: LightningQRProps) {
  const [, copy] = useCopyToClipboard();
  const intl = useIntl();
  const theme = useTheme();
  return (
    <FlexBox>
      <QRCode
        value={value}
        level="L"
        fgColor={colors.white}
        bgColor={theme.palette.text.secondary}
        onClick={() => {
          copy(value);
          toast(
            intl.formatMessage({
              defaultMessage: 'Address copied to clipboard',
              description:
                'Lightning Donation Address copied to clipboard toast message',
            })
          );
        }}
      />
      {isMobile() && (
        <Typography align="center" variant="caption" mt={1}>
          Tap to copy
        </Typography>
      )}
      <Typography align="center" variant="caption" mt={1}>
        Payments powered by <Link href="https://lnbits.com/">lnbits</Link>
      </Typography>
    </FlexBox>
  );
}
