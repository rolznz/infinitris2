import { getSettingPath, PremiumSettings } from 'infinitris2-models';
import { getCurrentTimestamp, getDb } from '../utils/firebase';

export default async function updateFreePremiumSignups() {
  const settings: PremiumSettings = {
    lastUpdatedTimestamp: getCurrentTimestamp(),
    freeAccountsRemaining: 10,
  };

  await getDb().doc(getSettingPath('premium')).update(settings);
}
