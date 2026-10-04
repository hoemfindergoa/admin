'use client';

import React, { useState, useEffect } from "react";
import { Menu, X, ArrowRight, ShieldCheck, Building2, LayoutDashboard, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation"; 
import Image from "next/image";
import logo from "../../public/logonew.png";

const Navbar = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/#erp", label: "School ERP" },
    { href: "/#crm", label: "CRM & Leads" },
    { href: "/#franchise", label: "Franchises" },
    { href: "/#features", label: "Features" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md border-b border-gray-200 py-3 shadow-sm"
          : "bg-white/80 backdrop-blur-md border-b border-gray-100 py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">

          {/* --- LOGO --- */}
          <Link href="/" className="flex items-center gap-3">
            <Image src={logo} alt="Logo" width={130} height={45} className="object-contain" priority />
          </Link>

          {/* --- DESKTOP MENU --- */}
          <div className="hidden lg:flex items-center gap-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`
                    px-4 py-2 text-sm font-medium transition-colors rounded-md
                    ${isActive ? 'text-indigo-600 bg-indigo-50' : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-50'}
                  `}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* --- RIGHT ACTIONS --- */}
          <div className="flex items-center gap-4">
            
            {/* ADMIN LOGIN BUTTON */}
            <Link href="/login" className="hidden sm:block">
              <button
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:text-indigo-600 transition-colors flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                Admin Login
              </button>
            </Link>

            {/* GET STARTED / ENROLL */}
            <Link href="/crm" className="hidden sm:block">
              <button
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-sm"
              >
                Open ERP
              </button>
            </Link>

            {/* Mobile Toggle */}
            <button
              className="lg:hidden p-2 text-gray-600 hover:text-indigo-600"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* --- MOBILE MENU --- */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden fixed top-full left-0 right-0 bg-white border-b border-gray-200 shadow-xl overflow-hidden"
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 rounded-md text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 text-base font-medium transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="px-4 py-6 border-t border-gray-100 space-y-3 bg-gray-50">
              <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="block">
                <button className="w-full py-3 rounded-md bg-white border border-gray-300 text-gray-700 font-medium flex items-center justify-center gap-2 hover:bg-gray-50">
                  <ShieldCheck className="w-5 h-5" />
                  Admin Login
                </button>
              </Link>
              <Link href="/crm" onClick={() => setMobileMenuOpen(false)} className="block">
                <button className="w-full py-3 rounded-md bg-indigo-600 text-white font-medium flex items-center justify-center gap-2 hover:bg-indigo-700">
                  <LayoutDashboard className="w-5 h-5" />
                  Open ERP
                </button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;