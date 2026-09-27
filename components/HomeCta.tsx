"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Star, Cloud } from "lucide-react";
import Image from "next/image";
import girlwithbucket from "../public/girlwithcup.png"; // Ensure path is correct
import { Titan_One, Nunito, Caveat } from 'next/font/google';
import Link from "next/link";

// --- FONT CONFIGURATION ---
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

const handwritingFont = Caveat({
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
});

const LittleDreamersBanner = () => {
  return (
    <section 
      className={`relative w-full min-h-[700px] lg:h-[80vh] md:my-[10px] my-[30px]  overflow-hidden bg-[#FCECE6] flex items-center ${bodyFont.className}`}
    >
      
      {/* --- TOP CLOUD WAVE --- */}
      {/* No rotation here creates the "ceiling" effect */}
      <div className="absolute top-0 left-0 w-full leading-none overflow-hidden z-30">
        <svg 
            className="relative block w-full h-[60px] md:h-[100px]" 
            data-name="Layer 1" 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 1200 120" 
            preserveAspectRatio="none"
        >
            <path 
                d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" 
                className="fill-white"
            ></path>
        </svg>
      </div>

      {/* --- BACKGROUND DECORATIONS --- */}
      <div className="absolute inset-0 pointer-events-none">
         {/* 1. Large Teal Blob (Top Left) */}
         <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1 }}
            className="absolute -top-20 -left-20 w-96 h-96 bg-[#9BC6C0]/20 rounded-full blur-3xl"
        />
        
        {/* 2. Large Pink Blob (Middle Right) */}
        <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="absolute top-1/4 -right-20 w-80 h-80 bg-[#D33060]/10 rounded-full blur-3xl"
        />

        {/* 3. Dotted Path Doodle */}
        <svg className="absolute top-10 left-0 w-full h-full opacity-30" viewBox="0 0 100 100" preserveAspectRatio="none">
             <path d="M0,10 Q30,40 60,10 T100,20" fill="none" stroke="#D33060" strokeWidth="0.3" strokeDasharray="1,1" />
        </svg>

        {/* 4. Floating Cloud Icon */}
        <motion.div
            className="absolute top-32 right-[20%] text-white/80 hidden md:block"
            animate={{ x: [0, -20, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        >
            <Cloud size={64} fill="white" className="drop-shadow-sm" />
        </motion.div>
      </div>

      {/* --- FLOATING STICKERS --- */}
      <motion.div 
        animate={{ rotate: [0, 10, -10, 0], y: [0, -10, 0] }}
        transition={{ duration: 5, repeat: Infinity }}
        className="absolute top-[25%] left-[45%] hidden lg:block z-10"
      >
        <Star className="w-10 h-10 text-[#F4D03F] drop-shadow-md" fill="currentColor" strokeWidth={3} stroke="white" />
      </motion.div>

      {/* --- CONTENT CONTAINER --- */}
      {/* Added pt-32 to push content below the top wave */}
      <div className="container mx-auto px-6 relative z-20 h-full pt-32 pb-20 md:py-0">
        <div className="flex flex-col md:flex-row items-center justify-between h-full">
          
          {/* LEFT: Text Content */}
          <motion.div 
            className="w-full md:w-1/2 text-center md:text-left flex flex-col items-center md:items-start z-30"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Badge */}
            <span className={`inline-block px-4 py-1 mb-4 text-lg text-[#D33060] bg-white rounded-full shadow-sm rotate-[-2deg] ${handwritingFont.className} font-bold border border-rose-100`}>
                Welcome to Little Dreamers at cambridge!
            </span>

            {/* Headline */}
            <h1 className={`${titleFont.className} leading-tight mb-6`}>
              <span className="block text-4xl md:text-6xl lg:text-7xl text-[#3E3431] drop-shadow-sm">
                DREAM BIG
              </span>
              <span className="block text-4xl md:text-6xl lg:text-7xl text-[#D33060] mt-2 relative">
                & Grow Together
                {/* Underline decoration */}
                <svg className="absolute w-2/3 h-4 -bottom-2 left-0 md:left-0 right-0 md:right-auto mx-auto md:mx-0 text-[#9BC6C0]" viewBox="0 0 100 10" preserveAspectRatio="none">
                    <path d="M0,5 Q50,10 100,5" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                </svg>
              </span>
            </h1>

            {/* Tagline */}
            <p className="text-[#3E3431]/80 text-lg md:text-xl font-medium mb-8 max-w-lg leading-relaxed">
              At Little Dreamers, we nurture curiosity, spark creativity, and celebrate every little step of their big journey.
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto font-bold">
              <Link href="/admission">
              <motion.a
                href="/enroll"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group relative inline-flex items-center justify-center bg-[#D33060] text-white text-lg py-4 px-10 rounded-full shadow-[0_10px_20px_rgba(211,48,96,0.3)] hover:bg-[#b0264d] transition-all duration-300 overflow-hidden"
                >
                <span className="relative z-10 flex items-center gap-2">
                  Enroll Now
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </motion.a>
                </Link>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center justify-center bg-white text-[#3E3431] text-lg py-4 px-10 rounded-full shadow-md hover:shadow-lg border-2 border-white hover:border-[#FCECE6] transition-all duration-300 text-slate-700"
              >
                View Programs
              </motion.button>
            </div>
          </motion.div>

          {/* RIGHT: Image */}
          <motion.div 
            className="w-full md:w-1/2 flex justify-center md:justify-end mt-12 md:mt-0 relative z-20"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0, y: [0, -10, 0] }}
            transition={{ 
                opacity: { duration: 0.8, delay: 0.3 },
                x: { duration: 0.8, delay: 0.3 },
                y: { duration: 6, repeat: Infinity, ease: "easeInOut" } // Float animation
            }}
          >
             {/* Character Image */}
             <div className="relative w-[300px] h-[350px] md:w-[450px] md:h-[550px] lg:w-[600px] lg:h-[650px]">
               <Image
                 src={girlwithbucket}
                 alt="Little Dreamer Character with Bucket"
                 fill
                 className="object-contain object-bottom drop-shadow-2xl"
                 priority
               />
             </div>
          </motion.div>
        </div>
      </div>

      {/* --- BOTTOM CLOUD WAVE (Flipped) --- */}
      <div className="absolute bottom-0 left-0 w-full leading-none rotate-180 overflow-hidden z-30">
        <svg 
            className="relative block w-full h-[60px] md:h-[100px]" 
            data-name="Layer 1" 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 1200 120" 
            preserveAspectRatio="none"
        >
            <path 
                d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" 
                className="fill-white"
            ></path>
        </svg>
      </div>

    </section>
  );
};

export default LittleDreamersBanner;