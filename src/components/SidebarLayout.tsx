"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { dbService } from '@/lib/services';
import { Organization } from '@/types';
import { 
  LayoutDashboard, 
  Dog, 
  CheckSquare, 
  Heart, 
  Users, 
  LogOut, 
  Menu, 
  X,
  User,
  Building2,
  Globe,
  HelpCircle,
  CreditCard,
  Lock,
  Clock
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GuidedTour } from './GuidedTour';
import { HelpCenter } from './HelpCenter';

interface SidebarLayoutProps {
  children: React.ReactNode;
}

export const SidebarLayout: React.FC<SidebarLayoutProps> = ({ children }) => {
  const { user, signOut, updateProfile } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isTourOpen, setIsTourOpen] = useState(false);

  const [orgSubscription, setOrgSubscription] = useState<Organization | null>(null);
  const [checkingSub, setCheckingSub] = useState(true);

  // Auto trigger onboarding tour on first login
  useEffect(() => {
    if (user && user.hasSeenOnboarding === false) {
      const timer = setTimeout(() => {
        setIsTourOpen(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [user]);

  // Load organization subscription status
  useEffect(() => {
    if (!user) return;
    let active = true;

    const fetchSub = async () => {
      try {
        const orgData = await dbService.getOrganization(user.orgId);
        if (active) {
          setOrgSubscription(orgData);
          setCheckingSub(false);
        }
      } catch (err) {
        console.error("Failed to load organization subscription state:", err);
        if (active) setCheckingSub(false);
      }
    };

    fetchSub();
    return () => {
      active = false;
    };
  }, [user, pathname]);

  if (!user) return <>{children}</>;

  const handleCloseTour = async () => {
    setIsTourOpen(false);
    if (user && user.hasSeenOnboarding === false) {
      try {
        await updateProfile({ hasSeenOnboarding: true });
      } catch (err) {
        console.error("Failed to persist onboarding state:", err);
      }
    }
  };

  const handleReplayTour = () => {
    setIsTourOpen(true);
  };

  // Subscription helpers
  const getTrialDaysRemaining = () => {
    if (!orgSubscription?.trialEnd) return 0;
    const diff = new Date(orgSubscription.trialEnd).getTime() - Date.now();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const trialDaysRemaining = getTrialDaysRemaining();
  const isTrialExpired = !orgSubscription?.stripeSubscriptionId && trialDaysRemaining <= 0;
  const isLocked = !checkingSub && 
    (orgSubscription?.subscriptionStatus === 'canceled' || 
     orgSubscription?.subscriptionStatus === 'past_due' ||
     isTrialExpired) &&
    pathname !== '/billing';

  const showTrialBanner = !checkingSub && !orgSubscription?.stripeSubscriptionId && trialDaysRemaining > 0;

  const navigation = [
    { name: t('nav_dashboard'), href: '/dashboard', icon: LayoutDashboard },
    { name: t('nav_animals'), href: '/animals', icon: Dog },
    { name: t('nav_boarding'), href: '/boarding', icon: Building2 },
    { name: t('nav_checklist'), href: '/checklist', icon: CheckSquare },
    { name: t('nav_breeding'), href: '/breeding', icon: Heart },
    ...(user.role === 'owner' ? [
      { name: language === 'ar' ? 'الفواتير' : language === 'es' ? 'Facturación' : language === 'fr' ? 'Facturation' : 'Billing', href: '/billing', icon: CreditCard }
    ] : []),
    { name: t('nav_staff'), href: '/staff', icon: Users },
  ];

  const handleSignOut = () => {
    signOut().catch(console.error);
  };

  const NavLinks = ({ onClick }: { onClick?: () => void }) => (
    <nav className="flex-1 space-y-1.5 px-3 py-4">
      {navigation.map((item) => {
        const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
        const Icon = item.icon;
        const navId = `tour-nav-${item.href.replace('/', '')}`;
        return (
          <Link
            key={item.name}
            href={item.href}
            onClick={onClick}
            id={navId}
            className={`group flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
              isActive
                ? 'bg-emerald-800 text-white shadow-md shadow-emerald-950/20'
                : 'text-emerald-100/80 hover:bg-emerald-800/40 hover:text-white'
            }`}
          >
            <Icon className={`ltr:mr-3 rtl:ml-3 h-5 w-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110 ${
              isActive ? 'text-white' : 'text-emerald-200/60 group-hover:text-emerald-100'
            }`} />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      {/* MOBILE HEADER */}
      <header className="lg:hidden bg-emerald-950 text-white flex items-center justify-between px-4 py-4 border-b border-emerald-900 sticky top-0 z-30 shadow-md">
        <div className="flex items-center space-x-2">
          <Dog className="h-6 w-6 text-emerald-400" />
          <span className="font-bold tracking-tight text-lg">DorionAnima SaaS</span>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="p-1.5 rounded-lg text-emerald-100 hover:bg-emerald-900 focus:outline-none"
        >
          <Menu className="h-6 w-6" />
        </button>
      </header>

      {/* MOBILE DRAWER */}
      {isOpen && (
        <div className="fixed inset-0 flex z-40 lg:hidden">
          {/* BACKDROP */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setIsOpen(false)}
          />
          {/* DRAWER CONTENT */}
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-emerald-950 text-white shadow-xl animate-slide-in">
            <div className="absolute top-0 right-0 -mr-12 pt-4">
              <button
                onClick={() => setIsOpen(false)}
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
            
            {/* BRAND */}
            <div className="px-6 py-6 border-b border-emerald-900 flex items-center space-x-3 bg-emerald-950/80">
              <div className="p-2 bg-emerald-900/60 rounded-xl">
                <Dog className="h-6 w-6 text-emerald-400 animate-pulse" />
              </div>
              <div>
                <h1 className="font-bold text-white tracking-tight leading-none text-base">DorionAnima SaaS</h1>
                <span className="text-[10px] text-emerald-400 font-semibold tracking-wider uppercase mt-1 block">Pet Operations</span>
              </div>
            </div>

            {/* MOBILE PROFILE BLOCK */}
            <div className="px-4 py-3.5 border-b border-emerald-900 bg-emerald-950/30">
              <Link 
                href="/profile" 
                onClick={() => setIsOpen(false)}
                className="flex items-center group hover:opacity-90 transition-opacity"
              >
                {user.photoUrl ? (
                  <img 
                    src={user.photoUrl} 
                    alt={user.name} 
                    className="h-10 w-10 rounded-full object-cover shadow-inner group-hover:ring-2 group-hover:ring-emerald-450 transition-all"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-emerald-800 flex items-center justify-center text-white font-semibold group-hover:ring-2 group-hover:ring-emerald-450 transition-all">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="ml-3 ltr:ml-3 rtl:mr-3">
                  <p className="text-xs font-semibold text-white group-hover:text-emerald-350 transition-colors">{user.name}</p>
                  <p className="text-[10px] text-emerald-400 capitalize">{user.role}</p>
                </div>
              </Link>
            </div>

            {/* NAV LINKS */}
            <NavLinks onClick={() => setIsOpen(false)} />

            {/* BOTTOM PANEL */}
            <div className="p-4 border-t border-emerald-900 bg-emerald-950/55">
              {/* Help Center */}
              <button
                onClick={() => { setIsOpen(false); setIsHelpOpen(true); }}
                className="w-full flex items-center px-3 py-2 mb-3 text-xs font-bold text-emerald-100/80 hover:bg-emerald-850/40 hover:text-white rounded-lg transition-colors cursor-pointer text-left"
              >
                <HelpCircle className="h-4.5 w-4.5 ltr:mr-2.5 rtl:ml-2.5 text-emerald-350" />
                {language === 'ar' ? 'مركز المساعدة' : language === 'es' ? 'Centro de Ayuda' : language === 'fr' ? 'Centre d\'Aide' : 'Help Center'}
              </button>

              {/* Language Selection */}
              <div className="mb-4">
                <label className="block text-[10px] text-emerald-400 font-bold uppercase mb-1.5 flex items-center">
                  <Globe className="h-3 w-3 mr-1 ltr:mr-1 rtl:ml-1" />
                  Language / اللغة
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as any)}
                  className="w-full bg-emerald-900/40 text-emerald-100 border border-emerald-850 rounded-lg py-1 px-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                >
                  <option value="en" className="bg-emerald-950 text-white">English 🇺🇸</option>
                  <option value="fr" className="bg-emerald-950 text-white">Français 🇫🇷</option>
                  <option value="es" className="bg-emerald-950 text-white">Español 🇪🇸</option>
                  <option value="ar" className="bg-emerald-950 text-white">العربية 🇸🇦</option>
                </select>
              </div>

              <button
                onClick={() => { setIsOpen(false); handleSignOut(); }}
                className="w-full flex items-center justify-center px-4 py-2 text-xs font-medium text-red-200 bg-red-950/30 hover:bg-red-950/60 rounded-lg border border-red-900/40 transition-colors"
              >
                <LogOut className="mr-2 ltr:mr-2 rtl:ml-2 h-4 w-4" />
                {t('nav_signout')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DESKTOP/TABLET PERMANENT SIDEBAR */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 ltr:left-0 rtl:right-0 ltr:border-r rtl:border-l border-emerald-900 bg-emerald-950 text-emerald-100 shadow-xl">
        {/* BRAND */}
        <div className="px-6 py-6 border-b border-emerald-900 flex items-center space-x-3">
          <div className="p-2 bg-emerald-900/60 rounded-xl">
            <Dog className="h-6 w-6 text-emerald-400" />
          </div>
          <div>
            <h1 className="font-bold text-white tracking-tight leading-none text-base">DorionAnima SaaS</h1>
            <span className="text-[10px] text-emerald-400 font-semibold tracking-wider uppercase mt-1 block">Pet Operations</span>
          </div>
        </div>

        {/* DESKTOP PROFILE BLOCK */}
        <div className="px-4 py-4 border-b border-emerald-900 bg-emerald-950/30 animate-fade-in">
          <Link href="/profile" className="flex items-center group hover:opacity-90 transition-opacity">
            {user.photoUrl ? (
              <img 
                src={user.photoUrl} 
                alt={user.name} 
                className="h-10 w-10 rounded-xl object-cover shadow-inner group-hover:ring-2 group-hover:ring-emerald-450 transition-all"
              />
            ) : (
              <div className="h-10 w-10 rounded-xl bg-emerald-800 flex items-center justify-center text-white font-semibold shadow-inner group-hover:ring-2 group-hover:ring-emerald-450 transition-all">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="ml-3 ltr:ml-3 rtl:mr-3 truncate max-w-[140px]">
              <p className="text-sm font-semibold text-white truncate leading-tight group-hover:text-emerald-350 transition-colors">{user.name}</p>
              <p className="text-[10px] text-emerald-400 capitalize font-medium">{user.role}</p>
            </div>
          </Link>
        </div>

        {/* ORG BLOCK */}
        <div className="px-4 py-3 bg-emerald-950/40 border-b border-emerald-900/50 flex flex-col justify-center">
          <span className="text-[9px] uppercase tracking-wider text-emerald-400 font-bold">{t('nav_org')}</span>
          <span className="text-sm font-semibold text-white truncate max-w-[210px]">{user.orgId === 'org-packleader' ? 'Pack Leader Kennel' : 'My Animal Biz'}</span>
        </div>

        {/* LINKS */}
        <NavLinks />

        {/* HELP CENTER TRIGGER */}
        <div className="px-4 py-2 bg-emerald-950/10 flex flex-col space-y-1">
          <button
            onClick={() => setIsHelpOpen(true)}
            className="w-full flex items-center px-3 py-2 text-xs font-bold text-emerald-100/85 hover:bg-emerald-800/40 hover:text-white rounded-lg transition-colors cursor-pointer text-left"
          >
            <HelpCircle className="h-4.5 w-4.5 ltr:mr-2.5 rtl:ml-2.5 text-emerald-350" />
            {language === 'ar' ? 'مركز المساعدة' : language === 'es' ? 'Centro de Ayuda' : language === 'fr' ? 'Centre d\'Aide' : 'Help & Onboarding'}
          </button>
        </div>

        {/* LANGUAGE SELECTOR */}
        <div className="px-4 py-3 border-t border-emerald-900/60 bg-emerald-950/20 flex flex-col space-y-1.5">
          <label className="text-[9px] uppercase tracking-wider text-emerald-400 font-bold flex items-center">
            <Globe className="h-3 w-3 mr-1 ltr:mr-1 rtl:ml-1" />
            Language / اللغة
          </label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as any)}
            className="w-full bg-emerald-900/40 text-emerald-100 border border-emerald-850 rounded-lg py-1.5 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="en" className="bg-emerald-950 text-white">English 🇺🇸</option>
            <option value="fr" className="bg-emerald-950 text-white">Français 🇫🇷</option>
            <option value="es" className="bg-emerald-950 text-white">Español 🇪🇸</option>
            <option value="ar" className="bg-emerald-950 text-white">العربية 🇸🇦</option>
          </select>
        </div>

        {/* LOGOUT FOOTER BLOCK */}
        <div className="p-4 border-t border-emerald-900 bg-emerald-950/40">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center px-4 py-2.5 text-xs font-semibold text-red-200 bg-red-950/20 hover:bg-red-950/50 border border-red-900/30 hover:border-red-900/60 rounded-xl transition-all duration-200"
          >
            <LogOut className="mr-2 ltr:mr-2 rtl:ml-2 h-4 w-4" />
            {t('nav_signout')}
          </button>
        </div>
      </aside>

      {/* CONTENT AREA */}
      <div className="flex-1 ltr:lg:pl-64 rtl:lg:pr-64 flex flex-col min-w-0">
        {showTrialBanner && (
          <div className="bg-purple-900 text-purple-100 text-center py-2.5 px-4 text-[10px] font-bold tracking-wide flex items-center justify-center space-x-1.5 border-b border-purple-800 animate-fade-in shrink-0">
            <Clock className="h-3.5 w-3.5 text-purple-300 animate-pulse" />
            <span>
              Trial Mode: {trialDaysRemaining} days remaining. Upgrade to the Standard Plan to avoid service interruptions.
            </span>
            <Link href="/billing" className="underline text-white font-extrabold hover:text-purple-200 ml-2">
              Upgrade now &rarr;
            </Link>
          </div>
        )}
        <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl w-full mx-auto animate-fade-in relative">
          {children}
        </main>
      </div>

      {/* SUSPENDED / LOCKED OVERLAY */}
      {isLocked && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-2xl max-w-sm w-full text-center space-y-4 animate-scale-in">
            <div className="p-3 bg-red-100 text-red-700 rounded-2xl w-fit mx-auto">
              <Lock className="h-8 w-8" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900">Your Subscription is Suspended</h3>
            <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
              Your DorionAnima SaaS trial has ended or your subscription payment is past due. To protect your data, access is restricted.
            </p>
            <div className="pt-2">
              <Link
                href="/billing"
                className="w-full inline-flex items-center justify-center px-4 py-2.5 bg-purple-800 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
              >
                Manage Subscription Billing
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ONBOARDING TOUR & HELP CENTER DRAWER */}
      <GuidedTour 
        isOpen={isTourOpen}
        onClose={handleCloseTour}
        role={user.role}
        language={language}
        isMobileMenuOpen={isOpen}
        setIsMobileMenuOpen={setIsOpen}
      />

      <HelpCenter 
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        onReplayTour={handleReplayTour}
        role={user.role}
        language={language}
      />
    </div>
  );
};
