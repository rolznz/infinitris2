export function removeUndefinedValues(original: object) {
  // delete undefined values from the changes so that the object is compatible with firestore
  // NOTE: THIS WILL BREAK FIRESTORE TIMESTAMPS
  return JSON.parse(JSON.stringify(original));
}
