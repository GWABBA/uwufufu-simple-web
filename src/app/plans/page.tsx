// app/plans/page.tsx
import PlansPageClient from '../../components/plans/PlansPageClient';
import { headers } from 'next/headers';

export default async function PlansPage() {
  const headersList = await headers(); // 👈 await here
  const paymentOptions = headersList.get('x-payment-options')?.split(',') ?? [];

  return <PlansPageClient paymentOptions={paymentOptions} />;
}
