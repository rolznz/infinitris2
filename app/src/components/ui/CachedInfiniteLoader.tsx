import FlexBox from '@/components/ui/FlexBox';
import { Intersection } from '@/components/ui/Intersection';
import { BoxProps } from '@mui/material/Box';
import React from 'react';

export type CachedInfiniteLoaderProps<T> = {
  items: T[];
  renderItem(item: T, index: number): React.ReactNode;
  itemKey?(item: T): string;
  itemWidth: number;
  itemHeight: number;
} & BoxProps;

export function CachedInfiniteLoader<T extends { id: string }>({
  items,
  itemWidth,
  itemHeight,
  itemKey,
  renderItem,
  ...props
}: CachedInfiniteLoaderProps<T>) {
  return (
    <FlexBox
      width="100%"
      flexDirection="row"
      flexWrap="wrap"
      justifyContent="flex-start"
      alignItems="flex-start"
      {...props}
    >
      {items.map((item, index) => (
        <Intersection
          key={itemKey?.(item) ?? item.id}
          width={itemWidth}
          height={itemHeight}
          index={index}
        >
          {renderItem(item, index)}
        </Intersection>
      ))}
    </FlexBox>
  );
}
