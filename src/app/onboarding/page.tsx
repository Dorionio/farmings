"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { Dog, Building, User, Shield, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function OnboardingPage() {
  const { user, loading, completeOnboarding, signOut } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  const [name, setName] = useState('');
  const [orgName, setOrgName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  // Auto-routing if user profile is already fully setup
  useEffect(() => {
    if (user && user.orgId && !loading) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitLoading(true);

    try {
      if (!name) throw new Error("Full name is required");
      if (!orgName) throw new Error("Business / Organization name is required");
      await completeOnboarding(name, orgName);
    } catch (err: any) {
      setErrorMsg(err.message || "An onboarding error occurred.");
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-100">
        <div className="flex flex-col items-center space-y-4">
          <Dog className="h-12 w-12 text-emerald-500 animate-bounce" />
          <p className="text-sm font-semibold text-emerald-400">Loading details...</p>
        </div>
      </div>
    );
  }

  // If no user is authenticated, this is protected by context, but add safety check
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-950 relative overflow-hidden text-slate-100">
      {/* Background blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-900/20 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-indigo-900/20 rounded-full blur-3xl -z-10" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="flex justify-center items-center space-x-3">
          <div className="p-2.5 bg-emerald-600 rounded-2xl shadow-lg shadow-emerald-500/10">
            <Dog className="h-8 w-8 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white block">DorionAnima SaaS</span>
        </div>
        <h2 className="mt-6 text-2xl font-extrabold text-white tracking-tight">
          {t('onboard_title')}
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          {t('onboard_logged_in')} <span className="font-semibold text-slate-300">{user.email}</span>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-900/60 border border-slate-800/80 py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10">
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-950/40 border border-red-800 text-red-400 rounded-xl text-xs flex items-start space-x-2">
              <Shield className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* FULL NAME */}
            <div>
              <label htmlFor="fullName" className="block text-xs font-semibold text-slate-300 mb-1.5">
                {t('onboard_label_name')}
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-slate-500" />
                </div>
                <input
                  id="fullName"
                  type="text"
                  required
                  placeholder="Sarah Jenkins"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 text-sm bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-100 placeholder-slate-500 transition-all"
                />
              </div>
            </div>

            {/* ORGANIZATION NAME */}
            <div>
              <label htmlFor="orgName" className="block text-xs font-semibold text-slate-300 mb-1.5">
                {t('onboard_label_biz')}
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Building className="h-4 w-4 text-slate-500" />
                </div>
                <input
                  id="orgName"
                  type="text"
                  required
                  placeholder="e.g. Whispering Pines Kennel"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 text-sm bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-100 placeholder-slate-500 transition-all"
                />
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <div>
              <button
                type="submit"
                disabled={submitLoading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-semibold text-slate-900 bg-emerald-400 hover:bg-emerald-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 transition-all cursor-pointer"
              >
                {submitLoading ? t('auth_authenticating') : t('onboard_submit')}
              </button>
            </div>
          </form>

          {/* LOG OUT BUTTON */}
          <div className="mt-6 pt-4 border-t border-slate-800 text-center">
            <button
              onClick={() => signOut()}
              className="inline-flex items-center space-x-2 text-xs text-slate-500 hover:text-rose-400 transition-colors font-medium cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>{t('onboard_logout')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
