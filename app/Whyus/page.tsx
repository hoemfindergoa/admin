'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, Brain, Heart, Star, Sparkles, Music, 
  Palette, Library, Camera, Wind, Waves, Coffee, 
  Bed, Microscope, Users, GraduationCap 
} from 'lucide-react'; 
import Image from 'next/image';
import { Luckiest_Guy, Nunito, Caveat } from 'next/font/google';

// --- FONTS ---
const bubbleFont = Luckiest_Guy({ subsets: ['latin'], weight: ['400'] });
const bodyFont = Nunito({ subsets: ['latin'], weight: ['600', '800'] });
const handFont = Caveat({ subsets: ['latin'], weight: ['700'] });

// --- IMAGES (Using your established test assets) ---
import whyUsHero from "../../public/test/657.webp";
import activityImage from "../../public/test/616.webp";
import bgPattern from "../../public/test/658.webp";

// --- CONSISTENT BUBBLE TEXT COMPONENT ---
const BubbleText = ({ text, sizeClass = "text-4xl md:text-6xl" }: { text: string, sizeClass?: string }) => {
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

// --- DATA: FACILITIES ---
const facilityList = [
  { icon: <Wind />, label: "Ventilated Classrooms", color: "bg-blue-400" },
  { icon: <Camera />, label: "CCTV Enabled", color: "bg-rose-400" },
  { icon: <Library />, label: "Stocked Library", color: "bg-purple-400" },
  { icon: <Waves />, label: "Purified Water", color: "bg-cyan-400" },
  { icon: <Bed />, label: "Restful Sleeping Zones", color: "bg-orange-400" },
];

const WhyUsPage = () => {
  return (
    <main className={`bg-[#FFFDF6] ${bodyFont.className} overflow-hidden`}>
      
      {/* 1. HERO HEADER */}
      <header className="relative w-full h-[50vh] min-h-[600px] bg-[#e0f2fe] flex items-center overflow-hidden ">
        <div className="container mx-auto px-6 relative z-10 grid lg:grid-cols-2 items-center">
          <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }}>
             <BubbleText text="WHY  To  CHOOSE  Us" />
             <div className="mt-[-10px] md:mt-[-10px] mb-6">
                <BubbleText text="BEST    PRESCHOOL    And         DayCare" sizeClass="text-4xl md:text-6xl" />
             </div>
             <p className="text-xl md:text-2xl text-slate-700 font-black leading-tight [text-shadow:_1px_1px_0_#fff]">
               Where parents find a perfect blend of education, care, and values.
             </p>
          </motion.div>
          <motion.div animate={{ y: [0, -20, 0] }} className="hidden lg:flex justify-center">
            <Image src={whyUsHero} alt="Why Us" width={400} height={400} className="object-contain drop-shadow-2xl" />
          </motion.div>
        </div>
        {/* Wavy bottom transition */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] transform rotate-180 z-20">
          <svg className="relative block w-full h-[60px]" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill="#FFFDF6"></path>
          </svg>
        </div>
      </header>

      {/* 2. WHY PARENTS CHOOSE US (The Trust Section) */}
      <section className="py-24 container mx-auto px-6">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7">
            <span className="bg-yellow-100 text-yellow-700 px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest border-2 border-yellow-200 mb-6 inline-block">
              Parental Choice
            </span>
            <BubbleText text="THE   PREFERRED   CHOICE" sizeClass="text-4xl md:text-6xl" />
            <div className="mt-8 space-y-6">
               <p className="text-xl text-slate-700 font-bold leading-relaxed">
                 Parents choose us because we provide a safe, nurturing, and academically strong environment that supports early development.
               </p>
               <p className="text-slate-500 font-bold leading-relaxed">
                 We prioritize safety through strict hygiene, CCTV-enabled premises, and trained staff to ensure complete peace of mind. Our scientifically designed curriculum and child-centered approach help children learn with confidence and joy.
               </p>
               <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { icon: <ShieldCheck />, text: "Strict Hygiene Standards" },
                    { icon: <Users />, text: "Experienced Educators" },
                    { icon: <GraduationCap />, text: "Structured Learning" },
                    { icon: <Heart />, text: "Consistent Social Growth" }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 bg-white border-2  p-4 rounded-2xl shadow-[4px_4px_0_0_#000]">
                      <div className="text-emerald-500">{item.icon}</div>
                      <span className="text-xs font-black uppercase">{item.text}</span>
                    </div>
                  ))}
               </div>
            </div>
          </div>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} className="lg:col-span-5 relative">
             <div className="rounded-[4rem] border-8 border-black overflow-hidden shadow-[20px_20px_0_0_#4D96FF]">
                <Image src={activityImage} alt="Parent trust" className="w-full h-auto object-cover" />
             </div>
          </motion.div>
        </div>
      </section>

      {/* 3. FACILITIES (The Toy Box Section) */}
      <section className="py-24 bg-blue-50/50 border-y-8 border-black relative">
        {/* <div className="absolute inset-0 opacity-5 pointer-events-none">
          <Image src={bgPattern} alt="bg" fill className="" />
        </div> */}
        <div className="container mx-auto px-6 relative z-10 text-center">
          <BubbleText text="MODERN    FACILITIES" />
          <p className="text-lg text-slate-600 font-bold mt-6 mb-16 max-w-2xl mx-auto">
            Our center features spacious, well-ventilated classrooms with child-friendly furniture designed for exploration and creativity.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {facilityList.map((item, idx) => (
              <motion.div key={idx} whileHover={{ y: -10 }} className="flex flex-col items-center">
                <div className={`w-20 h-20 rounded-2xl border-4 border-black ${item.color} flex items-center justify-center shadow-[4px_4px_0_0_#000] mb-4 text-white`}>
                   {React.cloneElement(item.icon as React.ReactElement, { size: 32, strokeWidth: 3 })}
                </div>
                <span className="text-xs font-black uppercase tracking-tighter leading-tight">{item.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. EXTRA-CURRICULAR (The Magic Map) */}
      <section className="py-24 container mx-auto px-6 overflow-hidden">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="w-full lg:w-1/2">
             <BubbleText text="EXTRA-CURRICULAR" />
             <div className="mt-[-10px] md:mt-[-10px] mb-8">
                <BubbleText text="ACTIVITIES" sizeClass="text-3xl md:text-5xl" />
             </div>
             <p className="text-xl text-slate-700 font-bold leading-relaxed mb-6">
               We offer a dynamic range of activities designed to nurture creativity, confidence and holistic development beyond the classroom.
             </p>
             <div className="space-y-4">
                <p className="text-slate-500 font-bold leading-relaxed">
                  Children participate in music, dance, yoga, and free play to enhance their expression. Skill-building activities such as STEM games and outdoor sports support physical growth and problem-solving.
                </p>
                <ul className="grid grid-cols-2 gap-4">
                  {["Music & Dance", "STEM Games", "Yoga Sessions", "Outdoor Sports"].map((act, i) => (
                    <li key={i} className="flex items-center gap-2 text-slate-800 font-black">
                       <Sparkles className="w-5 h-5 text-orange-400" /> {act}
                    </li>
                  ))}
                </ul>
             </div>
          </div>
          {/* Floating Bubble Icons Grid */}
          <div className="w-full lg:w-1/2 grid grid-cols-3 gap-4 relative">
             <div className="absolute inset-0 bg-yellow-100 blur-3xl opacity-30 -z-10" />
             {[Music, Palette, Microscope, Star, Users, Brain].map((Icon, i) => (
               <motion.div 
                 key={i}
                 animate={{ y: [0, -15, 0] }}
                 transition={{ duration: 4, delay: i * 0.2, repeat: Infinity }}
                 className="aspect-square bg-white border-4 border-black rounded-3xl shadow-[8px_8px_0_0_#000] flex items-center justify-center"
               >
                 <Icon className="w-12 h-12 text-blue-500" />
               </motion.div>
             ))}
          </div>
        </div>
      </section>

      {/* 5. FINAL QUOTE */}
      <section className="py-20 text-center bg-white border-t-8 border-black">
         <p className={`${handFont.className} text-4xl lg:text-6xl text-rose-500 font-bold`}>
           "Every child receives the care and support they need."
         </p>
      </section>
    </main>
  );
};

export default WhyUsPage;