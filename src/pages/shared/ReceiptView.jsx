// 80G receipt view (Part 10.2). Number SB/80G/<year>/xxxxxx, donor name, masked
// PAN, full amount paid (including the platform fee), date, payment reference,
// trust details and the 80G line. The trust's CA is to confirm the wording.
import React from 'react';
import { useStore } from '../../store/StoreProvider';
import * as sel from '../../store/selectors';
import { ReceiptCard } from '../../components/ui';

export function ReceiptView({ receipt }) {
  const { state } = useStore();
  const d = state.donations.find((x) => x.id === receipt.donationId);
  const sp = d && sel.getSponsor(state, d.sponsorId);
  return (
    <div className="space-y-3">
      <ReceiptCard receipt={receipt} donorName={sp?.org?.name || sp?.displayName || 'Donor'} paymentRef={d?.paymentRef} date={receipt.issuedAt} />
      <p className="text-[12px] text-center text-[#52525B] dark:text-[#A1A1AA]">
        The trust files Form 10BD each year and issues Form 10BE to donors. Receipt wording to be confirmed by the trust&apos;s CA.
      </p>
    </div>
  );
}
