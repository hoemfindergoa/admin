"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Star, Cloud, Heart } from "lucide-react";
import { Titan_One, Nunito } from 'next/font/google';
import Image from "next/image";
import Link from "next/link";

// --- IMAGE IMPORTS ---
import foldedboy from "../public/foldedhandsboy.png";
import girlsasking from "../public/whoweare.png";
import bothcharaters from "../public/bothcharacter.png";

// --- FONTS ---
const titleFont = Titan_One({ 
  weight: '400', 
  subsets: ['latin'],
  display: 'swap',
});

const bodyFont = Nunito({ 
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  display: 'swap',
});

// --- REUSABLE WAVE COMPONENT ---
const WaveSeparator = ({ position }: { position: "top" | "bottom" }) => {
  const viewBoxWidth = 2000;
  const viewBoxHeight = 100;

  const getWavePath = (count: number) => {
    const waveWidth = viewBoxWidth / count;
    let pathD = "";

    if (position === "top") {
      pathD = `M0,${viewBoxHeight / 2} `;
      for (let i = 0; i < count; i++) {
        pathD += `q ${waveWidth / 4}, 25 ${waveWidth / 2}, 0 t ${waveWidth / 2}, 0 `;
      }
      pathD += `V ${viewBoxHeight} 0 H 0 Z`;
    } else {
      pathD = `M0,${viewBoxHeight / 2} `;
      for (let i = 0; i < count; i++) {
        pathD += `q ${waveWidth / 4}, -25 ${waveWidth / 2}, 0 t ${waveWidth / 2}, 0 `;
      }
      pathD += `V ${viewBoxHeight} H 0 Z`;
    }
    return pathD;
  };

  const mobilePath = getWavePath(5);
  const desktopPath = getWavePath(20);

  const WaveLayer = ({ pathD, opacityClass, duration }: { pathD: string, opacityClass: string, duration: number }) => (
    <motion.div
      className={`absolute inset-0 w-[200%] h-full text-white ${opacityClass}`}
      animate={{ x: position === "top" ? ["0%", "-50%"] : ["-50%", "0%"] }}
      transition={{ duration: duration, repeat: Infinity, ease: "linear" }}
    >
      <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`} preserveAspectRatio="none">
        <path d={pathD} fill="currentColor"></path>
      </svg>
    </motion.div>
  );

  return (
    <div className={`absolute left-0 w-full h-[90px] sm:h-[120px] overflow-hidden z-20 ${position === "top" ? "top-0" : "bottom-0"}`}>
      <div className="block md:hidden w-full h-full absolute inset-0">
        <WaveLayer pathD={mobilePath} opacityClass="opacity-40" duration={20} />
        <WaveLayer pathD={mobilePath} opacityClass="opacity-100" duration={15} />
      </div>
      <div className="hidden md:block w-full h-full absolute inset-0">
        <WaveLayer pathD={desktopPath} opacityClass="opacity-40" duration={20} />
        <WaveLayer pathD={desktopPath} opacityClass="opacity-100" duration={15} />
      </div>
    </div>
  );
};

// --- DATA ---
const features = [
  {
    id: 1,
    title: "Who We Are",
    description: "We are the most loved preschool, creating a second home for your little ones.",
    image: girlsasking,
    ids: "#whowe",
    theme: {
      bg: "bg-sky-100",
      border: "border-sky-200",
      text: "text-sky-600",
      button: "bg-sky-500 hover:bg-sky-600",
      blob: "bg-sky-200"
    }
  },
  {
    id: 2,
    title: "Our Vision",
    description: "Building a sound foundation for life through love, care, and innovative learning.",
    image: bothcharaters,
    ids: "#vision",
    theme: {
      bg: "bg-rose-100",
      border: "border-rose-200",
      text: "text-rose-600",
      button: "bg-rose-500 hover:bg-rose-600",
      blob: "bg-rose-200"
    }
  },
  {
    id: 3,
    title: "Our Mission",
    description: "Transforming education by focusing on holistic growth and creative expression.",
    image: foldedboy,
    ids: "#mission",
    theme: {
      bg: "bg-amber-100",
      border: "border-amber-200",
      text: "text-amber-600",
      button: "bg-amber-500 hover:bg-amber-600",
      blob: "bg-amber-200"
    }
  }
];

const SpreadingLoveSection = () => {
  return (
    <section className={`relative w-full bg-rose-400 pt-28 pb-24 overflow-hidden ${bodyFont.className}`}>
      
      {/* Top Wave */}
      <WaveSeparator position="top" />

      {/* Floating Background Doodles */}
      <div className="absolute inset-0 pointer-events-none">
         <motion.div animate={{ y: [0, -20, 0] }} transition={{ duration: 4, repeat: Infinity }} className="absolute top-40 left-10 text-rose-200">
            <Heart fill="currentColor" className="w-16 h-16" />
         </motion.div>
         <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute bottom-40 right-10 text-amber-200">
            <Star fill="currentColor" className="w-20 h-20" />
         </motion.div>
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-5xl opacity-5">
            <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              <path fill="#000000" d="M44.7,-76.4C58.9,-69.2,71.8,-59.1,81.6,-46.6C91.4,-34.1,98.2,-19.2,95.8,-5.3C93.5,8.6,82.1,21.5,71.2,32.7C60.3,43.9,49.9,53.4,38.1,61.9C26.3,70.4,13.1,77.9,-0.7,79.1C-14.5,80.3,-29,75.2,-41.7,67.3C-54.4,59.4,-65.4,48.8,-73.4,36.2C-81.4,23.6,-86.4,9,-84.9,-4.9C-83.4,-18.8,-75.4,-32,-65.3,-43.3C-55.2,-54.6,-43.1,-63.9,-30.3,-71.9C-17.5,-79.9,-4,-86.6,8.5,-85.1C21,-83.6,42,-73.9,44.7,-76.4Z" transform="translate(100 100)" />
            </svg>
         </div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        
        {/* --- HEADER --- */}
        <div className="text-center mb-24">
            <span className="inline-block px-4 py-2 rounded-full bg-white border-2 border-slate-100 shadow-sm text-sm font-bold text-slate-500 mb-4 tracking-widest uppercase">
          Our Core Values
            </span>
            <h2 className={`${titleFont.className}  text-5xl md:text-6xl leading-tight`}>
          <span className="text-[#3E3431]">Nurturing </span> 
          <span className="text-rose-500  relative inline-block">
             Little Dreamers 
              <svg className="absolute w-full h-6 -bottom-4 left-0 text-amber-300" viewBox="0 0 100 10" preserveAspectRatio="none">
            <path d="M0,5 Q50,15 100,5" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
              </svg>
              {/* <span className="text-sm text-slate-600 block">At Cambridge</span> */}
          </span>
            <span className="text-[#3E3431] mt-8"> At Cambridge </span> 
            </h2>
        </div>

        {/* --- VERTICAL CARDS GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 pt-4 items-end">
            {features.map((feature, index) => (
                <Link href={`about/${feature.ids}`} key={feature.id} className="w-full h-full">
                    <motion.div 
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.2, duration: 0.6, type: "spring" }}
                        viewport={{ once: true }}
                        whileHover={{ y: -15 }}
                        className="group relative flex flex-col h-full"
                    >
                        {/* Character Pop-out Image */}
                        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 z-20 drop-shadow-xl transition-transform duration-300 group-hover:scale-110">
                            <Image 
                                src={feature.image} 
                                alt={feature.title}
                                fill
                                className="object-contain"
                            />
                        </div>

                        {/* Card Body */}
                        <div className={`
                            relative pt-24 pb-8 px-8 rounded-[3rem] 
                            bg-white border-4 ${feature.theme.border}
                            shadow-xl hover:shadow-2xl transition-all duration-300
                            flex flex-col items-center text-center h-full
                            overflow-hidden
                        `}>
                            {/* Decorative Blob inside card */}
                            <div className={`absolute top-0 left-0 w-full h-32 ${feature.theme.bg} rounded-t-[2.5rem] -z-10`}></div>
                            <div className={`absolute -top-10 -right-10 w-32 h-32 ${feature.theme.blob} rounded-full blur-2xl opacity-50`}></div>

                            <h3 className={`${titleFont.className} ${feature.theme.text} text-3xl mb-4`}>
                                {feature.title}
                            </h3>
                            
                            <p className="text-slate-500 font-bold text-base leading-relaxed mb-8">
                                {feature.description}
                            </p>

                            <div className={`mt-auto ${feature.theme.button} text-white w-12 h-12 rounded-full flex items-center justify-center shadow-md transition-all duration-300 group-hover:w-full group-hover:rounded-xl group-hover:px-6`}>
                                <ArrowRight className="w-6 h-6 shrink-0 group-hover:hidden" />
                                <span className="hidden group-hover:inline-block font-bold text-sm whitespace-nowrap">
                                    Read More
                                </span>
                                <ArrowRight className="w-5 h-5 ml-2 hidden group-hover:block" />
                            </div>
                        </div>
                    </motion.div>
                </Link>
            ))}
        </div>

      </div>

      {/* Bottom Wave */}
      <WaveSeparator position="bottom" />

    </section>
  );
};

export default SpreadingLoveSection;