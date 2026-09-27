'use client';

import React from "react";
import { motion } from "framer-motion";
import { 
  MapPin, Phone, Mail, Clock, MessageCircle, Send, Sparkles, Sun, Star , Quote , Heart
} from "lucide-react";
import Image from "next/image";
import { Luckiest_Guy, Nunito, Caveat } from 'next/font/google';

// Reusing assets
import smilingboy from "../../public/test/664.webp";
import Toys from "../../public/test/656.webp"; 

const bubbleFont = Luckiest_Guy({ subsets: ['latin'], weight: ['400'] });
const bodyFont = Nunito({ subsets: ['latin'], weight: ['600', '800'] });
const handFont = Caveat({ subsets: ['latin'], weight: ['700'] });

// --- CONSISTENT BUBBLE TEXT COMPONENT ---
const BubbleHeading = ({ text, sizeClass = "text-4xl md:text-6xl" }: { text: string, sizeClass?: string }) => {
  const colors = ['text-blue-500', 'text-red-500', 'text-yellow-500', 'text-green-500', 'text-orange-500', 'text-purple-500'];
  return (
    <div className="flex flex-wrap gap-x-1">
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

type TileProps = {
  children?: React.ReactNode;
  className?: string;
  delay?: number;
  shadowColor?: string;
};

const Tile: React.FC<TileProps> = ({ children, className, delay = 0, shadowColor = "#000" }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    className={`relative p-8 md:p-10 border-4 border-black shadow-[8px_8px_0_0_${shadowColor}] rounded-[3rem] ${className}`}
  >
    {children}
  </motion.div>
);

const ContactUs = () => {
  return (
    <section className={`bg-[#FFFDF6] mt-10 md:mt-14 py-20 px-4 md:px-10 ${bodyFont.className}`} id="contact">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        
        {/* TOP ROW: HEADER & INFO */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* 1. HEADER BLOCK (Pink) */}
          <Tile className="lg:col-span-8 bg-[#f7a7b4] text-white flex flex-col justify-center min-h-[400px]">
            <div className="absolute top-6 right-6 opacity-20 rotate-12">
              <Star className="w-32 h-32 fill-white" />
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                 <span className="bg-white border-2 border-black text-rose-500 px-4 py-1 font-black text-xs uppercase tracking-widest rounded-full shadow-[3px_3px_0_0_#000]">
                   Admissions Open
                 </span>
              </div>
              <BubbleHeading text="READY TO START" sizeClass="text-4xl md:text-7xl" />
              <div className="mt-[-10px] md:mt-[-20px] mb-6">
                <BubbleHeading text="THE JOURNEY?" sizeClass="text-4xl md:text-7xl" />
              </div>
              <p className="text-xl font-bold text-white max-w-lg leading-relaxed [text-shadow:_1px_1px_0_#000]">
                We'd love to hear from you! Whether you have questions about admissions or our curriculum.
              </p>
            </div>

            <div className="absolute bottom-[-10px] right-4 z-20 hidden md:block">
              <Image
                src={smilingboy}
                alt="Happy Student"
                width={280}
                height={280}
                className="object-contain transform scale-x-[-1] drop-shadow-2xl"
              />
            </div>
          </Tile>

          {/* 2. CONTACT INFO (Blue) */}
          <Tile className="lg:col-span-4 bg-[#4D96FF] text-white flex flex-col justify-between" shadowColor="#2563eb">
            <div>
              <h3 className={`${bubbleFont.className} text-4xl mb-8 [text-shadow:_2px_2px_0_#000]`}>Get in Touch</h3>
              
              <ul className="space-y-6">
                {[
                  { icon: MapPin, label: 'Visit Us', text: 'Pitampura,Delhi' },
                  { icon: Phone, label: 'Call Us', text: '+91 9999 6060 90' },
                  { icon: Mail, label: 'Email Us', text: 'info@bestpreschoolanddaycare.com' }
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-4 group">
                    <div className="bg-white border-2 border-black p-3 rounded-2xl shadow-[3px_3px_0_0_#000] text-blue-500">
                      <item.icon className="w-6 h-6 stroke-[3px]" />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase opacity-80">{item.label}</p>
                      <p className="text-sm font-black leading-tight">{item.text}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="mt-8 pt-6 border-t-2 border-black/10 flex items-center gap-2">
              <Sun className="w-6 h-6 text-yellow-300 animate-spin-slow" />
              <span className={`${handFont.className} text-2xl`}>We reply with a smile!</span>
            </div>
          </Tile>
        </div>

        {/* BOTTOM ROW: FORM & DETAILS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* 3. INTERACTIVE FORM (Yellow) */}
          <Tile className="lg:col-span-7 bg-[#FFD93D] text-slate-800" shadowColor="#ca8a04">
            <h3 className={`${bubbleFont.className} text-4xl mb-2 text-white [text-shadow:_2px_2px_0_#000]`}>Send a Message</h3>
            <p className="text-slate-700 font-black mb-8">Fill out the form for a quick response!</p>

            <form className="space-y-4 max-w-xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input 
                  type="text" 
                  className="w-full bg-white border-2 border-black rounded-2xl p-4 text-gray-800 placeholder-gray-400 focus:shadow-none shadow-[4px_4px_0_0_#000] transition-all font-bold outline-none"
                  placeholder="Parent's Name"
                />
                <input 
                  type="tel" 
                  className="w-full bg-white border-2 border-black rounded-2xl p-4 text-gray-800 placeholder-gray-400 focus:shadow-none shadow-[4px_4px_0_0_#000] transition-all font-bold outline-none"
                  placeholder="Phone Number"
                />
              </div>
              <input 
                type="email" 
                className="w-full bg-white border-2 border-black rounded-2xl p-4 text-gray-800 placeholder-gray-400 focus:shadow-none shadow-[4px_4px_0_0_#000] transition-all font-bold outline-none"
                placeholder="Email Address"
              />
              <textarea 
                rows={3}
                className="w-full bg-white border-2 border-black rounded-2xl p-4 text-gray-800 placeholder-gray-400 focus:shadow-none shadow-[4px_4px_0_0_#000] transition-all font-bold outline-none resize-none"
                placeholder="Tell us about your child..."
              ></textarea>

              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-[#FF6B6B] text-white font-black text-xl py-4 px-10 rounded-2xl border-2 border-black shadow-[6px_6px_0_0_#000] active:shadow-none active:translate-y-1 transition-all flex items-center gap-2 mt-4"
              >
                Send Enquiry <Send className="w-6 h-6" />
              </motion.button>
            </form>
          </Tile>

          {/* 4. HOURS & MAP (Purple/Teal) */}
          <div className="lg:col-span-5 flex flex-col gap-8">
       <Tile 
  className="bg-[#A78BFA] text-white flex-1 flex flex-col justify-center relative overflow-hidden" 
  shadowColor="#7c3aed"
>
  {/* Decorative Quote Mark Background */}
  <div className="absolute -top-4 -left-2 opacity-20 pointer-events-none">
    <Quote className="w-32 h-32 fill-white" />
  </div>

  <div className="relative z-10">
    <div className="flex items-center gap-4 mb-6">
      <div className="w-12 h-12 bg-white border-2 border-black rounded-2xl flex items-center justify-center shadow-[3px_3px_0_0_#000]">
        <Heart className="w-6 h-6 text-[#7c3aed] fill-[#7c3aed]" />
      </div>
      <h3 className={`${bubbleFont.className} text-3xl [text-shadow:_2px_2px_0_#000]`}>
        Our Philosophy
      </h3>
    </div>

    <div className="space-y-4">
      <p className={`${handFont.className} text-4xl lg:text-5xl leading-tight text-yellow-200`}>
        "Where imagination has no limits and every child is a star."
      </p>
      
      <div className="flex items-center gap-3 pt-4">
        <div className="h-[2px] w-12 bg-white/30 rounded-full" />
        <span className="font-black uppercase tracking-widest text-xs opacity-90">
          The Best Preschool & Daycare
        </span>
      </div>
    </div>
  </div>

  {/* Small Sparkle Sticker in Corner */}
  <div className="absolute bottom-6 right-6 animate-pulse">
    <Sparkles className="w-8 h-8 text-yellow-300" />
  </div>
</Tile>

            <Tile className="bg-[#6BCB77] p-0 overflow-hidden relative min-h-[220px]" shadowColor="#16a34a">
              <Image 
                src={Toys} 
                alt="Toys" 
                layout="fill" 
                objectFit="cover" 
                className="opacity-40 grayscale-[20%]" 
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.a 
                  whileHover={{ scale: 1.1, rotate: -2 }}
                  href="#" 
                  className="bg-white text-[#16a34a] px-8 py-4 rounded-2xl border-2 border-black font-black shadow-[6px_6px_0_0_#000] flex items-center gap-2"
                >
                  <MapPin className="w-6 h-6" /> View on Google Maps
                </motion.a>
              </div>
            </Tile>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactUs;