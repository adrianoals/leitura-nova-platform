import Hero from '@/components/site/sections/Hero';
import About from '@/components/site/sections/About';
import Services from '@/components/site/sections/Services';
import Differentiators from '@/components/site/sections/Differentiators';
import Testimonials from '@/components/site/sections/Testimonials';
import Contact from '@/components/site/sections/Contact';
import Footer from '@/components/site/layout/Footer';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://leituranova.com.br';

const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Leitura Nova',
    description: 'Soluções de leitura e gestão de consumo de água e gás para condomínios. Telemetria, medição visual, relatórios e economia comprovada.',
    url: SITE_URL,
    telephone: '+55-11-93362-0044',
    email: 'contato@leituranova.com.br',
    address: {
        '@type': 'PostalAddress',
        streetAddress: 'Av. Esperança, 827, Sala 01',
        addressLocality: 'Guarulhos',
        addressRegion: 'SP',
        addressCountry: 'BR',
    },
    areaServed: 'BR',
    priceRange: '$$',
};

export default function Home() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <main className="font-sans text-gray-900">
                <Hero />
                <About />
                <Services />
                <Differentiators />
                <Testimonials />
                <Contact />
                <Footer />
            </main>
        </>
    );
}
