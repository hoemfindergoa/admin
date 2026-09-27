'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  Brain, 
  Heart, 
  Users, 
  Sparkles, 
  CheckCircle2,
  Star,
  GraduationCap
} from 'lucide-react'; 
import { Luckiest_Guy, Nunito, Caveat } from 'next/font/google';
import Image from 'next/image';

// --- IMAGE IMPORTS ---
import kidsLearning from "../public/test/632.webp"; 
import bgPattern from "../public/test/642.webp";

const bubbleFont = Luckiest_Guy({ subsets: ['latin'], weight: ['400'] });
const bodyFont = Nunito({ subsets: ['latin'], weight: ['600', '800'] });
const handwritingFont = Caveat({ subsets: ['latin'], weight: ['700'] });

// --- CONSISTENT BUBBLE TEXT COMPONENT ---
const BubbleText = ({ text, sizeClass = "text-4xl md:text-6xl" }: { text: string, sizeClass?: string }) => {
  const colors = ['text-blue-500', 'text-red-500', 'text-yellow-500', 'text-green-500', 'text-orange-500', 'text-purple-500'];
  return (
    <div className="flex flex-wrap justify-center gap-x-1">
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

// --- DATA: WHY CHOOSE US PILLARS ---
const reasons = [
  {
    title: "Safety First",
    desc: "CCTV premises, strict hygiene, and trained staff for peace of mind.",
    icon: <ShieldCheck />,
    theme: "rose",
    shadow: "shadow-[6px_6px_0_0_#e11d48]"
  },
  {
    title: "Smart Learning",
    desc: "Scientifically designed curriculum focused on curiosity and joy.",
    icon: <Brain />,
    theme: "sky",
    shadow: "shadow-[6px_6px_0_0_#2563eb]"
  },
  {
    title: "Expert Care",
    desc: "Experienced educators providing personalized attention and warmth.",
    icon: <Heart />,
    theme: "purple",
    shadow: "shadow-[6px_6px_0_0_#9333ea]"
  },
  {
    title: "Social Growth",
    desc: "Consistent focus on emotional, social, and cognitive development.",
    icon: <Users />,
    theme: "teal",
    shadow: "shadow-[6px_6px_0_0_#0d9488]"
  }
];

const WhyChooseUs: React.FC = () => {
  return (
    <section className={`py-24 relative overflow-hidden bg-[#FFFDF6] ${bodyFont.className}`}>
      
      {/* BACKGROUND DECO */}
      {/* <div className="absolute inset-0 z-0 opacity-5 pointer-events-none">
        <Image src={bgPattern} alt="bg" fill className="object-cover" />
      </div> */}

      <div className="md:mx-[150px] mx-auto px-6 relative z-10">
        
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* LEFT CONTENT */}
          <div>
            <motion.div 
              initial={{ opacity: 0, x: -30 }} 
              whileInView={{ opacity: 1, x: 0 }} 
              viewport={{ once: true }}
            >
           
              
              <div className="mb-6">
                <BubbleText text="WHY Parents Choose US" sizeClass="text-4xl lg:text-6xl" />
               
              </div>

              <p className="text-xl text-slate-700 font-bold leading-relaxed mb-8">
                Parents choose Best Preschool and Day Care because we provide a safe, nurturing, and academically strong environment that supports every child’s early development..
              </p>

              {/* REASONS GRID */}
              <div className="grid sm:grid-cols-2 gap-6">
                {reasons.map((item, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={{ scale: 1.05 }}
                    className={`bg-white border-2 border-black p-6 rounded-[2rem] ${item.shadow}  transition-all`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-10 h-10  border-2 bg-${item.theme}-500  border-black rounded-xl flex items-center justify-center`}>
                        {React.cloneElement(item.icon as React.ReactElement, { className: `w-6 h-6 stroke-[3px] ` })}
                      </div>``
                      <h4 className={`${bubbleFont.className} text-xl tracking-wide`}>{item.title}</h4>
                    </div>
                    <p className="text-sm text-slate-500 font-bold leading-snug">{item.desc}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* RIGHT IMAGE & TRUST BADGE */}
          <div className="relative">
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative z-10 rounded-[4rem] border-8 border-black overflow-hidden shadow-[20px_20px_0_0_#4D96FF]"
            >
              <Image 
                src={kidsLearning} 
                alt="Happy kids learning" 
                className="w-full h-auto object-cover hover:scale-110 transition-transform duration-700"
              />
            </motion.div>

            {/* FLOATING TRUST CARD */}
            <motion.div 
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute -bottom-8 -left-8 z-20 bg-yellow-400 border-4 border-black p-6 rounded-[2.5rem] shadow-xl max-w-[250px]"
            >
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-6 h-6 text-black stroke-[3px]" />
                <span className="font-black uppercase text-xs tracking-tighter">Preferred Choice</span>
              </div>
              <p className={`${handwritingFont.className} text-xl font-bold leading-tight`}>
                The perfect blend of education, care, and values!.
              </p>
            </motion.div>
          </div>

        </div>

        {/* BOTTOM SUMMARY BLOCK */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-24 text-center max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center gap-4 bg-white border-4 border-black px-8 py-6 rounded-full shadow-[8px_8px_0_0_#6BCB77]">
             <GraduationCap className="w-10 h-10 text-green-500" />
             <p className="text-lg lg:text-xl text-slate-700 font-black leading-tight">
               Building a strong foundation for future schooling with personalized attention..
             </p>
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default WhyChooseUs;