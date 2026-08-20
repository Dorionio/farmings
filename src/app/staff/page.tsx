"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { dbService, authService } from '@/lib/services';
import { UserProfile } from '@/types';
import { Users, UserPlus, Shield, Mail, Key, Clipboard, Check } from 'lucide-react';
import Link from 'next/link';

export default function StaffPage() {
  const { user, generateInviteCode } = useAuth();
  const { t } = useLanguage();
  const [staffList, setStaffList] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // Invite form inputs
  const [inviteRole, setInviteRole] = useState<'owner' | 'staff'>('staff');
  const [generatedLink, setGeneratedLink] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user) return;
    refreshStaff();
  }, [user]);

  const refreshStaff = async () => {
    if (!user) return;
    try {
      const data = await authService.getStaff(user.orgId);
      setStaffList(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleGenerateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const code = await generateInviteCode(inviteRole);
      // Construct a relative invite link that runs locally
      const base = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
      setGeneratedLink(`${base}?invite=${code}`);
      setCopied(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopyLink = () => {
    if (!generatedLink) return;
    navigator.clipboard.writeText(generatedLink)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(console.error);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Users className="h-10 w-10 text-emerald-700 animate-bounce mb-3" />
        <p className="text-sm font-semibold text-slate-500">Loading staff directory...</p>
      </div>
    );
  }

  if (user?.role !== 'owner') {
    return (
      <div className="bg-white p-6 border border-slate-100 rounded-3xl text-center max-w-md mx-auto shadow-xs py-10 mt-10">
        <Shield className="mx-auto h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-sm font-bold text-slate-900">{t('staff_access_denied')}</h3>
        <p className="mt-2 text-xs text-slate-500 leading-normal font-medium">
          {t('staff_access_denied_desc')}
        </p>
        <div className="mt-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl text-xs cursor-pointer"
          >
            {t('staff_return_dashboard')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{t('staff_title')}</h1>
        <p className="text-sm text-slate-500 mt-1">{t('staff_subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* LEFT COLUMN: GENERATE STAFF INVITE */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center">
              <UserPlus className="h-4.5 w-4.5 text-emerald-700 mr-2 ltr:mr-2 rtl:ml-2" />
              {t('staff_card_generate')}
            </h3>
            <p className="text-xs text-slate-500 leading-normal">
              {t('staff_desc_generate')}
            </p>

            {user?.role === 'owner' ? (
              <form onSubmit={handleGenerateInvite} className="space-y-3.5 pt-2 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">{t('staff_label_role')}</label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as 'owner' | 'staff')}
                    className="block w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700/10 focus:border-emerald-700 text-slate-900 transition-all"
                  >
                    <option value="staff">{t('staff_role_staff')}</option>
                    <option value="owner">{t('staff_role_owner')}</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-xl shadow-md text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-700 focus:outline-none transition-all cursor-pointer"
                >
                  {t('staff_btn_generate')}
                </button>

                {/* SHOW GENERATED LINK */}
                {generatedLink && (
                  <div className="mt-4 p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl space-y-2 animate-fade-in">
                    <span className="block font-bold text-[10px] text-emerald-800 uppercase tracking-wider">{t('staff_label_link')}</span>
                    <div className="flex items-center space-x-1.5">
                      <input
                        type="text"
                        readOnly
                        value={generatedLink}
                        className="flex-1 bg-white px-2.5 py-1.5 rounded-lg border border-emerald-100 text-[10px] text-emerald-950 font-mono outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleCopyLink}
                        className="p-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg transition-colors cursor-pointer"
                      >
                        {copied ? <Check className="h-3.5 w-3.5" /> : <Clipboard className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                    <span className="block text-[9px] text-emerald-700 font-medium leading-normal italic">
                      {copied ? t('staff_copied') : t('staff_copy_instruction')}
                    </span>
                  </div>
                )}
              </form>
            ) : (
              <div className="p-3 bg-amber-50 border border-amber-200/50 rounded-xl text-[11px] text-amber-800 leading-normal font-semibold">
                {t('staff_only_owner')}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: REGISTERED STAFF LIST */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center">
              <Users className="h-4.5 w-4.5 text-emerald-700 mr-2 ltr:mr-2 rtl:ml-2" />
              {t('staff_card_directory')} ({staffList.length})
            </h3>

            <div className="divide-y divide-slate-100">
              {staffList.map((member) => (
                <div key={member.id} className="py-4 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-3.5">
                    <div className="h-10 w-10 bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm rounded-xl">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-950">{member.name} {member.id === user?.id && <span className="text-[10px] text-emerald-850 font-semibold">(You)</span>}</h4>
                      <p className="text-slate-400 font-semibold flex items-center mt-0.5">
                        <Mail className="h-3 w-3 mr-1 text-slate-300" />
                        {member.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end text-right">
                    <span className={`px-2 py-0.5 rounded-md font-bold text-[9px] uppercase tracking-wider flex items-center ${
                      member.role === 'owner' 
                        ? 'bg-purple-50 text-purple-700 border border-purple-100'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                    }`}>
                      <Shield className="h-3 w-3 mr-1 ltr:mr-1 rtl:ml-1" />
                      {member.role === 'owner' ? t('nav_org') : t('staff_role_staff')}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-1.5 font-medium">{t('staff_joined')}: {member.createdAt.split('T')[0]}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
