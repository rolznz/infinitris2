import { useCollection, UseCollectionOptions } from 'swr-firestore';
import { Donation } from 'infinitris2-models';
import { orderBy, Timestamp, where } from 'firebase/firestore';
import React from 'react';

const ONE_MONTH_IN_SECONDS = 60 * 60 * 24 * 30;

const oneMonthAgo = new Date(Date.now());
oneMonthAgo.setSeconds(oneMonthAgo.getSeconds() - ONE_MONTH_IN_SECONDS);

export const donationTarget = 10; // sats

export function useDonations(active = true, listen = false) {
  const useDonationOptions: UseCollectionOptions = React.useMemo(
    () => ({
      constraints: [
        where(
          'createdTimestamp',
          '>',
          Timestamp.fromDate(new Date('1900-01-01'))
        ),
        orderBy('createdTimestamp', 'desc'),
      ],
      listen,
    }),
    [listen]
  );

  // FIXME: swr-firestore timestamp where query is broken
  const { data: donations } = useCollection<Donation>(
    active ? 'donations' : null,
    useDonationOptions
  );
  const donationsThisMonth = donations
    ?.filter(
      (donation) =>
        donation.data()!.createdTimestamp.seconds >
        Date.now() / 1000 - ONE_MONTH_IN_SECONDS
    )
    ?.map((donation) => donation.data()!.amount);

  const monthDonationSum = donationsThisMonth?.length
    ? donationsThisMonth.reduce((a, b) => a + b)
    : 0;

  return { donations, monthDonationSum };
}
