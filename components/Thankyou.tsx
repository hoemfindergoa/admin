"use client"
import React from 'react';
import MegaDiagnosticsNavbar from '@/app/navbar/navbar';

// Aceternity-inspired components with updated color palette
const BackgroundBeams = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-800/10 to-transparent transform rotate-12 scale-150">
        <div className="h-full w-full bg-gradient-to-b from-transparent via-purple-700/15 to-transparent animate-pulse"></div>
      </div>
      <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-purple-500/30 to-transparent"></div>
      <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-yellow-400/25 to-transparent"></div>
      <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-500/25 to-transparent"></div>
      <div className="absolute bottom-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-yellow-400/20 to-transparent"></div>
    </div>
  );
};

const GlowingOrb = ({ className = "" }) => {
  return (
    <div className={`absolute rounded-full blur-xl opacity-25 animate-pulse ${className}`}>
      <div className="w-full h-full bg-gradient-to-r from-purple-600 to-purple-800 rounded-full"></div>
    </div>
  );
};

const TextShimmer = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-300/30 to-transparent animate-shimmer transform -skew-x-12"></div>
      {children}
    </div>
  );
};

const FloatingParticles = () => {
  const particles = Array.from({ length: 20 }, (_, i) => (
    <div
      key={i}
      className={`absolute w-1 h-1 rounded-full animate-bounce ${
        i % 3 === 0 ? 'bg-yellow-400/40' : 'bg-purple-400/30'
      }`}
      style={{
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 3}s`,
        animationDuration: `${2 + Math.random() * 2}s`
      }}
    />
  ));
  
  return <div className="absolute inset-0 overflow-hidden">{particles}</div>;
};

function ThankYouPage() {
  return (
<div>
      <MegaDiagnosticsNavbar/>
     <div className="min-h-screen bg-gradient-to-br from-purple-950 via-purple-900 to-purple-950 relative overflow-hidden flex items-center justify-center">
      {/* Background Effects */}
      <BackgroundBeams />
      <FloatingParticles />
      
      {/* Glowing Orbs */}
      <GlowingOrb className="w-64 h-64 -top-32 -left-32" />
      <GlowingOrb className="w-96 h-96 -bottom-48 -right-48" />
      <GlowingOrb className="w-32 h-32 top-1/4 right-1/4" />
      
      {/* Main Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        {/* Main Thank You Text */}
        <TextShimmer className="mb-8">
          <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-yellow-300 via-yellow-200 to-purple-200 bg-clip-text text-transparent animate-fade-in">
            Thank You
          </h1>
        </TextShimmer>
        
        {/* Subtitle */}
        <div className="mb-12">
          <p className="text-xl md:text-2xl text-purple-100 font-light leading-relaxed animate-fade-in-delay">
            Thank you for contacting us.
            <br />
            <span className="text-yellow-300">We will connect with you very soon.</span>
          </p>
        </div>
        
        {/* Decorative Elements */}
        <div className="flex justify-center items-center space-x-4 mb-8">
          <div className="w-12 h-px bg-gradient-to-r from-transparent to-purple-400"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-400 animate-ping"></div>
          <div className="w-12 h-px bg-gradient-to-l from-transparent to-yellow-400"></div>
        </div>
        
        {/* Success Icon */}
        <div className="relative inline-block mb-8">
          <div className="w-24 h-24 rounded-full border-2 border-yellow-400/40 flex items-center justify-center relative">
            <div className="absolute inset-0 rounded-full bg-yellow-400/15 animate-pulse"></div>
            <svg 
              className="w-12 h-12 text-yellow-300 animate-bounce-slow" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M5 13l4 4L19 7" 
              />
            </svg>
          </div>
          <div className="absolute inset-0 rounded-full border-2 border-yellow-400/25 animate-ping"></div>
        </div>
        
        {/* Additional Message */}
        <p className="text-purple-200 text-sm md:text-base max-w-md mx-auto leading-relaxed mb-8">
          Your message has been received successfully. Our team will review it and get back to you within 24 hours.
        </p>
        
        {/* WhatsApp Contact */}
        <div className="bg-gradient-to-r from-purple-800/30 to-purple-700/20 border border-yellow-400/30 rounded-xl p-6 max-w-md mx-auto backdrop-blur-sm">
          <div className="flex items-center justify-center mb-4">
            <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-purple-900" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.787"/>
              </svg>
            </div>
            <h3 className="text-yellow-300 font-semibold text-lg">Urgent Support</h3>
          </div>
          
          <p className="text-purple-100 text-sm mb-4 text-center">
            In case you have something urgent, you can contact us on WhatsApp
          </p>
          
          <a 
            href="https://wa.me/919351411126" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-400 hover:to-yellow-300 text-purple-900 font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-yellow-400/25"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.787"/>
            </svg>
            WhatsApp: +91 999 999 6266
          </a>
        </div>
      </div>
      
      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-purple-950 to-transparent"></div>
      
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%) skewX(-12deg); }
          100% { transform: translateX(200%) skewX(-12deg); }
        }
        
        @keyframes fade-in {ab
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fade-in-delay {
          0% { opacity: 0; transform: translateY(20px); }
          50% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
        
        .animate-fade-in-delay {
          animation: fade-in-delay 2s ease-out;
        }
        
        .animate-bounce-slow {
          animation: bounce-slow 2s infinite;
        }
      `}</style>
    </div>
</div> 
  );
}

export default ThankYouPage;