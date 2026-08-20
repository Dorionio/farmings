"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { Dog, Key, Mail, Shield, Building, User, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

type TabType = 'signin' | 'signup' | 'join';

export default function LoginPage() {
  const { user, loading, signIn, signUp, joinWithInvite } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('signin');
  
  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [orgName, setOrgName] = useState('');
  const [inviteCode, setInviteCode] = useState('');

  // UI state
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  // Auto-routing if user is logged in
  useEffect(() => {
    if (user && !loading) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  // Read invite code or active tab from URL if present
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('invite');
      const mode = params.get('mode') as TabType;
      
      if (code) {
        setInviteCode(code);
        setActiveTab('join');
      } else if (mode && (mode === 'signin' || mode === 'signup' || mode === 'join')) {
        setActiveTab(mode);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setSubmitLoading(true);

    try {
      if (activeTab === 'signin') {
        await signIn(email, password);
      } else if (activeTab === 'signup') {
        if (!orgName) throw new Error("Organization name is required");
        if (!name) throw new Error("Full name is required");
        const profile = await signUp(email, password, name, orgName);
        if (profile && (profile as any).emailConfirmationRequired) {
          setSuccessMsg("Registration successful! A verification link has been sent to your email. Please check your inbox and click the link to confirm your account and set up your business.");
          setSubmitLoading(false);
          setEmail('');
          setPassword('');
          setName('');
          setOrgName('');
        }
      } else if (activeTab === 'join') {
        if (!inviteCode) throw new Error("Invite code is required");
        if (!name) throw new Error("Full name is required");
        const profile = await joinWithInvite(inviteCode, email, password, name);
        if (profile && (profile as any).emailConfirmationRequired) {
          setSuccessMsg("Registration successful! A verification link has been sent to your email. Please check your inbox and click the link to confirm your account and join the team.");
          setSubmitLoading(false);
          setEmail('');
          setPassword('');
          setName('');
          setInviteCode('');
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An authentication error occurred.");
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center space-y-4">
          <Dog className="h-12 w-12 text-emerald-600 animate-bounce" />
          <p className="text-sm font-semibold text-emerald-950">Loading application...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-100/40 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-indigo-50/50 rounded-full blur-3xl -z-10" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center items-center space-x-3 cursor-pointer" onClick={() => router.push('/')}>
          <div className="p-2.5 bg-emerald-800 rounded-2xl shadow-lg shadow-emerald-800/20">
            <Dog className="h-8 w-8 text-emerald-100" />
          </div>
          <div>
            <span className="text-2xl font-bold tracking-tight text-slate-900 block leading-none">DorionAnima SaaS</span>
            <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-widest mt-1 block">Pet Boarding & Breeding</span>
          </div>
        </div>
        <h2 className="mt-6 text-center text-2xl font-extrabold text-slate-900 tracking-tight">
          {activeTab === 'signin' && t('auth_title_signin')}
          {activeTab === 'signup' && t('auth_title_signup')}
          {activeTab === 'join' && t('auth_title_join')}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-100 sm:rounded-2xl sm:px-10 border border-slate-100">
          {/* TAB HEADERS */}
          <div className="flex border-b border-slate-100 pb-4 mb-6 justify-between">
            <button
              onClick={() => { setActiveTab('signin'); setErrorMsg(''); }}
              className={`flex-1 text-center pb-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                activeTab === 'signin' 
                  ? 'border-emerald-700 text-emerald-800' 
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              {t('auth_signin')}
            </button>
            <button
              onClick={() => { setActiveTab('signup'); setErrorMsg(''); }}
              className={`flex-1 text-center pb-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                activeTab === 'signup' 
                  ? 'border-emerald-700 text-emerald-800' 
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              {t('auth_register_biz')}
            </button>
            <button
              onClick={() => { setActiveTab('join'); setErrorMsg(''); }}
              className={`flex-1 text-center pb-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                activeTab === 'join' 
                  ? 'border-emerald-700 text-emerald-800' 
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              {t('auth_staff_invite')}
            </button>
          </div>

          {/* ALERTS */}
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-start space-x-2 animate-fade-in">
              <Shield className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-start space-x-2 animate-fade-in">
              <CheckCircle className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* MAIN FORM */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* INVITE CODE (only for Join tab) */}
            {activeTab === 'join' && (
              <div>
                <label htmlFor="inviteCode" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {t('auth_label_invite')}
                </label>
                <div className="relative rounded-xl shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Building className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    id="inviteCode"
                    type="text"
                    required
                    placeholder="invite-xxxxxx"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 text-slate-900 placeholder-slate-400 transition-all"
                  />
                </div>
              </div>
            )}

            {/* ORGANIZATION NAME (only for Signup tab) */}
            {activeTab === 'signup' && (
              <div>
                <label htmlFor="orgName" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {t('auth_label_biz')}
                </label>
                <div className="relative rounded-xl shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Building className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    id="orgName"
                    type="text"
                    required
                    placeholder="e.g. Whispering Pines Kennel"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 text-slate-900 placeholder-slate-400 transition-all"
                  />
                </div>
              </div>
            )}

            {/* FULL NAME (for Signup and Join tabs) */}
            {activeTab !== 'signin' && (
              <div>
                <label htmlFor="fullName" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {t('auth_label_name')}
                </label>
                <div className="relative rounded-xl shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    id="fullName"
                    type="text"
                    required
                    placeholder="Sarah Jenkins"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 text-slate-900 placeholder-slate-400 transition-all"
                  />
                </div>
              </div>
            )}

            {/* EMAIL */}
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-slate-700 mb-1.5">
                {t('auth_label_email')}
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="name@business.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 text-slate-900 placeholder-slate-400 transition-all"
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-slate-700 mb-1.5">
                {t('auth_label_password')}
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Key className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 text-slate-900 placeholder-slate-400 transition-all"
                />
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <div>
              <button
                type="submit"
                disabled={submitLoading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-semibold text-white bg-emerald-800 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 transition-all cursor-pointer"
              >
                {submitLoading ? t('auth_authenticating') : (
                  activeTab === 'signin' ? t('auth_btn_signin') : (activeTab === 'signup' ? t('auth_btn_signup') : t('auth_btn_join'))
                )}
              </button>
            </div>
          </form>

          {/* BACK TO HOME */}
          <div className="mt-6 text-center">
            <button
              onClick={() => router.push('/')}
              className="text-xs text-slate-500 hover:text-emerald-700 transition-colors font-medium cursor-pointer"
            >
              &larr; {t('auth_back_landing')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
