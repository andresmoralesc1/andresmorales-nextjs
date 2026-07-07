// Email unsubscribe confirmation page (page id 1501)
export const metadata = {
  title: 'Unsubscribed',
  description:
    'You are unsubscribed. No further emails will be sent to this address.',
};

export default function UnsubscribePage() {
  return (
    <section className="section bg-primary">
      <div className="container-page max-w-2xl text-center">
        <h1 className="font-heading text-3xl md:text-4xl mb-4">
          You’re unsubscribed
        </h1>
        <p className="text-text text-lg mb-8">
          No further emails will be sent to this address. If this was a
          mistake, you can re-subscribe from any of our email footers.
        </p>
        <a href="/" className="btn-outline">
          Back to home
        </a>
      </div>
    </section>
  );
}
