'use client';

import React, { useState, useEffect } from "react";
import { Menu, X, ArrowRight, Sparkles, Facebook, Instagram, Youtube, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation"; 
import { Luckiest_Guy, Nunito } from 'next/font/google';
import Image from "next/image";
import logo from "../../public/logonew.png";

// --- FONTS ---
const bubbleFont = Luckiest_Guy({ subsets: ['latin'], weight: ['400'] });
const bodyFont = Nunito({ subsets: ['latin'], weight: ['600', '800'] });

const Navbar = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);

  const colors = ['text-blue-500', 'text-red-500', 'text-yellow-500', 'text-green-500', 'text-orange-500', 'text-purple-500'];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      if (pathname === "/") {
        const sections = ["about", "programs", "gallery"];
        let current = "";
        for (const section of sections) {
          const element = document.getElementById(section);
          if (element) {
            const rect = element.getBoundingClientRect();
            if (rect.top <= 150 && rect.bottom >= 150) current = `/#${section}`;
          }
        }
        if (current) setActiveSection(current);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  const navLinks = [
    { href: "/about", label: "About Us" },
    { href: "/#programs", label: "Programs" },
    { href: "/Whyus", label: "Why Us" },
    { href: "/contact", label: "Contact" },
     { href: "/admission", label: "Admission" },
     { href: "/Ourcenters", label: "Our Centers" },
      { href: "/franchise", label: "Franchise" },
  ];

  const socialLinks = [
    { icon: Facebook, href: "https://www.facebook.com/BESTPRESCHOOLDAYCARE", color: "hover:text-blue-600 shadow-blue-200" },
    { icon: Instagram, href: "https://www.instagram.com/BESTPRESCHOOL_AND_DAYCARE", color: "hover:text-pink-600 shadow-pink-200" },
    { icon: Youtube, href: "https://www.youtube.com/@BestPreschoolAndDayCare", color: "hover:text-red-600 shadow-red-200" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-white/90 backdrop-blur-lg py-2 shadow-[0_4px_20px_rgba(0,0,0,0.05)] border-b-4 border-[#6BCB77]"
          : "bg-transparent py-6"
      }`}
    >
      <div className=" md:mx-[120px] mx-auto px-6">
        <div className="flex items-center justify-between">

          {/* --- LOGO --- */}
          <Link href="/" className="flex items-center group">
            <motion.div whileHover={{ scale: 1.1, rotate: [-2, 2, -2] }}>
              <Image src={logo} alt="Logo" width={160} height={70} className="object-contain" priority />
            </motion.div>
          </Link>

          {/* --- DESKTOP MENU --- */}
          <div className="hidden xl:flex items-center gap-6">
            {navLinks.map((link, idx) => {
              const isActive = pathname === link.href || (pathname === "/" && activeSection === link.href);
              const isHovered = hoveredLink === link.href;
              const linkColor = colors[idx % colors.length];

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onMouseEnter={() => setHoveredLink(link.href)}
                  onMouseLeave={() => setHoveredLink(null)}
                  className="relative px-2 py-1"
                >
                  <span className={`
                    text-lg tracking-wider transition-all duration-300
                    ${bubbleFont.className}
                    ${isActive || isHovered ? linkColor : 'text-slate-700'}
                    ${isActive || isHovered ? '[text-shadow:_1px_1px_0_#000]' : ''}
                  `}>
                    {link.label}
                  </span>
                  
                  {/* Active Bubble/Underline */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        layoutId="navUnderline"
                        className="absolute -bottom-1 left-0 w-full h-1 bg-yellow-400 rounded-full border border-black shadow-[2px_2px_0_0_#000]"
                      />
                    )}
                  </AnimatePresence>
                </Link>
              );
            })}
          </div>

          {/* --- RIGHT ACTIONS --- */}
          <div className="flex items-center gap-4">
            
            {/* Social Icons (Desktop) */}
            <div className="hidden lg:flex items-center gap-2 pr-4 border-r-2 border-slate-200">
                {socialLinks.map((social, i) => (
                    <motion.a 
                    target="_blank"
                        key={i} 
                        href={social.href} 
                        whileHover={{ scale: 1.2, rotate: 10 }}
                        className={`p-2 rounded-xl bg-white border-2 border-black shadow-[3px_3px_0_0_#000] ${social.color}`}
                    >
                      <social.icon className="w-4 h-4" />
                    </motion.a>
                ))}
            </div>

            {/* Redesigned 3D Enroll Button */}
            <Link href="/admission" className="hidden sm:block">
              <motion.button
                whileHover={{ scale: 1.05, rotate: -2 }}
                whileTap={{ scale: 0.95 }}
                className={`
                  bg-[#FF6B6B] text-white rounded-2xl px-8 py-3 
                  border-2 border-black
                  shadow-[4px_4px_0_0_#000] 
                  active:shadow-none active:translate-y-1
                  flex items-center gap-2 text-base font-black transition-all
                  ${bodyFont.className}
                `}
              >
                Enroll Now <Star className="w-4 h-4 fill-white" />
              </motion.button>
            </Link>

            {/* Mobile Toggle */}
            <button
              className="xl:hidden w-12 h-12 flex items-center justify-center bg-yellow-400 border-2 border-black shadow-[4px_4px_0_0_#000] rounded-xl text-black"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6 stroke-[3px]" /> : <Menu className="w-6 h-6 stroke-[3px]" />}
            </button>
          </div>
        </div>
      </div>

      {/* --- MOBILE MENU --- */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="xl:hidden fixed inset-0 z-50 bg-[#FFFDF6] flex flex-col p-8"
          >
            <div className="flex justify-between items-center mb-12">
              <Image src={logo} alt="Logo" width={120} height={50} />
              <button onClick={() => setMobileMenuOpen(false)} className="w-12 h-12 bg-rose-400 border-2 border-black shadow-[4px_4px_0_0_#000] rounded-xl flex items-center justify-center">
                <X className="w-6 h-6 text-white stroke-[3px]" />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {navLinks.map((link, i) => {
                 const isActive = pathname === link.href || (pathname === "/" && activeSection === link.href);
                 return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`
                        p-5 rounded-3xl text-2xl border-2 border-black transition-all
                        ${bubbleFont.className}
                        ${isActive ? "bg-blue-400 text-white shadow-[6px_6px_0_0_#000]" : "bg-white text-slate-700 shadow-[4px_4px_0_0_#000]"}
                      `}
                    >
                      {link.label}
                    </Link>
                 );
              })}
              
              <Link href="/admission" onClick={() => setMobileMenuOpen(false)} className="mt-4">
                <button className={`w-full bg-[#6BCB77] text-white py-5 rounded-3xl border-2 border-black font-black text-2xl shadow-[8px_8px_0_0_#000] active:shadow-none flex justify-center items-center gap-3 ${bodyFont.className}`}>
                  Enroll Now <ArrowRight className="w-7 h-7" />
                </button>
              </Link>
            </div>

            <div className="mt-auto flex justify-center gap-6 py-8">
              {socialLinks.map((social, i) => (
                <a target="_blank" key={i} href={social.href} className="w-14 h-14 bg-white border-2 border-black shadow-[4px_4px_0_0_#000] rounded-2xl flex items-center justify-center">
                  <social.icon className="w-6 h-6" />
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;