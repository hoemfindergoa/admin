"use client";

import React from "react";
import { motion } from "framer-motion";
import { Home, ChevronRight, Star, Heart, Cloud } from "lucide-react";
import Image from "next/image"; // 1. Import Next.js Image component
import Girlonwing from "../public/girlonwing.png"; // Ensure path is correct for your project structure
import { Titan_One, Nunito } from 'next/font/google';

// @import url('https://fonts.googleapis.com/css2?family=Chewy&family=Baloo+2:wght@400;700&display=swap');


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

// Ensure you have these fonts in your layout or globals.css
// @import url('https://fonts.googleapis.com/css2?family=Chewy&family=Baloo+2:wght@400;700&display=swap');

const ContactHeader = () => {
  return (
    // Adjusted min-h for better spacing on desktop
    <header className="relative w-full h-auto md:h-[60vh] min-h-[500px] bg-teal-400 flex items-center justify-center overflow-hidden pt-20 pb-32 md:py-0">
      
      {/* --- BACKGROUND DECORATIONS --- */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        
        {/* Large Teal Circle (Abstract Hill) */}
        <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1 }}
            className="absolute -top-20 -left-20 w-96 h-96 bg-[#9BC6C0]/20 rounded-full blur-3xl"
        />
        
        {/* Large Pink Circle - Shifted left slightly to avoid image overlap */}
        <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="absolute top-10 right-[20%] w-80 h-80 bg-[#D33060]/10 rounded-full blur-3xl"
        />

        {/* Floating Clouds */}
        <motion.div 
           animate={{ x: [0, 20, 0] }}
           transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
           className="absolute top-[15%] left-[10%] text-white opacity-80"
        >
            <Cloud size={64} fill="white" className="drop-shadow-sm" />
        </motion.div>

        <motion.div 
           animate={{ x: [0, -30, 0] }}
           transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
           className="absolute top-[25%] right-[35%] text-white opacity-60"
        >
            <Cloud size={48} fill="white" className="drop-shadow-sm" />
        </motion.div>
      </div>

      {/* --- MAIN CONTENT CONTAINER (Grid layout) --- */}
      <div className="relative z-10 w-full max-w-7xl px-6 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        
        {/* --- LEFT COLUMN: TEXT --- */}
        <div className="text-center md:text-left">
            {/* Breadcrumb Pill */}
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                // Removed center alignment for desktop
                className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm border-2 border-white px-5 py-2 rounded-full mb-8 shadow-sm"
            >
                <Home className="w-4 h-4 text-[#D33060]" />
                <span className="text-[#3E3431] font-bold text-sm hover:text-[#D33060] transition-colors cursor-pointer">Home</span>
                <ChevronRight className="w-4 h-4 text-[#9BC6C0]" />
                <span className="text-[#D33060] font-bold text-sm">Contact Us</span>
            </motion.div>

            {/* Title */}
            <motion.h1 
                initial={{ opacity: 0, scale: 0.9, x: -50 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                transition={{ duration: 0.5, type: "spring" }}
                className={`text-6xl lg:text-7xl text-[#3E3431] mb-2 drop-shadow-sm leading-tight ${titleFont.className}`}
            >
               Get In
            <span className="text-[#D33060]  ml-4 relative">
                Touch
                {/* Crown/Highlight Doodle - Uncommented for effect */}
            </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                // Adjusted max-width and margin for left alignment
                className="text-lg lg:text-3xl text-[#3E3431]/90 font-medium max-w-xl mx-auto md:mx-0 leading-relaxed mt-4"
                style={{ fontFamily: '"Baloo 2", cursive' }}
            >
            A place where imagination has no limits and every child is a star.
            </motion.p>
        </div>

        {/* --- RIGHT COLUMN: IMAGE --- */}
        {/* Hidden on small mobile, slides in on desktop */}
        <motion.div 
            initial={{ opacity: 0, x: 100 }}
            animate={{ 
                opacity: 1, 
                x: 0,
                y: [0, -15, 0] // Adds a gentle floating effect to the girl
            }}
            transition={{ 
                opacity: { duration: 0.8, delay: 0.3 },
                x: { type: "spring", stiffness: 50, delay: 0.3 },
                y: { duration: 6, repeat: Infinity, ease: "easeInOut" } // Floating animation
            }}
            className=" md:block relative z-20 mt-10 md:mt-0"
        >
            <Image 
                src={Girlonwing} 
                alt="Little Dreamer Girl Flying"
                priority // Loads image quickly as it's above the fold
                className="w-full ml-[2px] md:ml-[200px] h-[250px] md:h-auto max-h-[500px] object-contain drop-shadow-xl transform rotate-3 hover:rotate-0 transition-transform duration-500"
            />
        </motion.div>

      </div>

      {/* --- CLOUD/WAVE DIVIDER (Bottom) --- */}
      <div className="absolute bottom-0 left-0 w-full leading-none rotate-180 overflow-hidden z-30">
        <svg 
            className="relative block w-full h-[80px] md:h-[140px]" 
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

    </header>
  );
};

export default ContactHeader;