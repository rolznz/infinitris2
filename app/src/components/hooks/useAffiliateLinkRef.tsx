import localStorageKeys from '@/utils/localStorageKeys';
import { useHistory, useLocation } from 'react-router-dom';

export default function useAffiliateLinkRef() {
  const location = useLocation();
  const history = useHistory();
  const queryParams = new URLSearchParams(location.search);
  const affiliateLinkKey = 'ref';
  const affiliateId = queryParams.get(affiliateLinkKey);
  if (affiliateId) {
    localStorage.setItem(localStorageKeys.referredByAffiliateId, affiliateId);
    queryParams.delete(affiliateLinkKey);
    history.replace({
      search: queryParams.toString(),
    });
  }
}
