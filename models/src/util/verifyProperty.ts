import { RecursiveKeyOf } from '@models/util/RecursiveKeyOf';

export function verifyProperty<T>(property: RecursiveKeyOf<Required<T>>) {
  return property;
}
