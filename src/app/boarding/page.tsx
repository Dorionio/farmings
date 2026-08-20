"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { dbService } from '@/lib/services';
import { Animal, Kennel } from '@/types';
import { 
  Building2, Dog, Calendar, Clipboard, AlertTriangle, 
  CheckCircle, Plus, LayoutGrid, Clock, Users, ArrowRight 
} from 'lucide-react';
import Link from 'next/link';

export default function BoardingDashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [kennels, setKennels] = useState<Kennel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    refreshDashboard();
  }, [user]);

  const refreshDashboard = async () => {
    if (!user) return;
    try {
      const [aList, kList] = await Promise.all([
        dbService.getAnimals(user.orgId),
        dbService.getKennels(user.orgId)
      ]);
      setAnimals(aList);
      setKennels(kList);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleCheckOut = async (animalId: string, kennelName: string) => {
    if (!user) return;
    if (confirm(`Check out guest and release kennel ${kennelName}?`)) {
      try {
        // Find corresponding kennel id
        const kennel = kennels.find(k => k.name === kennelName && k.status === 'occupied');

        // 1. Clear boarding flag on animal profile
        await dbService.updateAnimal(user.orgId, animalId, {
          isBoarding: false,
          kennelRun: null as any,
          checkInDate: null as any,
          checkOutDate: null as any
        });

        // 2. Free up the kennel status
        if (kennel) {
          await dbService.updateKennelStatus(
            user.orgId, 
            kennel.id, 
            'available', 
            null as any, 
            null as any
          );
        }

        await refreshDashboard();
      } catch (err) {
        console.error(err);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Building2 className="h-10 w-10 text-emerald-700 animate-bounce mb-3" />
        <p className="text-sm font-semibold text-slate-500">Loading boarding dashboard...</p>
      </div>
    );
  }

  // Statistics calculation
  const totalKennels = kennels.length;
  const occupiedKennels = kennels.filter(k => k.status === 'occupied').length;
  const maintenanceKennels = kennels.filter(k => k.status === 'maintenance').length;
  const vacantKennels = kennels.filter(k => k.status === 'available').length;
  const occupancyRate = totalKennels > 0 ? Math.round((occupiedKennels / totalKennels) * 100) : 0;

  // Active boarding animals
  const activeBoardingGuests = animals.filter(a => a.isBoarding);

  // Overdue checkouts list
  const todayStr = new Date().toISOString().split('T')[0];
  const overdueCheckouts = activeBoardingGuests.filter(a => {
    if (!a.checkOutDate) return false;
    return a.checkOutDate < todayStr;
  });

  // Upcoming arrivals in the next 7 days (where animal.isBoarding is false, but checkInDate is in next 7 days)
  const upcomingArrivals = animals.filter(a => {
    if (a.isBoarding || !a.checkInDate) return false;
    const checkIn = new Date(a.checkInDate);
    const today = new Date();
    const diffTime = checkIn.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 7;
  }).sort((a,b) => (a.checkInDate || '').localeCompare(b.checkInDate || ''));

  // Upcoming departures in the next 7 days
  const upcomingDepartures = activeBoardingGuests.filter(a => {
    if (!a.checkOutDate) return false;
    const checkOut = new Date(a.checkOutDate);
    const today = new Date();
    const diffTime = checkOut.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 7;
  }).sort((a,b) => (a.checkOutDate || '').localeCompare(b.checkOutDate || ''));

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{t('boarding_title')}</h1>
          <p className="text-sm text-slate-500 mt-1">{t('boarding_subtitle')}</p>
        </div>
        <div className="flex items-center space-x-3 text-xs font-semibold">
          <Link
            href="/boarding/kennels"
            className="inline-flex items-center justify-center px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <LayoutGrid className="mr-2 ltr:mr-2 rtl:ml-2 h-4 w-4" />
            {t('boarding_btn_kennels')}
          </Link>
          <Link
            href="/boarding/check-in"
            className="inline-flex items-center justify-center px-4 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl shadow-md transition-colors"
          >
            <Plus className="mr-2 ltr:mr-2 rtl:ml-2 h-4 w-4" />
            {t('boarding_btn_checkin')}
          </Link>
        </div>
      </div>

      {/* METRICS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-4.5 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-3.5">
          <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-850">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-xl font-bold text-slate-900">{totalKennels}</span>
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{t('boarding_total_enclosures')}</span>
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-3.5">
          <div className="p-2.5 bg-blue-50 rounded-xl text-blue-800">
            <Dog className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-xl font-bold text-slate-900">{occupiedKennels}</span>
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{t('boarding_occupied')}</span>
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-3.5">
          <div className="p-2.5 bg-green-50 rounded-xl text-green-700">
            <CheckCircle className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-xl font-bold text-slate-900">{vacantKennels}</span>
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{t('boarding_vacant')}</span>
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-3.5">
          <div className="p-2.5 bg-amber-50 rounded-xl text-amber-700">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-xl font-bold text-slate-900">{maintenanceKennels}</span>
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{t('boarding_maintenance')}</span>
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-3.5">
          <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-800">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-xl font-bold text-slate-900">{occupancyRate}%</span>
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{t('boarding_occupancy_rate')}</span>
          </div>
        </div>
      </div>

      {/* NEEDS ATTENTION: OVERDUE CHECKOUTS ALERT */}
      {overdueCheckouts.length > 0 && (
        <div className="p-4.5 bg-red-50 border border-red-200 rounded-2xl space-y-3 animate-fade-in">
          <div className="flex items-center space-x-2 text-red-800 font-bold text-xs">
            <AlertTriangle className="h-4.5 w-4.5 text-red-600 flex-shrink-0" />
            <span>Overdue Boarding Departures ({overdueCheckouts.length})</span>
          </div>
          <p className="text-[11px] text-red-900 leading-normal">
            The following animal guests have passed their expected checkout dates but have not been checked out. Please verify stay status or process release:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {overdueCheckouts.map((a) => (
              <div key={a.id} className="bg-white p-3 rounded-xl border border-red-100 flex items-center justify-between text-xs">
                <div>
                  <Link href={`/animals/${a.id}`} className="font-bold text-slate-950 hover:underline">{a.name}</Link>
                  <span className="block text-[9px] text-red-700 font-semibold mt-0.5">Overdue: {a.checkOutDate}</span>
                </div>
                <button
                  onClick={() => handleCheckOut(a.id, a.kennelRun || '')}
                  className="px-2.5 py-1 bg-red-850 hover:bg-red-800 text-white font-bold rounded-lg text-[10px] cursor-pointer"
                >
                  Release
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TWO COLUMN GRID DETAILS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* COLUMN 1: ACTIVE BOARDING GUESTS LIST (2 COLS WIDE) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center">
            <Users className="h-4.5 w-4.5 text-emerald-700 mr-2" />
            Currently Boarded Guests ({activeBoardingGuests.length})
          </h3>

          {activeBoardingGuests.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs text-left">
                <thead>
                  <tr className="text-slate-400 font-bold uppercase border-b border-slate-100">
                    <th className="py-2.5">Guest Info</th>
                    <th className="py-2.5">Kennel Run</th>
                    <th className="py-2.5">Stay Interval</th>
                    <th className="py-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {activeBoardingGuests.map((a) => (
                    <tr key={a.id} className="border-b border-slate-100/50 hover:bg-slate-50/50 transition-colors">
                      <td className="py-3">
                        <div className="flex items-center space-x-3">
                          <div className="h-8.5 w-8.5 bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-xs rounded-lg">
                            {a.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <Link href={`/animals/${a.id}`} className="font-bold text-slate-950 hover:underline leading-tight block">
                              {a.name}
                            </Link>
                            <span className="text-[10px] text-slate-400">{a.breed}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 font-semibold text-slate-800">{a.kennelRun || 'Run?'}</td>
                      <td className="py-3 text-slate-500">
                        <div>In: {a.checkInDate}</div>
                        <div className="text-[10px] mt-0.5">Out: {a.checkOutDate}</div>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => handleCheckOut(a.id, a.kennelRun || '')}
                          className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg font-bold cursor-pointer"
                        >
                          Check Out
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 px-4 border border-dashed border-slate-200 rounded-2xl text-center max-w-sm mx-auto animate-fade-in">
              <Building2 className="mx-auto h-10 w-10 text-slate-300" />
              <h4 className="mt-3.5 text-xs font-bold text-slate-900">{t('boarding_empty_title') || 'No Active Boarders'}</h4>
              <p className="mt-2 text-[11px] text-slate-500 leading-relaxed font-semibold">
                {t('boarding_empty_subtitle') || 'Manage checked-in animal guests and assign them to active kennel runs. Start by checking in a pet!'}
              </p>
              <div className="mt-5">
                <Link
                  href="/boarding/check-in"
                  className="inline-flex items-center px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white font-bold rounded-xl text-[10px] shadow-sm transition-all"
                >
                  <Plus className="mr-1.5 h-3.5 w-3.5" />
                  {t('boarding_btn_checkin') || 'Check In Guest'}
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* COLUMN 2: SCHEDULED ARRIVALS & DEPARTURES NEXT 7 DAYS */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* UPCOMING ARRIVALS */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2.5">
              Arrivals Schedule (7 Days)
            </h3>
            {upcomingArrivals.length > 0 ? (
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {upcomingArrivals.map((a) => (
                  <div key={a.id} className="p-3 bg-slate-50/50 border border-slate-100 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <Link href={`/animals/${a.id}`} className="font-bold text-slate-900 hover:underline">{a.name}</Link>
                      <p className="text-[10px] text-slate-400 mt-0.5">{a.breed}</p>
                    </div>
                    <span className="font-bold text-slate-700 bg-white border border-slate-100 px-2 py-1 rounded-lg text-[9px]">
                      {a.checkInDate}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No scheduled check-ins in the next 7 days.</p>
            )}
          </div>

          {/* UPCOMING DEPARTURES */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2.5">
              Departures Schedule (7 Days)
            </h3>
            {upcomingDepartures.length > 0 ? (
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {upcomingDepartures.map((a) => (
                  <div key={a.id} className="p-3 bg-slate-50/50 border border-slate-100 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <Link href={`/animals/${a.id}`} className="font-bold text-slate-900 hover:underline">{a.name}</Link>
                      <p className="text-[10px] text-slate-400 mt-0.5">Kennel: {a.kennelRun}</p>
                    </div>
                    <span className="font-bold text-slate-700 bg-white border border-slate-100 px-2 py-1 rounded-lg text-[9px]">
                      {a.checkOutDate}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No scheduled departures in the next 7 days.</p>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
