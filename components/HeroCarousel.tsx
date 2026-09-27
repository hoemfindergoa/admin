"use client"
import React from 'react';
import { Star, Moon, Rocket, Cloud } from 'lucide-react';

const WhimsicalTimeline = () => {
  return (
    <div className="min-h-screen bg-[#f9f7f2] text-slate-700 font-sans relative overflow-hidden">
      {/* --- Global Styles for Fonts & Animations --- */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Patrick+Hand&family=Quicksand:wght@400;600&display=swap');
        
        .font-hand { font-family: 'Patrick+Hand', cursive; }
        .font-body { font-family: 'Quicksand', sans-serif; }
        
        .cloud-shape {
          border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float 6s ease-in-out 3s infinite;
        }
        
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
          100% { transform: translateY(0px); }
        }
        
        /* Textured Paper Effect Overlay */
        .paper-texture {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E");
          opacity: 0.4;
        }
      `}</style>

      {/* Paper Texture Overlay */}
      <div className="absolute inset-0 paper-texture pointer-events-none z-0 mix-blend-multiply" />

      <div className="relative z-10 max-w-4xl mx-auto pb-32">
        
        {/* --- SVG Winding Path --- */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none z-0 opacity-40">
          <svg className="w-full h-[2000px]" viewBox="0 0 400 1200" preserveAspectRatio="none">
            {/* This path draws the winding road. 
              M = Move to start
              Q = Quadratic Bezier Curve (ControlPointX ControlPointY, EndX EndY)
              T = Smooth continuation
            */}
            <path 
              d="M 200 50 
                 Q 150 150 200 250
                 T 200 450 
                 T 200 650 
                 T 200 850
                 T 200 1050"
              fill="none" 
              stroke="#555" 
              strokeWidth="2" 
              strokeDasharray="8,8"
              className="opacity-30"
            />
          </svg>
        </div>

        {/* --- Header Section --- */}
        <header className="text-center pt-20 pb-12 relative">
          <div className="inline-block relative">
            <h1 className="text-5xl font-hand text-slate-600 mb-2">Night Night</h1>
            <h2 className="text-4xl font-hand text-slate-400">Sleep Tight</h2>
            {/* Sleeping Moon Icon */}
            <div className="absolute -top-12 -right-16 text-yellow-400 animate-float">
              <div className="bg-white p-3 rounded-full shadow-sm">
                <Moon size={48} fill="#fde047" strokeWidth={0} />
                <span className="absolute top-0 right-0 text-blue-300 text-xl font-bold z-10">zZ</span>
              </div>
            </div>
          </div>
          <p className="mt-6 max-w-md mx-auto text-slate-500 font-body text-sm">
            Explore the dreamy landscape of our journey. Follow the path to discover hidden treasures.
          </p>
        </header>

        {/* --- Timeline Items --- */}
        <div className="relative space-y-24">

          {/* Item 1: The Donut Planet (Left) */}
          <div className="relative flex justify-center md:justify-start md:pl-20">
             {/* Background Blob/Cloud */}
            <div className="relative bg-[#fff9c4] p-8 w-64 cloud-shape transform -rotate-2 z-10">
              <div className="absolute -top-8 -left-8 animate-float-delayed text-4xl">🪐</div>
              <h3 className="font-hand text-2xl text-yellow-700 mb-2">Reach the Stars</h3>
              <p className="font-body text-xs text-yellow-800/70 leading-relaxed">
                Our first stop on the journey takes us to the ringed planet of sweetness.
              </p>
              <button className="mt-4 px-4 py-1 bg-yellow-400 text-white font-hand rounded-full text-sm hover:bg-yellow-500 transition">
                Explore
              </button>
            </div>
            
            {/* Path Decoration */}
            <div className="absolute right-1/2 top-0 translate-x-16 hidden md:block">
               <Rocket className="text-red-400 animate-float" size={32} />
            </div>
          </div>

          {/* Item 2: The Cloud Castle (Right) */}
          <div className="relative flex justify-center md:justify-end md:pr-20">
             {/* Background Blob/Cloud */}
            <div className="relative bg-white p-8 w-72 rounded-[40px] border-4 border-dashed border-blue-100 transform rotate-1 z-10 shadow-sm">
              <div className="absolute -right-6 -top-6 bg-blue-100 rounded-full p-2">
                 <Cloud size={32} className="text-blue-400" fill="white" />
              </div>
              <h3 className="font-hand text-2xl text-blue-400 mb-2">Cloud Nine</h3>
              <p className="font-body text-xs text-slate-500 leading-relaxed">
                1. Dream big and sleep well.<br/>
                2. Count the sheep jumping over fences.<br/>
                3. Wake up refreshed.
              </p>
              <div className="mt-3 w-full h-1 bg-blue-50 rounded-full overflow-hidden">
                <div className="w-2/3 h-full bg-blue-300 rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Item 3: The Star Bonus (Center/Left) */}
          <div className="relative flex justify-center">
             <div className="bg-[#fef3c7] p-6 rounded-full w-56 h-56 flex flex-col items-center justify-center text-center shadow-inner border-4 border-white z-10">
                <h3 className="font-hand text-3xl text-orange-400 rotate-[-5deg]">Bonus!</h3>
                <div className="flex gap-2 mt-2">
                   <Star className="text-yellow-500 animate-bounce" fill="#f59e0b" size={24} />
                   <Star className="text-yellow-400 animate-bounce delay-100" fill="#fbbf24" size={20} />
                </div>
                <p className="font-body text-xs text-orange-800/60 mt-2 px-2">
                  Collect all the stars to unlock the secret dream level.
                </p>
             </div>
          </div>

          {/* Item 4: The Ocean Deep (Right) */}
          <div className="relative flex justify-center md:justify-end md:pr-32 pt-10">
             {/* Background Blob/Cloud */}
            <div className="relative bg-[#e0f2fe] p-8 w-64 cloud-shape transform -rotate-1 z-10">
              <h3 className="font-hand text-2xl text-sky-600 mb-2">Deep Blue</h3>
              <p className="font-body text-xs text-sky-800/70 leading-relaxed">
                Dive into the subconscious ocean where the whales sing lullabies.
              </p>
              <div className="absolute -bottom-10 -right-10 text-6xl animate-float-delayed">
                🐳
              </div>
              <div className="mt-4 text-center">
                <span className="inline-block bg-sky-500 text-white text-[10px] px-2 py-1 rounded uppercase tracking-widest font-bold">
                  Dive In
                </span>
              </div>
            </div>
             {/* Floating bubbles decoration */}
            <div className="absolute left-0 top-0 text-sky-200 text-xl opacity-50 animate-pulse">∘</div>
            <div className="absolute left-4 top-4 text-sky-300 text-2xl opacity-50 animate-pulse">｡</div>
          </div>
          
          {/* Footer Area */}
          <div className="text-center pt-20">
            <div className="bg-slate-800 text-white inline-block px-8 py-3 rounded-t-3xl rounded-b-lg shadow-lg transform rotate-1">
                <span className="font-hand text-xl">Thanks for watching!</span>
            </div>
             {/* Decorative mountains at bottom */}
             <div className="flex justify-center items-end gap-[-20px] mt-10 opacity-80">
                <div className="w-0 h-0 border-l-[30px] border-l-transparent border-b-[50px] border-b-slate-700 border-r-[30px] border-r-transparent"></div>
                <div className="w-0 h-0 border-l-[40px] border-l-transparent border-b-[70px] border-b-slate-600 border-r-[40px] border-r-transparent -ml-4"></div>
                <div className="w-0 h-0 border-l-[25px] border-l-transparent border-b-[40px] border-b-slate-700 border-r-[25px] border-r-transparent -ml-4"></div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default WhimsicalTimeline;