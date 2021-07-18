import { objectToDotNotation } from '../util/objectToDotNotation';

describe('objectToDotNotation', () => {
  test('basic conversion', async () => {
    expect(objectToDotNotation({ a: '1' }, ['a'])).toEqual({
      a: '1',
    });
  });
  test('nested conversion', async () => {
    expect(objectToDotNotation({ a: { b: 'c' } }, ['a.b'])).toEqual({
      'a.b': 'c',
    });
  });
  test('only convert requested properties', async () => {
    expect(objectToDotNotation({ a: { b: 'c', d: 1 } }, ['a.b'])).toEqual({
      'a.b': 'c',
    });
  });
  test('stop at requested level', async () => {
    expect(objectToDotNotation({ a: { b: 'c' } }, ['a'])).toEqual({
      a: { b: 'c' },
    });
  });
});
