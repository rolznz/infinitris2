import React from 'react';
import { useInView } from 'react-intersection-observer';

const _Intersection = ({
  children,
  width,
  height,
  index,
  onInView,
}: React.PropsWithChildren<{
  width: number;
  height: number;
  index: number;
  onInView: (index: number) => void;
}>) => {
  const { ref, inView } = useInView({ threshold: 0, rootMargin: '500px' });
  React.useEffect(() => {
    if (inView) {
      onInView(index);
    }
  }, [inView, onInView, index]);

  const style = React.useMemo(
    () => ({ width, height, overflow: 'hidden' }),
    [width, height]
  );

  return (
    <div ref={ref} style={style}>
      {inView && children}
    </div>
  );
};

export const Intersection = React.memo(_Intersection, () => true);
