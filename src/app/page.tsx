"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  Dog, 
  ShieldCheck, 
  Calendar, 
  FileText, 
  CheckSquare, 
  Heart, 
  ArrowRight, 
  Sparkles, 
  Building, 
  Users, 
  Activity,
  Layers,
  ChevronRight
} from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const { user } = useAuth();

  const handleNavigate = (mode: 'signin' | 'signup') => {
    if (user) {
      router.push('/dashboard');
    } else {
      router.push(`/login?mode=${mode}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 selection:bg-emerald-500 selection:text-slate-900 font-sans antialiased overflow-x-hidden">
      {/* NAVBAR */}
      <nav className="border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => router.push('/')}>
              <div className="p-2 bg-emerald-600 rounded-xl shadow-lg shadow-emerald-500/10">
                <Dog className="h-6 w-6 text-slate-100" />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-white block leading-none">DorionAnima SaaS</span>
                <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider mt-0.5 block">Kennel OS</span>
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-300">
              <a href="#features" className="hover:text-white transition-colors">Features</a>
              <a href="#pedigree" className="hover:text-white transition-colors">Pedigree Tracking</a>
              <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            </div>

            <div className="flex items-center space-x-4">
              {user ? (
                <button
                  onClick={() => router.push('/dashboard')}
                  className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold rounded-xl text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-500/10 transition-all cursor-pointer"
                >
                  Dashboard
                  <ChevronRight className="ml-1.5 h-4 w-4" />
                </button>
              ) : (
                <>
                  <button
                    onClick={() => handleNavigate('signin')}
                    className="text-sm font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => handleNavigate('signup')}
                    className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold rounded-xl text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-500/10 transition-all cursor-pointer"
                  >
                    Register Biz
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative pt-20 pb-24 md:pt-32 md:pb-36 overflow-hidden">
        {/* Colorful blobs */}
        <div className="absolute top-1/4 left-1/10 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl -z-10" />
        <div className="absolute top-1/3 right-1/10 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3.5 py-1.5 rounded-full text-xs font-semibold mb-6 animate-pulse">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Powered by Supabase + Row Level Security</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
            Smarter Kennel Boarding & <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">Breeding Operations</span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Complete management software built for professional animal facilities. Track boarding guests, schedule chores checklists, log vaccinations, and automate pregnancy calculations in one secure system.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4">
            <button
              onClick={() => handleNavigate('signup')}
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 text-base font-bold rounded-xl text-slate-900 bg-gradient-to-r from-emerald-400 to-teal-300 hover:from-emerald-300 hover:to-teal-200 shadow-xl shadow-emerald-500/10 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
            <a
              href="#features"
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 text-base font-bold rounded-xl text-slate-300 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/50 hover:text-white transition-all cursor-pointer"
            >
              View Features
            </a>
          </div>

          {/* MOCK PREVIEW DASHBOARD */}
          <div className="mt-16 md:mt-20 max-w-5xl mx-auto bg-slate-800/40 border border-slate-700/60 p-4 sm:p-6 rounded-2xl shadow-2xl relative">
            <div className="flex items-center space-x-2 border-b border-slate-700/60 pb-4 mb-6">
              <div className="w-3 h-3 bg-red-500 rounded-full" />
              <div className="w-3 h-3 bg-yellow-500 rounded-full" />
              <div className="w-3 h-3 bg-green-500 rounded-full" />
              <span className="text-xs text-slate-500 font-mono ml-2">DorionAnima SaaS Live Dashboard Preview</span>
            </div>

            {/* Simulated UI Widgets */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 text-left">
                <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
                  <span>ACTIVE BOARDING</span>
                  <Building className="h-4 w-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-bold text-white">12 Animals</div>
                <div className="text-[10px] text-emerald-400 font-semibold mt-1">4 Check-outs scheduled today</div>
              </div>

              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 text-left">
                <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
                  <span>ACTIVE HEAT CYCLES</span>
                  <Heart className="h-4 w-4 text-rose-400" />
                </div>
                <div className="text-2xl font-bold text-white">3 Females</div>
                <div className="text-[10px] text-rose-400 font-semibold mt-1">Ready for mating checks</div>
              </div>

              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 text-left">
                <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
                  <span>TODAY'S CHORES</span>
                  <CheckSquare className="h-4 w-4 text-indigo-400" />
                </div>
                <div className="text-2xl font-bold text-white">82% Done</div>
                <div className="text-[10px] text-indigo-400 font-semibold mt-1">8/10 tasks completed by staff</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CORE FEATURES */}
      <section id="features" className="py-20 bg-slate-950/40 border-y border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Complete Operations Control Panel
            </h2>
            <p className="mt-4 text-slate-400">
              Stop relying on spreadsheets and notes. DorionAnima SaaS brings together your entire facility under a single database.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Box 1 */}
            <div className="bg-slate-900/60 border border-slate-800/80 p-6 rounded-2xl hover:border-emerald-500/40 transition-all group">
              <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400 w-fit group-hover:scale-110 transition-transform">
                <Heart className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white mt-4 mb-2">Breeding Records</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Log heat cycles, record matings, track pregnancy duedates, and catalog litters with automatic sire/dam association.
              </p>
            </div>

            {/* Box 2 */}
            <div className="bg-slate-900/60 border border-slate-800/80 p-6 rounded-2xl hover:border-teal-500/40 transition-all group">
              <div className="p-3 bg-teal-500/10 rounded-xl text-teal-400 w-fit group-hover:scale-110 transition-transform">
                <Building className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white mt-4 mb-2">Kennel & Boarding</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Interactive boarder check-ins/outs. Assign runs, document dietary requirements, and track custom care guidelines.
              </p>
            </div>

            {/* Box 3 */}
            <div className="bg-slate-900/60 border border-slate-800/80 p-6 rounded-2xl hover:border-indigo-500/40 transition-all group">
              <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400 w-fit group-hover:scale-110 transition-transform">
                <FileText className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white mt-4 mb-2">Health & Vaccines</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Log rabies, booster vaccines, vet checkups, active medication dosages, and track body weight histories.
              </p>
            </div>

            {/* Box 4 */}
            <div className="bg-slate-900/60 border border-slate-800/80 p-6 rounded-2xl hover:border-violet-500/40 transition-all group">
              <div className="p-3 bg-violet-500/10 rounded-xl text-violet-400 w-fit group-hover:scale-110 transition-transform">
                <CheckSquare className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white mt-4 mb-2">Chores & Scheduling</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Assign recurring animal care routines and mark off logs with staff names, timestamps, and custom notes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PEDIGREE HIGHLIGHT */}
      <section id="pedigree" className="py-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-xs font-semibold mb-4">
                <Layers className="h-3.5 w-3.5" />
                <span>Recursive Self-Referencing Tables</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
                Pedigree Tracking Made Simple
              </h2>
              <p className="mt-4 text-slate-400 leading-relaxed">
                Our relational Postgres schema links animals directly back to their sires and dams. Track multi-generational lineage, OFA scores, and championship credentials without duplicating animal profiles.
              </p>
              
              <ul className="mt-8 space-y-3.5 text-sm text-slate-300">
                <li className="flex items-center space-x-2.5">
                  <ShieldCheck className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                  <span>Self-referential integrity guarantees parent links are never broken</span>
                </li>
                <li className="flex items-center space-x-2.5">
                  <ShieldCheck className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                  <span>Automatic sibling and offspring relation discovery</span>
                </li>
                <li className="flex items-center space-x-2.5">
                  <ShieldCheck className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                  <span>Interactive statuses (active, retired, or co-owned)</span>
                </li>
              </ul>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl relative overflow-hidden flex flex-col justify-center space-y-4">
              <div className="absolute top-0 right-0 -mt-6 -mr-6 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl" />
              
              <div className="text-xs font-black uppercase text-emerald-400 tracking-wider">
                Family Tree Mapping
              </div>
              
              {/* Visual mini tree */}
              <div className="space-y-3 pt-2">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/80 text-left">
                    <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold block">Sire (Father)</span>
                    <span className="text-xs font-bold text-white block mt-0.5">🐾 Champion Maximus</span>
                  </div>
                  <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/80 text-left">
                    <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold block">Dam (Mother)</span>
                    <span className="text-xs font-bold text-white block mt-0.5">🐾 Bella of Dorion</span>
                  </div>
                </div>
                
                <div className="flex justify-center">
                  <div className="h-4 w-0.5 bg-emerald-500/40 relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-emerald-500" />
                  </div>
                </div>

                <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-700/50 text-center max-w-xs mx-auto">
                  <span className="text-[9px] uppercase tracking-wider text-emerald-400 font-bold block">Offspring</span>
                  <span className="text-xs font-extrabold text-white block mt-0.5">Luna (Litter #12)</span>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 leading-normal pt-2 border-t border-slate-800/80">
                <span className="font-bold text-slate-200 block mb-1">Why Lineage Tracking Matters:</span>
                Prevent accidental inbreeding, track champion bloodlines automatically, and generate comprehensive lineage files for kennel associations with a single click.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section id="pricing" className="py-20 bg-slate-950/40 border-t border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              One Flat Plan. Unlimited Power.
            </h2>
            <p className="mt-4 text-slate-400 text-sm">
              Try DorionAnima SaaS Standard free for 14 days. No risk, cancel online anytime.
            </p>
          </div>

          <div className="max-w-xl mx-auto bg-slate-900 border-2 border-emerald-500/80 p-8 rounded-3xl relative shadow-xl shadow-emerald-500/5 text-left">
            <div className="absolute top-0 right-6 -translate-y-1/2 bg-emerald-500 text-slate-900 text-[9px] font-black uppercase tracking-widest px-3.5 py-1 rounded-full">
              Standard Package
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-white">DorionAnima SaaS Standard</h3>
                <p className="text-xs text-emerald-400 mt-0.5">Everything you need to run your facility</p>
              </div>
              <div className="text-left sm:text-right shrink-0">
                <span className="text-3xl font-black text-white">$69</span>
                <span className="text-xs text-slate-500 font-semibold">/month</span>
                <p className="text-[10px] text-emerald-400/80 font-bold mt-0.5">Or $690/year (Save 17%)</p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <p className="text-xs text-slate-300 font-semibold leading-relaxed">
                Unlock all kennel spaces, medical vaccinations charts, estrual heat notifications, stud sire breeding logs, and multi-user staff roles with zero restrictions.
              </p>
              
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-400 pt-2 font-semibold">
                <li className="flex items-center"><CheckSquare className="h-4 w-4 mr-2 text-emerald-500 shrink-0" /> Unlimited Animals</li>
                <li className="flex items-center"><CheckSquare className="h-4 w-4 mr-2 text-emerald-500 shrink-0" /> Boarding & Runs</li>
                <li className="flex items-center"><CheckSquare className="h-4 w-4 mr-2 text-emerald-500 shrink-0" /> Vaccines & Meds</li>
                <li className="flex items-center"><CheckSquare className="h-4 w-4 mr-2 text-emerald-500 shrink-0" /> Gestation Calculators</li>
              </ul>

              <div className="pt-6">
                <button 
                  onClick={() => handleNavigate('signup')} 
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-400 to-teal-300 hover:from-emerald-300 hover:to-teal-200 text-slate-950 font-black rounded-2xl transition-all shadow-md text-xs tracking-wide cursor-pointer"
                >
                  Start Your 14-Day Free Trial
                </button>
                <p className="text-center text-[10px] text-slate-500 font-bold uppercase mt-2.5 tracking-wider">
                  Payment method required at signup &bull; No charge for 14 days
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-slate-500 text-xs flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-2">
            <Dog className="h-5 w-5 text-emerald-500" />
            <span className="font-bold text-slate-300">DorionAnima SaaS Kennel System</span>
          </div>
          <div>
            &copy; {new Date().getFullYear()} DorionAnima SaaS Inc. All rights reserved. Row Level Security Tenant Enforced.
          </div>
        </div>
      </footer>
    </div>
  );
}
