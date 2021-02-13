export default function removeUndefinedValues(original: object) {
  // delete undefined values from the changes so that the object is compatible with firestore
  const cleanedObject = {};
  Object.keys(original).forEach((key) => {
    if ((original as any)[key] !== undefined)
      (cleanedObject as any)[key] = (original as any)[key];
  });
  return cleanedObject;
}
