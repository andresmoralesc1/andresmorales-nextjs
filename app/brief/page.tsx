import BriefWizard from '@/components/brief/BriefWizard';

export const metadata = {
  title: 'Project Brief',
  description:
    'Tell me about your project in five short steps so I can scope it on the first call. Five steps, about five minutes.',
};

// "brief" page — 5-step wizard intake. Stored draft in localStorage so
// users can come back without losing context. Submits to /api/brief
// (Brevo → andres@andresmorales.com.co).
export default function BriefPage() {
  return (
    <section className="section bg-background">
      <div className="container-page max-w-3xl">
        <h1 className="font-heading text-4xl md:text-5xl mb-4">Project Brief</h1>
        <p className="text-text text-lg mb-10">
          A few quick questions so I can scope your project in the first call.
          The more context, the better. Five steps, takes ~5 minutes.
        </p>

        <BriefWizard />
      </div>
    </section>
  );
}
