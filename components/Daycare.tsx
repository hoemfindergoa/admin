'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  Utensils, 
  Gamepad2, 
  BedDouble, 
  Video, 
  Heart, 
  BookOpen, 
  Palette 
} from 'lucide-react'; 
import { Luckiest_Guy, Nunito, Caveat } from 'next/font/google';
import Image from 'next/image';

// --- IMAGE IMPORTS ---
import daycareHeroImage from "../public/test/649.webp"; // Using one of your existing images
import bgPattern from "../public/test/658.webp"; 

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

// --- DATA: FACILITIES ---
const facilities = [
  { icon: <Video className="w-6 h-6" />, label: "CCTV", color: "sky" },
  { icon: <Gamepad2 className="w-6 h-6" />, label: "Play Zone", color: "rose" },
  { icon: <Utensils className="w-6 h-6" />, label: "Nutritious Meals", color: "teal" },
  { icon: <BedDouble className="w-6 h-6" />, label: "Rest Areas", color: "purple" },
  { icon: <ShieldCheck className="w-6 h-6" />, label: "Safety Protocols", color: "teal" },
  { icon: <Heart className="w-6 h-6" />, label: "Trained Caregivers", color: "red" },
];

const DayCareSection: React.FC = () => {
  return (
    <section className={`py-24 relative overflow-hidden bg-[#FFFDF6] ${bodyFont.className}`}>
      
      {/* BACKGROUND DECORATION */}
      <div className="absolute inset-0 z-0 opacity-5 pointer-events-none">
        <Image src={bgPattern} alt="bg" fill className="" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          
          {/* LEFT SIDE: INTERACTIVE IMAGE BLOCK */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="w-full lg:w-1/2 relative"
          >
            <div className="relative z-10 rounded-[4rem] border-4 border-black overflow-hidden shadow-[15px_15px_0_0_#FFD93D]">
              <Image 
                src={daycareHeroImage} 
                alt="Little Comets Day Care" 
                className="w-full px-4 py-4 h-auto object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>
            {/* Floating Decorative Badge */}
            <motion.div 
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ repeat: Infinity, duration: 4 }}
              className={`absolute -bottom-6 -right-6 z-20 bg-white border-4 border-black p-6 rounded-3xl shadow-xl`}
            >
              <p className={`${handwritingFont.className} text-2xl text-rose-500 font-bold`}>
                Safe & Nurturing!
              </p>
            </motion.div>
          </motion.div>

          {/* RIGHT SIDE: CONTENT */}
          <div className="w-full lg:w-1/2">
            <motion.div
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
            >
              <BubbleText text="LITTLE COMETS" sizeClass="text-4xl lg:text-6xl" />
              <div className="mt-[-10px] lg:mt-[-10px] mb-6">
                <BubbleText text="CARE CENTRE" sizeClass="text-3xl lg:text-5xl" />
              </div>

              <p className="text-xl text-slate-700 font-bold mb-6 leading-relaxed">
                Our Day Care service provides a safe, nurturing, and well-supervised environment where children feel comfortable, engaged and happy throughout the day.
              </p>
              
              <p className="text-slate-500 mb-10 font-medium">
                We offer age-appropriate activities, nutritious meals and structured routines that support emotional, social and cognitive development. From homework assistance to creative activities, we ensure every child receives personalized attention.
              </p>

              {/* FACILITIES GRID */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {facilities.map((item, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={{ scale: 1.05, y: -5 }}
                    className="bg-white border-2 border-black p-4 rounded-2xl shadow-[4px_4px_0_0_#000] flex flex-col items-center text-center gap-2"
                  >
                    <div className={`p-2 rounded-lg bg-${item.color}-500 bg-black/10`}>
                      {item.icon}
                    </div>
                    <span className={` text-${item.color}-600 uppercase `}>
                      {item.label}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

        </div>

        {/* BOTTOM SECTION: SUMMARY CARD */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 bg-blue-50 border-4 border-black rounded-[3rem] p-10 shadow-[0_12px_0_0_#4D96FF] text-center"
        >
          <div className="max-w-3xl mx-auto">
            <h4 className={`${bubbleFont.className} text-3xl text-blue-600 mb-4`}>
              Peace of Mind for Parents
            </h4>
            <p className="text-slate-600 font-bold italic">
              "With trained caregivers, strict safety protocols and personalized attention, we ensure every child receives the care they need while offering parents complete peace of mind."
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default DayCareSection;