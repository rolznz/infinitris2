import { useCollection } from '@nandorojo/swr-firestore';
import { Donation } from 'infinitris2-models';

const ONE_MONTH_IN_SECONDS = 60 * 60 * 24 * 30;

const oneMonthAgo = new Date(Date.now());
oneMonthAgo.setSeconds(oneMonthAgo.getSeconds() - ONE_MONTH_IN_SECONDS);

export const donationTarget = 10; // sats

export function useDonations() {
  // FIXME: swr-firestore timestamp where query is broken
  const { data: donations } = useCollection<Donation>('donations', {
    /*where: [
      [
        'createdTimestamp',
        '>',
        firebase.firestore.Timestamp.fromDate(new Date('1900-01-01')),
      ],
    ],*/
    orderBy: ['createdTimestamp', 'desc'],
  });
  //console.log(donations);
  const donationsThisMonth = donations
    ?.filter(
      (d) =>
        d.createdTimestamp.seconds > Date.now() / 1000 - ONE_MONTH_IN_SECONDS
    )
    ?.map((d) => d.amount);

  const monthDonationSum = donationsThisMonth?.length
    ? donationsThisMonth.reduce((a, b) => a + b)
    : 0;

  return { donations, monthDonationSum };
}
