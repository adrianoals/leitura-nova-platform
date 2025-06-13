import Hero from '@/components/sections/Hero';
import About from '@/components/sections/About';
import Services from '@/components/sections/Services';
import Differentiators from '@/components/sections/Differentiators';
import Testimonials from '@/components/sections/Testimonials';
import Contact from '@/components/sections/Contact';
import Footer from '@/components/layout/Footer';

export default function Home() {
  return (
    <main className="font-sans text-gray-900">
      <Hero />
      <About />
      <Services />
      <Differentiators />
      <Testimonials />
      <Contact />
      <Footer />
    </main>
  );
}
