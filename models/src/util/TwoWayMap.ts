export class TwoWayMap<
  K extends string | number | symbol,
  V extends string | number | symbol
> {
  private _keys: Record<K, V>;
  private _values: Record<V, K>;
  constructor() {
    this._keys = {} as Record<K, V>;
    this._values = {} as Record<V, K>;
  }
  get(key: K) {
    return this._keys[key];
  }
  revGet(value: V) {
    return this._values[value];
  }
  put(key: K, value: V) {
    this._keys[key] = value;
    this._values[value] = key;
  }
  delete(key: K) {
    const value = this._keys[key];
    delete this._keys[key];
    delete this._values[value];
  }
}
