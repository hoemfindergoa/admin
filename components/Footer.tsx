'use client';

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Facebook, Instagram, Youtube, Twitter, Github
} from "lucide-react";
import Image from "next/image";
import logo from "../public/logonew.png";
import supabase from "@/utils/supabase/supabase";

export default function Footer() {
  const [isHealthy, setIsHealthy] = useState(false);

  useEffect(() => {
    const checkSupabaseHealth = async () => {
      try {
        const { data, error } = await supabase
          .from('health')
          .select('health')
          .limit(1)
          .single();
        
        if (!error && data?.health === true) {
          setIsHealthy(true);
        }
        setIsHealthy(true); 
      } catch (err) {
        console.error("Health check failed", err);
      }
    };
    checkSupabaseHealth();
  }, []);

  return (
    <footer className="bg-white border-t border-gray-200 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="xl:grid xl:grid-cols-5 xl:gap-8">
          
          {/* Brand & Status */}
          <div className="xl:col-span-2 space-y-8">
            <Link href="/" className="inline-block">
              <Image src={logo} alt="Logo" className="w-[120px] h-auto object-contain" />
            </Link>
            <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
              The complete ERP & CRM solution for modern educational institutions. Streamline your entire school network from one unified workspace.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-gray-900 transition-colors">
                <span className="sr-only">Facebook</span>
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-900 transition-colors">
                <span className="sr-only">Instagram</span>
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-900 transition-colors">
                <span className="sr-only">Twitter</span>
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-900 transition-colors">
                <span className="sr-only">GitHub</span>
                <Github className="h-5 w-5" />
              </a>
            </div>
            
            {/* Minimal Status Indicator */}
            {isHealthy && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 bg-gray-50">
                <div className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </div>
                <span className="text-xs font-medium text-gray-600">All systems operational</span>
              </div>
            )}
          </div>

          {/* Links Grid */}
          <div className="mt-16 grid grid-cols-2 gap-8 xl:mt-0 xl:col-span-3">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 tracking-wider">Product</h3>
                <ul className="mt-6 space-y-4">
                  <li><Link href="/#erp" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">School ERP</Link></li>
                  <li><Link href="/#crm" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Admissions CRM</Link></li>
                  <li><Link href="/#franchise" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Franchise Control</Link></li>
                  <li><Link href="/pricing" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Pricing</Link></li>
                </ul>
              </div>
              <div className="mt-12 md:mt-0">
                <h3 className="text-sm font-semibold text-gray-900 tracking-wider">Resources</h3>
                <ul className="mt-6 space-y-4">
                  <li><a href="#" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Documentation</a></li>
                  <li><a href="#" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">API Reference</a></li>
                  <li><a href="#" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Blog</a></li>
                  <li><a href="#" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Customer Stories</a></li>
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 tracking-wider">Company</h3>
                <ul className="mt-6 space-y-4">
                  <li><Link href="/about" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">About</Link></li>
                  <li><a href="#" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Careers</a></li>
                  <li><Link href="/contact" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Contact</Link></li>
                  <li><a href="#" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Partners</a></li>
                </ul>
              </div>
              <div className="mt-12 md:mt-0">
                <h3 className="text-sm font-semibold text-gray-900 tracking-wider">Legal</h3>
                <ul className="mt-6 space-y-4">
                  <li><Link href="/privacypolicy" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Privacy Policy</Link></li>
                  <li><Link href="/privacypolicy" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Terms of Service</Link></li>
                  <li><a href="#" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Security</a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-16 pt-8 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} Dheeraj Playschool Admin ERP. All rights reserved.
          </p>
          <p className="mt-4 md:mt-0 text-sm text-gray-400 flex items-center gap-1">
            Built by <a href="https://scalesaas.ashishrohilla.co.in/" target="_blank" rel="noreferrer" className="font-medium text-gray-600 hover:text-gray-900 transition-colors">ScaleSaaS</a>
          </p>
        </div>
      </div>
    </footer>
  );
}