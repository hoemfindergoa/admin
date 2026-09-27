'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Target, ShieldCheck, Lightbulb, TrendingUp, 
  Users, Heart, GraduationCap, Globe 
} from 'lucide-react'; 
import { Luckiest_Guy, Nunito } from 'next/font/google';
import Image from 'next/image';

// --- IMAGES (Using your established assets) ---
import organizationImage from "../public/test/632.webp"; 
import bgPattern from "../public/test/642.webp";

// --- FONTS ---
const bubbleFont = Luckiest_Guy({ subsets: ['latin'], weight: ['400'] });
const bodyFont = Nunito({ subsets: ['latin'], weight: ['600', '800'] });

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

const OrganizationSection: React.FC = () => {
  return (
    <section className={`py-24 relative overflow-hidden bg-[#FFFDF6] ${bodyFont.className}`}>
      
      {/* BACKGROUND DECORATION */}
      <div className="absolute inset-0 z-0 opacity-5 pointer-events-none">
        <Image src={bgPattern} alt="bg" fill className="object-cover" />
      </div>

      <div className=" md:mx-[200px] mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-12 gap-16 items-center">
          
          {/* LEFT COLUMN: THE STORY */}
          <div className="lg:col-span-7">
            <motion.div 
              initial={{ opacity: 0, x: -30 }} 
              whileInView={{ opacity: 1, x: 0 }} 
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-6 h-6 text-rose-500 stroke-[3px]" />
                <span className="text-slate-500 font-black uppercase tracking-widest">Our Commitment</span>
              </div>
              
              <div className="mb-8">
                <BubbleText text="About Company" sizeClass="text-5xl lg:text-8xl" />
              </div>

              <p className="text-xl text-slate-700 font-bold leading-relaxed mb-6">
                Best Preschool and Day Care is an early childhood education organization committed to creating a safe, nurturing and intellectually stimulating learning environment.
              </p>

              <div className="space-y-4 text-slate-500 font-bold text-lg leading-relaxed mb-10">
                <p>
                  Established with a vision to provide high-quality services, we promote holistic development and prepare children for future academic success and social readiness.
                </p>
                <p>
                  We aim to set new benchmarks by integrating modern teaching methodologies, scientifically designed curriculum, and continuous educator training to ensure every child receives the highest level of care.
                </p>
              </div>

              {/* CORE FOCUS BADGES */}
              <div className="flex flex-wrap gap-4">
                {["Communication", "Creativity", "Confidence", "Critical Thinking"].map((skill, i) => (
                  <div key={i} className="bg-white border-2 border-black px-6 py-2 rounded-full shadow-[4px_4px_0_0_#000] flex items-center gap-2">
                    <StarIcon className="w-4 h-4 text-yellow-500" />
                    <span className="text-xs font-black uppercase tracking-tight">{skill}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* RIGHT COLUMN: THE BENCHMARKS GRID */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-6 relative">
             {/* Large Offset Shadow Box behind the grid */}
             <div className="absolute -inset-4 bg-emerald-100/50 rounded-[4rem] -z-10 rotate-2 border-4 border-emerald-200 border-dashed" />
             
             {[
               { icon: <ShieldCheck />, label: "Safety Standards", color: "bg-rose-400" },
               { icon: <Lightbulb />, label: "Modern Pedagogy", color: "bg-blue-400" },
               { icon: <GraduationCap />, label: "Educator Training", color: "bg-yellow-400" },
               { icon: <Globe />, label: "Expanding Reach", color: "bg-purple-400" }
             ].map((item, idx) => (
               <motion.div
                 key={idx}
                 whileHover={{ scale: 1.05, rotate: idx % 2 === 0 ? -2 : 2 }}
                 className="bg-white border-4 border-black p-6 rounded-[2.5rem] shadow-[6px_6px_0_0_#000] flex flex-col items-center text-center gap-3"
               >
                 <div className={`w-14 h-14 ${item.color} border-4 border-black rounded-2xl flex items-center justify-center text-white shadow-[3px_3px_0_0_#000]`}>
                    {React.cloneElement(item.icon as React.ReactElement, { size: 28, strokeWidth: 3 })}
                 </div>
                 <span className="text-[10px] font-black uppercase leading-tight">{item.label}</span>
               </motion.div>
             ))}

             {/* Bottom Brand Identity Card */}
             <div className="col-span-2 bg-slate-900 border-4 border-black p-6 rounded-[3rem] text-white shadow-[8px_8px_0_0_#000] flex items-center gap-4 mt-4">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shrink-0">
                  <TrendingUp className="text-slate-900 w-6 h-6" />
                </div>
                <p className="text-xs font-bold leading-snug">
                  Our dedicated team ensures that each center upholds the brand’s excellence and delivers a premium experience.
                </p>
             </div>
          </div>

        </div>
      </div>
    </section>
  );
};

// --- HELPER ICON ---
const StarIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 1.5l3.09 6.26L22 8.74l-5 4.87 1.18 6.89L12 17.25l-6.18 3.25L7 13.61l-5-4.87 6.91-0.98L12 1.5z" />
  </svg>
);

export default OrganizationSection;