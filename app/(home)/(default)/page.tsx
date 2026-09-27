
import Programs from '@/components/SmallProgram';
import SmallAbout from '@/components/SmallAbout';
import HeroNEW from '@/components/HeroNew';
import ProgramsSection from '@/components/ProgramsNew';
import WhyChooseUs from '@/components/BlogComponents';
import Homecta from '@/components/HomeCta';
import Daycare from '@/components/Daycare';
import FaqSection from '@/components/Faqsection';

export default function Page() {
  return (
    <div className="w-full  text-white  ">
      <HeroNEW />
      <ProgramsSection />
      <Daycare />
      <Programs />
      <WhyChooseUs />
      <FaqSection />

    </div>
  );
}
