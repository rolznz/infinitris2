import stableStringify from './stableStringify';

export default function prettyStringify(value: any) {
  return stableStringify(value, {
    space: 2,
  });
}
