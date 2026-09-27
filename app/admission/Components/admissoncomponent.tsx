'use client';

import React, { useCallback } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { 
  Home, ChevronRight, Star, Loader2, 
  Phone, MapPin, ClipboardCheck, Camera,
  MessageCircle, Sparkles, CheckCircle, Mail, Globe, Building2, Map, MessageSquare
} from "lucide-react";
import { Luckiest_Guy, Nunito, Caveat } from 'next/font/google';
import Image from "next/image";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";
import type { Engine } from "tsparticles-engine";
import { EmailFormschemaType } from "@/lib/schema";

// --- IMAGES ---
import headerImage from "../../../public/test/649.webp"; 

// --- FONTS ---
const bubbleFont = Luckiest_Guy({ subsets: ['latin'], weight: ['400'] });
const bodyFont = Nunito({ subsets: ['latin'], weight: ['600', '800'] });
const handFont = Caveat({ subsets: ['latin'], weight: ['700'] });

// --- BUBBLE TEXT COMPONENT ---
const BubbleText = ({ text, sizeClass = "text-4xl md:text-6xl" }: { text: string, sizeClass?: string }) => {
  const colors = ['text-blue-500', 'text-red-500', 'text-yellow-500', 'text-green-500', 'text-orange-500', 'text-purple-500'];
  return (
    <div className="flex flex-wrap justify-center lg:justify-start gap-x-1">
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

const WaveSeparator = ({ color }: { color: string }) => (
  <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] transform rotate-180 z-20">
    <svg className="relative block w-full h-[60px] md:h-[100px]" viewBox="0 0 1200 120" preserveAspectRatio="none">
      <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill={color}></path>
    </svg>
  </div>
);

export default function AdmissionPage({ 
  isLoading, 
  onHandleSubmit, 
  defaultEmail 
}: { 
  isLoading: boolean; 
  onHandleSubmit: (data: EmailFormschemaType) => void; 
  defaultEmail?: any;
}) {
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  const { register, handleSubmit, formState: { errors } } = useForm<EmailFormschemaType>({
    mode: "all",
    defaultValues: {
      email: defaultEmail?.email || "",
      name: defaultEmail?.name || "",
      phone: defaultEmail?.phone || "",
      country: defaultEmail?.country || "",
      city: defaultEmail?.city || "",
      state: defaultEmail?.state || "",
      admission_seeking: "Little Explorers - Playgroup (2 - 3 Years)"
    },
  });

  return (
    <div className={`w-full flex flex-col bg-[#FFFDF6] ${bodyFont.className} overflow-hidden`}>
      
      {/* 1. HERO HEADER */}
      <header className="relative w-full h-[60vh] min-h-[650px] bg-[#fdf2f8] flex items-center overflow-hidden">
        <div className="container mx-auto px-6 relative z-10 grid lg:grid-cols-2 items-center">
          <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }}>
            <div className="inline-flex items-center gap-2 text-slate-700 text-sm font-black bg-white border-2 border-black px-4 py-2 rounded-full mb-8 shadow-[4px_4px_0_0_#000]">
                <Home className="w-4 h-4" />
                <span>HOME</span>
                <ChevronRight className="w-4 h-4" />
                <span>ADMISSION</span>
            </div>
            <BubbleText text="Admissions" sizeClass="text-5xl md:text-8xl" />
            <div className="mt-[-10px] md:mt-[-20px] mb-8">
                <BubbleText text="Open!" sizeClass="text-6xl md:text-9xl" />
            </div>
            <p className="text-xl md:text-2xl text-slate-700 font-black leading-tight [text-shadow:_1px_1px_0_#fff]">
              Join our family today. We are excited to meet your little one!
            </p>
          </motion.div>
          <motion.div animate={{ y: [0, -20, 0] }} className="hidden lg:flex justify-center">
            <Image src={headerImage} alt="Join Us" width={400} height={400} className="object-contain drop-shadow-2xl" priority />
          </motion.div>
        </div>
        <WaveSeparator color="#FFFDF6" />
      </header>

      {/* 2. PROCESS STEPS */}
      <section className="py-24 container mx-auto px-6 relative">
        <Particles id="adm-particles" init={particlesInit} className="absolute inset-0 z-0 pointer-events-none opacity-30"
          options={{ fullScreen: false, particles: { color: { value: ["#FF6B6B", "#4D96FF"] }, move: { enable: true, speed: 1 }, number: { value: 30 }, shape: { type: "star" }, size: { value: { min: 4, max: 10 } } } }} />
        
        <div className="text-center mb-16 relative z-10">
          <BubbleText text="ADMISSION   PROCESS" />
          <p className="text-lg text-slate-500 font-bold mt-4">A simple 4-step journey to enrollment.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
          {[
            { icon: <MessageCircle />, title: "Enquiry", desc: "Fill out the online form.", color: "bg-rose-400" },
            { icon: <Camera />, title: "Campus Visit", desc: "Tour our modern facility.", color: "bg-blue-400" },
            { icon: <ClipboardCheck />, title: "Registration", desc: "Submit the necessary documents.", color: "bg-emerald-400" },
            { icon: <Sparkles />, title: "Welcome!", desc: "A joyful start for your child.", color: "bg-purple-400" },
          ].map((step, i) => (
            <motion.div key={i} whileHover={{ y: -10 }} className="bg-white border-4 border-black p-8 rounded-[2.5rem] shadow-[8px_8px_0_0_#000] text-center">
               <div className={`w-16 h-16 ${step.color} border-4 border-black rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[4px_4px_0_0_#000] text-white`}>
                  {React.cloneElement(step.icon as React.ReactElement, { size: 30, strokeWidth: 3 })}
               </div>
               <h4 className={`${bubbleFont.className} text-2xl mb-3`}>{step.title}</h4>
               <p className="text-sm text-slate-500 font-bold">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 3. FULL ADMISSION FORM */}
      <section className="relative w-full bg-[#4D96FF] py-32 overflow-hidden border-t-8 border-black">
        <div className="container mx-auto px-6 relative z-10">
           <div className="text-center mb-16">
              <BubbleText text="ENQUIRY     FORM" sizeClass="text-4xl md:text-7xl" />
              <p className="text-white text-xl font-black mt-4 [text-shadow:_1px_1px_0_#000]">Please fill in the details below</p>
           </div>

           <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
             className="max-w-4xl mx-auto bg-white rounded-[3rem] p-8 md:p-12 shadow-[12px_12px_0_0_#000] border-4 border-black relative">
             
              <div className="absolute -top-10 -left-4 w-24 h-24 bg-yellow-400 border-4 border-black rounded-[2rem] flex items-center justify-center shadow-[4px_4px_0_0_#000] rotate-12 animate-pulse">
                  <Star className="w-12 h-12 text-black fill-black" />
              </div>

              <form onSubmit={handleSubmit(onHandleSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Name */}
                  <div className="flex flex-col gap-2">
                     <label className="font-black text-slate-800 ml-2 text-xs uppercase flex items-center gap-2">
                       <Home className="w-3 h-3" /> Full Name *
                     </label>
                     <input 
                        {...register("name", { required: true })} 
                        type="text" 
                        placeholder="John Doe" 
                        disabled={isLoading}
                        className={`w-full bg-slate-50 border-4 rounded-2xl py-3 px-6 text-slate-700 font-black shadow-[4px_4px_0_0_#000] outline-none transition-colors ${errors.name ? 'border-red-500' : 'border-black'}`} 
                      />
                  </div>

                  {/* Email */}
                  <div className="flex flex-col gap-2">
                     <label className="font-black text-slate-800 ml-2 text-xs uppercase flex items-center gap-2">
                       <Mail className="w-3 h-3" /> Email *
                     </label>
                     <input 
                        {...register("email", { required: true, pattern: /^\S+@\S+$/i })} 
                        type="email" 
                        placeholder="hello@example.com" 
                        disabled={isLoading}
                        className={`w-full bg-slate-50 border-4 rounded-2xl py-3 px-6 text-slate-700 font-black shadow-[4px_4px_0_0_#000] outline-none transition-colors ${errors.email ? 'border-red-500' : 'border-black'}`} 
                      />
                  </div>

                  {/* Phone */}
                  <div className="flex flex-col gap-2">
                     <label className="font-black text-slate-800 ml-2 text-xs uppercase flex items-center gap-2">
                       <Phone className="w-3 h-3" /> Phone Number *
                     </label>
                     <input 
                        {...register("phone", { required: true })} 
                        type="tel" 
                        placeholder="+91 00000 00000" 
                        disabled={isLoading}
                        className={`w-full bg-slate-50 border-4 rounded-2xl py-3 px-6 text-slate-700 font-black shadow-[4px_4px_0_0_#000] outline-none transition-colors ${errors.phone ? 'border-red-500' : 'border-black'}`} 
                      />
                  </div>

                  {/* Country */}
                  <div className="flex flex-col gap-2">
                     <label className="font-black text-slate-800 ml-2 text-xs uppercase flex items-center gap-2">
                       <Globe className="w-3 h-3" /> Country *
                     </label>
                     <input 
                        {...register("country", { required: true })} 
                        type="text" 
                        placeholder="Country" 
                        disabled={isLoading}
                        className={`w-full bg-slate-50 border-4 rounded-2xl py-3 px-6 text-slate-700 font-black shadow-[4px_4px_0_0_#000] outline-none transition-colors ${errors.country ? 'border-red-500' : 'border-black'}`} 
                      />
                  </div>

                  {/* City */}
                  <div className="flex flex-col gap-2">
                     <label className="font-black text-slate-800 ml-2 text-xs uppercase flex items-center gap-2">
                       <Building2 className="w-3 h-3" /> City *
                     </label>
                     <input 
                        {...register("city", { required: true })} 
                        type="text" 
                        placeholder="City" 
                        disabled={isLoading}
                        className={`w-full bg-slate-50 border-4 rounded-2xl py-3 px-6 text-slate-700 font-black shadow-[4px_4px_0_0_#000] outline-none transition-colors ${errors.city ? 'border-red-500' : 'border-black'}`} 
                      />
                  </div>

                  {/* State */}
                  <div className="flex flex-col gap-2">
                     <label className="font-black text-slate-800 ml-2 text-xs uppercase flex items-center gap-2">
                       <Map className="w-3 h-3" /> State *
                     </label>
                     <input 
                        {...register("state", { required: true })} 
                        type="text" 
                        placeholder="State" 
                        disabled={isLoading}
                        className={`w-full bg-slate-50 border-4 rounded-2xl py-3 px-6 text-slate-700 font-black shadow-[4px_4px_0_0_#000] outline-none transition-colors ${errors.state ? 'border-red-500' : 'border-black'}`} 
                      />
                  </div>

                  {/* Program Selection */}
                  <div className="flex flex-col gap-2 md:col-span-2">
                    <label className="font-black text-slate-800 ml-2 text-xs uppercase">Program Seeking Admission For</label>
                    <div className="relative">
                      <select 
                        {...register("admission_seeking")} 
                        className="w-full bg-slate-50 border-4 border-black rounded-2xl py-3 px-6 text-slate-700 font-black shadow-[4px_4px_0_0_#000] outline-none appearance-none"
                      >
                        <option value="Little Explorers - Playgroup (2 - 3 Years)">Little Explorers - Playgroup (2 - 3 Years)</option>
                        <option value="Curious Learners - Nursery (3 - 4 Years)">Curious Learners - Nursery (3 - 4 Years)</option>
                        <option value="Creative Thinkers - Lower Kindergarten (4 - 5 Years)">Creative Thinkers - LKG (4 - 5 Years)</option>
                        <option value="Future Leaders - Upper Kindergarten (5 - 6 Years)">Future Leaders - UKG (5 - 6 Years)</option>
                        <option value="Daycare">Daycare</option>
                      </select>
                      <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 w-6 h-6 pointer-events-none" />
                    </div>
                  </div>

                  {/* Message */}
                  <div className="flex flex-col gap-2 md:col-span-2">
                    <label className="font-black text-slate-800 ml-2 text-xs uppercase flex items-center gap-2">
                      <MessageSquare className="w-3 h-3" /> Message (Optional)
                    </label>
                    <textarea 
                      {...register("message")} 
                      rows={3} 
                      placeholder="Any specific questions for us?" 
                      disabled={isLoading}
                      className="w-full bg-slate-50 border-4 border-black rounded-2xl py-3 px-6 text-slate-700 font-black shadow-[4px_4px_0_0_#000] outline-none resize-none" 
                    />
                  </div>

                  <div className="md:col-span-2 mt-6">
                    <motion.button 
                      whileHover={!isLoading ? { scale: 1.02 } : {}} 
                      whileTap={!isLoading ? { scale: 0.98 } : {}} 
                      type="submit" 
                      disabled={isLoading}
                      className={`w-full bg-[#FF6B6B] text-white font-black py-5 rounded-[2rem] border-4 border-black shadow-[8px_8px_0_0_#000] active:shadow-none active:translate-y-2 transition-all flex items-center justify-center gap-3 text-2xl ${isLoading ? 'opacity-70 cursor-not-allowed shadow-none' : ''}`}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-8 h-8 animate-spin" />
                          <span>SENDING...</span>
                        </>
                      ) : (
                        <>
                          <span>SUBMIT APPLICATION</span>
                          <CheckCircle className="w-7 h-7 stroke-[3px]" />
                        </>
                      )}
                    </motion.button>
                  </div>
              </form>
           </motion.div>
        </div>
      </section>

      {/* 4. FOOTER NOTE */}
      <footer className="py-20 text-center container mx-auto px-6 relative">
         <div className="absolute top-10 right-10 opacity-10 rotate-12">
            <Sparkles className="w-24 h-24 text-blue-500" />
         </div>
         <p className={`${handFont.className} text-4xl lg:text-6xl text-rose-500 font-bold mb-4`}>
            "A world of laughter and learning awaits!"
         </p>
         <div className="flex justify-center flex-wrap gap-4">
            <div className="bg-white border-2 border-black p-3 rounded-2xl shadow-[4px_4px_0_0_#000] flex items-center gap-2">
               <Phone className="w-5 h-5 text-emerald-500" />
               <span className="text-xs font-black">+91 9999 6060 90</span>
            </div>
            <div className="bg-white border-2 border-black p-3 rounded-2xl shadow-[4px_4px_0_0_#000] flex items-center gap-2">
               <MapPin className="w-5 h-5 text-rose-500" />
               <span className="text-xs font-black">Visit Our Campus</span>
            </div>
         </div>
      </footer>
    </div>
  );
}