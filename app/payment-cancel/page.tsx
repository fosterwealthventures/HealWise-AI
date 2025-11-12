import Link from 'next/link';

export default function PaymentCancelPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-brand-cream px-6">
      <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl p-10 text-center space-y-6">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-amber-100 text-amber-600 mx-auto">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-brand-charcoal">Payment canceled</h1>
        <p className="text-gray-600">
          No charges were made. You can try the checkout again or keep exploring HealWise on the free plan.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Link
            href="/pricing"
            className="inline-flex justify-center rounded-lg bg-brand-green-dark px-6 py-3 text-white font-semibold hover:bg-brand-green-dark/90 transition-colors"
          >
            Return to pricing
          </Link>
          <Link
            href="/healwise/dashboard"
            className="inline-flex justify-center rounded-lg border border-gray-300 px-6 py-3 text-gray-700 font-semibold hover:bg-gray-100 transition-colors"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
