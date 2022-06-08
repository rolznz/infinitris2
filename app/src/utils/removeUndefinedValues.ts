export default function removeUndefinedValues(original: object) {
  // delete undefined values from the changes so that the object is compatible with firestore
  return JSON.parse(JSON.stringify(original));
}
