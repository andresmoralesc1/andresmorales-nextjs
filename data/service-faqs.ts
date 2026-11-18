/**
 * FAQ content for the 4 service pages.
 *
 * Localized in English, Spanish and Portuguese for maximum search visibility
 * and rich-snippet eligibility in LATAM, the US, and Brazilian markets.
 *
 * Schema wiring: every FAQ item here is consumed by both:
 *  - the visible <details> accordion (UX / HTML)
 *  - the `faqSchema()` JSON-LD injected in <head> (SEO + rich results)
 *
 * Google requires the visible page to match the structured Q&A verbatim.
 */

export interface ServiceFAQ {
  question: string;
  answer: string;
}

export type ServiceFAQSet = Record<string, ServiceFAQ[]>;

const FAQS_EN: ServiceFAQSet = {
  // /services hub — generic questions across all 3 service lines.
  services: [
    {
      question: 'How do I know which service my project actually needs?',
      answer:
        'Start with a 30-minute call. We walk through your current stack, the manual work that is costing you the most, and the systems that already hold the data. Most projects turn out to need 2 of the 3 service lines (for example, web-development + ai-automation), but the answer is yours, not mine. The call is free and the recommendation is honest even when the recommendation is "you do not need me yet".',
    },
    {
      question: 'Do you work with companies outside Colombia and LATAM?',
      answer:
        'Yes. About a third of active clients are in the US, Mexico, or Spain. Engagement is fully remote; payments work over Wise, Stripe, or bank transfer. The only Colombia-specific thing is that the calendar booking is in Bogotá time, which I flex around for non-LATAM clients.',
    },
    {
      question: 'What if I only need one deliverable (a site, an automation, a UX audit)?',
      answer:
        'Most engagements start with exactly that — a single deliverable — and grow from there. Pricing is per deliverable, not per retainer. You are not signing up for a long-term contract; you are commissioning a piece of work and I am committing to deliver it on time and on scope.',
    },
    {
      question: 'How do you handle source code, IP, and handover?',
      answer:
        'You own everything I produce for you from day one. Source code lives in your GitHub repo (or a new one I create for you under your account), design files are in your Figma, automation flows are exported as JSON you can re-import anywhere, and credentials are stored in your password manager — not mine. If we part ways after the engagement, nothing of yours lives in my accounts.',
    },
    {
      question: 'How is pricing structured?',
      answer:
        'Fixed price per deliverable after a short scoping call. No retainer for the sake of a retainer. You see the line items, you see the hours estimate, you sign off before work starts. If scope changes mid-project, I flag it before doing the extra work and quote it separately.',
    },
    {
      question: 'What happens after the engagement ends?',
      answer:
        'Most clients keep a small monthly retainer for ongoing tweaks and monitoring. Some hand the keys back to their in-house team with documentation and a handover session. Either is fine — the engagement ends when you say it ends, and the work I produce is yours to operate, modify, or hand to anyone you choose.',
    },
  ],

  // /services/web-development
  'web-development': [
    {
      question: 'How long does a typical web development project take?',
      answer:
        'A marketing site ships in 2 to 4 weeks. An e-commerce build runs 4 to 8 weeks. A custom platform with integrations runs 8 to 16 weeks. These are realistic ranges for a single developer shipping end-to-end; the timeline extends when the design phase is still in flight or when there are multiple stakeholders reviewing the same surface.',
    },
    {
      question: 'What stack do you work with?',
      answer:
        'Next.js for the app layer, Postgres for the data layer, Vercel for the deployment layer, Stripe or Wompi for payments, and a headless CMS (Sanity, Contentful, or Strapi) when content is editor-owned. For e-commerce in LATAM, the storefront is usually Next.js + Medusa or a custom Next.js + Shopify Storefront. I pick the boring tool that fits the constraint, not the shiny one that fits the demo.',
    },
    {
      question: 'Do you only ship new sites, or do you also maintain existing ones?',
      answer:
        'Both. About 60% of the work is new builds; the rest is taking over an existing codebase, fixing performance, paying down technical debt, or adding a feature that the original team did not have time for. I do not take over a codebase I cannot read — if the existing code is too tangled to extend sensibly, the honest answer is a rewrite, not a band-aid.',
    },
    {
      question: 'How do you handle SEO and performance?',
      answer:
        'Both are non-negotiable defaults. Every site I ship lands at PageSpeed 100 across the board on desktop (and in the 90s on mobile) and ships with structured data, hreflang tags, sitemap, and the metadata a content editor actually needs. Performance is built in at the architecture level (Next.js App Router, image optimization, font subsetting) rather than bolted on later.',
    },
    {
      question: 'What does a typical e-commerce build cost?',
      answer:
        'A single-region Shopify or Medusa storefront with 1 to 50 SKUs and one payment gateway lands between $2,000 and $8,000 USD. Multi-region with multiple currencies and gateways lands between $8,000 and $20,000. Custom checkout, loyalty, or subscription logic adds another layer. The scoping call locks the line items before work starts.',
    },
    {
      question: 'Do you build the design too, or do you take Figma files from a designer?',
      answer:
        'Both. About half the projects I take a Figma from a designer the client hired separately; about half I design myself, either from scratch or from a rough sketch in Miro. When I design, you get a Figma file you own and can hand to anyone; when I take a Figma, I push back early on anything I think will break in code.',
    },
  ],

  // /services/ui-ux-design
  'ui-ux-design': [
    {
      question: 'What is the difference between a UX audit and a UX redesign?',
      answer:
        'A UX audit is a written report: what is wrong, why it is wrong, what to change, and in what order. You hand it to your dev team (or to me) and they implement. A UX redesign is the same analysis plus a fully designed replacement in Figma that gets implemented directly. Most clients start with the audit, see the value, then move to the redesign.',
    },
    {
      question: 'How long does a UX redesign take?',
      answer:
        'A focused landing page redesign ships in 1 to 2 weeks. A full app redesign (5 to 20 key screens, design system, prototype, handoff) ships in 3 to 6 weeks. The audit before the redesign adds another 1 to 2 weeks. Rushing past those numbers is how you get redesigns that look pretty but do not actually move the metrics you said you cared about.',
    },
    {
      question: 'Do you do user research, or just design from best practices?',
      answer:
        'Both, depending on the budget. For most projects, a research round (5 to 8 user interviews + a synthesis) doubles the cost but also doubles the chance the redesign actually changes behavior. For smaller projects, I skip the interviews and design from analytics + session recordings + heuristic best practice. The call is yours; I will recommend the option that fits the risk.',
    },
    {
      question: 'What tools do you work in?',
      answer:
        'Figma for design, FigJam for whiteboarding, Maze or Useberry for unmoderated usability tests, Hotjar or PostHog for session recordings and heatmaps, Notion for written reports and design systems documentation. I do not use Sketch, Adobe XD, or any tool that locks your design files into a vendor format.',
    },
    {
      question: 'Can you hand off the design to my existing development team?',
      answer:
        'Yes. The handoff includes a Figma file with auto-layout, a documented design system (colors, type, spacing, components), a prototype for the flows that need to feel right before build, and a recorded walkthrough. I stay available during the build for clarifications but am not the developer on your side.',
    },
    {
      question: 'What if I already have a design and just need it implemented well?',
      answer:
        'That is the simpler version of the same engagement. I push back on the Figma early — anywhere the design will not survive code, I flag it before build so we do not discover the problem mid-sprint. Then I implement against the approved Figma with weekly demos and a final QA pass.',
    },
  ],

  // /services/ai-automation
  'ai-automation': [
    {
      question: 'How do you handle data privacy and security with AI models?',
      answer:
        'Your data stays where it already is. I use self-hosted models (Ollama, vLLM) when privacy or cost demands it, and third-party APIs (OpenAI, Anthropic) when speed to ship matters more. The choice is yours per workflow.',
    },
    {
      question: 'What happens after the automation ships?',
      answer:
        'Every flow has a dashboard, every error has an alert, every retry has a story. I monitor what real traffic teaches and iterate. Most clients keep a small monthly retainer for ongoing improvements.',
    },
    {
      question: 'Do you build AI agents and chatbots?',
      answer:
        'Yes. Custom AI agents for support, lead qualification, and internal knowledge. Versioned prompts, human-in-the-loop handoffs, and source-grounded answers so the agent does not hallucinate about your business.',
    },
    {
      question: 'Which automation platforms do you use?',
      answer:
        'n8n for complex workflows requiring self-hosting and full data sovereignty; Make for rapid third-party SaaS integrations; and custom Node/Python microservices when API limitations require custom scripts.',
    },
  ],
};

const FAQS_ES: ServiceFAQSet = {
  // /services hub
  services: [
    {
      question: '¿Cómo sé qué servicio necesita realmente mi proyecto?',
      answer:
        'Comenzamos con una llamada de 30 minutos. Revisamos tu stack actual, el trabajo manual que más costo genera y los sistemas donde ya viven tus datos. La mayoría de proyectos combinan 2 de las 3 líneas (por ejemplo, desarrollo web + automatización con IA), pero la decisión es tuya. La llamada es gratuita y la recomendación es transparente, incluso si la conclusión es que aún no me necesitas.',
    },
    {
      question: '¿Trabajas con empresas fuera de Colombia y Latinoamérica?',
      answer:
        'Sí. Aproximadamente un tercio de mis clientes activos están en Estados Unidos, México y España. El trabajo es 100% remoto; los pagos se gestionan vía Stripe, Wise o transferencia bancaria. Todo el agendamiento se sincroniza en zona horaria de Bogotá (GMT-5), con flexibilidad horaria para clientes internacionales.',
    },
    {
      question: '¿Qué pasa si solo necesito un entregable puntual (un sitio, una automatización, una auditoría UX)?',
      answer:
        'La gran mayoría de proyectos inician exactamente así: con un entregable puntual con alcance definido. Cobro por entregable y no por retención obligatoria. No firmas contratos de permanencia a largo plazo; encargas un entregable y me comprometo a enviarlo a tiempo y dentro del alcance.',
    },
    {
      question: '¿Cómo manejas el código fuente, la propiedad intelectual y el traspaso?',
      answer:
        'Eres dueño de todo lo que construyo para ti desde el primer día. El código fuente vive en tu repositorio de GitHub, los archivos de diseño en tu Figma, los flujos de automatización exportados en JSON portable y las credenciales en tu gestor de contraseñas. Al terminar, nada de tu infraestructura queda retenida en mis cuentas.',
    },
    {
      question: '¿Cómo está estructurado el esquema de precios?',
      answer:
        'Precio fijo por entregable tras una llamada de scoping de 30 minutos. Sin cobros sorpresa. Conoces el desglose de ítems y la estimación antes de iniciar. Si el alcance cambia en el camino, se conversa y cotiza por separado antes de ejecutar cualquier trabajo adicional.',
    },
    {
      question: '¿Qué pasa después de finalizar el proyecto?',
      answer:
        'Muchos clientes conservan un fee mensual pequeño para soporte y optimizaciones continuas. Otros prefieren transferir el control a su equipo interno tras una sesión de capacitación y entrega de documentación. En ambos casos, el sistema queda completamente operativo para tu negocio.',
    },
  ],

  // /services/web-development
  'web-development': [
    {
      question: '¿Cuánto tiempo toma un proyecto de desarrollo web típico?',
      answer:
        'Un sitio web corporativo o landing page toma entre 2 y 4 semanas. Un e-commerce de alto rendimiento toma entre 4 y 8 semanas. Una plataforma web a medida con integraciones complejas toma entre 8 y 16 semanas. Son plazos realistas para desarrollo full-stack entregado con rigor de producción.',
    },
    {
      question: '¿Con qué stack tecnológico trabajas?',
      answer:
        'Next.js 14/15 con App Router y React Server Components en el frontend, PostgreSQL con Prisma o Drizzle en los datos, Vercel o VPS Docker para despliegue, pasarelas de pago (Stripe, Wompi, Bold) y headless CMS (Sanity, Strapi) para que tu equipo edite contenido con facilidad.',
    },
    {
      question: '¿Solo construyes sitios desde cero o también mantienes y optimizas existentes?',
      answer:
        'Ambos. Cerca del 60% son proyectos nuevos y el resto consiste en optimizar código existente, mejorar Core Web Vitals, resolver deuda técnica o agregar features de IA a plataformas en producción.',
    },
    {
      question: '¿Cómo garantizas el SEO y el rendimiento?',
      answer:
        'Son estándares no negociables. Cada sitio se entrega con puntuaciones de PageSpeed de 95-100 en desktop y +90 en mobile, esquema JSON-LD completo (Schema.org), etiquetas hreflang para soporte multi-idioma, sitemap XML dinámico y metadatos Open Graph optimizados.',
    },
    {
      question: '¿Cuánto cuesta típicamente el desarrollo de un e-commerce?',
      answer:
        'Una tienda Shopify o Medusa para una región con 1 a 50 productos y pasarela local oscila entre $2,000 y $8,000 USD. E-commerce multi-moneda o plataformas con checkout personalizado se cotizan tras definir el alcance técnico en la llamada inicial.',
    },
    {
      question: '¿También realizas el diseño de la interfaz o trabajas con Figma externo?',
      answer:
        'Ambas modalidades. Puedo diseñar la experiencia desde cero en Figma o implementar con precisión de píxel los diseños aprobados proporcionados por tu equipo de diseño.',
    },
  ],

  // /services/ui-ux-design
  'ui-ux-design': [
    {
      question: '¿Cuál es la diferencia entre una auditoría UX y un rediseño UI/UX?',
      answer:
        'Una auditoría UX es un informe técnico accionable: identifica fricciones, evalúa métricas de conversión y prioriza mejoras. Un rediseño UX incluye todo el análisis previo más los componentes, flujos y prototipos finales en Figma listos para ser desarrollados.',
    },
    {
      question: '¿Cuánto tiempo toma un rediseño UI/UX?',
      answer:
        'El rediseño de una landing page toma entre 1 y 2 semanas. Una aplicación web o plataforma SaaS completa (de 10 a 25 pantallas clave, design system y prototipo interactivo) toma entre 3 y 6 semanas.',
    },
    {
      question: '¿Haces investigación de usuarios o diseñas basado en heurísticas?',
      answer:
        'Ambos enfoques según el presupuesto y el momento de tu producto: investigación con entrevistas a usuarios reales y pruebas de usabilidad, o auditorías heurísticas basadas en grabaciones de sesión (Hotjar, PostHog) y patrones probados de conversión.',
    },
    {
      question: '¿Qué herramientas utilizas?',
      answer:
        'Figma para diseño de interfaces y sistemas de componentes, FigJam para arquitectura de información, Maze para pruebas con usuarios y Notion para documentación técnica.',
    },
    {
      question: '¿Cómo entregas el diseño a mi equipo de desarrollo?',
      answer:
        'La entrega incluye un archivo de Figma con auto-layout estricto, variables de tokens de diseño (colores, tipografía, espaciado), prototipo navegable y sesión explicativa de handoff grabada.',
    },
    {
      question: '¿Qué pasa si ya tengo un diseño y solo requiero feedback técnico?',
      answer:
        'Revisamos el Figma para detectar inconsistencias antes de iniciar código: componentes difíciles de escalar, riesgos de accesibilidad o problemas de responsive design.',
    },
  ],

  // /services/ai-automation
  'ai-automation': [
    {
      question: '¿Cómo manejas la privacidad y seguridad de los datos con modelos de IA?',
      answer:
        'Tus datos empresariales permanecen bajo tu control. Usamos modelos locales o auto-hospedados (Ollama, vLLM) cuando la privacidad estricta lo exige, y APIs empresariales con acuerdos de no entrenamiento (OpenAI, Anthropic) para máxima velocidad.',
    },
    {
      question: '¿Qué pasa después de que la automatización sale a producción?',
      answer:
        'Cada workflow cuenta con monitoreo de errores, alertas automáticas en Telegram o Slack y reintentos automáticos. Monitoreamos el tráfico real para iterar y perfeccionar la lógica.',
    },
    {
      question: '¿Construyes agentes de IA y chatbots conversacionales?',
      answer:
        'Sí. Agentes de IA para atención al cliente, calificación de prospectos y búsqueda sobre base de conocimiento interna, con prompts versionados y handoff transparente a agentes humanos.',
    },
    {
      question: '¿Qué plataformas de automatización utilizas?',
      answer:
        'n8n para automatizaciones escalables auto-hospedadas sin costos por ejecución; Make para integraciones rápidas con SaaS; y servicios en Node.js/Python cuando se requiere lógica especializada.',
    },
  ],
};

const FAQS_PT: ServiceFAQSet = {
  // /services hub
  services: [
    {
      question: 'Como sei qual serviço meu projeto realmente precisa?',
      answer:
        'Começamos com uma chamada de 30 minutos. Analisamos sua infraestrutura atual, os processos manuais que mais consom tempo e onde vivem seus dados. A maioria dos projetos combina 2 das 3 linhas (por exemplo, desenvolvimento web + automação com IA). A chamada é gratuita e a recomendação é 100% transparente.',
    },
    {
      question: 'Você trabalha com empresas fora da Colômbia e da América Latina?',
      answer:
        'Sim. Cerca de um terço dos clientes ativos estão nos Estados Unidos, México e Espanha. O trabalho é totalmente remoto; pagamentos via Stripe, Wise ou transferência internacional.',
    },
    {
      question: 'E se eu precisar apenas de uma entrega pontual (um site, uma automação, uma auditoria de UX)?',
      answer:
        'A maioria das parcerias começa exatamente assim — com um escopo e entrega específicos. Você contrata o entregável definido sem compromisso de permanência a longo prazo.',
    },
    {
      question: 'Como você lida com código-fonte, propriedade intelectual e entrega?',
      answer:
        'Você é o único proprietário de tudo o que produzo desde o primeiro dia. O código vive no seu GitHub, os arquivos no seu Figma e as automações em JSON portátil. Nada fica retido nas minhas contas.',
    },
    {
      question: 'Como funciona a estrutura de preços?',
      answer:
        'Preço fixo por entregável após a chamada inicial de alinhamento. Você tem clareza total dos custos antes de iniciarmos qualquer linha de código.',
    },
    {
      question: 'O que acontece após a finalização do projeto?',
      answer:
        'Muitos clientes mantêm um acompanhamento mensal para evolução contínua, enquanto outros assumem a gestão interna com documentação e treinamento fornecidos por mim.',
    },
  ],

  // /services/web-development
  'web-development': [
    {
      question: 'Quanto tempo leva um projeto típico de desenvolvimento web?',
      answer:
        'Um site institucional ou landing page leva de 2 a 4 semanas. Um e-commerce leva de 4 a 8 semanas. Plataformas customizadas com integrações levam de 8 a 16 semanas.',
    },
    {
      question: 'Com qual stack tecnológico você trabalha?',
      answer:
        'Next.js 14/15 com App Router, TypeScript, Tailwind CSS, PostgreSQL com Prisma/Drizzle e infraestrutura edge na Vercel ou VPS Docker com Cloudflare.',
    },
    {
      question: 'Você só cria sites novos ou também mantém os existentes?',
      answer:
        'Ambos. Cerca de 60% são projetos do zero e o restante abrange refatorações de código, melhorias de Core Web Vitals e novas funcionalidades em plataformas ativas.',
    },
    {
      question: 'Como você gerencia SEO e performance?',
      answer:
        'São prioridades nativas. Todos os projetos entregam PageSpeed 95-100 no desktop, suporte completo a Schema.org JSON-LD, tags hreflang e sitemaps dinâmicos.',
    },
    {
      question: 'Quanto custa normalmente a criação de um e-commerce?',
      answer:
        'Uma loja virtual de alta conversão costuma variar entre $2.000 e $8.000 USD dependendo do número de SKUs, moedas e integrações de pagamento requeridas.',
    },
    {
      question: 'Você também cria o design ou recebe arquivos do Figma de outro designer?',
      answer:
        'Ambos. Posso desenhar a interface completa no Figma ou implementar com fidelidade visual os layouts fornecidos pela sua equipe.',
    },
  ],

  // /services/ui-ux-design
  'ui-ux-design': [
    {
      question: 'Qual é a diferença entre uma auditoria de UX e um redesign completo?',
      answer:
        'A auditoria de UX é um relatório analítico apontando gargalos de conversão e melhorias imediatas. O redesign inclui a pesquisa mais todos os protótipos e telas no Figma prontos para desenvolvimento.',
    },
    {
      question: 'Quanto tempo leva um redesign de UI/UX?',
      answer:
        'Uma landing page leva de 1 a 2 semanas. Uma aplicação SaaS completa com design system e protótipo interativo leva de 3 a 6 semanas.',
    },
    {
      question: 'Você faz pesquisa com usuários ou apenas aplica melhores práticas?',
      answer:
        'Ambos, conforme a necessidade: entrevistas qualitativas e testes de usabilidade, ou otimizações heurísticas fundamentadas em dados de mapas de calor e navegação real.',
    },
    {
      question: 'Quais ferramentas você usa?',
      answer:
        'Figma para interfaces e design system, FigJam para mapeamento de fluxos, Maze para testes com usuários e Notion para especificações de produto.',
    },
    {
      question: 'Como é feito o handoff para minha equipe de desenvolvimento?',
      answer:
        'Entrega com auto-layout rigoroso no Figma, tokens de design documentados, protótipo navegável e sessão gravada de alinhamento técnico.',
    },
    {
      question: 'E se eu já tiver um design e precisar apenas de uma implementação impecável?',
      answer:
        'Reviso o arquivo Figma para antecipar restrições técnicas e implemento com código limpo e responsivo.',
    },
  ],

  // /services/ai-automation
  'ai-automation': [
    {
      question: 'Como você lida com privacidade de dados e segurança com modelos de IA?',
      answer:
        'Seus dados permanecem na sua infraestrutura. Usamos modelos locais (Ollama, vLLM) para confidencialidade máxima ou APIs corporativas que não utilizam seus dados para treinamento.',
    },
    {
      question: 'O que acontece depois que a automação entra em produção?',
      answer:
        'Cada fluxo conta com monitoramento em tempo real, alertas automáticos em caso de falhas e reprocessamento inteligente de dados.',
    },
    {
      question: 'Você desenvolve agentes de IA e chatbots corporativos?',
      answer:
        'Sim. Desenvolvo agentes de IA para suporte, qualificação de leads e busca semântica em base de conhecimento com respostas precisas e sem alucinações.',
    },
    {
      question: 'Quais plataformas de automação você utiliza?',
      answer:
        'n8n para automações complexas auto-hospedadas sem custos por execução, Make para integrações rápidas e microsserviços em Node.js/Python para necessidades sob medida.',
    },
  ],
};

const FAQS_BY_LOCALE: Record<'en' | 'es' | 'pt', ServiceFAQSet> = {
  en: FAQS_EN,
  es: FAQS_ES,
  pt: FAQS_PT,
};

/**
 * Get the localized FAQs for a service track.
 */
export function getServiceFaqs(track: string, lang: 'en' | 'es' | 'pt' = 'en'): ServiceFAQ[] {
  const set = FAQS_BY_LOCALE[lang] || FAQS_EN;
  return set[track] || FAQS_EN[track] || [];
}

/**
 * Default English FAQs for backwards compatibility with existing consumers.
 */
export const SERVICE_FAQS: ServiceFAQSet = FAQS_EN;
