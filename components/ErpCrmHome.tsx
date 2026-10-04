'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ShieldCheck, 
  LayoutDashboard, 
  School,
  Kanban,
  Building2,
  CheckCircle2,
  Users,
  BarChart3,
  BookOpen
} from 'lucide-react';
import heroImage from '../public/test/641.webp';

export default function ErpCrmHome() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* --- HERO SECTION (Two-Column Layout) --- */}
      <main className="pt-32 pb-16 lg:pt-40 lg:pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          
          {/* Left Column: Text & CTAs */}
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-sm font-medium mb-6">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              Integrated School OS
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight leading-[1.15]">
              The Complete <span className="text-indigo-600">ERP & CRM</span> <br className="hidden md:block" />
              for Modern Schools
            </h1>
            
            <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Streamline your entire educational network. Manage student records, automate admissions pipelines, collect fees, and track multi-franchise branch performance from one unified platform.
            </p>
            
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link href="/login" className="w-full sm:w-auto">
                <button className="w-full px-6 py-3.5 rounded-lg bg-indigo-600 text-white font-semibold shadow-md hover:bg-indigo-700 hover:shadow-lg transition-all flex items-center justify-center gap-2">
                  <ShieldCheck className="w-5 h-5" />
                  Admin Login
                </button>
              </Link>
              <Link href="/crm" className="w-full sm:w-auto">
                <button className="w-full px-6 py-3.5 rounded-lg bg-white border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all flex items-center justify-center gap-2">
                  <LayoutDashboard className="w-5 h-5" />
                  Open CRM Workspace
                </button>
              </Link>
            </div>

            <div className="mt-10 pt-8 border-t border-gray-200 flex flex-wrap items-center justify-center lg:justify-start gap-8">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-500" />
                <span className="text-sm font-medium text-gray-600">10k+ Students</span>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-500" />
                <span className="text-sm font-medium text-gray-600">50+ Branches</span>
              </div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-500" />
                <span className="text-sm font-medium text-gray-600">99.9% Uptime</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Image / App Preview */}
          <div className="flex-1 w-full max-w-2xl lg:max-w-none">
            <div className="relative rounded-2xl bg-white border border-gray-200 shadow-xl overflow-hidden">
              {/* Fake Window Header */}
              <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="ml-4 px-3 py-1 bg-white border border-gray-200 rounded text-xs text-gray-500 font-mono flex-1 text-center truncate">
                  admin.dheerajplayschool.com
                </div>
              </div>
              {/* Image Content */}
              <div className="relative w-full aspect-[4/3] bg-gray-100 flex items-center justify-center p-4">
                 <Image 
                   src={heroImage} 
                   alt="School ERP Dashboard"
                   className="object-contain w-full h-full drop-shadow-md rounded"
                 />
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* --- FEATURES GRID --- */}
      <section id="features" className="py-20 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-gray-900">
              Everything you need to run your institution
            </h2>
            <p className="mt-4 text-gray-600 text-lg">
              A comprehensive suite of tools built specifically for schools and multi-branch franchises.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 rounded-2xl bg-gray-50 border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center mb-6">
                <School className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Core ERP Suite</h3>
              <p className="text-gray-600 mb-6">
                Manage student profiles, track daily attendance, handle fee invoicing, and coordinate class schedules effortlessly.
              </p>
              <ul className="space-y-3 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-indigo-500 shrink-0" />
                  <span>Student & Parent Directory</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-indigo-500 shrink-0" />
                  <span>Automated Fee Collection</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-indigo-500 shrink-0" />
                  <span>Academic Reporting</span>
                </li>
              </ul>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-2xl bg-gray-50 border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center mb-6">
                <Kanban className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Admissions CRM</h3>
              <p className="text-gray-600 mb-6">
                Never lose a lead. Track inquiries from first contact to enrollment with a visual Kanban pipeline and automated follow-ups.
              </p>
              <ul className="space-y-3 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span>Lead Pipeline Management</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span>Call & Activity Logging</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span>Conversion Analytics</span>
                </li>
              </ul>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-2xl bg-gray-50 border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center mb-6">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Franchise Hub</h3>
              <p className="text-gray-600 mb-6">
                Scale your network securely. Centralize branch reporting while maintaining isolated workspaces for franchise directors.
              </p>
              <ul className="space-y-3 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-rose-500 shrink-0" />
                  <span>Multi-Branch Workspaces</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-rose-500 shrink-0" />
                  <span>Royalty & Revenue Tracking</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-rose-500 shrink-0" />
                  <span>Role-Based Access Control</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className="py-20 bg-indigo-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to streamline your school operations?
          </h2>
          <p className="text-indigo-100 text-lg mb-8 max-w-2xl mx-auto">
            Log in to the admin portal or access your CRM workspace to manage your leads, students, and branches today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login">
              <button className="px-8 py-3.5 rounded-lg bg-white text-indigo-600 font-bold hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2">
                <ShieldCheck className="w-5 h-5" />
                Go to Admin Login
              </button>
            </Link>
            <Link href="/crm">
              <button className="px-8 py-3.5 rounded-lg bg-indigo-700 border border-indigo-500 text-white font-bold hover:bg-indigo-800 transition-colors flex items-center gap-2">
                <LayoutDashboard className="w-5 h-5" />
                Open Workspace
              </button>
            </Link>
          </div>
        </div>
      </section>
      
    </div>
  );
}
