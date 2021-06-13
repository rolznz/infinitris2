import firebase from 'firebase';

export default interface IUpdateUserReadOnly {
  'readOnly.credits'?: firebase.firestore.FieldValue;
}
