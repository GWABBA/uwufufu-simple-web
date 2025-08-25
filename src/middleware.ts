// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const country = req.headers.get('cf-ipcountry') ?? 'US';

  const stripeOnlyCountries = [
    // 🌍 Real-world limitations (PayPal unreliable for subscriptions)
    'KR', // South Korea - send-only, subscriptions often fail
    'VN', // Vietnam - no withdrawals, unstable subscriptions
    'QA',
    'KZ',
    'GE',
    'OM',
    'DO',
    'TW',
    'AM',
    'LK',

    // 🚫 No PayPal support at all
    'AF',
    'BD',
    'BY',
    'CM',
    'CF',
    'CI',
    'KP',
    'EG',
    'GA',
    'GH',
    'HT',
    'IR',
    'IQ',
    'LB',
    'LR',
    'LY',
    'MC',
    'MD',
    'MM',
    'PK',
    'PY',
    'LC',
    'SS',
    'SD',
    'SY',
    'TL',
    'UZ',
    'ZW',
    'CR',
    'TR',
    'RU',

    // ⚠️ Extra edge cases
    'IN', // India - subscriptions/payments very restricted
    'CN', // China - technically works, but unreliable and low adoption
  ];

  // Decide available payment options
  let options: string[];
  if (stripeOnlyCountries.includes(country)) {
    options = ['stripe'];
  } else {
    options = ['paypal'];
  }

  // Inject as a request header for your /plans page
  const res = NextResponse.next();
  res.headers.set('x-payment-options', options.join(','));
  return res;
}

// Only run middleware on the /plans route
export const config = {
  matcher: ['/plans'],
};
