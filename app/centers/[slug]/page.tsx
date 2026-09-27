'use client';

import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Home, ChevronRight, MapPin, Phone, Mail, Clock, School,
  CheckCircle, CalendarCheck, Star, Users, ShieldCheck, Play, Sparkles,Camera
} from "lucide-react";
import { Luckiest_Guy, Nunito, Caveat } from 'next/font/google';

// --- FONTS ---
const bubbleFont = Luckiest_Guy({ subsets: ['latin'], weight: ['400'] });
const bodyFont = Nunito({ subsets: ['latin'], weight: ['600', '800'] });
const handFont = Caveat({ subsets: ['latin'], weight: ['700'] });

// --- MOCK DATABASE (Updated with new school name) ---
type CenterDetails = {
  name: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  hours: string;
  description: string;
  mapEmbed: string;
  facilities: string[];
  image: string; 
  theme: string;
  shadow: string;
};

const centersDB: Record<string, CenterDetails> = {
  "patel-nagar": {
    name: "Best   Pre   School    and   Day    Care   Patel   Nagar",
    city: "New   Delhi",
    address: "Block 24, Near Patel Nagar Metro Station, New Delhi, 110008",
    phone: "+91 999 999 6266",
    email: "patelnagar@bestpreschoolanddaycare.com",
    hours: "8:30 AM - 1:30 PM",
    description: "Centrally located in the heart of Delhi, our Patel Nagar campus offers a premium Montessori environment. We focus on building a strong foundation through a blend of traditional values and modern teaching methodologies.",
    mapEmbed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14008.114688942263!2d77.16109965!3d28.64936355!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390d029c5f402c8b%3A0x4a4d468f3e5f5b0!2sPatel%20Nagar%2C%20New%20Delhi%2C%20Delhi!5e0!3m2!1sen!2sin!4v1625642432654!5m2!1sen!2sin",
    facilities: ["Smart Classrooms", "Ball Pool", "CCTV Enabled", "Indoor Play Zone", "Sensory Lab"],
    image: "bg-teal-200",
    theme: "bg-[#e0f2fe]",
    shadow: "shadow-[12px_12px_0_0_#38bdf8]"
  },
  "tagore-garden": {
    name: "Best   Pre   School    and    Day    Care   Tagore   Garden",
    city: "New   Delhi",
    address: "J-Block, Tagore Garden, Near Holy Child School, New Delhi, 110027",
    phone: "+91 999 999 6266",
    email: "tagoregarden@bestpreschoolanddaycare.com",
    hours: "8:30 AM - 1:30 PM",
    description: "Our Tagore Garden campus provides a sprawling, greenery-filled activity area where children can explore nature safely. We emphasize experiential learning and social development in a high-security environment.",
    mapEmbed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14009.678456834!2d77.106584!3d28.647567!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390d036e5f5f5b0%3A0x4a4d468f3e5f5b0!2sTagore%20Garden%2C%20New%20Delhi%2C%20Delhi!5e0!3m2!1sen!2sin!4v1625642432654!5m2!1sen!2sin",
    facilities: ["Outdoor Garden", "STEM Lab", "Storytelling Corner", "Nutritious Meals", "Splash Pool"],
    image: "bg-rose-200",
    theme: "bg-[#fff1f2]",
    shadow: "shadow-[12px_12px_0_0_#fb7185]"
  }
};

// --- BUBBLE TEXT COMPONENT ---
const BubbleText = ({ text, sizeClass = "text-4xl md:text-6xl" }: { text: string, sizeClass?: string }) => {
  const colors = ['text-blue-500', 'text-red-500', 'text-yellow-500', 'text-green-500', 'text-orange-500', 'text-purple-500'];
  return (
    <div className="flex flex-wrap justify-center gap-x-1">
      {text.split("").map((char, i) => (
        <span key={i} className={`relative inline-block ${sizeClass} ${bubbleFont.className} ${colors[i % colors.length]} [text-shadow:_3px_3px_0_#000,_-1px_-1px_0_#000,_1px_-1px_0_#000,_-1px_1px_0_#000,_1px_1px_0_#000]`}>
          {char}
          {['o', 'e', 'p', 'a', 'd', 'c', 'u'].includes(char.toLowerCase()) && (
            <span className="absolute top-[40%] left-1/2 -translate-x-1/2 flex gap-1 pointer-events-none">
              <span className="w-1 h-1 bg-black rounded-full" />
              <span className="w-1 h-1 bg-black rounded-full" />
            </span>
          )}
        </span>
      ))}
    </div>
  );
};

// --- REUSABLE WAVE COMPONENT ---
const WaveSeparator = ({ color }: { color: string }) => (
    <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] transform rotate-180 z-20">
      <svg className="relative block w-full h-[60px] md:h-[100px]" viewBox="0 0 1200 120" preserveAspectRatio="none">
        <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill={color}></path>
      </svg>
    </div>
);

export default function CenterProfile({ params }: { params: { slug: string } }) {
  const center = centersDB[params.slug];
  if (!center) return notFound();

  return (
    <div className={`w-full flex flex-col bg-[#FFFDF6] ${bodyFont.className}`}>
      
      {/* 1. HERO HEADER */}
      <header className={`relative w-full h-[60vh] min-h-[500px] ${center.theme} flex items-center justify-center overflow-hidden`}>
        <div className="absolute inset-0 pointer-events-none opacity-20">
           <motion.div animate={{ y: [0, -20, 0] }} className="absolute top-20 left-10"><School className="w-24 h-24 text-blue-400" /></motion.div>
           <motion.div animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity }} className="absolute bottom-20 right-10"><Star className="w-20 h-20 text-yellow-400 fill-yellow-400" /></motion.div>
        </div>

        <div className="relative z-10 text-center px-6 mt-8 max-w-5xl">
          <div className="inline-flex items-center gap-2 text-slate-700 text-sm font-black bg-white border-2 border-black px-4 py-2 rounded-full mb-8 shadow-[4px_4px_0_0_#000]">
              <Link href="/">HOME</Link> <ChevronRight size={14} /> 
              <Link href="/centers">CENTERS</Link> <ChevronRight size={14} /> 
              <span className="text-blue-500 uppercase">{center.city}</span>
          </div>

          <BubbleText text={center.name.toUpperCase()} />
          
          <div className="flex flex-wrap justify-center items-center gap-6 text-slate-700 font-black text-xl mt-8">
             <span className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border-2 border-black shadow-[3px_3px_0_0_#000]"><MapPin className="text-rose-500" /> {center.city}</span>
          </div>
        </div>
        <WaveSeparator color="#FFFDF6" />
      </header>

      {/* 2. INFO GRID & ABOUT */}
      <section className="relative w-full py-24 px-6 overflow-hidden">
        <div className="container mx-auto">
          {/* Quick Info Blocks */}
          <div className=" md:mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8 relative z-30">
            {[
              { icon: <MapPin />, label: "Address", text: center.address, color: "bg-rose-400", shadow: "shadow-[8px_8px_0_0_#e11d48]" },
              { icon: <Phone />, label: "Phone", text: center.phone, color: "bg-amber-400", shadow: "shadow-[8px_8px_0_0_#d97706]" },
              { icon: <Mail />, label: "Email", text: center.email, color: "bg-sky-400", shadow: "shadow-[8px_8px_0_0_#0284c7]" },
            ].map((card, i) => (
              <motion.div key={i} whileHover={{ y: -5 }} className={`bg-white border-4 border-black p-8 rounded-[2.5rem] ${card.shadow} flex flex-col items-center text-center gap-4 transition-all`}>
                 <div className={`w-14 h-14 ${card.color} border-4 border-black rounded-2xl flex items-center justify-center text-white shadow-[4px_4px_0_0_#000]`}>
                    {React.cloneElement(card.icon as React.ReactElement, { strokeWidth: 3 })}
                 </div>
                 <div>
                    <h3 className="font-black text-slate-800 uppercase tracking-widest text-xs mb-1">{card.label}</h3>
                    <p className="text-sm font-bold text-slate-500 leading-relaxed break-words">{card.text}</p>
                 </div>
              </motion.div>
            ))}
          </div>

          {/* About This Center */}
          <div className="mt-32 flex flex-col lg:flex-row items-center gap-20">
            <div className="w-full lg:w-1/2">
               <span className="bg-yellow-100 text-yellow-700 px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest border-2 border-yellow-200 mb-6 inline-block">
                 Campus Spotlight
               </span>
               <BubbleText text="WELCOME    TO" sizeClass="text-4xl md:text-6xl" />
               <div className="mt-[-10px] md:mt-[-10px] mb-8">
                  <BubbleText text={center.city.toUpperCase()} sizeClass="text-5xl md:text-7xl" />
               </div>
               <p className="text-xl text-slate-700 font-bold leading-relaxed mb-6 italic">
                 {center.description}
               </p>
               <p className="text-slate-500 font-bold leading-relaxed mb-10 text-lg">
                 At The Best Pre School and Day Care {center.city}, we believe in creating a safe, nurturing, and stimulating environment where your child can grow, learn, and thrive.
               </p>
               <motion.button whileHover={{ scale: 1.05, rotate: -2 }} className="bg-[#FF6B6B] text-white border-4 border-black px-10 py-5 rounded-[2rem] font-black text-xl shadow-[8px_8px_0_0_#000] active:shadow-none active:translate-y-2 transition-all flex items-center gap-3">
                 Book Campus Tour <CalendarCheck className="stroke-[3px]" />
               </motion.button>
            </div>
            
            <div className="w-full lg:w-1/2">
               <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} className={`relative w-full aspect-square rounded-[4rem] border-8 border-black overflow-hidden ${center.shadow} bg-white`}>
                  <div className="w-full h-full flex flex-col items-center justify-center bg-blue-50 text-blue-300">
                     <Camera size={80} strokeWidth={1} className="mb-4" />
                     <p className={`${handFont.className} text-3xl font-bold`}>View Our Gallery</p>
                  </div>
               </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FACILITIES STICKERS */}
      <section className="py-24 bg-white border-y-8 border-black relative">
        <div className="container mx-auto px-6 text-center">
          <BubbleText text="OUR FACILITIES" />
          <div className="flex flex-wrap justify-center gap-6 mt-16">
            {center.facilities.map((fact, idx) => (
              <motion.div key={idx} whileHover={{ scale: 1.1, rotate: idx % 2 === 0 ? 2 : -2 }} 
                className="bg-[#FFFDF6] border-4 border-black px-8 py-4 rounded-3xl shadow-[6px_6px_0_0_#000] flex items-center gap-3 group">
                <CheckCircle className="text-emerald-500 group-hover:scale-125 transition-transform" strokeWidth={4} />
                <span className="font-black text-slate-800 uppercase tracking-tighter">{fact}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. LARGE MAP & CTA */}
      <section className="py-24 container mx-auto px-6">
         <div className="w-full h-[600px] rounded-[4rem] border-8 border-black shadow-[20px_20px_0_0_#4D96FF] overflow-hidden bg-slate-100 relative group">
            <iframe src={center.mapEmbed} width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" className="grayscale-[20%] group-hover:grayscale-0 transition-all duration-700"></iframe>
            <div className="absolute top-8 left-8 bg-white border-4 border-black p-6 rounded-[2rem] shadow-[10px_10px_0_0_#000] max-w-xs">
               <p className="font-black text-slate-400 text-xs mb-1 uppercase">Find Us Here</p>
               <h4 className={`${bubbleFont.className} text-2xl text-slate-800`}>{center.city} CAMPUS</h4>
            </div>
         </div>

         <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} className="mt-24 bg-[#6BCB77] border-8 border-black rounded-[4rem] p-12 md:p-20 text-center text-white shadow-[15px_15px_0_0_#000] relative overflow-hidden">
            <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12"><Sparkles size={150} /></div>
            <h2 className={`${bubbleFont.className} text-5xl md:text-8xl mb-6 [text-shadow:_4px_4px_0_#000]`}>READY TO JOIN?</h2>
            <p className="text-xl md:text-2xl font-black mb-10 max-w-3xl mx-auto [text-shadow:_1px_1px_0_#000]">
               Admissions are open at The Best Pre School and Day Care {center.city}! Secure your explorer's spot today.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
               <Link href="/admission"><button className="bg-white text-slate-900 border-4 border-black px-12 py-5 rounded-[2rem] font-black text-2xl shadow-[8px_8px_0_0_#000] hover:bg-yellow-400 hover:translate-y-[-4px] active:translate-y-0 transition-all">
                 ENROLL NOW
               </button></Link>  
               <button className="bg-transparent text-white border-4 border-white px-12 py-5 rounded-[2rem] font-black text-2xl hover:bg-white/10 transition-all">
                 BROCHURE
               </button>
            </div>
         </motion.div>
      </section>
    </div>
  );
}