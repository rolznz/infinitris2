import FlexBox from '@/components/ui/FlexBox';
import { Intersection } from '@/components/ui/Intersection';
import { BoxProps } from '@mui/material/Box';
import { limit, QueryDocumentSnapshot, startAfter } from 'firebase/firestore';
import React from 'react';
import { useCollection, UseCollectionOptions } from 'swr-firestore';

export type InfiniteLoaderProps<T> = {
  items: QueryDocumentSnapshot<T>[];
  renderItem(item: QueryDocumentSnapshot<T>): React.ReactNode;
  itemKey?(item: QueryDocumentSnapshot<T>): string;
  onNewItemsLoaded(items: QueryDocumentSnapshot<T>[]): void;
  itemWidth: number;
  itemHeight: number;
  numColumns: number;
  collectionPath: string;
  useCollectionOptions: UseCollectionOptions;
} & BoxProps;

export function InfiniteLoader<T>({
  items,
  collectionPath,
  useCollectionOptions,
  itemWidth,
  itemHeight,
  numColumns,
  itemKey,
  renderItem,
  onNewItemsLoaded,
  ...props
}: InfiniteLoaderProps<T>) {
  const [loadMore, setLoadMore] = React.useState(items.length === 0);
  const lastItem = items[items.length - 1];
  const fetchLimit = numColumns * 2;

  const onInView = React.useCallback(
    (index: number) => {
      if (index > items.length - numColumns) {
        setLoadMore(true);
      }
    },
    [setLoadMore, numColumns, items.length]
  );

  const useCollectionOptionsWithPaging = React.useMemo(
    () => ({
      ...useCollectionOptions,
      constraints: [
        ...(useCollectionOptions.constraints || []),
        ...(lastItem ? [startAfter(lastItem)] : []),
        limit(fetchLimit),
      ],
    }),
    [fetchLimit, lastItem, useCollectionOptions]
  );

  // TODO: useCollection purchases for my-blocks
  const { data: newItems } = useCollection<T>(
    loadMore ? collectionPath : null,
    useCollectionOptionsWithPaging
  );

  React.useEffect(() => {
    if (newItems?.length) {
      onNewItemsLoaded(newItems as QueryDocumentSnapshot<T>[]);
      setLoadMore(false);
    }
  }, [newItems, onNewItemsLoaded]);

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
          onInView={onInView}
        >
          {renderItem(item)}
        </Intersection>
      ))}
    </FlexBox>
  );
}
