"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { dbService } from '@/lib/services';
import { Animal, MatingRecord, PregnancyRecord, Litter, HeatCycle } from '@/types';
import { Heart, Calendar, Plus, Save, Clock, HelpCircle, Check, Award, Baby, ArrowRight } from 'lucide-react';
import Link from 'next/link';

type SubTab = 'pregnancies' | 'matings' | 'litters' | 'heats';

export default function BreedingHub() {
  const { user } = useAuth();
  const { t } = useLanguage();
  
  // Data states
  const [dams, setDams] = useState<Animal[]>([]);
  const [sires, setSires] = useState<Animal[]>([]);
  
  const [activeTab, setActiveTab] = useState<SubTab>('pregnancies');
  const [loading, setLoading] = useState(true);

  // Lists
  const [pregnancies, setPregnancies] = useState<PregnancyRecord[]>([]);
  const [matings, setMatings] = useState<MatingRecord[]>([]);
  const [litters, setLitters] = useState<Litter[]>([]);
  const [heats, setHeats] = useState<HeatCycle[]>([]);

  // Inline Forms Toggles
  const [showPregForm, setShowPregForm] = useState(false);
  const [showMateForm, setShowMateForm] = useState(false);
  const [showLitterForm, setShowLitterForm] = useState(false);

  // Form Input States
  // Pregnancy
  const [pregDamId, setPregDamId] = useState('');
  const [pregDueDate, setPregDueDate] = useState('');
  const [pregNotes, setPregNotes] = useState('');
  // Mating
  const [mateDate, setMateDate] = useState('');
  const [mateDamId, setMateDamId] = useState('');
  const [mateSireOption, setMateSireOption] = useState<'local' | 'external'>('local');
  const [mateLocalSireId, setMateLocalSireId] = useState('');
  const [mateExternalSire, setMateExternalSire] = useState('');
  const [mateNotes, setMateNotes] = useState('');
  // Litter
  const [litterDamId, setLitterDamId] = useState('');
  const [litterSireOption, setLitterSireOption] = useState<'local' | 'external'>('local');
  const [litterLocalSireId, setLitterLocalSireId] = useState('');
  const [litterExternalSire, setLitterExternalSire] = useState('');
  const [litterBirthDate, setLitterBirthDate] = useState('');
  const [litterOffspringCount, setLitterOffspringCount] = useState('');
  const [litterNotes, setLitterNotes] = useState('');

  useEffect(() => {
    if (!user) return;
    refreshData();
  }, [user]);

  const refreshData = async () => {
    if (!user) return;
    try {
      const [allAnimals, pList, mList, lList, hList] = await Promise.all([
        dbService.getAnimals(user.orgId),
        dbService.getPregnancies(user.orgId),
        dbService.getMatingRecords(user.orgId),
        dbService.getLitters(user.orgId),
        dbService.getHeatCycles(user.orgId)
      ]);

      // Filter breeding stock
      setDams(allAnimals.filter(a => a.sex === 'female' && a.isBreeding));
      setSires(allAnimals.filter(a => a.sex === 'male' && a.isBreeding));

      setPregnancies(pList);
      setMatings(mList);
      setLitters(lList);
      setHeats(hList);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  // Submit handlers
  const handleAddPregnancy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !pregDamId || !pregDueDate) return;
    try {
      await dbService.addPregnancy(user.orgId, {
        damId: pregDamId,
        expectedDueDate: pregDueDate,
        status: 'active',
        notes: pregNotes || undefined
      });
      setPregDamId(''); setPregDueDate(''); setPregNotes('');
      setShowPregForm(false);
      refreshData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdatePregnancyStatus = async (id: string, newStatus: 'completed' | 'failed') => {
    if (!user) return;
    try {
      await dbService.updatePregnancyStatus(user.orgId, id, newStatus);
      refreshData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddMating = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !mateDamId || !mateDate) return;
    try {
      const sireName = mateSireOption === 'local' 
        ? sires.find(s => s.id === mateLocalSireId)?.name || 'Unknown Sire'
        : mateExternalSire;
      const sireId = mateSireOption === 'local' ? mateLocalSireId : undefined;
      const damName = dams.find(d => d.id === mateDamId)?.name || 'Unknown Dam';

      await dbService.addMatingRecord(user.orgId, {
        date: mateDate,
        damId: mateDamId,
        damName,
        sireId,
        sireName,
        notes: mateNotes || undefined
      });

      setMateDate(''); setMateDamId(''); setMateLocalSireId(''); setMateExternalSire(''); setMateNotes('');
      setShowMateForm(false);
      refreshData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddLitter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !litterDamId || !litterBirthDate || !litterOffspringCount) return;
    try {
      const sireName = litterSireOption === 'local' 
        ? sires.find(s => s.id === litterLocalSireId)?.name || 'Unknown Sire'
        : litterExternalSire;
      const sireId = litterSireOption === 'local' ? litterLocalSireId : undefined;

      await dbService.addLitter(user.orgId, {
        damId: litterDamId,
        sireId,
        birthDate: litterBirthDate,
        offspringCount: parseInt(litterOffspringCount),
        notes: litterNotes || undefined,
        offspringIds: []
      });

      setLitterDamId(''); setLitterLocalSireId(''); setLitterExternalSire(''); setLitterBirthDate(''); setLitterOffspringCount(''); setLitterNotes('');
      setShowLitterForm(false);
      refreshData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Heart className="h-10 w-10 text-purple-700 animate-bounce mb-3" />
        <p className="text-sm font-semibold text-slate-500">Loading Breeding Hub...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{t('breeding_title')}</h1>
        <p className="text-sm text-slate-500 mt-1">{t('breeding_subtitle')}</p>
      </div>

      {/* DASHBOARD SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-purple-50 rounded-xl text-purple-700">
            <Heart className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-xl font-bold text-slate-900">{pregnancies.filter(p => p.status === 'active').length}</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{t('breeding_tab_pregnancy')}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-700">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-xl font-bold text-slate-900">{heats.length}</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{t('breeding_tab_heat')}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-blue-50 rounded-xl text-blue-700">
            <Baby className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-xl font-bold text-slate-900">{litters.length}</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{t('breeding_tab_litters')}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-indigo-50 rounded-xl text-indigo-700">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-xl font-bold text-slate-900">{dams.length + sires.length}</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{t('dash_widget_active_breeders')}</span>
          </div>
        </div>
      </div>

      {/* HUB NAVIGATION TABS */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('pregnancies')}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'pregnancies'
              ? 'border-purple-700 text-purple-800'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          {t('breeding_tab_pregnancy')} ({pregnancies.filter(p => p.status === 'active').length})
        </button>
        <button
          onClick={() => setActiveTab('matings')}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'matings'
              ? 'border-purple-700 text-purple-800'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          {t('breeding_tab_mating')} ({matings.length})
        </button>
        <button
          onClick={() => setActiveTab('litters')}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'litters'
              ? 'border-purple-700 text-purple-800'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          {t('breeding_tab_litters')} ({litters.length})
        </button>
        <button
          onClick={() => setActiveTab('heats')}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'heats'
              ? 'border-purple-700 text-purple-800'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Estrual Cycles ({heats.length})
        </button>
      </div>

      {/* TAB CONTENT: PREGNANCIES */}
      {activeTab === 'pregnancies' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Active Pregnancy Tracking</h3>
              <button
                onClick={() => setShowPregForm(!showPregForm)}
                className="text-xs font-bold text-purple-800 flex items-center hover:text-purple-700"
              >
                <Plus className="h-4 w-4 mr-1" />
                Track Pregnancy
              </button>
            </div>

            {showPregForm && (
              <form onSubmit={handleAddPregnancy} className="p-4 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-1 md:grid-cols-4 gap-3 text-xs animate-fade-in">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Dam (Mother) *</label>
                  <select
                    required value={pregDamId} onChange={(e) => setPregDamId(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="">-- Choose Dam --</option>
                    {dams.map(d => (
                      <option key={d.id} value={d.id}>{d.name} ({d.breed})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mating Date (Optional Calculator)</label>
                  <input
                    type="date"
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val) {
                        const date = new Date(val);
                        date.setDate(date.getDate() + 63);
                        setPregDueDate(date.toISOString().split('T')[0]);
                      }
                    }}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Expected Due Date *</label>
                  <input
                    type="date" required value={pregDueDate} onChange={(e) => setPregDueDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Notes (e.g. ultrasound info)</label>
                  <input
                    type="text" placeholder="e.g. Ultrasound confirmed 6 pups" value={pregNotes} onChange={(e) => setPregNotes(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
                  />
                </div>
                <div className="md:col-span-4 flex justify-end space-x-2 pt-2">
                  <button type="button" onClick={() => setShowPregForm(false)} className="px-3 py-1 bg-white border rounded-lg">Cancel</button>
                  <button type="submit" className="px-3 py-1 bg-purple-800 hover:bg-purple-700 text-white rounded-lg font-semibold">Save</button>
                </div>
              </form>
            )}

            {pregnancies.length > 0 ? (
              <div className="space-y-3.5">
                {pregnancies.map((preg) => {
                  const dam = dams.find(d => d.id === preg.damId);
                  return (
                    <div key={preg.id} className="p-4 bg-slate-50/50 border border-slate-100 rounded-2xl flex flex-col md:flex-row md:items-center justify-between">
                      <div className="space-y-1.5">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-sm text-slate-900">{dam ? dam.name : 'Unknown Female'}</span>
                          <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-sm ${
                            preg.status === 'active' 
                              ? 'bg-purple-50 text-purple-700 border border-purple-100'
                              : preg.status === 'completed'
                                ? 'bg-green-50 text-green-700 border border-green-100'
                                : 'bg-slate-100 text-slate-500'
                          }`}>
                            {preg.status} Pregnancy
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 flex items-center">
                          <Clock className="h-3.5 w-3.5 mr-1 text-slate-400" />
                          Expected Due Date: <strong className="text-slate-800 ml-1">{preg.expectedDueDate}</strong>
                        </p>
                        {preg.notes && <p className="text-xs text-slate-600 italic">Notes: {preg.notes}</p>}
                      </div>

                      {preg.status === 'active' && (
                        <div className="flex items-center gap-2 mt-4 md:mt-0">
                          <button
                            onClick={() => handleUpdatePregnancyStatus(preg.id, 'completed')}
                            className="px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 rounded-lg text-xs font-semibold cursor-pointer"
                          >
                            Mark Completed
                          </button>
                          <button
                            onClick={() => handleUpdatePregnancyStatus(preg.id, 'failed')}
                            className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-xs font-semibold cursor-pointer"
                          >
                            Mark Failed
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 px-4 border border-dashed border-slate-200 rounded-2xl text-center max-w-sm mx-auto animate-fade-in">
                <Heart className="mx-auto h-9 w-9 text-purple-400/50 animate-pulse mb-1" />
                <h4 className="text-xs font-bold text-slate-900">No Active Pregnancies</h4>
                <p className="mt-1.5 text-[11px] text-slate-500 leading-normal font-semibold">
                  Track active pregnancies, expected gestation calendars, and due dates for dam mothers.
                </p>
                <div className="mt-4">
                  <button
                    onClick={() => setShowPregForm(true)}
                    className="inline-flex items-center px-3.5 py-1.5 bg-purple-800 hover:bg-purple-700 text-white font-bold rounded-xl text-[10px] shadow-sm transition-all cursor-pointer"
                  >
                    <Plus className="mr-1 h-3.5 w-3.5" />
                    Track Pregnancy
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: MATINGS */}
      {activeTab === 'matings' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Mating & Cover Records</h3>
              <button
                onClick={() => setShowMateForm(!showMateForm)}
                className="text-xs font-bold text-purple-800 flex items-center hover:text-purple-700"
              >
                <Plus className="h-4 w-4 mr-1" />
                Log Mating Event
              </button>
            </div>

            {showMateForm && (
              <form onSubmit={handleAddMating} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Mating Date *</label>
                    <input
                      type="date" required value={mateDate} onChange={(e) => setMateDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Dam (Mother) *</label>
                    <select
                      required value={mateDamId} onChange={(e) => setMateDamId(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
                    >
                      <option value="">-- Choose Dam --</option>
                      {dams.map(d => (
                        <option key={d.id} value={d.id}>{d.name} ({d.breed})</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block font-semibold text-slate-700">Sire (Father)</label>
                    <div className="flex space-x-2 text-[10px] font-semibold text-slate-500 mb-1">
                      <button
                        type="button" onClick={() => setMateSireOption('local')}
                        className={`px-2 py-0.5 rounded ${mateSireOption === 'local' ? 'bg-purple-100 text-purple-800' : 'bg-slate-200'}`}
                      >
                        Local Stud
                      </button>
                      <button
                        type="button" onClick={() => setMateSireOption('external')}
                        className={`px-2 py-0.5 rounded ${mateSireOption === 'external' ? 'bg-purple-100 text-purple-800' : 'bg-slate-200'}`}
                      >
                        External Stud
                      </button>
                    </div>
                    {mateSireOption === 'local' ? (
                      <select
                        value={mateLocalSireId} onChange={(e) => setMateLocalSireId(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white animate-fade-in"
                      >
                        <option value="">-- Choose Sire --</option>
                        {sires.map(s => (
                          <option key={s.id} value={s.id}>{s.name} ({s.breed})</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text" placeholder="Stud Name / Kennel Name" value={mateExternalSire} onChange={(e) => setMateExternalSire(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white animate-fade-in"
                      />
                    )}
                  </div>
                  <div className="md:col-span-3">
                    <label className="block font-semibold text-slate-700 mb-1">Observation Notes</label>
                    <input
                      type="text" placeholder="e.g. Tied for 15 minutes, natural cover" value={mateNotes} onChange={(e) => setMateNotes(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                  <button type="button" onClick={() => setShowMateForm(false)} className="px-3 py-1 bg-white border rounded-lg">Cancel</button>
                  <button type="submit" className="px-3 py-1 bg-purple-800 hover:bg-purple-700 text-white rounded-lg font-semibold">Save Mating</button>
                </div>
              </form>
            )}

            {matings.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full text-xs text-left">
                  <thead>
                    <tr className="text-slate-400 font-bold uppercase border-b border-slate-100">
                      <th className="py-2">Date</th>
                      <th className="py-2">Dam (Mother)</th>
                      <th className="py-2">Sire (Father)</th>
                      <th className="py-2">Mating Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {matings.map((mate) => (
                      <tr key={mate.id} className="border-b border-slate-100/50">
                        <td className="py-2.5 font-bold text-slate-800">{mate.date}</td>
                        <td className="py-2.5 text-slate-700">{mate.damName}</td>
                        <td className="py-2.5 text-slate-700">{mate.sireName}</td>
                        <td className="py-2.5 text-slate-500 italic">{mate.notes || 'No notes'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 px-4 border border-dashed border-slate-200 rounded-2xl text-center max-w-sm mx-auto animate-fade-in">
                <Heart className="mx-auto h-9 w-9 text-slate-350 mb-1" />
                <h4 className="text-xs font-bold text-slate-900">No Mating Covers Logged</h4>
                <p className="mt-1.5 text-[11px] text-slate-500 leading-normal font-semibold">
                  Log mating events between active dam mothers and stud sires to estimate gestation periods.
                </p>
                <div className="mt-4">
                  <button
                    onClick={() => setShowMateForm(true)}
                    className="inline-flex items-center px-3.5 py-1.5 bg-purple-800 hover:bg-purple-700 text-white font-bold rounded-xl text-[10px] shadow-sm transition-all cursor-pointer"
                  >
                    <Plus className="mr-1 h-3.5 w-3.5" />
                    Log Mating Event
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: LITTERS */}
      {activeTab === 'litters' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Registered Litter Records</h3>
              <button
                onClick={() => setShowLitterForm(!showLitterForm)}
                className="text-xs font-bold text-purple-800 flex items-center hover:text-purple-700"
              >
                <Plus className="h-4 w-4 mr-1" />
                Register Litter
              </button>
            </div>

            {showLitterForm && (
              <form onSubmit={handleAddLitter} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Dam (Mother) *</label>
                    <select
                      required value={litterDamId} onChange={(e) => setLitterDamId(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
                    >
                      <option value="">-- Choose Dam --</option>
                      {dams.map(d => (
                        <option key={d.id} value={d.id}>{d.name} ({d.breed})</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block font-semibold text-slate-700">Sire (Father)</label>
                    <div className="flex space-x-2 text-[10px] font-semibold text-slate-500 mb-1">
                      <button
                        type="button" onClick={() => setLitterSireOption('local')}
                        className={`px-2 py-0.5 rounded ${litterSireOption === 'local' ? 'bg-purple-100 text-purple-800' : 'bg-slate-200'}`}
                      >
                        Local Stud
                      </button>
                      <button
                        type="button" onClick={() => setLitterSireOption('external')}
                        className={`px-2 py-0.5 rounded ${litterSireOption === 'external' ? 'bg-purple-100 text-purple-800' : 'bg-slate-200'}`}
                      >
                        External Stud
                      </button>
                    </div>
                    {litterSireOption === 'local' ? (
                      <select
                        value={litterLocalSireId} onChange={(e) => setLitterLocalSireId(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
                      >
                        <option value="">-- Choose Sire --</option>
                        {sires.map(s => (
                          <option key={s.id} value={s.id}>{s.name} ({s.breed})</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text" placeholder="Sire Stud Name" value={litterExternalSire} onChange={(e) => setLitterExternalSire(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
                      />
                    )}
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Birth Date *</label>
                    <input
                      type="date" required value={litterBirthDate} onChange={(e) => setLitterBirthDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Offspring Count *</label>
                    <input
                      type="number" required placeholder="Number of pups/kittens" value={litterOffspringCount} onChange={(e) => setLitterOffspringCount(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">Litter Notes</label>
                    <input
                      type="text" placeholder="e.g. 3 boys, 2 girls, all nursing well" value={litterNotes} onChange={(e) => setLitterNotes(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                  <button type="button" onClick={() => setShowLitterForm(false)} className="px-3 py-1 bg-white border rounded-lg">Cancel</button>
                  <button type="submit" className="px-3 py-1 bg-purple-800 hover:bg-purple-700 text-white rounded-lg font-semibold">Save Litter</button>
                </div>
              </form>
            )}

            {litters.length > 0 ? (
              <div className="space-y-3.5">
                {litters.map((lit) => {
                  const dam = dams.find(d => d.id === lit.damId);
                  const sire = sires.find(s => s.id === lit.sireId);
                  return (
                    <div key={lit.id} className="p-4 bg-slate-50/50 border border-slate-100 rounded-2xl flex flex-col md:flex-row md:items-center justify-between text-xs">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-sm text-slate-900">
                            {dam ? dam.name : 'Unknown Dam'}&apos;s Litter
                          </span>
                          <span className="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-100 rounded-md font-bold text-[9px]">
                            {lit.offspringCount} Offspring
                          </span>
                        </div>
                        <p className="text-slate-400 font-semibold mt-1">
                          Born on {lit.birthDate} &bull; Sire: {sire ? sire.name : 'External Stud'}
                        </p>
                        {lit.notes && <p className="text-slate-500 italic mt-1">{lit.notes}</p>}
                      </div>
                      
                      <Link
                        href="/animals/new"
                        className="mt-4 md:mt-0 text-[11px] font-bold text-purple-800 flex items-center hover:underline"
                      >
                        Register offspring profiles
                        <ArrowRight className="h-3.5 w-3.5 ml-1" />
                      </Link>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 px-4 border border-dashed border-slate-200 rounded-2xl text-center max-w-sm mx-auto animate-fade-in">
                <Baby className="mx-auto h-9 w-9 text-slate-300 mb-1" />
                <h4 className="text-xs font-bold text-slate-900">No Litters Registered</h4>
                <p className="mt-1.5 text-[11px] text-slate-500 leading-normal font-semibold">
                  Register new litters, record dam/sire information, and count born offspring.
                </p>
                <div className="mt-4">
                  <button
                    onClick={() => setShowLitterForm(true)}
                    className="inline-flex items-center px-3.5 py-1.5 bg-purple-800 hover:bg-purple-700 text-white font-bold rounded-xl text-[10px] shadow-sm transition-all cursor-pointer"
                  >
                    <Plus className="mr-1 h-3.5 w-3.5" />
                    Register Litter
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: ESTRUAL HEATS */}
      {activeTab === 'heats' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">Active Estrual Cycle Registry</h3>
          
          {heats.length > 0 ? (
            <div className="space-y-3">
              {heats.map((cycle) => {
                const dam = dams.find(d => d.id === cycle.animalId);
                return (
                  <div key={cycle.id} className="p-3 bg-slate-50/50 border border-slate-100 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-800">{dam ? dam.name : 'Unknown Female'}</span>
                      <p className="text-slate-400 font-semibold mt-0.5">Started: {cycle.startDate}</p>
                      {cycle.notes && <p className="text-slate-500 italic mt-1">{cycle.notes}</p>}
                    </div>
                    <span className="px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200/50 rounded font-bold text-[9px] uppercase tracking-wider">
                      Estrual Logged
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 px-4 border border-dashed border-slate-200 rounded-2xl text-center max-w-sm mx-auto animate-fade-in">
              <Calendar className="mx-auto h-9 w-9 text-slate-300 mb-1" />
              <h4 className="text-xs font-bold text-slate-900">No Heat Cycles Found</h4>
              <p className="mt-1.5 text-[11px] text-slate-500 leading-normal font-semibold">
                Active heat cycles for female dams. Log new estrual dates directly from an individual animal's profile page.
              </p>
              <div className="mt-4">
                <Link
                  href="/animals"
                  className="inline-flex items-center px-4 py-2 bg-purple-850 hover:bg-purple-850 text-white font-bold rounded-xl text-[10px] shadow-sm transition-all"
                >
                  Go to Animals Directory
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
