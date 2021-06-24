import firebase from 'firebase';

export default interface IUpdateAffiliateReadOnly {
  'readOnly.numConversions'?: firebase.firestore.FieldValue;
}
