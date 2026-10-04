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
  Facebook,
  Globe,
  Megaphone,
  ArrowRight,
  Database,
  RefreshCw,
  Zap,
  ChevronRight
} from 'lucide-react';
import heroImage from '../public/heromainimage.png';

export default function ErpCrmHome() {
  return (
    <div className="relative min-h-screen bg-white text-slate-900 font-sans selection:bg-gray-100 selection:text-black">

      <div className="relative mt-[100px] overflow-hidden">
        {/* Sleek Top Grid Background & Diffused Bubbles */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none z-0"></div>
        <div className="absolute top-0 left-0 -ml-40 -mt-40 w-[500px] h-[500px] rounded-full bg-indigo-500/20 blur-[140px] pointer-events-none z-0"></div>
        <div className="absolute bottom-0 right-0 -mr-40 -mb-40 w-[500px] h-[500px] rounded-full bg-fuchsia-500/20 blur-[140px] pointer-events-none z-0"></div>

        <div className="relative z-10">
          {/* --- HERO SECTION --- */}
          <main className="pt-32 pb-16 lg:pt-40 lg:pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

              {/* Left Column: Text & CTAs */}
              <div className="flex-1 text-center lg:text-left">

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tighter leading-[1.1]">
                  The Complete <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-500">ERP & CRM</span> <br className="hidden md:block" />
                  for Modern Schools
                </h1>

                <p className="mt-6 text-lg text-gray-500 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                  Streamline your entire educational network. Manage student records, automate admissions pipelines, collect fees, and automatically capture leads across all platforms.
                </p>

                <div className="mt-10 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 w-full sm:w-auto">
                  <Link href="/login" className="w-full sm:w-auto">
                    <button className="w-full px-6 py-3.5 rounded-md bg-black text-white font-medium hover:bg-gray-800 transition-all flex items-center justify-center gap-2 shadow-[0_4px_14px_0_rgba(0,0,0,0.1)]">
                      <ShieldCheck className="w-4 h-4" />
                      Admin Login
                    </button>
                  </Link>
                  <Link href="/crm" className="w-full sm:w-auto">
                    <button className="w-full px-6 py-3.5 rounded-md bg-white border border-gray-200 text-gray-900 font-medium hover:border-gray-300 hover:bg-gray-50 transition-all flex items-center justify-center gap-2 shadow-sm">
                      <LayoutDashboard className="w-4 h-4" />
                      Open CRM Workspace
                    </button>
                  </Link>
                </div>
              </div>

              {/* Right Column: Hero Image Frame */}
              <div className="flex-1 w-full max-w-2xl lg:max-w-none relative">
                <Image
                  src={heroImage}
                  alt="School ERP Dashboard"
                  className="object-contain w-full h-full"
                  priority
                />
              </div>

            </div>
          </main>
        </div>
      </div>

      {/* --- STATS BAR --- */}
      <div className="border-y border-gray-100 bg-gray-50/50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-center gap-12 lg:gap-24">
          <div className="flex flex-col items-center">
            <span className="text-3xl font-bold text-gray-900 tracking-tight">10k+</span>
            <span className="text-sm font-medium text-gray-500 mt-1">Students Managed</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-3xl font-bold text-gray-900 tracking-tight">50+</span>
            <span className="text-sm font-medium text-gray-500 mt-1">Active Branches</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-3xl font-bold text-gray-900 tracking-tight">99.9%</span>
            <span className="text-sm font-medium text-gray-500 mt-1">Uptime SLA</span>
          </div>
        </div>
      </div>

      {/* --- SCHOOL ERP SECTION --- */}
      <section id="erp" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-16">
            <div className="inline-flex items-center gap-2 text-indigo-600 text-sm font-semibold mb-4 tracking-wide uppercase">
              <School className="w-4 h-4" /> Core ERP Engine
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
              Infrastructure for scale.
            </h2>
            <p className="mt-4 text-gray-500 text-lg leading-relaxed">
              Our School ERP is designed to eliminate paperwork and bring administrators, teachers, parents, and students onto a single, strictly typed and secure platform.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Student Management', desc: 'Centralized database for student profiles, documents, and academic history.', icon: Users },
              { title: 'Fee Automation', desc: 'Automated fee collection, customized payment plans, and overdue reminders.', icon: Database },
              { title: 'Academic Tracking', desc: 'Schedules, attendance, report cards, and digital gradebooks made easy.', icon: BarChart3 },
              { title: 'Franchise Control', desc: 'Monitor branch performance, staff allocation, and aggregate analytics globally.', icon: Building2 },
            ].map((item, i) => (
              <div key={i} className="group p-6 rounded-xl border border-gray-200 bg-white hover:border-gray-300 transition-colors shadow-sm hover:shadow-md">
                <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-200 text-gray-700 flex items-center justify-center mb-5 group-hover:bg-gray-100 transition-colors">
                  <item.icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- CRM & LEADS INTEGRATION SECTION --- */}
      <section id="crm" className="py-24 bg-gray-50/50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-16 items-center">

            <div className="flex-1 lg:pr-8">
              <div className="inline-flex items-center gap-2 text-rose-600 text-sm font-semibold mb-4 tracking-wide uppercase">
                <Zap className="w-4 h-4" /> Omnichannel Leads
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 tracking-tight">
                Automate admissions from every touchpoint.
              </h2>
              <p className="text-gray-500 mb-10 leading-relaxed text-lg">
                Deeply integrated with modern marketing APIs. Capture leads in real-time, route them instantly to your CRM Kanban, and drastically improve conversion rates without manual data entry.
              </p>

              <div className="space-y-8">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-md bg-white border border-gray-200 shadow-sm flex items-center justify-center shrink-0">
                    <Facebook className="w-5 h-5 text-gray-700" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Facebook Lead Ads API</h4>
                    <p className="text-gray-500 text-sm mt-1">Direct webhooks to Meta Graph API. Leads generated from Facebook campaigns instantly populate your CRM workspace.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-md bg-white border border-gray-200 shadow-sm flex items-center justify-center shrink-0">
                    <Globe className="w-5 h-5 text-gray-700" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Edge-Native Website Forms</h4>
                    <p className="text-gray-500 text-sm mt-1">Embeddable React widgets and Webhooks ensure any inquiry from your main website flows seamlessly into the admissions pipeline.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-md bg-white border border-gray-200 shadow-sm flex items-center justify-center shrink-0">
                    <Megaphone className="w-5 h-5 text-gray-700" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Google Ads Sync</h4>
                    <p className="text-gray-500 text-sm mt-1">Native integration with Google Lead Form Extensions. Capture high-intent parents searching for schools instantly.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* CRM Visual Board */}
            <div className="flex-1 w-full max-w-lg lg:max-w-none relative">
              <div className="relative bg-white border border-gray-200 rounded-xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">

                {/* Mock Window Header */}
                <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-gray-200"></div>
                      <div className="w-3 h-3 rounded-full bg-gray-200"></div>
                      <div className="w-3 h-3 rounded-full bg-gray-200"></div>
                    </div>
                    <span className="ml-4 text-xs font-semibold text-gray-400 tracking-widest uppercase">Live Incoming Pipeline</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="p-4 bg-white border border-gray-200 rounded-lg flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-gray-50 border border-gray-100 flex items-center justify-center">
                        <Facebook className="w-4 h-4 text-[#1877F2]" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Sarah Jenkins</p>
                        <p className="text-xs text-gray-500">Facebook Campaign &bull; Just now</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 border border-gray-200 text-[10px] uppercase font-bold tracking-wider rounded">New</span>
                  </div>

                  <div className="p-4 bg-white border border-gray-200 rounded-lg flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-gray-50 border border-gray-100 flex items-center justify-center">
                        <Globe className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Mike Robertson</p>
                        <p className="text-xs text-gray-500">Website Form &bull; 2m ago</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 border border-gray-200 text-[10px] uppercase font-bold tracking-wider rounded">New</span>
                  </div>

                  <div className="p-4 bg-gray-50 border border-gray-100 rounded-lg flex items-center justify-between opacity-75">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-white border border-gray-100 flex items-center justify-center">
                        <Megaphone className="w-4 h-4 text-red-500" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Emily Chen</p>
                        <p className="text-xs text-gray-500">Google Ads &bull; 1h ago</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 bg-white text-gray-500 border border-gray-200 text-[10px] uppercase font-bold tracking-wider rounded">Nurturing</span>
                  </div>
                </div>

                <div className="mt-6 flex justify-center">
                  <div className="flex items-center gap-2 text-gray-400 text-xs font-medium uppercase tracking-wider">
                    <RefreshCw className="w-3 h-3 animate-spin" style={{ animationDuration: '3s' }} />
                    Listening for webhooks...
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className="py-24 bg-white border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
            Ready to deploy?
          </h2>
          <p className="text-gray-500 text-lg mb-10 max-w-2xl mx-auto">
            Start building your centralized multi-branch school network today. Login to the admin workspace to begin.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login">
              <button className="px-8 py-3.5 rounded-md bg-black text-white font-medium hover:bg-gray-800 transition-colors shadow-lg shadow-gray-200 flex items-center gap-2 text-sm">
                <ShieldCheck className="w-4 h-4" />
                Go to Admin Login
              </button>
            </Link>
            <Link href="/crm">
              <button className="px-8 py-3.5 rounded-md bg-white border border-gray-200 text-gray-900 font-medium hover:border-gray-300 transition-colors flex items-center gap-2 text-sm shadow-sm">
                <LayoutDashboard className="w-4 h-4" />
                Explore CRM
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

