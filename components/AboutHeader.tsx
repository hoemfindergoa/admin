'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Luckiest_Guy, Nunito, Caveat } from 'next/font/google';
import headerBoyImage from "../public/test/664.webp"; // Your boy with elephant image
import skyBg from "../public/test/642.webp";

const bubbleFont = Luckiest_Guy({ subsets: ['latin'], weight: ['400'] });
const handFont = Caveat({ subsets: ['latin'], weight: ['700'] });

const AboutHeader = ({ title, subtitle }: { title: string, subtitle: string }) => {
  return (
    <div className="relative h-[400px] lg:h-[500px] w-full overflow-hidden bg-[#e0f2fe] flex items-center">
      {/* Sky Background Texture */}
      <div className="absolute inset-0 z-0 opacity-20">
        <Image src={skyBg} alt="sky" fill className="object-cover" />
      </div>

      <div className="container mx-auto px-6 relative z-10 flex flex-col lg:flex-row items-center justify-between">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-center lg:text-left"
        >
          {/* Breadcrumb / Tagline */}
          <div className="inline-block bg-white/50 backdrop-blur-sm px-4 py-1 rounded-full border-2 border-blue-400 mb-4">
            <span className="text-blue-600 font-black uppercase text-sm tracking-widest">Who We Are</span>
          </div>
          
          <h1 className={`${bubbleFont.className} text-5xl lg:text-8xl text-white [text-shadow:_4px_4px_0_#4D96FF] mb-4`}>
            {title}
          </h1>
          
          <p className={`${handFont.className} text-2xl lg:text-4xl text-slate-600 max-w-xl`}>
            {subtitle}
          </p>
        </motion.div>

        {/* Right Side Image */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="hidden lg:block relative w-[400px] h-[400px]"
        >
          <Image src={headerBoyImage} alt="About us" fill className="object-contain drop-shadow-2xl" />
        </motion.div>
      </div>

      {/* Wave Bottom Transition */}
      <div className="absolute bottom-0 left-0 w-full leading-[0]">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-[60px] fill-[#FFFDF6]">
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
        </svg>
      </div>
    </div>
  );
};

export default AboutHeader;