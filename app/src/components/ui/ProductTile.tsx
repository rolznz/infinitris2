import React from 'react';

interface ProductTileProps {}

export default function ProductTile(
  props: React.PropsWithChildren<ProductTileProps>
) {
  return <>{props.children}</>;
}
