'use client';

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Home, ChevronRight, MapPin, Phone, Clock, Navigation,
  Search, ArrowRight, School, Globe, Sparkles, Timer, Star
} from "lucide-react";
import { Luckiest_Guy, Nunito } from 'next/font/google';
import Link from "next/link";

// --- FONTS ---
const bubbleFont = Luckiest_Guy({ subsets: ['latin'], weight: ['400'] });
const bodyFont = Nunito({ subsets: ['latin'], weight: ['600', '800'] });

// --- DATA STRUCTURES (Kept Same) ---
type Center = {
  id: string;
  name: string;
  address: string;
  phone: string;
  hours: string;
  mapEmbed: string; 
  slug: string;
};

type LocationData = {
  [country: string]: {
    [state: string]: {
      [city: string]: Center[];
    };
  };
};

// --- DATASETS (Kept Same) ---
const admissionOpenDB: LocationData = {};
const openingShortlyDB: LocationData = {
  "India": {
    "Delhi": {
      "Patel Nagar": [{ id: "patel-nagar", name: "Best Preschool and Daycare Patel Nagar", address: "Patel Nagar, Delhi", phone: "+91 98765 43210", hours: "Opening Soon", slug: "patel-nagar", mapEmbed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14006.18572186715!2d77.161400!3d28.644800!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390d029969100001%3A0x6339000000000000!2sPatel%20Nagar%2C%20New%20Delhi%2C%20Delhi!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin" }],
      "Tagore Garden": [{ id: "tagore-garden", name: "Best Preschool and Daycare Tagore Garden", address: "Tagore Garden, Delhi", phone: "+91 98765 43211", hours: "Opening Soon", slug: "tagore-garden", mapEmbed: "" }]
    },
    "Haryana": {
      "Karnal": [{ id: "hr-karnal", name: "Best Preschool and Daycare Karnal", address: "Karnal, Haryana", phone: "+91 98765 43212", hours: "Opening Soon", slug: "karnal", mapEmbed: "" }],
      "Ambala": [{ id: "hr-ambala", name: "Best Preschool and Daycare Ambala", address: "Ambala, Haryana", phone: "+91 98765 43213", hours: "Opening Soon", slug: "ambala", mapEmbed: "" }]
    },
    "Jammu": {
        "Kathua": [{ id: "jm-kathua", name: "Best Preschool and Daycare Kathua", address: "Kathua, Jammu", phone: "+91 98765 43214", hours: "Opening Soon", slug: "kathua", mapEmbed: "" }]
    },
    "Maharashtra": {
        "Pune": [{ id: "mh-pune", name: "Best Preschool and Daycare Pune", address: "Pune, Maharashtra", phone: "+91 98765 43219", hours: "Opening Soon", slug: "pune", mapEmbed: "" }]
    }
  }
};

// --- BUBBLE TEXT COMPONENT ---
const BubbleText = ({ text, sizeClass = "text-4xl md:text-7xl" }: { text: string, sizeClass?: string }) => {
  const colors = ['text-blue-500', 'text-red-500', 'text-yellow-500', 'text-green-500', 'text-orange-500', 'text-purple-500'];
  return (
    <div className="flex flex-wrap justify-center lg:justify-start gap-x-1">
      {text.split("").map((char, i) => (
        <span key={i} className={`relative inline-block ${sizeClass} ${bubbleFont.className} ${colors[i % colors.length]} [text-shadow:_3px_3px_0_#000,_-1px_-1px_0_#000,_1px_-1px_0_#000,_-1px_1px_0_#000,_1px_1px_0_#000]`}>
          {char}
          {['o', 'e', 'p', 'a', 'd', 'c'].includes(char.toLowerCase()) && (
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
    
    </div>
);

const CentersPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'open' | 'shortly'>('shortly');
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [selectedState, setSelectedState] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [centerList, setCenterList] = useState<Center[]>([]);
  const [activeCenter, setActiveCenter] = useState<Center | null>(null);

  const activeDB = activeTab === 'open' ? admissionOpenDB : openingShortlyDB;

  useEffect(() => {
    const countries = Object.keys(activeDB);
    if (countries.length > 0) setSelectedCountry(countries[0]!);
    else { setSelectedCountry(""); setSelectedState(""); setSelectedCity(""); setCenterList([]); setActiveCenter(null); }
  }, [activeTab]);

  useEffect(() => {
    if (!selectedCountry) return;
    const states = Object.keys(activeDB[selectedCountry] || {});
    if (states.length > 0) {
      setSelectedState(states[0]!);
      const cities = Object.keys(activeDB[selectedCountry]?.[states[0]!] || {});
      setSelectedCity(cities.length > 0 ? cities[0]! : "");
    }
  }, [selectedCountry, activeDB]);

  useEffect(() => {
    if (selectedCountry && selectedState && selectedCity) {
        const centers = activeDB[selectedCountry]?.[selectedState]?.[selectedCity] || [];
        setCenterList(centers);
        if (centers.length > 0) setActiveCenter(centers[0]!);
    }
  }, [selectedCity, selectedState, selectedCountry, activeDB]);

  return (
    <div className={`w-full flex flex-col bg-[#FFFDF6] ${bodyFont.className}`}>
      
      {/* 1. HEADER */}
      <header className="relative w-full h-[60vh] min-h-[500px] bg-[#e0f2fe] flex items-center overflow-hidden">
        <div className="container mx-auto px-6 relative z-10 grid lg:grid-cols-2 items-center">
          <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }}>
            <div className="inline-flex items-center gap-2 text-slate-700 text-sm font-black bg-white border-2 border-black px-4 py-2 rounded-full mb-8 shadow-[4px_4px_0_0_#000]">
                <Home className="w-4 h-4" />
                <span>HOME</span>
                <ChevronRight className="w-4 h-4" />
                <span>OUR CENTERS</span>
            </div>
            <BubbleText text="FIND    YOUR" sizeClass="text-5xl md:text-8xl" />
            <div className="mt-[-10px] md:mt-[-10px] mb-8">
                <BubbleText text="NEAREST    CENTER" sizeClass="text-4xl md:text-6xl" />
            </div>
            <p className="text-xl md:text-2xl text-slate-700 font-black leading-tight [text-shadow:_1px_1px_0_#fff]">
              Explore our vibrant campuses across India!
            </p>
          </motion.div>
          <div className="hidden lg:flex justify-center opacity-20">
             <MapPin size={300} className="text-blue-400 rotate-12" />
          </div>
        </div>
        <WaveSeparator color="#FFFDF6" />
      </header>

      <section className="relative w-full py-24 px-6 overflow-hidden">
        
        {/* TAB SWITCHER */}
        <div className="flex justify-center mb-16">
          <div className="bg-white border-4 border-black p-2 rounded-[2.5rem] shadow-[8px_8px_0_0_#000] inline-flex gap-4">
            <button 
                onClick={() => setActiveTab('open')}
                className={`px-8 py-4 rounded-3xl font-black text-lg transition-all flex items-center gap-2 border-2 ${activeTab === 'open' ? 'bg-[#6BCB77] text-white border-black shadow-[4px_4px_0_0_#000]' : 'bg-transparent text-slate-400 border-transparent hover:bg-slate-50'}`}
            >
              <Sparkles size={20} /> ADMISSION OPEN
            </button>
            <button 
                onClick={() => setActiveTab('shortly')}
                className={`px-8 py-4 rounded-3xl font-black text-lg transition-all flex items-center gap-2 border-2 ${activeTab === 'shortly' ? 'bg-[#FF6B6B] text-white border-black shadow-[4px_4px_0_0_#000]' : 'bg-transparent text-slate-400 border-transparent hover:bg-slate-50'}`}
            >
              <Timer size={20} /> OPENING SHORTLY
            </button>
          </div>
        </div>

        {/* FILTER BAR */}
        {Object.keys(activeDB).length > 0 && (
          <div className="max-w-6xl mx-auto mb-20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 bg-white border-4 border-black p-8 rounded-[3rem] shadow-[12px_12px_0_0_#4D96FF]">
              {[
                { label: 'COUNTRY', icon: <Globe />, value: selectedCountry, onChange: setSelectedCountry, options: Object.keys(activeDB) },
                { label: 'STATE', icon: <MapPin />, value: selectedState, onChange: setSelectedState, options: selectedCountry ? Object.keys(activeDB[selectedCountry] || {}) : [] },
                { label: 'CITY', icon: <Navigation />, value: selectedCity, onChange: setSelectedCity, options: (selectedCountry && selectedState) ? Object.keys(activeDB[selectedCountry]?.[selectedState] || {}) : [] }
              ].map((filter, idx) => (
                <div key={idx} className="flex flex-col gap-2">
                  <label className="font-black text-slate-800 ml-2 text-xs tracking-widest">{filter.label}</label>
                  <div className="relative">
                    <div className="absolute left-4 top-4 text-blue-500">{filter.icon}</div>
                    <select 
                      value={filter.value} 
                      onChange={(e) => filter.onChange(e.target.value)}
                      className="w-full bg-slate-50 border-4 border-black rounded-2xl py-4 pl-12 pr-6 text-slate-700 font-black shadow-[4px_4px_0_0_#000] focus:shadow-none focus:translate-y-1 transition-all outline-none appearance-none"
                    >
                      {filter.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* RESULTS GRID */}
        <div className="container mx-auto">
          {centerList.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              
              {/* CENTER LISTING */}
              <div className="lg:col-span-5 flex flex-col gap-6 max-h-[700px] overflow-y-auto pr-4 custom-scrollbar">
                {centerList.map((center, index) => (
                  <motion.div
                    key={center.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => setActiveCenter(center)}
                    className={`relative rounded-[2.5rem] p-8 cursor-pointer transition-all border-4 border-black ${activeCenter?.id === center.id ? 'bg-white shadow-[10px_10px_0_0_#FFD93D] scale-[1.02]' : 'bg-white/60 shadow-[4px_4px_0_0_#000] opacity-80'}`}
                  >
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-blue-100 border-2 border-black rounded-xl flex items-center justify-center shadow-[3px_3px_0_0_#000]">
                           <School className="text-blue-600" />
                        </div>
                        <h3 className={`${bubbleFont.className} text-2xl text-slate-800 tracking-wide`}>{center.name}</h3>
                    </div>
                    <div className="space-y-3 text-slate-600 font-bold">
                       <div className="flex items-start gap-2"><MapPin size={18} className="text-rose-500 shrink-0 mt-1" /> <span>{center.address}</span></div>
                       <div className="flex items-center gap-2"><Phone size={18} className="text-emerald-500 shrink-0" /> <span>{center.phone}</span></div>
                       <div className="flex items-center gap-2"><Clock size={18} className="text-blue-500 shrink-0" /> <span>{center.hours}</span></div>
                    </div>
                    <div className="mt-6 pt-6 border-t-2 border-black/5 flex items-center justify-between">
                       <Link href={`/centers/${center.slug}`}>
                          <button className="bg-slate-900 text-white px-6 py-2 rounded-xl font-black text-xs border-2 border-black shadow-[4px_4px_0_0_#000] active:shadow-none hover:bg-black transition-all">VIEW CAMPUS</button>
                       </Link>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* STICKY MAP CONTAINER */}
              <div className="lg:col-span-7 sticky top-24">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    key={activeCenter?.id}
                    className="w-full h-[600px] rounded-[3rem] border-8 border-black shadow-[20px_20px_0_0_#4D96FF] overflow-hidden bg-slate-200 relative"
                >
                  {activeCenter?.mapEmbed ? (
                    <iframe src={activeCenter.mapEmbed} width="100%" height="100%" style={{ border: 0 }} allowFullScreen={true} loading="lazy" className="grayscale-[20%] hover:grayscale-0 transition-all duration-500"></iframe>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-blue-50 text-blue-400 p-10 text-center">
                       <MapPin size={60} className="mb-4 animate-bounce" />
                       <p className="font-black text-xl italic">"Map location coming shortly!"</p>
                    </div>
                  )}
                  {/* Floating Label */}
                  <div className="absolute top-6 left-6 right-6">
                
                  </div>
                </motion.div>
              </div>

            </div>
          ) : (
            /* EMPTY STATE */
            <div className="text-center py-32 bg-white border-4 border-dashed border-black rounded-[4rem]">
               <School size={80} className="mx-auto text-slate-200 mb-6" />
               <BubbleText text="COMING SOON" sizeClass="text-4xl lg:text-6xl" />
               <p className="text-slate-400 font-bold mt-4">We are expanding to this location shortly!</p>
            </div>
          )}
        </div>
      </section>
      <WaveSeparator color="white" />
    </div>
  );
};

export default CentersPage;