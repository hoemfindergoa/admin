'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  MessageCircle, 
  Binary, 
  Users2, 
  Brain, 
  Palette, 
  Music, 
  Sun, 
  Rocket 
} from 'lucide-react'; 
import { Luckiest_Guy, Nunito, Caveat } from 'next/font/google';
import Image from 'next/image';

// --- IMAGE IMPORTS ---
import learningImage from "../public/test/632.webp"; // Using your existing girl with book image
import bgPattern from "../public/test/656.webp"; 

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

// --- LEARNING PILLARS DATA ---
const learningPillars = [
  { icon: <MessageCircle />, title: "Communication", desc: "Language & Expression", color: "bg-blue-400", shadow: "shadow-[0_8px_0_0_#2563eb]" },
  { icon: <Binary />, title: "Numeracy", desc: "Early Math Concepts", color: "bg-red-400", shadow: "shadow-[0_8px_0_0_#dc2626]" },
  { icon: <Users2 />, title: "Social Skills", desc: "Teamwork & Sharing", color: "bg-green-400", shadow: "shadow-[0_8px_0_0_#16a34a]" },
  { icon: <Brain />, title: "Logic", desc: "Problem Solving", color: "bg-purple-400", shadow: "shadow-[0_8px_0_0_#9333ea]" },
  { icon: <Palette />, title: "Creativity", desc: "Art & Imagination", color: "bg-orange-400", shadow: "shadow-[0_8px_0_0_#ea580c]" },
  { icon: <Music />, title: "Rhythm", desc: "Music & Movement", color: "bg-pink-400", shadow: "shadow-[0_8px_0_0_#db2777]" },
];

const LearningJourney: React.FC = () => {
  return (
    <section className={`py-24 relative overflow-hidden bg-[#fdfbf7] ${bodyFont.className}`}>
      
      {/* BACKGROUND ELEMENTS */}
      {/* <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
        <Image src={bgPattern} alt="bg" fill className="" />
      </div> */}

      <div className="container mx-auto px-6 relative z-10">
        
        {/* HEADER */}
        <div className="text-center mb-16">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sun className="w-8 h-8 text-yellow-500 animate-spin-slow" />
              <span className="text-slate-500 font-black uppercase tracking-widest">Growth & Discovery</span>
            </div>
            <BubbleText text="WHAT KIDS" sizeClass="text-5xl lg:text-8xl" />
            <div className="mt-[-10px] lg:mt-[-20px]">
              <BubbleText text="WILL LEARN" sizeClass="text-4xl lg:text-7xl" />
            </div>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-12 gap-12 items-center">
          
          {/* LEFT: LEARNING PILLARS GRID */}
          <div className="lg:col-span-4 grid grid-cols-2 gap-6">
            {learningPillars.slice(0, 4).map((pillar, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.05, rotate: idx % 2 === 0 ? -2 : 2 }}
                className={`${pillar.color} ${pillar.shadow} border-2 border-black p-6 rounded-[2.5rem] text-white flex flex-col items-center text-center gap-3`}
              >
                <div className="bg-white/20 p-3 rounded-2xl">
                  {React.cloneElement(pillar.icon as React.ReactElement, { className: "w-8 h-8 stroke-[3px]" })}
                </div>
                <div>
                  <h4 className="font-black text-lg leading-tight">{pillar.title}</h4>
                  <p className="text-[10px] font-bold opacity-90">{pillar.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* CENTER: HERO IMAGE FOCUS */}
          <div className="lg:col-span-4 relative flex justify-center">
             <div className="absolute inset-0 bg-yellow-100 rounded-full blur-3xl opacity-50 animate-pulse" />
             <motion.div 
               animate={{ y: [0, -20, 0] }} 
               transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
               className="relative z-10 w-[300px] h-[400px]"
             >
                <Image src={learningImage} alt="Kids learning" fill className="object-contain drop-shadow-2xl" />
             </motion.div>
          </div>

          {/* RIGHT: CONTENT & VALUES */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-white border-4 border-black rounded-[3rem] p-8 shadow-[10px_10px_0_0_#4D96FF]">
              <h3 className={`${bubbleFont.className} text-3xl text-blue-500 mb-4`}>Ready for Lift-Off!</h3>
              <p className="text-slate-600 font-bold leading-relaxed mb-4">
                At Best Preschool and Day Care, children grow through a balanced blend of academics, creativity and real-world learning.
              </p>
              <ul className="space-y-3">
                {["Strong Language Skills", "Early Numeracy", "Independence", "Good Habits"].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-slate-700 font-black">
                    <Rocket className="w-5 h-5 text-orange-500" /> {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex gap-4">
               {learningPillars.slice(4).map((pillar, idx) => (
                  <div key={idx} className={`flex-1 ${pillar.color} ${pillar.shadow} border-2 border-black p-4 rounded-3xl text-center text-white`}>
                     <p className="font-black text-sm">{pillar.title}</p>
                  </div>
               ))}
            </div>
          </div>

        </div>

        {/* BOTTOM MOTTO */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          className="mt-20 text-center"
        >
          <p className={`${handwritingFont.className} text-4xl text-slate-400 mb-2`}>
            "Confidence, Happiness, and School-Ready"
          </p>
          <div className="h-2 w-48 bg-yellow-400 mx-auto rounded-full" />
        </motion.div>

      </div>
    </section>
  );
};

export default LearningJourney;