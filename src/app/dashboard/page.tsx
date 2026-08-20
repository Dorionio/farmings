"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { dbService } from '@/lib/services';
import { Animal, Vaccination, Medication, PregnancyRecord } from '@/types';
import { 
  Dog, Calendar, ShieldAlert, Heart, Activity, ClipboardList, MapPin, 
  Clock, Plus, ArrowRight, Pill, AlertTriangle, MessageCircle 
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [whatsappNumber, setWhatsappNumber] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setWhatsappNumber(localStorage.getItem('owner_whatsapp_number') || '');
    }
  }, []);

  const handleSaveWhatsapp = (val: string) => {
    setWhatsappNumber(val);
    if (typeof window !== 'undefined') {
      localStorage.setItem('owner_whatsapp_number', val);
    }
  };

  // Data states
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [vaccines, setVaccines] = useState<Vaccination[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [pregnancies, setPregnancies] = useState<PregnancyRecord[]>([]);

  useEffect(() => {
    if (!user) return;
    refreshDashboard();
  }, [user]);

  const refreshDashboard = async () => {
    if (!user) return;
    try {
      const [allAnimals, allVax, allMeds, allPreg] = await Promise.all([
        dbService.getAnimals(user.orgId),
        dbService.getVaccinations(user.orgId),
        dbService.getMedications(user.orgId),
        dbService.getPregnancies(user.orgId)
      ]);

      setAnimals(allAnimals);
      setVaccines(allVax);
      setMedications(allMeds.filter(m => m.status === 'active'));
      setPregnancies(allPreg.filter(p => p.status === 'active'));
      setLoading(false);
    } catch (err) {
      console.error("Error loading dashboard data", err);
      setLoading(false);
    }
  };

  // 1. Boarded animals count
  const boardedAnimals = animals.filter(a => a.isBoarding);

  // 2. Breeding stock count
  const breedingStock = animals.filter(a => a.isBreeding);

  // 3. Filter vaccinations due in the next 30 days or overdue
  const upcomingVaccines = vaccines.filter(v => {
    try {
      const dueDate = new Date(v.nextDueDate);
      const today = new Date();
      const diffTime = dueDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 30; // Due in next 30 days or already overdue
    } catch {
      return false;
    }
  }).sort((a,b) => a.nextDueDate.localeCompare(b.nextDueDate));

  // Compile Dashboard Alert Center
  const dashboardAlerts: {
    id: string;
    type: 'vaccine' | 'medication' | 'checkout' | 'breeding';
    severity: 'danger' | 'warning' | 'info';
    message: string;
    link: string;
    targetText: string;
  }[] = [];

  const todayStr = new Date().toISOString().split('T')[0];

  // 1. Boarding checkout status
  animals.filter(a => a.isBoarding).forEach(a => {
    if (!a.checkOutDate) return;
    if (a.checkOutDate < todayStr) {
      dashboardAlerts.push({
        id: `alert-checkout-overdue-${a.id}`,
        type: 'checkout',
        severity: 'danger',
        message: `${a.name}'s boarding checkout is OVERDUE. Scheduled departure was ${a.checkOutDate}.`,
        link: `/animals/${a.id}`,
        targetText: 'Inspect Profile'
      });
    } else {
      const checkOut = new Date(a.checkOutDate);
      const today = new Date();
      const diffTime = checkOut.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays >= 0 && diffDays <= 7) {
        dashboardAlerts.push({
          id: `alert-checkout-soon-${a.id}`,
          type: 'checkout',
          severity: 'warning',
          message: `${a.name}'s stay ends soon. Checkout scheduled on ${a.checkOutDate} (${diffDays} days).`,
          link: `/animals/${a.id}`,
          targetText: 'Inspect Profile'
        });
      }
    }
  });

  // 2. Vaccine alerts (7 days or overdue)
  vaccines.forEach(v => {
    if (!v.nextDueDate) return;
    const dueDate = new Date(v.nextDueDate);
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      dashboardAlerts.push({
        id: `alert-vax-overdue-${v.id}`,
        type: 'vaccine',
        severity: 'danger',
        message: `${v.animalName} has an OVERDUE ${v.type} vaccination. Was due on ${v.nextDueDate}.`,
        link: `/animals/${v.animalId}?tab=health`,
        targetText: 'Record Vaccine'
      });
    } else if (diffDays <= 7) {
      dashboardAlerts.push({
        id: `alert-vax-soon-${v.id}`,
        type: 'vaccine',
        severity: 'warning',
        message: `${v.animalName}'s ${v.type} vaccination is due soon on ${v.nextDueDate} (${diffDays} days).`,
        link: `/animals/${v.animalId}?tab=health`,
        targetText: 'Record Vaccine'
      });
    }
  });

  // 3. Medications due today
  medications.forEach(m => {
    dashboardAlerts.push({
      id: `alert-med-today-${m.id}`,
      type: 'medication',
      severity: 'info',
      message: `${m.animalName} requires medication today: ${m.name} (${m.dosage}) - ${m.schedule}.`,
      link: `/animals/${m.animalId}?tab=health`,
      targetText: 'Inspect Health'
    });
  });

  // 4. Pregnancy deliveries due in next 7 days
  pregnancies.forEach(p => {
    if (!p.expectedDueDate) return;
    const dueDate = new Date(p.expectedDueDate);
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const damName = animals.find(a => a.id === p.damId)?.name || 'Dam';

    if (diffDays < 0) {
      dashboardAlerts.push({
        id: `alert-preg-overdue-${p.id}`,
        type: 'breeding',
        severity: 'danger',
        message: `${damName}'s pregnancy expected due date has passed (${p.expectedDueDate}).`,
        link: `/breeding`,
        targetText: 'Breeding Hub'
      });
    } else if (diffDays <= 7) {
      dashboardAlerts.push({
        id: `alert-preg-soon-${p.id}`,
        type: 'breeding',
        severity: 'warning',
        message: `${damName}'s expected pregnancy due date is approaching on ${p.expectedDueDate} (${diffDays} days).`,
        link: `/breeding`,
        targetText: 'Breeding Hub'
      });
    }
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Dog className="h-10 w-10 text-emerald-700 animate-bounce mb-3" />
        <p className="text-sm font-semibold text-slate-500">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{t('dash_title')}</h1>
          <p className="text-sm text-slate-500 mt-1">{t('dash_subtitle')}</p>
        </div>
        <div className="flex items-center space-x-3 text-xs font-semibold">
          <Link
            href="/checklist"
            className="inline-flex items-center justify-center px-4 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl shadow-md cursor-pointer transition-colors"
          >
            <ClipboardList className="mr-2 ltr:mr-2 rtl:ml-2 h-4 w-4" />
            {t('dash_action_checklist')}
          </Link>
        </div>
      </div>

      {/* OPERATIONAL ALERT CENTER */}
      {dashboardAlerts.length > 0 && (
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-3.5">
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-3 gap-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center">
              <AlertTriangle className="h-4.5 w-4.5 text-rose-600 mr-2 ltr:mr-2 rtl:ml-2" />
              {t('auth_signin') === 'تسجيل الدخول' ? 'مركز التنبيهات التشغيلية' : 'Operational Alert Center'} ({dashboardAlerts.length})
            </h3>
            
            <div className="flex flex-wrap items-center gap-3">
              {/* WhatsApp Config */}
              <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs">
                <span className="text-[10px] text-slate-500 font-bold uppercase">{t('dash_whatsapp_number')}:</span>
                <input
                  type="text"
                  placeholder="e.g. +1234567890"
                  value={whatsappNumber}
                  onChange={(e) => handleSaveWhatsapp(e.target.value)}
                  className="bg-transparent outline-none w-32 text-xs text-slate-800 placeholder-slate-400 font-semibold"
                />
              </div>

              <span className="text-[9px] bg-rose-50 text-rose-800 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                {t('auth_signin') === 'تسجيل الدخول' ? 'بحاجة إلى اهتمام' : 'Needs Attention'}
              </span>
            </div>
          </div>

          <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
            {dashboardAlerts.map((alert) => (
              <div 
                key={alert.id}
                className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-3 transition-colors ${
                  alert.severity === 'danger'
                    ? 'bg-red-50/50 border-red-100 text-red-950 hover:bg-red-50'
                    : alert.severity === 'warning'
                      ? 'bg-amber-50/50 border-amber-100 text-amber-950 hover:bg-amber-50'
                      : 'bg-blue-50/50 border-blue-100 text-blue-950 hover:bg-blue-50'
                }`}
              >
                <div className="flex items-start space-x-2.5 min-w-0">
                  <div className="mt-0.5 flex-shrink-0">
                    {alert.severity === 'danger' && <AlertTriangle className="h-4 w-4 text-red-700" />}
                    {alert.severity === 'warning' && <AlertTriangle className="h-4 w-4 text-amber-600" />}
                    {alert.severity === 'info' && <Pill className="h-4 w-4 text-blue-700" />}
                  </div>
                  <span className="font-semibold leading-normal">{alert.message}</span>
                </div>
                
                <div className="flex items-center space-x-2 flex-shrink-0">
                  <Link
                    href={alert.link}
                    className={`px-3 py-1.5 rounded-lg font-bold text-[10px] text-center whitespace-nowrap cursor-pointer transition-colors ${
                      alert.severity === 'danger'
                        ? 'bg-red-800 hover:bg-red-700 text-white'
                        : alert.severity === 'warning'
                          ? 'bg-amber-850 hover:bg-amber-800 text-white'
                          : 'bg-blue-800 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {alert.targetText}
                  </Link>

                  <a
                    href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`[ANIMAL SAAS ALERT]: ${alert.message}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={t('dash_send_whatsapp')}
                    className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* METRIC OVERVIEW GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-800">
            <Dog className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-2xl font-bold text-slate-900">{boardedAnimals.length}</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{t('dash_widget_active_boarding')}</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-purple-50 rounded-xl text-purple-800">
            <Heart className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-2xl font-bold text-slate-900">{breedingStock.length}</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{t('dash_widget_heat_cycles')}</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-amber-50 rounded-xl text-amber-800">
            <Pill className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-2xl font-bold text-slate-900">{medications.length}</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{t('dash_widget_chores')}</span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-rose-50 rounded-xl text-rose-800">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-2xl font-bold text-slate-900">{upcomingVaccines.length}</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Vaccine Alerts</span>
          </div>
        </div>
      </div>

      {/* QUICK LINKS GRID */}
      <div className="bg-emerald-950 text-white rounded-2xl p-5 border border-emerald-900 shadow-md">
        <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-3">Quick Operational Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs font-semibold">
          <Link
            href="/animals/new"
            className="p-3 bg-emerald-900/60 hover:bg-emerald-900 rounded-xl flex items-center justify-between border border-emerald-800/40 transition-colors"
          >
            <span>Check In Guest Profile</span>
            <Plus className="h-4.5 w-4.5 text-emerald-400" />
          </Link>
          <Link
            href="/checklist"
            className="p-3 bg-emerald-900/60 hover:bg-emerald-900 rounded-xl flex items-center justify-between border border-emerald-800/40 transition-colors"
          >
            <span>Log Feeding/Care Actions</span>
            <ClipboardList className="h-4.5 w-4.5 text-emerald-400" />
          </Link>
          <Link
            href="/breeding"
            className="p-3 bg-emerald-900/60 hover:bg-emerald-900 rounded-xl flex items-center justify-between border border-emerald-800/40 transition-colors"
          >
            <span>Register Breeding Mating</span>
            <Heart className="h-4.5 w-4.5 text-emerald-400" />
          </Link>
          <Link
            href="/animals"
            className="p-3 bg-emerald-900/60 hover:bg-emerald-900 rounded-xl flex items-center justify-between border border-emerald-800/40 transition-colors"
          >
            <span>Inspect Health Directory</span>
            <Activity className="h-4.5 w-4.5 text-emerald-400" />
          </Link>
        </div>
      </div>

      {/* MAIN TWO-COLUMN DASHBOARD CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* COL 1 PANEL A: CURRENT BOARDING GUESTS */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center">
                <Dog className="h-4.5 w-4.5 text-emerald-700 mr-2" />
                Current Boarding Guests ({boardedAnimals.length})
              </h3>
              <Link href="/animals" className="text-xs font-bold text-emerald-800 hover:underline flex items-center">
                View All <ArrowRight className="h-3 ml-1" />
              </Link>
            </div>
            {boardedAnimals.length > 0 ? (
              <div className="divide-y divide-slate-100 overflow-y-auto max-h-72">
                {boardedAnimals.map((animal) => (
                  <div key={animal.id} className="py-3 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-3">
                      <div className="h-8.5 w-8.5 bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-xs rounded-lg">
                        {animal.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <Link href={`/animals/${animal.id}`} className="font-bold text-slate-950 hover:underline">
                          {animal.name}
                        </Link>
                        <p className="text-[10px] text-slate-400">{animal.breed}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end text-right">
                      <span className="font-bold text-slate-800 flex items-center">
                        <MapPin className="h-3 w-3 mr-0.5 text-slate-400" />
                        {animal.kennelRun || 'Run?'}
                      </span>
                      <span className="text-[10px] text-slate-400">Checkout: {animal.checkOutDate}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic py-4">No animals currently boarding.</p>
            )}
          </div>
        </div>

        {/* COL 1 PANEL B: MEDICATIONS DUE TODAY */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center">
                <Pill className="h-4.5 w-4.5 text-amber-700 mr-2" />
                Medications Due Today ({medications.length})
              </h3>
              <Link href="/checklist" className="text-xs font-bold text-emerald-800 hover:underline flex items-center">
                Checklist <ArrowRight className="h-3 ml-1" />
              </Link>
            </div>
            {medications.length > 0 ? (
              <div className="divide-y divide-slate-100 overflow-y-auto max-h-72">
                {medications.map((med) => (
                  <div key={med.id} className="py-3 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-3">
                      <div className="h-8.5 w-8.5 bg-amber-50 text-amber-800 flex items-center justify-center rounded-lg">
                        <Pill className="h-4 w-4" />
                      </div>
                      <div>
                        <Link href={`/animals/${med.animalId}`} className="font-bold text-slate-950 hover:underline">
                          {med.animalName}
                        </Link>
                        <p className="text-[10px] text-slate-500 font-semibold">{med.name} ({med.dosage})</p>
                      </div>
                    </div>
                    <span className="font-bold text-slate-700 bg-slate-50 border border-slate-100 px-2 py-1 rounded-lg flex items-center text-[10px]">
                      <Clock className="h-3 w-3 mr-1 text-slate-400" />
                      {med.schedule}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic py-4">No active medications scheduled.</p>
            )}
          </div>
        </div>

        {/* COL 2 PANEL A: VACCINATIONS DUE ALERT PANEL */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center text-rose-700">
                <AlertTriangle className="h-4.5 w-4.5 mr-2 text-rose-600" />
                Critical Vaccine Alerts ({upcomingVaccines.length})
              </h3>
            </div>
            {upcomingVaccines.length > 0 ? (
              <div className="divide-y divide-rose-50 overflow-y-auto max-h-72">
                {upcomingVaccines.map((vax) => {
                  const isOverdue = new Date(vax.nextDueDate) < new Date();
                  return (
                    <div key={vax.id} className="py-3 flex items-center justify-between text-xs">
                      <div>
                        <Link href={`/animals/${vax.animalId}`} className="font-bold text-slate-950 hover:underline">
                          {vax.animalName}
                        </Link>
                        <p className="text-[10px] text-slate-500 mt-0.5">{vax.type}</p>
                      </div>
                      <div className="flex flex-col items-end text-right">
                        <span className={`px-2 py-0.5 rounded font-bold text-[9px] uppercase tracking-wider ${
                          isOverdue ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
                        }`}>
                          {isOverdue ? 'Overdue' : 'Due Soon'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-semibold mt-1">Due: {vax.nextDueDate}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic py-4">All vaccines are up to date.</p>
            )}
          </div>
        </div>

        {/* COL 2 PANEL B: UPCOMING BREEDING EVENTS */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center">
                <Heart className="h-4.5 w-4.5 text-purple-700 mr-2" />
                Breeding Operations Watch ({pregnancies.length})
              </h3>
              <Link href="/breeding" className="text-xs font-bold text-purple-800 hover:underline flex items-center">
                Breeding Hub <ArrowRight className="h-3 ml-1" />
              </Link>
            </div>
            {pregnancies.length > 0 ? (
              <div className="divide-y divide-slate-100 overflow-y-auto max-h-72">
                {pregnancies.map((preg) => {
                  const animalObj = animals.find(a => a.id === preg.damId);
                  return (
                    <div key={preg.id} className="py-3 flex items-center justify-between text-xs">
                      <div>
                        <Link href={`/animals/${preg.damId}`} className="font-bold text-slate-950 hover:underline">
                          {animalObj ? animalObj.name : 'Dam Name'}
                        </Link>
                        <p className="text-[10px] text-slate-400">{animalObj ? animalObj.breed : 'Breed'}</p>
                      </div>
                      <div className="flex flex-col items-end text-right">
                        <span className="font-bold text-slate-800 bg-purple-50 border border-purple-100 px-2 py-0.5 rounded text-[10px]">
                          Due: {preg.expectedDueDate}
                        </span>
                        {preg.notes && <span className="text-[9px] text-slate-400 mt-1 max-w-[120px] truncate">{preg.notes}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic py-4">No active pregnancy logs scheduled.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
