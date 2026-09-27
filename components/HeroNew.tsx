'use client';

import React, { useCallback, useRef } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";
import type { Engine } from "tsparticles-engine";
import Image from 'next/image';
import { Nunito, Luckiest_Guy } from 'next/font/google';
import { ArrowRight } from 'lucide-react';

// Using your images
import heroImage from "../public/test/641.webp"; 
const bubbleFont = Luckiest_Guy({ subsets: ['latin'], weight: ['400'] });
const bodyFont = Nunito({ subsets: ['latin'], weight: ['600', '800'] });

// Component to render the multi-colored bubble text with "eyes"
const BubbleHeading = ({ text }: { text: string }) => {
  const colors = ['text-blue-500', 'text-red-500', 'text-yellow-400', 'text-green-500', 'text-orange-500', 'text-purple-500'];
  
  return (
    <div className="flex flex-wrap justify-center lg:justify-start gap-x-1">
      {text.split("").map((char, i) => (
        <motion.span
          key={i}
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: i * 0.05, type: 'spring', stiffness: 200 }}
          className={`
            relative inline-block text-4  text-3xl md:text-6xl lg:text-7xl
            ${bubbleFont.className} 
            ${colors[i % colors.length]}
            [text-shadow:_4px_4px_0_#000,_-1px_-1px_0_#000,_1px_-1px_0_#000,_-1px_1px_0_#000,_1px_1px_0_#000]
            hover:scale-110 transition-transform cursor-default
          `}
        >
          {char}
          {/* Adding "Eyes" to specific letters like the image */}
          {['o', 'e', 'p', 'd'].includes(char.toLowerCase()) && (
            <span className="absolute top-[40%] left-1/2 -translate-x-1/2 flex gap-1 lg:gap-2 pointer-events-none">
              <span className="w-1 h-1 lg:w-2 lg:h-2 bg-black rounded-full" />
              <span className="w-1 h-1 lg:w-2 lg:h-2 bg-black rounded-full" />
            </span>
          )}
        </motion.span>
      ))}
    </div>
  );
};

const InteractiveHero: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseX = useSpring(x, { damping: 30, stiffness: 100 });
  const mouseY = useSpring(y, { damping: 30, stiffness: 100 });

  const rotateX = useTransform(mouseY, [-0.5, 0.5], [10, -10]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-10, 10]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    x.set(e.clientX / rect.width - 0.5);
    y.set(e.clientY / rect.height - 0.5);
  };

  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  return (
    <section 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className={`relative pt-12 min-h-screen w-full flex flex-col overflow-hidden bg-[#f9fdf9] ${bodyFont.className}`}
    >
      {/* BACKGROUND IMAGE LAYER (heroimage2)
      <div className="absolute inset-0 z-0 opacity-20 select-none">
        <Image src={heroimage2} alt="bg-texture" fill className="" />
      </div> */}

      {/* PARTICLES LAYER */}
      <Particles
        id="hero-particles"
        init={particlesInit}
        className="absolute inset-0 z-10 pointer-events-none"
        options={{
          fullScreen: false,
          particles: {
            color: { value: ["#FF6B6B", "#4D96FF", "#6BCB77", "#FFD93D"] },
            move: { enable: true, speed: 1.5, direction: "none", random: true },
            number: { value: 50, density: { enable: true, area: 800 } },
            opacity: { value: 0.7 },
            shape: { type: "circle" },
            size: { value: { min: 4, max: 10 } },
          },
        }}
      />

      {/* MAIN CONTENT AREA */}
      <div className="md:mx-[150px] mx-auto px-6 relative z-20 flex-1 flex flex-col lg:flex-row items-center justify-center gap-4 py-20 lg:py-0">
        
        {/* TEXT SIDE */}
        <div className="w-full lg:w-1/2 text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 inline-block"
          >
             <span className="bg-yellow-100 text-yellow-700 px-4 py-1.5 rounded-full text-[10px] md:text-[16px]   font-black uppercase tracking-widest border-2 border-yellow-200">
               Welcome to Best Preschool and Day Care
             </span>
          </motion.div>

          <div className="mb-8">
            <span className="inline-block">
              <BubbleHeading text="Best " />
            </span>
            <span className="inline-block">
              <BubbleHeading text="  Preschool" />
            </span>
            <div  className="inline-block mt-[-10px] lg:mt-[-10px]">
              <span className='pt-6'> <BubbleHeading text="And      DayCare" /></span> 
            </div>
          </div>

          <p className="text-xl text-slate-600 mb-10 max-w-lg mx-auto lg:mx-0 font-bold leading-relaxed">
            Where every little explorer finds their smile! A safe, colorful, and joyful place for your child to grow.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-6 justify-center lg:justify-start">
            <motion.button
              whileHover={{ scale: 1.1, rotate: 2 }}
              whileTap={{ scale: 0.9 }}
              className="px-10 py-5 bg-[#FF6B6B] text-white rounded-full font-black text-xl shadow-[0_8px_0_0_#b91c1c] active:shadow-none active:translate-y-1 transition-all flex items-center gap-2 border-2 border-black"
            >
              Enroll Now <ArrowRight className="w-6 h-6 stroke-[3px]" />
            </motion.button>

        
          </div>
        </div>

        {/* IMAGE SIDE (heroImage) */}
        <motion.div 
          style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
          className="w-full lg:w-1/2 relative h-[350px] md:h-[500px]"
        >
          <div className="relative w-full h-full">
            {/* Playful Floating Shape Background for Image */}
            {/* <div className="absolute inset-0 bg-blue-100 rounded-[40%_60%_70%_30%/40%_50%_60%_50%] animate-pulse" /> */}
            
            <Image 
              src={heroImage} 
              alt="Kids playing" 
              fill 
              priority
              className="object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.2)] z-10"
            />
          </div>
        </motion.div>
      </div>

      {/* BOTTOM CURVE */}
      {/* <div className="absolute bottom-0 left-0 w-full leading-[0] z-30">
        <svg className="relative block w-full h-[50px] lg:h-[100px]" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" fill="#ffffff" opacity=".5"></path>
          <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5V0Z" fill="#ffffff"></path>
        </svg>
      </div> */}
    </section>
  );
};

export default InteractiveHero;