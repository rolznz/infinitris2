// from https://stackoverflow.com/a/39419171/4562693
export function assertUnreachable(x: never): never {
  throw new Error("Didn't expect to get here");
}
