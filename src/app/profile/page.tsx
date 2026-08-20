"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { User, Phone, Mail, Shield, Image, CheckCircle, Save, FileText } from 'lucide-react';

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const { t } = useLanguage();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Hydrate fields from user state
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setPhotoUrl(user.photoUrl || '');
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setSaving(true);
    setSuccess(false);
    setError('');

    try {
      await updateProfile({
        name,
        phone,
        photoUrl
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <User className="h-10 w-10 text-emerald-700 animate-bounce mb-3" />
        <p className="text-sm font-semibold text-slate-500">Loading user session...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* PAGE HEADER */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{t('profile_title')}</h1>
        <p className="text-sm text-slate-500 mt-1">{t('profile_subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* LEFT COLUMN: AVATAR CARD & RESOURCES */}
        <div className="lg:col-span-1 space-y-6">
          {/* AVATAR CARD */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center text-center space-y-4">
            <div className="relative group">
              {photoUrl ? (
                <img 
                  src={photoUrl} 
                  alt={name} 
                  className="h-28 w-28 rounded-3xl object-cover shadow-md border-2 border-emerald-500/10"
                  onError={(e) => {
                    // Fallback if image fails to load
                    (e.target as any).src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`;
                  }}
                />
              ) : (
                <div className="h-28 w-28 rounded-3xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-3xl border border-emerald-100/50 shadow-inner">
                  {name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">{name}</h3>
              <span className={`inline-flex items-center mt-1.5 px-2.5 py-0.5 rounded-md font-bold text-[10px] uppercase tracking-wider ${
                user.role === 'owner' 
                  ? 'bg-purple-50 text-purple-700 border border-purple-100'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
              }`}>
                <Shield className="h-3 w-3 mr-1 ltr:mr-1 rtl:ml-1" />
                {user.role === 'owner' ? t('nav_org') : t('staff_role_staff')}
              </span>
            </div>
            <div className="w-full border-t border-slate-100 pt-4 text-left text-xs space-y-2.5 text-slate-500">
              <div className="flex items-center space-x-2">
                <Mail className="h-3.5 w-3.5 text-slate-400" />
                <span className="truncate">{user.email}</span>
              </div>
              {phone && (
                <div className="flex items-center space-x-2">
                  <Phone className="h-3.5 w-3.5 text-slate-400" />
                  <span>{phone}</span>
                </div>
              )}
            </div>
          </div>

          {/* SYSTEM ANALYSIS PDF DOWNLOAD CARD */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col space-y-4 text-slate-700">
            <h3 className="font-extrabold text-slate-900 text-xs flex items-center">
              <FileText className="h-4.5 w-4.5 text-emerald-800 mr-2" />
              Business & Operations Report
            </h3>
            <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">
              Download the complete system analysis detailing what operational challenges this app solves and how it optimizes kennel/breeding workflows.
            </p>
            <a 
              href="/dorionanima_analysis.pdf" 
              download="dorionanima_analysis.pdf"
              className="w-full inline-flex justify-center items-center py-2.5 px-4 border border-slate-200 hover:border-emerald-700 hover:bg-emerald-50/20 text-slate-700 hover:text-emerald-900 rounded-xl shadow-xs text-xs font-bold transition-all cursor-pointer"
            >
              Download System PDF
            </a>
          </div>
        </div>

        {/* RIGHT COLUMN: EDIT PROFILE FIELDS */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium">
            
            {/* SUCCESS BANNER */}
            {success && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 flex items-center space-x-2 animate-fade-in">
                <CheckCircle className="h-4.5 w-4.5 text-emerald-700 flex-shrink-0" />
                <span className="font-bold">{t('profile_success')}</span>
              </div>
            )}

            {/* ERROR BANNER */}
            {error && (
              <div className="p-3.5 bg-red-50 border border-red-250 rounded-xl text-red-900 font-bold">
                {error}
              </div>
            )}

            {/* EDIT NAME */}
            <div>
              <label className="block text-slate-700 mb-1.5">{t('onboard_label_name')}</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700/10 focus:border-emerald-700 text-slate-900 transition-all font-semibold"
                />
              </div>
            </div>

            {/* EDIT PHONE NUMBER */}
            <div>
              <label className="block text-slate-700 mb-1.5">{t('profile_label_phone')}</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700/10 focus:border-emerald-700 text-slate-900 transition-all font-semibold"
                />
              </div>
            </div>

            {/* EDIT PHOTO URL */}
            <div>
              <label className="block text-slate-700 mb-1.5">{t('profile_label_photo')}</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Image className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700/10 focus:border-emerald-700 text-slate-900 transition-all font-semibold"
                />
              </div>
            </div>

            {/* STATIC READONLY FIELDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 pt-4">
              <div>
                <label className="block text-slate-400 mb-1.5">{t('auth_label_email')}</label>
                <div className="p-2.5 bg-slate-50 border border-slate-100 text-slate-500 rounded-xl font-bold flex items-center">
                  <Mail className="h-3.5 w-3.5 text-slate-350 mr-2" />
                  {user.email}
                </div>
              </div>
              <div>
                <label className="block text-slate-400 mb-1.5">{t('staff_label_role')}</label>
                <div className="p-2.5 bg-slate-50 border border-slate-100 text-slate-500 rounded-xl font-bold flex items-center capitalize">
                  <Shield className="h-3.5 w-3.5 text-slate-350 mr-2" />
                  {user.role}
                </div>
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-xl shadow-md text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-700 focus:outline-none transition-all cursor-pointer disabled:opacity-50"
              >
                <Save className="mr-2 h-4 w-4" />
                {saving ? 'Saving...' : t('profile_btn_save')}
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
}
