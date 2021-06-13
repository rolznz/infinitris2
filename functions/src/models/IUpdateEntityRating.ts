import firebase from 'firebase';

export default interface IUpdateEntityRating {
  'readOnly.numRatings': firebase.firestore.FieldValue;
  'readOnly.summedRating': firebase.firestore.FieldValue;
  'readOnly.rating': number;
}
