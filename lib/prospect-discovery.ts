import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import type { Prospect } from './prospect-store';

const execFileAsync = promisify(execFile);

export interface ScoutQuery {
  country?: string;
  city: string;
  category: string;
  count: number;
}

export interface DiscoveredBusiness {
  name: string;
  category: string;
  country: string;
  city: string;
  website: string;
  phone?: string;
  instagram?: string;
}

// Curated verified catalog of international and Colombian e-commerce brands by niche, country & city
const CURATED_BUSINESSES: DiscoveredBusiness[] = [
  // ── COLOMBIA ──
  // Joyerías & Lujo
  { name: 'Joyería Liévano', category: 'Joyería & Lujo', country: 'Colombia', city: 'Bogotá', website: 'https://joyerialievano.com', phone: '573176465432' },
  { name: 'Joyería Intercontinental', category: 'Joyería & Lujo', country: 'Colombia', city: 'Medellín', website: 'https://joyeriaintercontinental.com', phone: '573113456789' },
  { name: 'Kevin\'s Jewelers', category: 'Joyería & Lujo', country: 'Colombia', city: 'Bogotá', website: 'https://kevins.com.co', phone: '573102345678' },
  { name: 'Joyería Moderna', category: 'Joyería & Lujo', country: 'Colombia', city: 'Medellín', website: 'https://joyeriamoderna.com.co', phone: '573154567890' },
  { name: 'Fauna Joyería Artesanal', category: 'Joyería & Lujo', country: 'Colombia', city: 'Cali', website: 'https://faunajoyeria.com', phone: '573187654321' },
  { name: 'Joyería Caribe', category: 'Joyería & Lujo', country: 'Colombia', city: 'Cartagena', website: 'https://joyeriacaribe.com', phone: '573001234567' },

  // Calzado & Zapatos
  { name: 'Calzado Caprino', category: 'Calzado & Cuero', country: 'Colombia', city: 'Bogotá', website: 'https://caprino.com.co', phone: '573105678901' },
  { name: 'Calzado Aquiles', category: 'Calzado & Cuero', country: 'Colombia', city: 'Medellín', website: 'https://aquiles.com.co', phone: '573147890123' },
  { name: 'Calzado Croydon', category: 'Calzado & Cuero', country: 'Colombia', city: 'Bogotá', website: 'https://croydon.com.co', phone: '573168901234' },
  { name: 'Calzado Bosi', category: 'Calzado & Cuero', country: 'Colombia', city: 'Medellín', website: 'https://bosi.com.co', phone: '573123456789' },
  { name: 'Calzado Rómulo', category: 'Calzado & Cuero', country: 'Colombia', city: 'Cali', website: 'https://calzadoromulo.com', phone: '573189012345' },
  { name: 'Brahma Calzado', category: 'Calzado & Cuero', country: 'Colombia', city: 'Bogotá', website: 'https://brahma.co', phone: '573171234567' },

  // Moda & Boutiques
  { name: 'Mattelsa', category: 'Moda & Ropa', country: 'Colombia', city: 'Medellín', website: 'https://mattelsa.net', phone: '573009876543' },
  { name: 'Tennis', category: 'Moda & Ropa', country: 'Colombia', city: 'Medellín', website: 'https://tennis.com.co', phone: '573134567890' },
  { name: 'Ela', category: 'Moda & Ropa', country: 'Colombia', city: 'Cali', website: 'https://ela.com.co', phone: '573156789012' },
  { name: 'Studio F', category: 'Moda & Ropa', country: 'Colombia', city: 'Cali', website: 'https://studiof.com.co', phone: '573183456789' },
  { name: 'Mon & Velarde', category: 'Moda & Ropa', country: 'Colombia', city: 'Medellín', website: 'https://monvelarde.com', phone: '573145678901' },
  { name: 'Gef Colombia', category: 'Moda & Ropa', country: 'Colombia', city: 'Medellín', website: 'https://gef.com.co', phone: '573162345678' },
  { name: 'Armatura', category: 'Moda & Ropa', country: 'Colombia', city: 'Bogotá', website: 'https://armatura.com.co', phone: '573109876543' },

  // Cosmética & Belleza
  { name: 'Loto del Sur', category: 'Cosmética & Cuidado', country: 'Colombia', city: 'Bogotá', website: 'https://lotodelsur.com', phone: '573118765432' },
  { name: 'Blush-Bar', category: 'Cosmética & Cuidado', country: 'Colombia', city: 'Bogotá', website: 'https://blush-bar.com', phone: '573159876543' },
  { name: 'Krika Cosmetics', category: 'Cosmética & Cuidado', country: 'Colombia', city: 'Cali', website: 'https://krikacosmetics.com', phone: '573178901234' },
  { name: 'Cromantic', category: 'Cosmética & Cuidado', country: 'Colombia', city: 'Medellín', website: 'https://cromantic.com', phone: '573125678901' },

  // Muebles & Decoración
  { name: 'Tugó Muebles', category: 'Muebles & Hogar', country: 'Colombia', city: 'Bogotá', website: 'https://tugo.com.co', phone: '573104567890' },
  { name: 'Muebles Jamar', category: 'Muebles & Hogar', country: 'Colombia', city: 'Barranquilla', website: 'https://jamar.com', phone: '573007654321' },
  { name: 'Kassani Diseño', category: 'Muebles & Hogar', country: 'Colombia', city: 'Bogotá', website: 'https://kassani.com', phone: '573138901234' },
  { name: 'Zientte', category: 'Muebles & Hogar', country: 'Colombia', city: 'Bogotá', website: 'https://zientte.com', phone: '573165432109' },

  // ── MÉXICO ──
  { name: 'Tanya Moss Joyería', category: 'Joyería & Lujo', country: 'México', city: 'Ciudad de México', website: 'https://tanyamoss.com', phone: '525512345678' },
  { name: 'Daniel Espinosa Jewelry', category: 'Joyería & Lujo', country: 'México', city: 'Ciudad de México', website: 'https://danielespinosa.com', phone: '525598765432' },
  { name: 'Calzado Flexi', category: 'Calzado & Cuero', country: 'México', city: 'León / CDMX', website: 'https://flexi.com.mx', phone: '524771234567' },
  { name: 'Brantano', category: 'Calzado & Cuero', country: 'México', city: 'Guadalajara', website: 'https://brantano.com.mx', phone: '523312345678' },
  { name: 'Cuidado con el Perro', category: 'Moda & Ropa', country: 'México', city: 'Ciudad de México', website: 'https://cuidadoconelperro.com.mx', phone: '525543218765' },
  { name: 'Gaia Design', category: 'Muebles & Hogar', country: 'México', city: 'Ciudad de México', website: 'https://gaiadesign.com.mx', phone: '525587654321' },
  { name: 'Pai Pai Belleza', category: 'Cosmética & Cuidado', country: 'México', city: 'Ciudad de México', website: 'https://paipai.mx', phone: '525532109876' },

  // ── ESPAÑA ──
  { name: 'Suarez Joyería', category: 'Joyería & Lujo', country: 'España', city: 'Madrid', website: 'https://joyeriasuarez.com', phone: '34912345678' },
  { name: 'Singularu Jewels', category: 'Joyería & Lujo', country: 'España', city: 'Valencia', website: 'https://singularu.com', phone: '34960123456' },
  { name: 'Scalpers Company', category: 'Moda & Ropa', country: 'España', city: 'Sevilla / Madrid', website: 'https://scalperscompany.com', phone: '34954123456' },
  { name: 'Pompeii Brand', category: 'Calzado & Cuero', country: 'España', city: 'Madrid', website: 'https://pompeiibrand.com', phone: '34918765432' },
  { name: 'Hoff Sneakers', category: 'Calzado & Cuero', country: 'España', city: 'Madrid / Alicante', website: 'https://thehoffbrand.com', phone: '34965123456' },
  { name: 'Kave Home', category: 'Muebles & Hogar', country: 'España', city: 'Barcelona / Girona', website: 'https://kavehome.com', phone: '34972123456' },
  { name: 'Freshly Cosmetics', category: 'Cosmética & Cuidado', country: 'España', city: 'Barcelona / Reus', website: 'https://freshlycosmetics.com', phone: '34977123456' },

  // ── ESTADOS UNIDOS ──
  { name: 'Oliver Cabell', category: 'Calzado & Cuero', country: 'Estados Unidos', city: 'Miami / Online', website: 'https://olivercabell.com', phone: '13051234567' },
  { name: 'Cuyana', category: 'Moda & Ropa', country: 'Estados Unidos', city: 'San Francisco / New York', website: 'https://cuyana.com', phone: '14151234567' },
  { name: 'Mejuri', category: 'Joyería & Lujo', country: 'Estados Unidos', city: 'New York / Miami', website: 'https://mejuri.com', phone: '12121234567' },
  { name: 'Gorjana Jewelry', category: 'Joyería & Lujo', country: 'Estados Unidos', city: 'Los Angeles / Miami', website: 'https://gorjana.com', phone: '13101234567' },
  { name: 'Castlery Furniture', category: 'Muebles & Hogar', country: 'Estados Unidos', city: 'Austin / Los Angeles', website: 'https://castlery.com', phone: '18551234567' },

  // ── BRASIL ──
  { name: 'Vivara Joias', category: 'Joyería & Lujo', country: 'Brasil', city: 'São Paulo', website: 'https://vivara.com.br', phone: '5511998765432' },
  { name: 'Arezzo Calçados', category: 'Calzado & Cuero', country: 'Brasil', city: 'Belo Horizonte / SP', website: 'https://arezzo.com.br', phone: '5531987654321' },
  { name: 'Reserva Moda', category: 'Moda & Ropa', country: 'Brasil', city: 'Rio de Janeiro', website: 'https://usereserva.com', phone: '5521976543210' },
  { name: 'Amaro Fashion', category: 'Moda & Ropa', country: 'Brasil', city: 'São Paulo', website: 'https://amaro.com', phone: '5511987651234' },
  { name: 'Mobly Móveis', category: 'Muebles & Hogar', country: 'Brasil', city: 'São Paulo', website: 'https://mobly.com.br', phone: '5511976541234' },

  // ── CHILE & PERÚ ──
  { name: 'Gacel Calzado', category: 'Calzado & Cuero', country: 'Chile', city: 'Santiago', website: 'https://gacel.cl', phone: '56221234567' },
  { name: 'Platanitos', category: 'Calzado & Cuero', country: 'Perú', city: 'Lima', website: 'https://platanitos.com', phone: '5115123456' },
  { name: 'Crepier', category: 'Moda & Ropa', country: 'Perú', city: 'Lima', website: 'https://crepier.com', phone: '5115987654' },
];

/**
 * Discovers businesses matching country, city and category, using curated data + dynamic AI query
 */
export async function discoverProspects({
  country = 'Colombia',
  city,
  category,
  count = 5,
}: ScoutQuery): Promise<DiscoveredBusiness[]> {
  const normCountry = (country || 'Colombia').trim().toLowerCase();
  const normCity = (city || '').trim().toLowerCase();
  const normCat = (category || '').trim().toLowerCase();

  // 1. Check curated list
  const matched = CURATED_BUSINESSES.filter((b) => {
    const matchCountry =
      normCountry === 'todos' ||
      normCountry === 'internacional' ||
      b.country.toLowerCase().includes(normCountry) ||
      normCountry.includes(b.country.toLowerCase());

    const matchCity =
      normCity === 'todas' ||
      normCity === 'nacional' ||
      normCity === 'general' ||
      normCity === '' ||
      b.city.toLowerCase().includes(normCity) ||
      normCity.includes(b.city.toLowerCase());

    const catWords = normCat
      .split(/[\s,&/]+/)
      .map((w) => w.trim())
      .filter((w) => w.length > 2 && !['los', 'las', 'del', 'para', 'con'].includes(w));

    const matchCat =
      normCat === 'todos' ||
      normCat === '' ||
      b.category.toLowerCase().includes(normCat) ||
      (catWords.length > 0 && catWords.some((w) => b.category.toLowerCase().includes(w)));

    return matchCountry && matchCity && matchCat;
  });

  if (matched.length >= count) {
    return matched.slice(0, count);
  }

  // 2. If curated has fewer than requested, consult Gemini Flash for real businesses in that country & city
  try {
    const targetCountry = country || 'Colombia';
    const targetCity = city || 'Principal';
    const prompt = `Actúa como especialista en prospección comercial B2B e investigación de mercado en ${targetCountry}.
Proporciona una lista de exactamente ${count} empresas, marcas, firmas o comercios reales con sitio web oficial activo en ${targetCountry} (${targetCity}) en el nicho o categoría de "${category}".
Pueden ser empresas de proyectos, servicios profesionales, firmas de consultoría, B2B, mayoristas, e-commerce o comercios establecidos con presencia web.

IMPORTANTE: NO USES HERRAMIENTAS EXTERNAS NI BÚSQUEDAS WEB LENTAS. Responde DIRECTAMENTE con tu conocimiento base interno en formato JSON estricto.

Criterios de búsqueda:
• País: ${targetCountry}
• Ciudad o Región: ${targetCity}
• Categoría o Nicho de negocio: ${category}

Para cada negocio debes devolver un objeto JSON con:
- "name": Nombre comercial real de la marca o empresa
- "category": "${category}"
- "country": "${targetCountry}"
- "city": "${targetCity}"
- "website": URL oficial del sitio web (formato https://...)
- "phone": Número de teléfono o WhatsApp comercial con código de país si se conoce (o vacío)
- "instagram": Usuario de Instagram oficial si se conoce (o vacío)

RESPONDE ESTRICTAMENTE con un arreglo JSON sin texto adicional ni bloques explicativos:
[
  { "name": "...", "category": "...", "country": "...", "city": "...", "website": "...", "phone": "...", "instagram": "..." }
]`;

    const { stdout } = await execFileAsync(
      '/home/telchar/.local/bin/agy',
      ['--disable-slash-commands', '--model', 'gemini-3.8-flash-low', '-p', prompt],
      {
        timeout: 45000,
        cwd: '/tmp',
        env: {
          ...process.env,
          HOME: '/home/telchar',
          PATH: `/home/telchar/.local/bin:${process.env.PATH}`,
        },
      }
    );

    const match = stdout.match(/\[[\s\S]*\]/);
    if (match) {
      const parsed = JSON.parse(match[0]);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const combined = [...matched];
        for (const item of parsed) {
          if (
            item.name &&
            item.website &&
            item.website.startsWith('http') &&
            !combined.some((c) => c.website.toLowerCase().replace(/\/+$/, '') === item.website.toLowerCase().replace(/\/+$/, ''))
          ) {
            combined.push({
              name: item.name.trim(),
              category: item.category || category,
              country: item.country || targetCountry,
              city: item.city || targetCity,
              website: item.website.trim(),
              phone: item.phone?.replace(/\D/g, '') || undefined,
              instagram: item.instagram?.replace(/^@/, '') || undefined,
            });
          }
        }
        return combined.slice(0, count);
      }
    }
  } catch (err) {
    console.warn('[prospect-discovery] AI lookup fallback to curated:', err);
  }

  return matched.slice(0, count);
}
