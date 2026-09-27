'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Rocket, Moon, Star, Send, Sparkles, Brain, 
  Users, Music, Palette, BookOpen, Microscope, GraduationCap 
} from 'lucide-react'; 
import { Luckiest_Guy, Nunito, Caveat } from 'next/font/google';
import Image from 'next/image';

// --- IMAGE IMPORTS (Using your established assets) ---
import boywithfootball from "../../public/test/616.webp"; 
import girlwithbook from "../../public/test/671.webp";
import boywithelephant from "../../public/test/662.webp";
import girlonswing from "../../public/test/649.webp";
import bgPattern from "../../public/test/642.webp";

// --- FONT CONFIGURATION ---
const bubbleFont = Luckiest_Guy({ subsets: ['latin'], weight: ['400'] });
const bodyFont = Nunito({ subsets: ['latin'], weight: ['600', '800'] });
const handFont = Caveat({ subsets: ['latin'], weight: ['700'] });

// --- CONSISTENT BUBBLE TEXT COMPONENT ---
const BubbleText = ({ text, sizeClass = "text-4xl md:text-7xl" }: { text: string, sizeClass?: string }) => {
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
            <span className="absolute top-[40%] left-1/2 -translate-x-1/2 flex gap-0.5 lg:gap-1 pointer-events-none">
              <span className="w-0.5 h-0.5 lg:w-1 lg:h-1 bg-black rounded-full" />
              <span className="w-0.5 h-0.5 lg:w-1 lg:h-1 bg-black rounded-full" />
            </span>
          )}
        </span>
      ))}
    </div>
  );
};

// --- DATA: DETAILED PROGRAM CONTENT ---
const programDetails = [
  {
    id: "rockets",
    title: "LITTLE ROCKETS",
    age: "2-3 Years (Play Group)",
    tagline: "First Steps into the Universe",
    description: "Our Little Rockets begin their learning journey with joyful discoveries and hands-on exploration in a safe, nature-inspired setting.",
    activities: ["Sensory Play", "Storytelling with Props", "Rhymes & Movement", "Finger Painting"],
    development: "Focuses on early social skills, building trust, and refining gross motor skills through active play.",
    image: boywithfootball,
    theme: "bg-rose-400",
    shadow: "shadow-[15px_15px_0_0_#fb7185]",
    icon: <Rocket />,
    reverse: false
  },
  {
    id: "explorers",
    title: "MOON EXPLORERS",
    age: "3-4 Years (Nursery)",
    tagline: "Imagination Takes Flight",
    description: "Step into a world of imagination! Children engage in early literacy and thematic play to expand their vocabularies.",
    activities: ["Role-Playing", "Phonics Introduction", "Nature Walks", "Pattern Puzzles"],
    development: "Nurtures curiosity and language development while encouraging independent thinking and problem-solving.",
    image: girlwithbook,
    theme: "bg-blue-400",
    shadow: "shadow-[15px_15px_0_0_#4D96FF]",
    icon: <Moon />,
    reverse: true
  },
  {
    id: "champs",
    title: "ASTRO CHAMPS",
    age: "4-5 Years (LKG)",
    tagline: "Building Confidence",
    description: "Building stronger academic readiness through structured yet enjoyable learning experiences that prepare for future schooling.",
    activities: ["Basic Math Games", "Letter Formation", "Group Projects", "Creative Dramatics"],
    development: "Strengthens emotional intelligence, social teamwork, and cognitive reasoning for school readiness.",
    image: boywithelephant,
    theme: "bg-purple-400",
    shadow: "shadow-[15px_15px_0_0_#A78BFA]",
    icon: <Star />,
    reverse: false
  },
  {
    id: "innovators",
    title: "SPACE INNOVATORS",
    age: "5-6 Years (UKG)",
    tagline: "Ready for Lift-Off",
    description: "Preparing for formal schooling with advanced foundational learning, ensuring every child is confident and school-ready.",
    activities: ["STEM Experiments", "Advanced Literacy", "Public Speaking", "Complex Construction Play"],
    development: "Promotes responsibility, discipline, and advanced academic concepts through a joyful, structured environment.",
    image: girlonswing,
    theme: "bg-teal-400",
    shadow: "shadow-[15px_15px_0_0_#6BCB77]",
    icon: <Send />,
    reverse: true
  }
];

const ProgramsPage = () => {
  return (
    <main className={`bg-[#FFFDF6] ${bodyFont.className} overflow-hidden`}>
      
      {/* 1. WAVY HEADER */}
      <header className="relative w-full h-[50vh] min-h-[500px] bg-[#e0f2fe] flex items-center overflow-hidden">
        <div className="container mx-auto px-6 relative z-10 text-center lg:text-left">
          <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }}>
             <span className="bg-white border-2 border-black px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest mb-6 inline-block">
                Academic Excellence
             </span>
             <BubbleText text="OUR LEARNING" />
             <div className="mt-[-10px] md:mt-[-20px] mb-6">
                <BubbleText text="PROGRAMS" sizeClass="text-5xl md:text-8xl" />
             </div>
             <p className={`${handFont.className} text-3xl text-slate-600`}>
               A balanced blend of academics, creativity, and real-world learning.
             </p>
          </motion.div>
        </div>
        
        {/* Wavy bottom transition */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] transform rotate-180 z-20">
          <svg className="relative block w-full h-[60px]" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill="#FFFDF6"></path>
          </svg>
        </div>
      </header>

      {/* 2. PROGRAM SECTIONS */}
      {programDetails.map((prog, idx) => (
        <section 
          key={prog.id} 
          id={prog.id}
          className={`py-24 relative ${idx % 2 !== 0 ? 'bg-blue-50/30' : ''}`}
        >
          {/* Background decoration */}
          <div className="absolute inset-0 z-0 opacity-5 pointer-events-none">
            <Image src={bgPattern} alt="bg" fill className="object-cover" />
          </div>

          <div className="container mx-auto px-6 relative z-10">
            <div className={`flex flex-col ${prog.reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-16`}>
              
              {/* IMAGE COLUMN */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="w-full lg:w-1/2"
              >
                <div className={`relative rounded-[4rem] border-8 border-black overflow-hidden bg-white ${prog.shadow}`}>
                  <Image 
                    src={prog.image} 
                    alt={prog.title} 
                    className="w-full h-[400px] lg:h-[550px] object-contain p-8 hover:scale-110 transition-transform duration-700"
                  />
                  {/* Icon Badge */}
                  <div className={`absolute top-6 left-6 w-16 h-16 rounded-2xl border-4 border-black ${prog.theme} flex items-center justify-center text-white shadow-[4px_4px_0_0_#000]`}>
                    {React.cloneElement(prog.icon as React.ReactElement, { size: 32, strokeWidth: 3 })}
                  </div>
                </div>
              </motion.div>

              {/* CONTENT COLUMN */}
              <motion.div 
                initial={{ opacity: 0, x: prog.reverse ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="w-full lg:w-1/2"
              >
                <div className="flex flex-col gap-6 text-center lg:text-left">
                  <div className="inline-flex items-center gap-2 bg-slate-100 border-2 border-black px-4 py-1 rounded-full w-fit mx-auto lg:mx-0">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-xs font-black uppercase tracking-widest">{prog.age}</span>
                  </div>

                  <BubbleText text={prog.title} sizeClass="text-4xl md:text-6xl" />
                  
                  <p className={`${handFont.className} text-3xl text-slate-500`}>
                    "{prog.tagline}"
                  </p>

                  <p className="text-lg text-slate-600 font-bold leading-relaxed">
                    {prog.description}
                  </p>

                  {/* MIND & ACTIVITIES BLOCKS */}
                  <div className="grid sm:grid-cols-2 gap-6 mt-4">
                    <div className="bg-white border-4 border-black p-6 rounded-[2rem] shadow-[6px_6px_0_0_#000]">
                       <div className="flex items-center gap-2 mb-3">
                          <Brain className="w-6 h-6 text-rose-500" />
                          <h4 className={`${bubbleFont.className} text-xl`}>Mind Growth</h4>
                       </div>
                       <p className="text-xs text-slate-500 font-bold leading-relaxed">
                         {prog.development}
                       </p>
                    </div>

                    <div className="bg-white border-4 border-black p-6 rounded-[2rem] shadow-[6px_6px_0_0_#000]">
                       <div className="flex items-center gap-2 mb-3">
                          <Sparkles className="w-6 h-6 text-blue-500" />
                          <h4 className={`${bubbleFont.className} text-xl`}>Activities</h4>
                       </div>
                       <ul className="text-xs text-slate-500 font-black grid grid-cols-2 gap-1">
                          {prog.activities.map((act, i) => (
                            <li key={i} className="flex items-center gap-1">
                              <CheckCircle className="w-3 h-3 text-emerald-500" /> {act}
                            </li>
                          ))}
                       </ul>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      ))}

      {/* FINAL CTA */}
      <section className="py-24 text-center bg-[#6BCB77] border-t-8 border-black">
         <div className="container mx-auto px-6">
            <BubbleText text="READY TO ENROLL?" sizeClass="text-5xl md:text-8xl" />
            <p className="text-white text-xl font-black mt-4 mb-10 [text-shadow:_1px_1px_0_#000]">
              Every child becomes confident, happy, and school-ready for the future.
            </p>
            <motion.button 
              whileHover={{ scale: 1.1, rotate: -2 }}
              className="bg-white border-4 border-black px-12 py-5 rounded-3xl shadow-[8px_8px_0_0_#000] text-2xl font-black hover:bg-yellow-400 transition-colors"
            >
              Start Admission →
            </motion.button>
         </div>
      </section>
    </main>
  );
};

// --- HELPER COMPONENT ---
const CheckCircle = ({ className, size = 16 }: { className?: string, size?: number }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="4" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export default ProgramsPage;