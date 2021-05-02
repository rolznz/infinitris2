import localStorageKeys from '@/utils/localStorageKeys';
import { useSearchParam } from 'react-use';

export default function useAffiliateLinkRef() {
  const affiliateId = useSearchParam('ref');
  if (affiliateId) {
    localStorage.setItem(localStorageKeys.referredByAffiliateId, affiliateId);
  }
}
