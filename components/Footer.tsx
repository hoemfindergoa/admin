'use client';

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { 
  Mail, Phone, Facebook, Instagram, Send, Heart, Youtube, Globe, Star
} from "lucide-react";
import Image from "next/image";
import { Luckiest_Guy, Nunito, Caveat } from 'next/font/google';
import logo from "../public/logonew.png";
import supabase from "@/utils/supabase/supabase";

// --- SUPABASE IMPORT ---
// Replace this with your actual supabase client import
// import { supabase } from "@/lib/supabase"; 

// --- PARTICLES IMPORTS ---
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";
import type { Engine } from "tsparticles-engine";

// --- IMAGE IMPORTS ---
import floatingBoy from "../public/test/634.webp";

// --- FONTS ---
const bubbleFont = Luckiest_Guy({ subsets: ['latin'], weight: ['400'] });
const bodyFont = Nunito({ subsets: ['latin'], weight: ['600', '800'] });
const handwritingFont = Caveat({ subsets: ['latin'], weight: ['700'] });

// --- CONSISTENT BUBBLE TEXT COMPONENT ---
const BubbleHeading = ({ text, sizeClass = "text-2xl lg:text-3xl" }: { text: string, sizeClass?: string }) => {
  const colors = ['text-blue-400', 'text-red-400', 'text-yellow-400', 'text-green-400', 'text-orange-400', 'text-purple-400'];
  return (
    <div className="flex flex-wrap gap-x-1 mb-6">
      {text.split("").map((char, i) => (
        <span
          key={i}
          className={`relative inline-block ${sizeClass} ${bubbleFont.className} ${colors[i % colors.length]} 
          [text-shadow:_2px_2px_0_#000,_-1px_-1px_0_#000,_1px_-1px_0_#000,_-1px_1px_0_#000,_1px_1px_0_#000]`}
        >
          {char}
          {['o', 'e', 'p', 'a', 'd'].includes(char.toLowerCase()) && (
            <span className="absolute top-[40%] left-1/2 -translate-x-1/2 flex gap-0.5 pointer-events-none">
              <span className="w-0.5 h-0.5 bg-black rounded-full" />
              <span className="w-0.5 h-0.5 bg-black rounded-full" />
            </span>
          )}
        </span>
      ))}
    </div>
  );
};

const Footer = () => {
  const [isHealthy, setIsHealthy] = useState(false);

  // --- SUPABASE KEEP-ALIVE FETCH ---
  useEffect(() => {
    const checkSupabaseHealth = async () => {
      try {
        const { data, error } = await supabase
          .from('health')
          .select('health')
          .limit(1)
          .single();
        
        if (!error && data?.health === true) {
          setIsHealthy(true);
        }
        setIsHealthy(true); 
      } catch (err) {
        console.error("Health check failed", err);
      }
    };

    checkSupabaseHealth();
  }, []);

  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };
  
  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } },
  };

  return (
    <footer className={`relative bg-[#1A1A1A] pt-32 pb-10 overflow-hidden text-slate-200 ${bodyFont.className}`}>
      
      {/* --- HEALTH STATUS INDICATOR (The Green Dot) --- */}
      {isHealthy && (
        <div className="absolute top-4 right-4 z-50 flex items-center gap-2 bg-black/40 px-3 py-1 rounded-full border border-white/10">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
          </span>
          <span className="text-[10px] font-black uppercase tracking-tighter text-green-500/80">System Live</span>
        </div>
      )}

      {/* 1. PARTICLES BACKGROUND */}
      <Particles
        id="footer-particles"
        init={particlesInit}
        className="absolute inset-0 z-0 pointer-events-none opacity-40"
        options={{
          fullScreen: false,
          background: { color: { value: "transparent" } },
          fpsLimit: 120,
          interactivity: {
            events: { onHover: { enable: true, mode: "bubble" } },
            modes: { bubble: { distance: 200, duration: 2, size: 0, opacity: 0 } },
          },
          particles: {
            color: { value: ["#ffffff", "#fde047"] },
            move: {
              enable: true,
              direction: "none",
              outModes: { default: "out" },
              random: true,
              speed: 0.3,
              straight: false,
            },
            number: { density: { enable: true, area: 800 }, value: 60 },
            opacity: {
              value: { min: 0.1, max: 0.8 },
              animation: { enable: true, speed: 0.5, sync: false },
            },
            shape: { type: "star" },
            size: { value: { min: 1, max: 3 } },
          },
          detectRetina: true,
        }}
      />

      {/* 2. FLOATING BACKGROUND IMAGE */}
      <motion.div 
        animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute right-[-5%] bottom-[10%] w-[300px] lg:w-[500px] opacity-20 z-0 pointer-events-none blend-overlay"
      >
        <Image src={floatingBoy} alt="floating element" className="object-contain" />
      </motion.div>

      {/* 3. DECORATIVE TOP CURVE */}
      <div className="absolute top-0 left-0 w-full overflow-hidden leading-[0] z-20">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-[60px] fill-[#FFFDF6]">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
        </svg>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="container mx-auto px-6 relative z-10"
      >
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* --- BRAND BLOCK --- */}
          <motion.div variants={itemVariants} className="space-y-6">
            <div className="bg-white inline-block px-10 py-1 shadow-sm rounded-md border-2 border-black">
              <Link href="/" className="inline-block">
                <Image src={logo} alt="Logo" className="w-[140px] h-auto" />
              </Link>
            </div>
            
            <p className="text-slate-400 text-sm leading-relaxed font-bold max-w-xs">
              Launching little astronauts into a universe of learning through play, creativity, and exploration.
            </p>
            
            <div className="flex gap-4">
               {[
                 { Icon: Facebook, color: "bg-blue-500", shadow: "shadow-[3px_3px_0_0_#1e40af]" , href: "https://www.facebook.com/BESTPRESCHOOLDAYCARE" },
                 { Icon: Instagram, color: "bg-pink-500", shadow: "shadow-[3px_3px_0_0_#9d174d]", href: "https://www.instagram.com/BESTPRESCHOOL_AND_DAYCARE" },
                 { Icon: Youtube, color: "bg-red-500", shadow: "shadow-[3px_3px_0_0_#991b1b]", href:"https://www.youtube.com/@BestPreschoolAndDayCare" }
               ].map((item, idx) => (
                 <motion.a 
                    key={idx} 
                    target="_blank"
                    href={item.href} 
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className={`w-11 h-11 rounded-xl border-2 border-black ${item.color} ${item.shadow} text-white flex items-center justify-center transition-all`}
                 >
                   <item.Icon className="w-5 h-5" />
                 </motion.a>
               ))}
            </div>
          </motion.div>

          {/* --- QUICK LINKS --- */}
          <motion.div variants={itemVariants}>
            <BubbleHeading text="QUICK LINKS" sizeClass="text-xl lg:text-2xl" />
            <ul className="space-y-3">
              {[
                { name: 'About Us', href: '/about' },
                { name: 'Our Programs', href: '/#programs' },
                { name: 'Admission', href: '/admission' },
                { name: 'Contact us', href: '/contact' }
              ].map((item) => (
                <li key={item.name}>
                  <Link href={item.href} className="text-slate-400 hover:text-yellow-400 transition-all duration-300 inline-flex items-center gap-2 text-sm font-black group">
                    <Star className="w-3 h-3 text-slate-600 group-hover:text-yellow-400 transition-colors" />
                    {item.name.toUpperCase()}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* --- CONTACT BASE --- */}
          <motion.div variants={itemVariants}>
            <BubbleHeading text="CONTACT BASE" sizeClass="text-xl lg:text-2xl" />
            <ul className="space-y-4">
              {[
                { icon: <Globe />, text: 'bestpreschoolanddaycare.com', href: 'https://www.bestpreschoolanddaycare.com', color: 'text-blue-400' },
                { icon: <Mail />, text: 'info@bestpreschoolanddaycare.com', href: 'mailto:info@bestpreschoolanddaycare.com', color: 'text-pink-400' },
                { icon: <Phone />, text: '+91-9999 6060 90', href: 'tel:+919999606090', color: 'text-orange-400' }
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-4 group">
                  <div className={`w-10 h-10 rounded-xl bg-white border-2 border-black flex items-center justify-center shrink-0 shadow-[3px_3px_0_0_#000] ${item.color}`}>
                    {React.cloneElement(item.icon as React.ReactElement, { className: "w-5 h-5" })}
                  </div>
                  <a href={item.href} className="text-sm font-bold text-slate-400 group-hover:text-white transition-colors">
                    {item.text}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* --- NEWSLETTER BLOCK --- */}
          <motion.div variants={itemVariants}>
            <BubbleHeading text="STAY UPDATED" sizeClass="text-xl lg:text-2xl" />
            <p className="text-sm text-slate-400 mb-5 font-bold leading-relaxed">
              Subscribe for mission updates and parenting tips!
            </p>
            <div className="relative group">
              <input 
                type="email" 
                placeholder="Email address..." 
                className="w-full bg-white border-2 border-black rounded-2xl pl-5 pr-14 py-4 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none shadow-[4px_4px_0_0_#000] font-black"
              />
              <button className="absolute right-2 top-2 bottom-2 w-10 h-10 bg-[#FF6B6B] border-2 border-black rounded-xl flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-all shadow-[2px_2px_0_0_#000]">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>

        </div>

        {/* --- BOTTOM BAR --- */}
        <motion.div 
          variants={itemVariants}
          className="pt-8 border-t-2 border-black/20 flex flex-col md:flex-row justify-between items-center gap-4"
        >
          <p className="text-sm text-slate-500 font-black flex flex-wrap justify-center items-center gap-1 uppercase tracking-tighter">
              © 2025 Best Preschool and daycare. Made with <Heart className="w-3 h-3 text-red-500 fill-red-500 animate-bounce mx-1"/> by 
              <a href="https://scalesaas.ashishrohilla.co.in/" target="_blank" rel="noreferrer" className={`ml-1 text-white hover:text-yellow-400 transition-colors ${handwritingFont.className} text-2xl`}>
                  scalesaas
              </a>
          </p>
          <div className="flex gap-6 text-xs font-black text-slate-500 uppercase tracking-widest">
            <Link href="/privacypolicy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/privacypolicy" className="hover:text-white transition-colors">Terms</Link>
          </div>
        </motion.div>
      </motion.div>
    </footer>
  );
};

export default Footer;