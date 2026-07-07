// Section 2 of home: "About me" — real bio extracted from WP original
export function About() {
  return (
    <section className="section bg-theme-5">
      <div className="container-page">
        <h2 className="text-sm uppercase tracking-widest text-theme-1 mb-2">
          About me
        </h2>
        <h3 className="font-heading text-2xl md:text-3xl mb-4 max-w-3xl">
          AI consultant specialized in automation, chatbots, and digital agents
          that help businesses scale—without extra overhead. With a decade in
          sales and UX, I build AI-powered systems that sell, serve, and grow
          with you. Your business, just smarter.
        </h3>
        <p className="font-secondary italic text-lg md:text-xl text-text mb-6">
          Building automation flows that work — so you don’t have to.
        </p>
        <div className="prose max-w-3xl text-text leading-relaxed space-y-4">
          <p>
            I’m an AI Automation Consultant with over a decade of experience in
            sales and UX.
          </p>
          <p>
            I specialize in helping businesses scale by transforming manual,
            repetitive processes into streamlined, automated systems that
            deliver measurable results.
          </p>
          <p>
            My background in executive search, digital strategy, and user
            experience gives me a deep understanding of how people think, buy,
            and interact — and I use that to design solutions that not only
            optimize operations, but also improve conversions and customer
            experience.
          </p>
          <p>
            I’ve led high-impact projects across multiple industries,
            consistently increasing revenue and operational efficiency by making
            technology work smarter for the business.
          </p>
        </div>
      </div>
    </section>
  );
}