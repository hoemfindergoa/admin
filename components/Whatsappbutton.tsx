"use client"
import React, { useState } from "react";
import { BsWhatsapp } from "react-icons/bs";
function Whatsappbutton() {
      const [isHovered, setIsHovered] = useState(false);
      // Replace this with your actual WhatsApp number (include country code without + sign)
      const whatsappNumber = "+919024311126"; // Example: 91 for India + your 10-digit number
      const message = "Hi! I would like to know more about your diagnostic services.";
      
      const handleWhatsAppClick = () => {
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
        window.open(whatsappUrl, '_blank');
      };
  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Pulse animation rings */}
      <div className="absolute inset-0 rounded-full animate-ping bg-green-500 opacity-20"></div>
      <div className="absolute inset-0 rounded-full animate-ping bg-green-500 opacity-30" style={{ animationDelay: '0.5s' }}></div>
      
      {/* Main button */}
      <button
        onClick={handleWhatsAppClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative w-16 h-16 bg-green-500 hover:bg-green-600 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 flex items-center justify-center group"
        style={{
          background: isHovered 
            ? 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)' 
            : 'linear-gradient(135deg, #25D366 0%, #25D366 100%)',
          boxShadow: isHovered 
            ? '0 20px 40px rgba(37, 211, 102, 0.4)' 
            : '0 10px 25px rgba(37, 211, 102, 0.3)'
        }}
        aria-label="Contact us on WhatsApp"
      >
        <BsWhatsapp 
          size={28} 
          className="text-white transition-transform duration-300 group-hover:rotate-12" 
        />
        
        {/* Tooltip */}
        <div 
          className={`absolute right-20 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-all duration-300 ${
            isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'
          }`}
          style={{
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
          }}
        >
          Chat with us on WhatsApp
          {/* Arrow */}
          <div 
            className="absolute top-1/2 -right-1 transform -translate-y-1/2 w-2 h-2 bg-gray-800 rotate-45"
          ></div>
        </div>
      </button>
      
      {/* Floating particles effect */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-green-400 rounded-full animate-bounce opacity-60"
            style={{
              left: `${20 + i * 15}%`,
              top: `${20 + i * 10}%`,
              animationDelay: `${i * 0.3}s`,
              animationDuration: '2s'
            }}
          />
        ))}
      </div>
    </div>
  )
}

export default Whatsappbutton