import FlexBox from '@/components/ui/FlexBox';
import { textShadows } from '@/theme/theme';
import Typography from '@mui/material/Typography';
import { colors } from 'infinitris2-models';
import useSearchParam from 'react-use/lib/useSearchParam';

// example: http://localhost:3000/trailer-feature?pattern=6&color=7&text=Mind-Bending+Challenges
export function TrailerFeaturePage() {
  const color = parseInt(useSearchParam('color') ?? '0');
  const pattern = useSearchParam('pattern');
  const text = useSearchParam('text');
  const text2 = useSearchParam('text2');

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: colors[color].hex,
        pointerEvents: 'none',
        zIndex: 999999999,
      }}
    >
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: `url(${process.env.REACT_APP_IMAGES_ROOT_URL}/patterns/pattern_${pattern}.svg)`,
          backgroundRepeat: 'repeat',
          backgroundSize: Math.max(window.innerWidth, window.innerHeight) / 2,
          opacity: 1,
          pointerEvents: 'none',
        }}
      >
        <FlexBox height="100%">
          <Typography
            variant="h1"
            sx={{
              color: 'white',
              textShadow: textShadows.base,
              fontSize: '8vw',
              textAlign: 'center',
              width: '70vw',
              lineHeight: '10vw',
            }}
          >
            {text}
            <br />
            {text2}
          </Typography>
        </FlexBox>
      </div>
    </div>
  );
}
