import Link from 'next/link';

type Props = {
  searchParams?: {
    session_id?: string;
  };
};

export default function PaymentSuccessPage({ searchParams }: Props) {
  const sessionId = searchParams?.session_id;

  return (
    <main className="min-h-screen flex items-center justify-center bg-brand-cream px-6">
      <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl p-10 text-center space-y-6">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100 text-green-600 mx-auto">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-brand-charcoal">Payment Successful</h1>
        <p className="text-gray-600">
          Thanks for upgrading your HealWise learning pass. A receipt is on the way to your email.
        </p>
        {sessionId && (
          <p className="text-sm text-gray-500">
            Stripe session ID: <span className="font-mono">{sessionId}</span>
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Link
            href="/healwise/dashboard"
            className="inline-flex justify-center rounded-lg bg-brand-green-dark px-6 py-3 text-white font-semibold hover:bg-brand-green-dark/90 transition-colors"
          >
            Back to dashboard
          </Link>
          <Link
            href="/pricing"
            className="inline-flex justify-center rounded-lg border border-brand-green-dark px-6 py-3 text-brand-green-dark font-semibold hover:bg-brand-green/10 transition-colors"
          >
            View plans
          </Link>
        </div>
      </div>
    </main>
  );
}
