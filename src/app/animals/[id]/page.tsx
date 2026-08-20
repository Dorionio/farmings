"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { dbService } from '@/lib/services';
import { 
  Animal, 
  Vaccination, 
  VetVisit, 
  Medication, 
  WeightRecord, 
  CareSchedule,
  HeatCycle 
} from '@/types';
import { 
  Dog, Calendar, MapPin, User, Shield, Heart, Plus, Trash2, CheckCircle2, XCircle, 
  Activity, Syringe, Stethoscope, Pill, Scale, Clock, Settings, ArrowLeft 
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

export default function AnimalDetailPage() {
  const { user } = useAuth();
  const { id: animalId } = useParams() as { id: string };
  const router = useRouter();

  // Core states
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'health' | 'care' | 'breeding'>('profile');

  // Logs states
  const [vaccines, setVaccines] = useState<Vaccination[]>([]);
  const [vetVisits, setVetVisits] = useState<VetVisit[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [weights, setWeights] = useState<WeightRecord[]>([]);
  const [schedules, setSchedules] = useState<CareSchedule[]>([]);
  const [heatCycles, setHeatCycles] = useState<HeatCycle[]>([]);

  // Inline Form Toggles
  const [showVaxForm, setShowVaxForm] = useState(false);
  const [showVetForm, setShowVetForm] = useState(false);
  const [showMedForm, setShowMedForm] = useState(false);
  const [showWeightForm, setShowWeightForm] = useState(false);
  const [showSchedForm, setShowSchedForm] = useState(false);
  const [showHeatForm, setShowHeatForm] = useState(false);

  // Form Input States
  const [vaxType, setVaxType] = useState('');
  const [vaxDateGiven, setVaxDateGiven] = useState('');
  const [vaxNextDue, setVaxNextDue] = useState('');

  const [vetDate, setVetDate] = useState('');
  const [vetReason, setVetReason] = useState('');
  const [vetNotes, setVetNotes] = useState('');

  const [medName, setMedName] = useState('');
  const [medDosage, setMedDosage] = useState('');
  const [medSchedule, setMedSchedule] = useState('');

  const [weightVal, setWeightVal] = useState('');
  const [weightDate, setWeightDate] = useState('');

  const [schedTaskName, setSchedTaskName] = useState('');
  const [schedTime, setSchedTime] = useState('');
  const [schedNotes, setSchedNotes] = useState('');

  const [heatDate, setHeatDate] = useState('');
  const [heatNotes, setHeatNotes] = useState('');

  useEffect(() => {
    if (!user || !animalId) return;
    refreshData();
  }, [user, animalId]);

  const refreshData = async () => {
    if (!user) return;
    try {
      const data = await dbService.getAnimal(user.orgId, animalId);
      if (!data) {
        setLoading(false);
        return;
      }
      setAnimal(data);

      const [v, vv, m, w, s, h] = await Promise.all([
        dbService.getVaccinations(user.orgId, animalId),
        dbService.getVetVisits(user.orgId, animalId),
        dbService.getMedications(user.orgId, animalId),
        dbService.getWeights(user.orgId, animalId),
        dbService.getCareSchedules(user.orgId, animalId),
        dbService.getHeatCycles(user.orgId, animalId),
      ]);

      setVaccines(v);
      setVetVisits(vv);
      setMedications(m);
      setWeights(w);
      setSchedules(s);
      setHeatCycles(h);
      setLoading(false);
    } catch (e) {
      console.error("Error loading animal detail logs", e);
      setLoading(false);
    }
  };

  const handleDeleteAnimal = async () => {
    if (!user || !animal) return;
    if (confirm(`Are you sure you want to permanently delete ${animal.name}? This action cannot be undone.`)) {
      try {
        await dbService.deleteAnimal(user.orgId, animal.id);
        router.push('/animals');
      } catch (err) {
        console.error(err);
        alert("Failed to delete animal.");
      }
    }
  };

  // ------------------------------------------
  // FORM SUBMISSION HANDLERS
  // ------------------------------------------
  const handleAddVax = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !animal) return;
    try {
      await dbService.addVaccination(user.orgId, {
        animalId: animal.id,
        animalName: animal.name,
        type: vaxType,
        dateGiven: vaxDateGiven,
        nextDueDate: vaxNextDue
      });
      setVaxType(''); setVaxDateGiven(''); setVaxNextDue('');
      setShowVaxForm(false);
      refreshData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddVet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !animal) return;
    try {
      await dbService.addVetVisit(user.orgId, {
        animalId: animal.id,
        animalName: animal.name,
        date: vetDate,
        reason: vetReason,
        notes: vetNotes
      });
      setVetDate(''); setVetReason(''); setVetNotes('');
      setShowVetForm(false);
      refreshData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddMed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !animal) return;
    try {
      await dbService.addMedication(user.orgId, {
        animalId: animal.id,
        animalName: animal.name,
        name: medName,
        dosage: medDosage,
        schedule: medSchedule,
        status: 'active'
      });
      setMedName(''); setMedDosage(''); setMedSchedule('');
      setShowMedForm(false);
      refreshData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleMedStatus = async (medId: string, currentStatus: 'active' | 'inactive') => {
    if (!user) return;
    try {
      const nextStatus = currentStatus === 'active' ? 'inactive' : 'active';
      await dbService.updateMedicationStatus(user.orgId, medId, nextStatus);
      refreshData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddWeight = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !animal) return;
    try {
      await dbService.addWeight(user.orgId, {
        animalId: animal.id,
        date: weightDate,
        weight: parseFloat(weightVal)
      });
      setWeightVal(''); setWeightDate('');
      setShowWeightForm(false);
      refreshData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !animal) return;
    try {
      await dbService.addCareSchedule(user.orgId, {
        animalId: animal.id,
        animalName: animal.name,
        taskName: schedTaskName,
        schedule: schedTime,
        notes: schedNotes || undefined
      });
      setSchedTaskName(''); setSchedTime(''); setSchedNotes('');
      setShowSchedForm(false);
      refreshData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    if (!user) return;
    if (confirm("Delete this recurring care task?")) {
      try {
        await dbService.deleteCareSchedule(user.orgId, scheduleId);
        refreshData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleAddHeat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !animal) return;
    try {
      await dbService.addHeatCycle(user.orgId, {
        animalId: animal.id,
        startDate: heatDate,
        notes: heatNotes || undefined
      });
      setHeatDate(''); setHeatNotes('');
      setShowHeatForm(false);
      refreshData();
    } catch (err) {
      console.error(err);
    }
  };

  const calculateAge = (dobString: string) => {
    try {
      const dob = new Date(dobString);
      const diffMs = Date.now() - dob.getTime();
      const ageDate = new Date(diffMs);
      const years = Math.abs(ageDate.getUTCFullYear() - 1970);
      const months = ageDate.getUTCMonth();
      if (years === 0) return `${months} months`;
      return `${years} years, ${months} months`;
    } catch {
      return "Unknown";
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Dog className="h-10 w-10 text-emerald-700 animate-bounce mb-3" />
        <p className="text-sm font-semibold text-slate-500">Loading profile data...</p>
      </div>
    );
  }

  if (!animal) {
    return (
      <div className="bg-white py-12 px-6 border border-slate-100 rounded-3xl text-center max-w-md mx-auto shadow-xs">
        <XCircle className="mx-auto h-12 w-12 text-red-500" />
        <h3 className="mt-4 text-sm font-bold text-slate-900">Profile not found</h3>
        <p className="mt-2 text-xs text-slate-500 leading-normal">
          The animal profile you are trying to view does not exist or belongs to another organization.
        </p>
        <Link
          href="/animals"
          className="mt-6 inline-flex items-center justify-center px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl text-xs"
        >
          Return to Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="flex items-center space-x-3">
          <Link
            href="/animals"
            className="p-2 bg-white rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors text-slate-600"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">{animal.name}</h1>
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                animal.sex === 'female' 
                  ? 'bg-rose-50 text-rose-700 border border-rose-100' 
                  : 'bg-blue-50 text-blue-700 border border-blue-100'
              }`}>
                {animal.sex}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">{animal.breed} &bull; {animal.species}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3.5">
          <button
            onClick={handleDeleteAnimal}
            className="inline-flex items-center justify-center p-2.5 text-red-700 bg-red-50 hover:bg-red-100 border border-red-200/50 rounded-xl transition-colors cursor-pointer text-xs font-semibold"
          >
            <Trash2 className="h-4 w-4" />
            <span className="ml-1.5 hidden sm:inline">Delete Profile</span>
          </button>
        </div>
      </div>

      {/* TWO COLUMN CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* LEFT COLUMN: QUICK INFO PANEL */}
        <div className="lg:sticky lg:top-24 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
            <div className="h-28 w-full bg-emerald-800 text-white flex flex-col items-center justify-center font-bold text-3xl rounded-xl shadow-inner relative overflow-hidden">
              <span className="z-10">{animal.name.toUpperCase()}</span>
              <Dog className="absolute -bottom-4 -right-4 h-24 w-24 text-emerald-950/20" />
            </div>

            <div className="space-y-3.5 border-t border-slate-100 pt-4">
              <div>
                <span className="block text-[9px] uppercase tracking-wider text-slate-400 font-bold">Microchip / ID</span>
                <span className="text-sm font-semibold text-slate-800">{animal.microchipId || 'Not Assigned'}</span>
              </div>
              <div>
                <span className="block text-[9px] uppercase tracking-wider text-slate-400 font-bold">Age</span>
                <span className="text-sm font-semibold text-slate-800">{calculateAge(animal.dateOfBirth)}</span>
              </div>
              <div>
                <span className="block text-[9px] uppercase tracking-wider text-slate-400 font-bold">Date of Birth</span>
                <span className="text-sm font-semibold text-slate-800">{animal.dateOfBirth}</span>
              </div>

              {/* Scope/Purpose Badges */}
              <div className="flex gap-1.5 pt-2">
                {animal.isBoarding && (
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200/50 rounded-md font-bold text-[9px] uppercase tracking-wider">
                    Boarding Guest
                  </span>
                )}
                {animal.isBreeding && (
                  <span className="px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200/50 rounded-md font-bold text-[9px] uppercase tracking-wider">
                    Breeding Stock
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* BOARDING DETAILS CARD (only for boarding) */}
          {animal.isBoarding && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
                Boarding Details
              </h3>
              <div className="space-y-3.5 text-xs">
                <div className="flex items-start">
                  <User className="h-4.5 w-4.5 text-slate-400 mr-2.5 mt-0.5" />
                  <div>
                    <span className="block font-semibold text-slate-700">Owner Name</span>
                    <span className="text-slate-500">{animal.ownerName || 'None'}</span>
                  </div>
                </div>
                <div className="flex items-start">
                  <Clock className="h-4.5 w-4.5 text-slate-400 mr-2.5 mt-0.5" />
                  <div>
                    <span className="block font-semibold text-slate-700">Stay Dates</span>
                    <span className="text-slate-500">
                      {animal.checkInDate || '?'} to {animal.checkOutDate || '?'}
                    </span>
                  </div>
                </div>
                <div className="flex items-start">
                  <MapPin className="h-4.5 w-4.5 text-slate-400 mr-2.5 mt-0.5" />
                  <div>
                    <span className="block font-semibold text-slate-700">Kennel Run</span>
                    <span className="text-slate-950 font-bold">{animal.kennelRun || 'Not Assigned'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: MAIN TABBED ACTIONS PANEL */}
        <div className="lg:col-span-2 space-y-6">
          {/* TAB SYSTEM BUTTONS */}
          <div className="flex border-b border-slate-200 overflow-x-auto">
            <button
              onClick={() => setActiveTab('profile')}
              className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 whitespace-nowrap transition-all ${
                activeTab === 'profile'
                  ? 'border-emerald-700 text-emerald-800'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('health')}
              className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 whitespace-nowrap transition-all ${
                activeTab === 'health'
                  ? 'border-emerald-700 text-emerald-800'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Health Records
            </button>
            <button
              onClick={() => setActiveTab('care')}
              className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 whitespace-nowrap transition-all ${
                activeTab === 'care'
                  ? 'border-emerald-700 text-emerald-800'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Care Tasks
            </button>
            {animal.isBreeding && (
              <button
                onClick={() => setActiveTab('breeding')}
                className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 whitespace-nowrap transition-all ${
                  activeTab === 'breeding'
                    ? 'border-emerald-700 text-emerald-800'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                Breeding Logs
              </button>
            )}
          </div>

          {/* TAB CONTENT: PROFILE OVERVIEW */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6 animate-fade-in">
              {/* Special Care Instructions */}
              {animal.isBoarding && (
                <div className="bg-amber-50/50 border border-amber-200/50 rounded-xl p-4 space-y-2">
                  <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center">
                    <Activity className="h-4 w-4 mr-2" />
                    Special Care & Feeding instructions
                  </h4>
                  <p className="text-xs text-amber-950 leading-relaxed font-medium">
                    {animal.specialCare || "No special care instructions provided for this stay."}
                  </p>
                </div>
              )}

              {/* Lineage Info (if breeding is true) */}
              {animal.isBreeding && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Lineage & Pedigree</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3.5 bg-slate-50 border border-slate-200/50 rounded-xl">
                      <span className="block text-[10px] text-slate-400 font-bold uppercase">Sire (Father)</span>
                      {animal.sireId ? (
                        <Link href={`/animals/${animal.sireId}`} className="text-sm font-bold text-emerald-800 hover:underline mt-1 block">
                          {animal.sireName}
                        </Link>
                      ) : (
                        <span className="text-sm font-semibold text-slate-800 mt-1 block">{animal.sireName || 'Unknown / External'}</span>
                      )}
                    </div>
                    <div className="p-3.5 bg-slate-50 border border-slate-200/50 rounded-xl">
                      <span className="block text-[10px] text-slate-400 font-bold uppercase">Dam (Mother)</span>
                      {animal.damId ? (
                        <Link href={`/animals/${animal.damId}`} className="text-sm font-bold text-emerald-800 hover:underline mt-1 block">
                          {animal.damName}
                        </Link>
                      ) : (
                        <span className="text-sm font-semibold text-slate-800 mt-1 block">{animal.damName || 'Unknown / External'}</span>
                      )}
                    </div>
                  </div>
                  {animal.breedingNotes && (
                    <div className="pt-2">
                      <span className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Breeding Program Notes</span>
                      <p className="text-xs text-slate-600 leading-relaxed">{animal.breedingNotes}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Contact Information (if boarding) */}
              {animal.isBoarding && (
                <div className="space-y-3.5">
                  <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Owner Contact Info</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="block text-[10px] text-slate-400 font-bold uppercase">Phone / Email</span>
                      <span className="text-slate-800 mt-1 block font-semibold">{animal.ownerContact || 'None provided'}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB CONTENT: HEALTH RECORDS */}
          {activeTab === 'health' && (
            <div className="space-y-6 animate-fade-in">
              {/* 1. VACCINATIONS */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center">
                    <Syringe className="h-4.5 w-4.5 text-emerald-700 mr-2" />
                    Vaccination Log
                  </h3>
                  <button
                    onClick={() => setShowVaxForm(!showVaxForm)}
                    className="text-xs font-bold text-emerald-800 flex items-center hover:text-emerald-700"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Log Vaccine
                  </button>
                </div>

                {showVaxForm && (
                  <form onSubmit={handleAddVax} className="p-4 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-1 md:grid-cols-3 gap-3 text-xs animate-fade-in">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Vaccine Name</label>
                      <input
                        type="text" required placeholder="e.g. Rabies" value={vaxType} onChange={(e) => setVaxType(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Date Given</label>
                      <input
                        type="date" required value={vaxDateGiven} onChange={(e) => setVaxDateGiven(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Next Due Date</label>
                      <input
                        type="date" required value={vaxNextDue} onChange={(e) => setVaxNextDue(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
                      />
                    </div>
                    <div className="md:col-span-3 flex justify-end space-x-2 pt-2">
                      <button type="button" onClick={() => setShowVaxForm(false)} className="px-3 py-1 bg-white border rounded-lg">Cancel</button>
                      <button type="submit" className="px-3 py-1 bg-emerald-850 hover:bg-emerald-800 text-white rounded-lg font-semibold">Save</button>
                    </div>
                  </form>
                )}

                {vaccines.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-xs text-left">
                      <thead>
                        <tr className="text-slate-400 font-bold uppercase border-b border-slate-100">
                          <th className="py-2">Vaccine Type</th>
                          <th className="py-2">Date Given</th>
                          <th className="py-2">Next Due Date</th>
                          <th className="py-2">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {vaccines.map((v) => {
                          const isOverdue = new Date(v.nextDueDate) < new Date();
                          return (
                            <tr key={v.id} className="border-b border-slate-100/50">
                              <td className="py-2.5 font-semibold text-slate-800">{v.type}</td>
                              <td className="py-2.5 text-slate-500">{v.dateGiven}</td>
                              <td className="py-2.5 text-slate-500">{v.nextDueDate}</td>
                              <td className="py-2.5">
                                <span className={`px-2 py-0.5 rounded font-bold text-[9px] uppercase tracking-wider ${
                                  isOverdue ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
                                }`}>
                                  {isOverdue ? 'Overdue' : 'Active'}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No vaccinations logged for this animal.</p>
                )}
              </div>

              {/* 2. VET VISITS */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center">
                    <Stethoscope className="h-4.5 w-4.5 text-emerald-700 mr-2" />
                    Vet Visit Log
                  </h3>
                  <button
                    onClick={() => setShowVetForm(!showVetForm)}
                    className="text-xs font-bold text-emerald-800 flex items-center hover:text-emerald-700"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Log Vet Visit
                  </button>
                </div>

                {showVetForm && (
                  <form onSubmit={handleAddVet} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Date</label>
                        <input
                          type="date" required value={vetDate} onChange={(e) => setVetDate(e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Reason</label>
                        <input
                          type="text" required placeholder="e.g. Annual Checkup, Limp" value={vetReason} onChange={(e) => setVetReason(e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block font-semibold text-slate-700 mb-1">Visit Notes / Diagnosis</label>
                        <textarea
                          rows={2} required placeholder="Record diagnosis, prescribed medications, and instructions." value={vetNotes} onChange={(e) => setVetNotes(e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2 pt-2">
                      <button type="button" onClick={() => setShowVetForm(false)} className="px-3 py-1 bg-white border rounded-lg">Cancel</button>
                      <button type="submit" className="px-3 py-1 bg-emerald-850 hover:bg-emerald-800 text-white rounded-lg font-semibold">Save</button>
                    </div>
                  </form>
                )}

                {vetVisits.length > 0 ? (
                  <div className="space-y-3">
                    {vetVisits.map((visit) => (
                      <div key={visit.id} className="p-3 bg-slate-50/50 border border-slate-100 rounded-xl flex flex-col justify-between">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 mb-2">
                          <span className="font-bold text-xs text-slate-800">{visit.reason}</span>
                          <span className="text-[10px] text-slate-400 font-semibold">{visit.date}</span>
                        </div>
                        <p className="text-xs text-slate-600 leading-normal">{visit.notes}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No vet visits logged for this animal.</p>
                )}
              </div>

              {/* 3. MEDICATIONS */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center">
                    <Pill className="h-4.5 w-4.5 text-emerald-700 mr-2" />
                    Medications Log
                  </h3>
                  <button
                    onClick={() => setShowMedForm(!showMedForm)}
                    className="text-xs font-bold text-emerald-800 flex items-center hover:text-emerald-700"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Medication
                  </button>
                </div>

                {showMedForm && (
                  <form onSubmit={handleAddMed} className="p-4 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-1 md:grid-cols-3 gap-3 text-xs animate-fade-in">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Medication Name</label>
                      <input
                        type="text" required placeholder="e.g. Apoquel" value={medName} onChange={(e) => setMedName(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Dosage</label>
                      <input
                        type="text" required placeholder="e.g. 16mg" value={medDosage} onChange={(e) => setMedDosage(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Schedule / Frequency</label>
                      <input
                        type="text" required placeholder="e.g. Once daily at 9am" value={medSchedule} onChange={(e) => setMedSchedule(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
                      />
                    </div>
                    <div className="md:col-span-3 flex justify-end space-x-2 pt-2">
                      <button type="button" onClick={() => setShowMedForm(false)} className="px-3 py-1 bg-white border rounded-lg">Cancel</button>
                      <button type="submit" className="px-3 py-1 bg-emerald-850 hover:bg-emerald-800 text-white rounded-lg font-semibold">Save</button>
                    </div>
                  </form>
                )}

                {medications.length > 0 ? (
                  <div className="space-y-2">
                    {medications.map((m) => (
                      <div key={m.id} className="p-3 bg-slate-50/50 border border-slate-100 rounded-xl flex items-center justify-between">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-xs text-slate-800">{m.name}</span>
                            <span className="text-[10px] text-slate-400">({m.dosage})</span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1">{m.schedule}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleToggleMedStatus(m.id, m.status)}
                          className={`px-3 py-1.5 text-xs font-bold rounded-lg border cursor-pointer transition-all ${
                            m.status === 'active'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-200/50'
                          }`}
                        >
                          {m.status === 'active' ? 'Active' : 'Inactive'}
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No medications logged for this animal.</p>
                )}
              </div>

              {/* 4. WEIGHT TRACKER */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center">
                    <Scale className="h-4.5 w-4.5 text-emerald-700 mr-2" />
                    Weight Log Over Time
                  </h3>
                  <button
                    onClick={() => setShowWeightForm(!showWeightForm)}
                    className="text-xs font-bold text-emerald-800 flex items-center hover:text-emerald-700"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Log Weight
                  </button>
                </div>

                {showWeightForm && (
                  <form onSubmit={handleAddWeight} className="p-4 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-1 md:grid-cols-2 gap-3 text-xs animate-fade-in">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Weight (lbs/kg)</label>
                      <input
                        type="number" step="0.1" required placeholder="e.g. 65.4" value={weightVal} onChange={(e) => setWeightVal(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Date</label>
                      <input
                        type="date" required value={weightDate} onChange={(e) => setWeightDate(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
                      />
                    </div>
                    <div className="md:col-span-2 flex justify-end space-x-2 pt-2">
                      <button type="button" onClick={() => setShowWeightForm(false)} className="px-3 py-1 bg-white border rounded-lg">Cancel</button>
                      <button type="submit" className="px-3 py-1 bg-emerald-850 hover:bg-emerald-800 text-white rounded-lg font-semibold">Save</button>
                    </div>
                  </form>
                )}

                {weights.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Visual list */}
                    <div className="border border-slate-100 rounded-xl overflow-hidden max-h-44 overflow-y-auto">
                      <table className="min-w-full text-xs text-left">
                        <thead>
                          <tr className="bg-slate-50 text-slate-400 font-bold uppercase border-b border-slate-100">
                            <th className="py-2 px-3">Date</th>
                            <th className="py-2 px-3">Weight</th>
                          </tr>
                        </thead>
                        <tbody>
                          {weights.map((w) => (
                            <tr key={w.id} className="border-b border-slate-100/50">
                              <td className="py-2 px-3 text-slate-500">{w.date}</td>
                              <td className="py-2 px-3 font-semibold text-slate-800">{w.weight} units</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    {/* Simple display sparkline info */}
                    <div className="p-4 bg-emerald-50/20 border border-emerald-100/50 rounded-xl flex flex-col justify-between text-xs">
                      <div>
                        <span className="block text-[10px] text-slate-400 font-bold uppercase">Weight Trend Summary</span>
                        <div className="mt-2.5 flex items-baseline">
                          <span className="text-2xl font-bold text-slate-900">{weights[weights.length - 1].weight}</span>
                          <span className="text-[10px] text-slate-500 ml-1">Latest Weight ({weights[weights.length - 1].date})</span>
                        </div>
                      </div>
                      <div className="mt-3 text-[11px] text-slate-600 leading-normal">
                        Initial weight logged was <strong className="text-slate-800">{weights[0].weight}</strong> on {weights[0].date}.
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No weight records logged for this animal.</p>
                )}
              </div>
            </div>
          )}

          {/* TAB CONTENT: CARE SCHEDULES */}
          {activeTab === 'care' && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6 animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center">
                  <Clock className="h-4.5 w-4.5 text-emerald-700 mr-2" />
                  Recurring Daily Care Tasks
                </h3>
                <button
                  onClick={() => setShowSchedForm(!showSchedForm)}
                  className="text-xs font-bold text-emerald-800 flex items-center hover:text-emerald-700 animate-pulse"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Care Task
                </button>
              </div>

              {showSchedForm && (
                <form onSubmit={handleAddSchedule} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs animate-fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Task Name *</label>
                      <input
                        type="text" required placeholder="e.g. AM Feeding, Brush Coat, Medication" value={schedTaskName} onChange={(e) => setSchedTaskName(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Target Schedule Time *</label>
                      <input
                        type="time" required value={schedTime} onChange={(e) => setSchedTime(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block font-semibold text-slate-700 mb-1">Instruction / Notes</label>
                      <textarea
                        rows={2} placeholder="Instructions for the task (e.g. 'Feed 2 cups kibble + mix in active medication')" value={schedNotes} onChange={(e) => setSchedNotes(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2 pt-2">
                    <button type="button" onClick={() => setShowSchedForm(false)} className="px-3 py-1 bg-white border rounded-lg">Cancel</button>
                    <button type="submit" className="px-3 py-1 bg-emerald-850 hover:bg-emerald-800 text-white rounded-lg font-semibold">Log Task</button>
                  </div>
                </form>
              )}

              {schedules.length > 0 ? (
                <div className="space-y-3">
                  {schedules.map((s) => (
                    <div key={s.id} className="p-3 bg-slate-50/50 border border-slate-100 rounded-xl flex items-center justify-between">
                      <div className="flex items-center space-x-3.5">
                        <div className="h-8.5 w-8.5 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                          {s.schedule}
                        </div>
                        <div>
                          <span className="font-bold text-xs text-slate-800">{s.taskName}</span>
                          {s.notes && <p className="text-[10px] text-slate-500 mt-0.5">{s.notes}</p>}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteSchedule(s.id)}
                        className="p-1.5 text-slate-400 hover:text-red-700 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No recurring care tasks registered for this animal.</p>
              )}
            </div>
          )}

          {/* TAB CONTENT: BREEDING RECORDS */}
          {activeTab === 'breeding' && animal.isBreeding && (
            <div className="space-y-6 animate-fade-in">
              {/* HEAT CYCLES (only females) */}
              {animal.sex === 'female' && (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center">
                      <Heart className="h-4.5 w-4.5 text-purple-700 mr-2" />
                      Heat Cycles (Estrual Tracking)
                    </h3>
                    <button
                      onClick={() => setShowHeatForm(!showHeatForm)}
                      className="text-xs font-bold text-purple-800 flex items-center hover:text-purple-700"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Log Heat Cycle
                    </button>
                  </div>

                  {showHeatForm && (
                    <form onSubmit={handleAddHeat} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs animate-fade-in">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">Start Date *</label>
                          <input
                            type="date" required value={heatDate} onChange={(e) => setHeatDate(e.target.value)}
                            className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">Observation Notes</label>
                          <input
                            type="text" placeholder="e.g. Swelling, first spotting" value={heatNotes} onChange={(e) => setHeatNotes(e.target.value)}
                            className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end space-x-2 pt-2">
                        <button type="button" onClick={() => setShowHeatForm(false)} className="px-3 py-1 bg-white border rounded-lg">Cancel</button>
                        <button type="submit" className="px-3 py-1 bg-purple-850 hover:bg-purple-800 text-white rounded-lg font-semibold">Log Cycle</button>
                      </div>
                    </form>
                  )}

                  {heatCycles.length > 0 ? (
                    <div className="space-y-3">
                      {heatCycles.map((c) => (
                        <div key={c.id} className="p-3 bg-slate-50/50 border border-slate-100 rounded-xl flex items-center justify-between text-xs">
                          <div>
                            <span className="font-bold text-slate-800">{c.startDate}</span>
                            {c.notes && <p className="text-[10px] text-slate-500 mt-1">{c.notes}</p>}
                          </div>
                          <span className="px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200/50 rounded font-bold text-[9px] uppercase tracking-wider">
                            Logged
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No heat cycles logged for this animal.</p>
                  )}
                </div>
              )}

              {/* General Breeding Information Info */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
                <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Program Registry</h3>
                <p className="text-xs text-slate-500 leading-normal">
                  Heat cycle details, matings, litters, and pregnant profiles are managed inside the unified <Link href="/breeding" className="text-emerald-800 font-bold hover:underline">Breeding Center Dashboard</Link>. Navigate to the dashboard to log mating activities, pregnancies, or litter registries.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
