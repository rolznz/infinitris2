import firebase from 'firebase';

export default interface IUpdateUserReadOnly {
  'readOnly.coins'?: firebase.firestore.FieldValue;
  'readOnly.networkImpact'?: firebase.firestore.FieldValue;
  'readOnly.affiliateId'?: string;
  'readOnly.referredByAffiliateId'?: string;
}
