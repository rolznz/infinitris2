import firebase from 'firebase';

export default interface IUpdateEntityReadOnly {
  'readOnly.lastModifiedTimestamp'?: firebase.firestore.Timestamp;
  'readOnly.numTimesModified'?: firebase.firestore.FieldValue;
}
