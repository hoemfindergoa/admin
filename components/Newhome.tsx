"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  Phone,
  Mail,
  Facebook,
  Instagram,
  Star,
  Heart,
  Shield,
  Shapes,
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Utility for merging tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Reusable Vibrant Bento Box Wrapper
const BentoBox = ({
  children,
  className,
  bgClass, // Pass the background color class specifically
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  bgClass: string;
  delay?: number;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay, type: "spring", bounce: 0.3 }}
      className={cn(
        // Base styles: super rounded corners, overflow hidden to crop images, relative positioning
        "relative overflow-hidden rounded-[2.5rem] p-6 md:p-8 shadow-lg hover:shadow-xl transition-all duration-300 group",
        bgClass,
        className
      )}
    >
       {/* Subtle inner glow effect for a "toy" plastic look */}
      <div className="absolute inset-0 bg-white/10 pointer-events-none mix-blend-overlay rounded-[2.5rem]"></div>
      
      {/* Content Wrapper to ensure text stays on top of absolute images */}
      <div className="relative z-20 h-full flex flex-col">
        {children}
      </div>
    </motion.div>
  );
};

export default function VibrantKindergartenHero() {
  return (
    <section className="min-h-screen bg-[#FFF5F5] p-4 md:p-8 font-sans overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Decorative background blobs like the reference */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
        
        {/* THE VIBRANT GRID */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-4 md:grid-rows-3 gap-6 md:h-[850px]">
          
          {/* 1. MAIN HERO (Large Pink Block - Top Left) */}
          <BentoBox bgClass="bg-pink-500" className="md:col-span-2 md:row-span-2 text-white justify-center">
            <div className="max-w-md">
               {/* Decorative Elements */}
               <Heart className="absolute top-4 right-4 w-12 h-12 text-pink-300/50 rotate-12 fill-current" />
               <Star className="absolute bottom-20 left-10 w-8 h-8 text-yellow-300 rotate-45 fill-current z-30" />

              <h1 className="text-5xl md:text-7xl font-black leading-none mb-6 drop-shadow-sm">
                Where <span className="text-yellow-300">Fun</span> Meets <br />
                Learning!
              </h1>
              <p className="text-lg md:text-xl font-bold text-pink-100 mb-8 leading-relaxed max-w-xs md:max-w-md">
                A magical place for your little one to grow, play, and discover their potential.
              </p>
              <button className="bg-yellow-400 text-pink-900 px-10 py-4 rounded-full font-black text-lg shadow-[0_8px_0_rgb(234,179,8)] hover:shadow-[0_4px_0_rgb(234,179,8)] hover:translate-y-1 transition-all">
                Enroll Today
              </button>
            </div>
            
            {/* IMAGE: REPLACE WITH TRANSPARENT PNG OF HAPPY CHILD */}
            <img 
               src="/api/placeholder/500/600" 
               alt="Happy Kindergarten Child"
               className="absolute bottom-0 right-0 md:right-[-50px] w-64 md:w-[450px] object-contain z-10 group-hover:scale-105 transition-transform duration-500"
               style={{ filter: "drop-shadow(0 10px 15px rgba(0,0,0,0.2))" }}
            />
          </BentoBox>

          {/* 2. ABOUT US (Cyan Block - Top Right) */}
          <BentoBox delay={0.2} bgClass="bg-cyan-500" className="md:col-span-1 md:row-span-1 text-white justify-between">
            <div>
              <h2 className="text-3xl font-black mb-3">About Us</h2>
              <p className="font-bold text-cyan-50 leading-snug">
                Nurturing curiosity in a safe, vibrant environment since 2015. We build confidence!
              </p>
            </div>
            {/* IMAGE: SMALLER CHILD IMAGE */}
             <img 
               src="/api/placeholder/300/300" 
               alt="Child playing"
               className="absolute bottom-[-20px] right-[-20px] w-32 md:w-40 object-contain z-10 rotate-[-10deg] group-hover:rotate-0 transition-transform"
            />
          </BentoBox>

          {/* 3. PROGRAMS (Yellow Vertical Block - Far Right) */}
          <BentoBox delay={0.3} bgClass="bg-yellow-400" className="md:col-span-1 md:row-span-2 text-yellow-900">
            <div className="mb-6">
               <Shapes className="w-12 h-12 mb-2 text-yellow-700 fill-current" />
               <h2 className="text-3xl font-black leading-tight">Our <br/>Programs</h2>
            </div>
            
            <div className="flex-1 flex flex-col gap-4 relative z-30">
              {['Toddlers (1.5-2.5y)', 'Nursery (2.5-3.5y)', 'Junior KG (3.5-4.5y)', 'Senior KG (4.5-5.5y)'].map((item, i) => (
                <motion.div 
                  key={i} 
                  whileHover={{ scale: 1.05, x: 10 }}
                  className="bg-white/70 backdrop-blur-sm p-4 rounded-2xl shadow-sm cursor-pointer flex items-center justify-between"
                >
                  <span className="font-black text-sm md:text-base">{item}</span>
                  <Star className="w-5 h-5 text-yellow-600 fill-current" />
                </motion.div>
              ))}
            </div>
             {/* IMAGE: EDUCATIONAL TOYS OR STACKING BLOCKS */}
            <img 
               src="/api/placeholder/350/500" 
               alt="Educational Toys"
               className="absolute bottom-0 right-0 w-full object-cover opacity-30 mix-blend-overlay z-0"
            />
          </BentoBox>

          {/* 4. USP & VALUES (Green Wide Block - Middle) */}
          <BentoBox delay={0.4} bgClass="bg-lime-500" className="md:col-span-3 md:row-span-1 text-white flex-row items-center justify-around text-left gap-4">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                {/* IMAGE: WIDE SHOT OF KIDS PLAYING TOGETHER, LOW OPACITY */}
                <img src="/api/placeholder/800/400" alt="Kids Playing safely" className="w-full h-full object-cover opacity-20 mix-blend-soft-light" />
            </div>

            <div className="flex items-center gap-4 relative z-20">
              <div className="bg-white/20 p-3 rounded-2xl">
                <Shield className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-2xl font-black">100% Safe</h3>
                <p className="font-bold text-lime-100">CCTV & Secure Entry</p>
              </div>
            </div>
            <div className="flex items-center gap-4 relative z-20">
              <div className="bg-white/20 p-3 rounded-2xl">
                <Heart className="w-10 h-10 fill-current" />
              </div>
              <div>
                <h3 className="text-2xl font-black">Loving Care</h3>
                <p className="font-bold text-lime-100">Certified Teachers</p>
              </div>
            </div>
             <div className="flex items-center gap-4 relative z-20 md:flex">
              <div className="bg-white/20 p-3 rounded-2xl">
                <Star className="w-10 h-10 fill-current" />
              </div>
              <div>
                <h3 className="text-2xl font-black">Play & Learn</h3>
                <p className="font-bold text-lime-100">Modern Curriculum</p>
              </div>
            </div>
          </BentoBox>

          {/* 5. CONTACT FOOTER (Orange Block - Bottom) */}
          <BentoBox delay={0.5} bgClass="bg-orange-500" className="md:col-span-4 text-white flex-col md:flex-row justify-between items-center gap-6 py-8">
             {/* IMAGE: PEAKING CHILD AT BOTTOM */}
             <img 
               src="/api/placeholder/400/250" 
               alt="Child waving"
               className="absolute bottom-[-30px] left-10 w-48 object-contain z-0 opacity-50 md:opacity-100"
            />

             <div className="flex items-center gap-4 relative z-20 md:w-1/3 md:pl-32">
                <MapPin className="w-8 h-8 text-orange-200" />
                <div>
                   <h4 className="font-black text-lg">Our Campus</h4>
                   <p className="font-bold text-orange-100 text-sm">123 Rainbow Street, Kinder City</p>
                </div>
             </div>

             <div className="flex flex-col justify-center gap-2 relative z-20 md:w-1/3 text-center font-black text-lg">
                <a href="tel:+1234567890" className="hover:text-orange-200 transition-colors flex items-center justify-center gap-2">
                   <Phone className="w-5 h-5" /> (555) 123-4567
                </a>
                <a href="mailto:hi@kinder.com" className="hover:text-orange-200 transition-colors flex items-center justify-center gap-2">
                   <Mail className="w-5 h-5" /> hi@kinder.com
                </a>
             </div>

             <div className="flex gap-4 relative z-20 md:w-1/3 justify-end">
                <a href="#" className="bg-white/20 p-4 rounded-full hover:bg-white hover:text-blue-600 transition-all hover:scale-110">
                   <Facebook className="w-7 h-7" fill="currentColor" />
                </a>
                <a href="#" className="bg-white/20 p-4 rounded-full hover:bg-white hover:text-pink-600 transition-all hover:scale-110">
                   <Instagram className="w-7 h-7" />
                </a>
             </div>
          </BentoBox>

        </div>
      </div>
       {/* Tailwind config needed for blob animation */}
      <style jsx global>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </section>
  );
}