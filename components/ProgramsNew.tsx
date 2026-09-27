'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Star } from 'lucide-react'; 
import { Luckiest_Guy, Nunito, Caveat } from 'next/font/google';
import Image, { StaticImageData } from 'next/image';
import Link from 'next/link';

// --- IMAGE IMPORTS (Your provided paths) ---
import boywithfootball from "../public/compressed/346.webp"; 
import girlwithbook from "../public/compressed/411.webp";
import boywithelephant from "../public/compressed/482.webp";
import girlonswing from "../public/compressed/488a.webp";
// --- FONT CONFIGURATION ---
const bubbleFont = Luckiest_Guy({ subsets: ['latin'], weight: ['400'] });
const bodyFont = Nunito({ subsets: ['latin'], weight: ['600', '800'] });
const handwritingFont = Caveat({ subsets: ['latin'], weight: ['700'] });

// --- BUBBLE TEXT COMPONENT (Consistent with Hero) ---
const BubbleText = ({ text, sizeClass = "text-2xl md:text-3xl" }: { text: string, sizeClass?: string }) => {
  const colors = ['text-blue-500', 'text-red-500', 'text-yellow-500', 'text-green-500', 'text-orange-500', 'text-purple-500'];
  return (
    <div className="flex flex-wrap justify-center gap-x-0.5">
      {text.split("").map((char, i) => (
        <span
          key={i}
          className={`relative inline-block ${sizeClass} ${bubbleFont.className} ${colors[i % colors.length]} 
          [text-shadow:_2px_2px_0_#000,_-1px_-1px_0_#000,_1px_-1px_0_#000,_-1px_1px_0_#000,_1px_1px_0_#000]`}
        >
          {char}
          {['o', 'e', 'p', 'a', 'd'].includes(char.toLowerCase()) && (
            <span className="absolute top-[40%] left-1/2 -translate-x-1/2 flex gap-0.5 pointer-events-none">
              <span className="w-0.5 h-0.5 lg:w-1 lg:h-1 bg-black rounded-full" />
              <span className="w-0.5 h-0.5 lg:w-1 lg:h-1 bg-black rounded-full" />
            </span>
          )}
        </span>
      ))}
    </div>
  );
};

// --- TYPES ---
type ThemeColor = 'rose' | 'sky' | 'purple' | 'teal';

interface Program {
  id: number;
  title: string;
  subtitle: string;
  age: string;
  description: string;
  theme: ThemeColor;
  image: StaticImageData;
  linkId: string;
}

// --- DATA ---
const programs: Program[] = [
  {
    id: 1,
    title: "Little   Rockets",
    subtitle: "Igniting Curiosity",
    age: "Play Group (2-3 Years)",
    description: "Our Little Rockets begin their journey with joyful discoveries and exploration.",
    theme: "rose", 
    image: boywithfootball, 
    linkId: "/Programs/#rockets"
  },
  {
    id: 2,
    title: "Moon   Explorers",
    subtitle: "Imagination Takes Flight",
    age: "Nursery (3-4 Years)",
    description: "Children engage in early literacy and thematic play in a world of imagination.",
    theme: "sky",
    image: girlwithbook, 
    linkId: "/Programs/#explorers"
  },
  {
    id: 3,
    title: "Astro   Champs",
    subtitle: "Building Confidence",
    age: "LKG (4-5 Years)",
    description: "Stronger academic readiness through structured yet enjoyable learning.",
    theme: "purple",
    image: boywithelephant, 
    linkId: "/Programs/#astrochamps"
  },
  {
    id: 4,
    title: "Space   Innovators",
    subtitle: "Ready for Lift-Off",
    age: "UKG (5-6 Years)",
    description: "Preparing for formal schooling with advanced foundational learning.",
    theme: "teal",
    image: girlonswing, 
    linkId: "/Programs/#inovators"
  },
];

const CosmicPrograms: React.FC = () => {
  return (
    <section id='programs' className={`py-24 relative overflow-hidden bg-[#FFFDF6] ${bodyFont.className}`}>
      
      {/* BIG BACKGROUND IMAGE */}
      {/* <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
        <Image src={sectionBgImage} alt="Background pattern" fill className="" />
      </div> */}

      <div className="max-w-[1700px] mx-auto px-6 relative z-10">
        {/* Section Heading */}
        <div className="text-center mb-20">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}  
            viewport={{ once: true }}
            className="inline-block"
          >
            <div className="flex items-center justify-center gap-2 mb-4">
               <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
               <span className="text-slate-500 font-black uppercase tracking-widest">Our Learning Paths</span>
               <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
            </div>
            <span><BubbleText text="OUR  "  sizeClass="text-5xl md:text-8xl" /> <span>
              <BubbleText text="PROGRAMS"  sizeClass="text-5xl md:text-8xl" /></span> </span>
                        
          </motion.div>
        </div>

        {/* Programs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {programs.map((program, index) => (
            <ProgramCard key={program.id} data={program} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

const ProgramCard: React.FC<{ data: Program; index: number }> = ({ data, index }) => {
  // Theme styling for the "Physical Block" look
  const themes: Record<ThemeColor, { shadow: string, border: string, btn: string, bg: string }> = {
    rose:   { shadow: 'shadow-[0_12px_0_0_#fb7185]', border: 'border-rose-200', btn: 'bg-rose-500 shadow-[0_4px_0_0_#e11d48]', bg: 'bg-rose-50' },
    sky:    { shadow: 'shadow-[0_12px_0_0_#38bdf8]', border: 'border-blue-200', btn: 'bg-blue-500 shadow-[0_4px_0_0_#2563eb]', bg: 'bg-blue-50' },
    purple: { shadow: 'shadow-[0_12px_0_0_#c084fc]', border: 'border-purple-200', btn: 'bg-purple-500 shadow-[0_4px_0_0_#9333ea]', bg: 'bg-purple-50' },
    teal:   { shadow: 'shadow-[0_12px_0_0_#2dd4bf]', border: 'border-teal-200', btn: 'bg-teal-500 shadow-[0_4px_0_0_#0d9488]', bg: 'bg-teal-50' },
  };

  const currentTheme = themes[data.theme];

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      className={`relative bg-white border-2 ${currentTheme.border} rounded-[3rem] p-8 ${currentTheme.shadow} transition-all flex flex-col items-center text-center`}
    >
      {/* Program Image with Bouncy Hover */}
      <div className={`w-full h-[250px] relative rounded-[2rem]  mb-6 overflow-hidden`}>
        <motion.div 
          whileHover={{ scale: 1.15, rotate: 3 }}
          className="w-full h-full p-4"
        >
          <Image src={data.image} alt={data.title} fill className="object-contain drop-shadow-lg" />
        </motion.div>
      </div>

      {/* Age Badge */}
      <div className="bg-slate-100 text-slate-600 px-4 py-1 rounded-full text-xs font-black mb-3">
           {data.age}
      </div>

      <div className="mb-2">
        <BubbleText text={data.title} sizeClass="text-2xl md:text-3xl" />
      </div>

      <p className={`text-slate-400 ${handwritingFont.className} text-xl mb-4`}>
        "{data.subtitle}"
      </p>

      <p className="text-slate-600 text-sm font-bold mb-8 leading-relaxed">
        {data.description}
      </p>

      <Link href={`${data.linkId}`} className="w-full mt-auto">
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`w-full py-4 rounded-2xl ${currentTheme.btn} text-white font-black text-lg flex items-center justify-center gap-2 border-2 border-black/10 active:shadow-none active:translate-y-1 transition-all`}
        >
          Explore <ArrowRight className="w-5 h-5 stroke-[3px]" />
        </motion.button>
      </Link>
    </motion.div>
  );
};

export default CosmicPrograms;