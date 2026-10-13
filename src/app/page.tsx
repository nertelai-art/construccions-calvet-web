import { BeforeAfter } from '@/components/home/BeforeAfter';
import { Company } from '@/components/home/Company';
import { Faq } from '@/components/home/Faq';
import { Hero } from '@/components/home/Hero';
import { Quote } from '@/components/home/Quote';
import { Services } from '@/components/home/Services';
import { Showroom } from '@/components/home/Showroom';
import { Works } from '@/components/home/Works';
import { MasiaShowcase } from '@/components/masia/MasiaShowcase';
import { Footer } from '@/components/site/Footer';
import { Header } from '@/components/site/Header';

export default function HomePage() {
  return (
    <>
      <Header />
      <main id="contingut">
        <Hero />
        <MasiaShowcase index="01" />
        <Services index="02" />
        <BeforeAfter index="03" />
        <Works index="04" />
        <Showroom index="05" />
        <Company index="06" />
        <Faq index="07" />
        <Quote index="08" />
      </main>
      <Footer />
    </>
  );
}
