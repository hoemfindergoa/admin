'use client';

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, Minus, Baby, BookOpen, ShieldCheck, Clock, 
  Sparkles, MessageCircle, Search, School, Smile, 
  Calendar, HelpCircle, Phone, Star 
} from "lucide-react";
import { Luckiest_Guy, Nunito } from 'next/font/google';

const bubbleFont = Luckiest_Guy({ subsets: ['latin'], weight: ['400'] });
const bodyFont = Nunito({ subsets: ['latin'], weight: ['600', '800'] });

// --- BUBBLE TEXT COMPONENT (Consistent with your UI) ---
const BubbleHeading = ({ text, sizeClass = "text-4xl md:text-6xl" }: { text: string, sizeClass?: string }) => {
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

// --- DATA (Updated with your requested phrasing) ---
const faqData = [
  {
    question: "What age groups does the best preschool and daycare accept?",
    answer: "We welcome children from 2 to 6 years, offering age-appropriate programs for infants, toddlers, preschoolers and kindergarten learners.",
    icon: Baby, theme: 'rose'
  },
  {
    question: "What curriculum does the best preschool and daycare follow?",
    answer: "We follow a play-based, Montessori-inspired and early learning approach that focuses on holistic development—academic, social, emotional, and physical growth.",
    icon: BookOpen, theme: 'sky'
  },
  {
    question: "Is the best preschool and daycare safe and secure?",
    answer: "Yes. Our daycare follows strict safety protocols, CCTV surveillance, secure entry-exit systems, trained staff, and regular hygiene and safety audits.",
    icon: ShieldCheck, theme: 'purple'
  },
  {
    question: "What are the timings for the best preschool and daycare?",
    answer: "Preschool operates during morning hours, while daycare offers flexible full-day and half-day options to support working parents.",
    icon: Clock, theme: 'teal'
  },
  {
    question: "How does the best preschool and daycare communicate with parents?",
    answer: "We maintain regular communication through parent-teacher meetings, progress updates, activity photos, and direct communication channels.",
    icon: MessageCircle, theme: 'amber'
  }
];

const FAQItem = ({ item, index, isOpen, onClick }: any) => {
  const themes: any = {
    rose:   { shadow: 'shadow-[0_8px_0_0_#fb7185]', border: 'border-rose-200', btn: 'bg-rose-50', text: 'text-rose-600' },
    sky:    { shadow: 'shadow-[0_8px_0_0_#38bdf8]', border: 'border-blue-200', btn: 'bg-blue-50', text: 'text-blue-600' },
    purple: { shadow: 'shadow-[0_8px_0_0_#c084fc]', border: 'border-purple-200', btn: 'bg-purple-50', text: 'text-purple-600' },
    teal:   { shadow: 'shadow-[0_8px_0_0_#2dd4bf]', border: 'border-teal-200', btn: 'bg-teal-50', text: 'text-teal-600' },
    amber:  { shadow: 'shadow-[0_8px_0_0_#fbbf24]', border: 'border-amber-200', btn: 'bg-amber-50', text: 'text-amber-600' },
  };

  const current = themes[item.theme];

  return (
    <motion.div 
      className={`mb-6 rounded-[2rem] border-2 border-black bg-white overflow-hidden transition-all ${current.shadow}`}
    >
      <button 
        onClick={onClick}
        className={`w-full flex items-center justify-between p-6 text-left focus:outline-none transition-colors ${isOpen ? current.btn : 'bg-white'}`}
      >
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl border-2 border-black flex items-center justify-center shrink-0 bg-white`}>
             <item.icon className={`w-6 h-6 ${current.text}`} />
          </div>
          <span className={`text-lg md:text-xl font-black leading-tight ${isOpen ? current.text : 'text-slate-800'}`}>
            {item.question}
          </span>
        </div>
        
        <div className={`w-10 h-10 rounded-xl border-2 border-black flex items-center justify-center shrink-0 transition-transform ${isOpen ? 'rotate-180 bg-white' : 'bg-slate-50'}`}>
           {isOpen ? <Minus className="w-5 h-5 text-black stroke-[3px]" /> : <Plus className="w-5 h-5 text-black stroke-[3px]" />}
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className={`${current.btn}`}
          >
            <div className="px-6 pb-8 ml-0 md:ml-16">
               <div className="h-[2px] w-full bg-black/10 mb-4" />
               <p className="text-slate-600 font-bold text-lg leading-relaxed">
                 {item.answer}
               </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className={`py-24 bg-[#FFFDF6] relative overflow-hidden ${bodyFont.className}`}>
      
      {/* BACKGROUND DECO */}
      <div className="absolute top-10 left-10 opacity-10 animate-bounce">
         <Star className="w-16 h-16 text-yellow-500 fill-yellow-500" />
      </div>

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
            <span className="bg-yellow-100 text-yellow-700 px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest border-2 border-yellow-200 mb-4 inline-block">
              Got Questions?
            </span>
            <BubbleHeading text="PARENT FAQS" />
            <p className="text-slate-500 text-lg mt-4 font-bold">
              Everything you need to know about the best preschool and daycare!
            </p>
          </motion.div>
        </div>

        <div className="flex flex-col">
          {faqData.map((item, index) => (
            <FAQItem 
              key={index} 
              item={item} 
              isOpen={openIndex === index}
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FaqSection;