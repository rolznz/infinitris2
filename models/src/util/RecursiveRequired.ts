// from https://gist.github.com/gomezcabo/dff1d95fd1eb354f686d6606a511d7da
export type RecursiveRequired<T> = Required<{
  [P in keyof T]: T[P] extends object | undefined
    ? RecursiveRequired<Required<T[P]>>
    : T[P];
}>;
