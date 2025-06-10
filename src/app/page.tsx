import Hero from './components/Hero';
import QuemSomos from './components/QuemSomos';
import Servicos from './components/Servicos';
import Diferencial from './components/Diferencial';
import Depoimentos from './components/Depoimentos';
import CTA from './components/CTA';
import Footer from './components/Footer';

export default function Home() {
  return (
    <main>
      <Hero />
      <QuemSomos />
      <Servicos />
      <Diferencial />
      <Depoimentos />
      <CTA />
      <Footer />
    </main>
  );
}
