// from https://stackoverflow.com/a/54178819/4562693
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
