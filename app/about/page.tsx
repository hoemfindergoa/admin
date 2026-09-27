'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Target, Eye, Rocket, Star } from 'lucide-react';
import { Luckiest_Guy, Nunito, Caveat } from 'next/font/google';
import Image, { StaticImageData } from 'next/image';
import OrganizationSection from '@/components/organizationSection';

// --- COMPONENTS ---
import AboutHeader from '@/components/AboutHeader';

// --- IMAGES ---
import boywithfootball from "../../public/test/616.webp"; 
import girlwithbook from "../../public/test/632.webp";
import boywithelephant from "../../public/test/634.webp";
import bgPattern from "../../public/test/642.webp";

const bubbleFont = Luckiest_Guy({ subsets: ['latin'], weight: ['400'] });
const bodyFont = Nunito({ subsets: ['latin'], weight: ['600', '800'] });
const handFont = Caveat({ subsets: ['latin'], weight: ['700'] });

// --- CONSISTENT BUBBLE TEXT COMPONENT ---
const BubbleText = ({ text, sizeClass = "text-5xl lg:text-7xl" }: { text: string, sizeClass?: string }) => {
  const colors = ['text-blue-500', 'text-red-500', 'text-yellow-500', 'text-green-500', 'text-orange-500', 'text-purple-500'];
  return (
    <div className="flex flex-wrap justify-center lg:justify-start gap-x-1">
      {text.split("").map((char, i) => (
        <span
          key={i}
          className={`relative inline-block ${sizeClass} ${bubbleFont.className} ${colors[i % colors.length]} 
          [text-shadow:_3px_3px_0_#000,_-1px_-1px_0_#000,_1px_-1px_0_#000,_-1px_1px_0_#000,_1px_1px_0_#000]`}
        >
          {char}
          {['o', 'e', 'p', 'a', 'd', 'c', 'u'].includes(char.toLowerCase()) && (
            <span className="absolute top-[40%] left-1/2 -translate-x-1/2 flex gap-1 pointer-events-none">
              <span className="w-1 h-1 bg-black rounded-full" />
              <span className="w-1 h-1 bg-black rounded-full" />
            </span>
          )}
        </span>
      ))}
    </div>
  );
};

// --- DATA ---
const aboutSections = [
  {
    title: "Our   Aim",
    icon: <Target className="w-8 h-8 lg:w-12 lg:h-12 text-white" />,
    text: "To create a foundation for lifelong learning by providing a stimulating environment where children can discover their unique talents and build self-confidence through play and structured education.",
    color: "bg-rose-400",
    shadow: "shadow-[12px_12px_0_0_#fb7185]",
    border: "border-rose-500",
    image: boywithfootball,
    reverse: false,
  },
  {
    title: "Our   Mission",
    icon: <Rocket className="w-8 h-8 lg:w-12 lg:h-12 text-white" />,
    text: "Our mission is to nurture the next generation of thinkers, creators, and leaders. We provide holistic care that focuses on physical, emotional, and cognitive development in a safe, nature-inspired setting.",
    color: "bg-blue-400",
    shadow: "shadow-[12px_12px_0_0_#60a5fa]",
    border: "border-blue-500",
    image: boywithelephant,
    reverse: true,
  },
  {
    title: "Our   Vision",
    icon: <Eye className="w-8 h-8 lg:w-12 lg:h-12 text-white" />,
    text: "To be the leading preschool that sets the standard for early childhood education, where every child is empowered to reach their full potential in a world of limitless imagination.",
    color: "bg-green-400",
    shadow: "shadow-[12px_12px_0_0_#4ade80]",
    border: "border-green-500",
    image: girlwithbook,
    reverse: false,
  }
];

const AboutPage = () => {
  return (
    <main className={`bg-[#FFFDF6] ${bodyFont.className} overflow-hidden`}>
      <AboutHeader 
        title="About Us" 
        subtitle="A place where imagination has no limits and every child is a star." 
      />

      {/* Intro Text Section */}
      <section className="py-20 container mx-auto px-6 text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <Star className="text-yellow-500 fill-yellow-500 animate-pulse" />
            <h2 className={`${bubbleFont.className} text-4xl lg:text-6xl text-slate-800`}>
              Building a Brighter <span className="text-yellow-500 underline decoration-black underline-offset-4">Future</span>
            </h2>
            <Star className="text-yellow-500 fill-yellow-500 animate-pulse" />
          </div>
          <p className="text-xl text-slate-600 font-bold leading-relaxed italic">
            At Best Preschool, we believe that every child is a star waiting to shine. Our approach combines traditional values with modern learning techniques.
          </p>
        </motion.div>
      </section>

      {/* Alternating Value Sections */}
      {aboutSections.map((section, idx) => (
        <section 
          key={idx} 
          className={`py-24 relative ${idx % 2 !== 0 ? 'bg-blue-50/50' : ''}`}
        >
          {/* Background decoration */}
          <div className="absolute inset-0 z-0 opacity-5 pointer-events-none">
            <Image src={bgPattern} alt="bg" fill className="object-cover" />
          </div>

          <div className="container mx-auto px-6 relative z-10">
            <div className={`flex flex-col ${section.reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-16`}>
              
              {/* Image Container */}
              <motion.div 
                initial={{ opacity: 0, x: section.reverse ? 50 : -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="w-full lg:w-1/2"
              >
                <div className={`relative rounded-[4rem] border-8 border-black overflow-hidden bg-white ${section.shadow}`}>
                  <Image 
                    src={section.image} 
                    alt={section.title} 
                    className="w-full h-[400px] lg:h-[500px] object-contain p-8 hover:scale-110 transition-transform duration-500"
                  />
                </div>
              </motion.div>

              {/* Text Container */}
              <motion.div 
                initial={{ opacity: 0, x: section.reverse ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="w-full lg:w-1/2 text-center lg:text-left"
              >
                <div className="flex items-center justify-center lg:justify-start gap-4 mb-6">
                  <div className={`${section.color} p-4 rounded-2xl border-4 border-black shadow-[4px_4px_0_0_#000]`}>
                    {section.icon}
                  </div>
                </div>

                <div className="mb-6">
                   <BubbleText text={section.title.toUpperCase()} sizeClass="text-5xl lg:text-8xl" />
                </div>

                <p className="text-2xl text-slate-700 font-black mb-8 leading-relaxed">
                  {section.text}
                </p>

                <div className={`h-3 w-32 ${section.color} rounded-full border-2 border-black mx-auto lg:mx-0`} />
              </motion.div>
            </div>
          </div>
        </section>
      ))}

      {/* Decorative Final Quote */}
      <section className="py-24 bg-white text-center">
         <p className={`${handFont.className} text-4xl lg:text-6xl text-rose-500 font-bold px-4`}>
           "Where every little heart finds a home to grow."
         </p>
      </section>
      <OrganizationSection />
    </main>
  );
};

export default AboutPage;