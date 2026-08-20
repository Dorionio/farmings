"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { dbService } from '@/lib/services';
import { Animal } from '@/types';
import { Dog, ArrowLeft, Save, Building, ShieldCheck, Heart } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function NewAnimalPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  // Available animals for lineage dropdowns
  const [maleAnimals, setMaleAnimals] = useState<Animal[]>([]);
  const [femaleAnimals, setFemaleAnimals] = useState<Animal[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Core animal fields
  const [name, setName] = useState('');
  const [species, setSpecies] = useState('Dog');
  const [breed, setBreed] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [sex, setSex] = useState<'male' | 'female'>('female');
  const [microchipId, setMicrochipId] = useState('');
  const [isBoarding, setIsBoarding] = useState(false);
  const [isBreeding, setIsBreeding] = useState(false);

  // Boarding fields
  const [ownerName, setOwnerName] = useState('');
  const [ownerContact, setOwnerContact] = useState('');
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [kennelRun, setKennelRun] = useState('');
  const [specialCare, setSpecialCare] = useState('');

  // Breeding fields
  const [sireOption, setSireOption] = useState<'local' | 'external'>('external');
  const [localSireId, setLocalSireId] = useState('');
  const [externalSireName, setExternalSireName] = useState('');
  
  const [damOption, setDamOption] = useState<'local' | 'external'>('external');
  const [localDamId, setLocalDamId] = useState('');
  const [externalDamName, setExternalDamName] = useState('');
  
  const [breedingStatus, setBreedingStatus] = useState<'active' | 'retired'>('active');
  const [breedingNotes, setBreedingNotes] = useState('');

  // Form error message
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!user) return;
    dbService.getAnimals(user.orgId).then((list) => {
      setMaleAnimals(list.filter(a => a.sex === 'male'));
      setFemaleAnimals(list.filter(a => a.sex === 'female'));
    }).catch(console.error);
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setErrorMsg('');
    setSubmitting(true);

    try {
      if (!name || !species || !breed || !dateOfBirth) {
        throw new Error("Please fill in all core fields: Name, Species, Breed, and Date of Birth.");
      }

      if (!isBoarding && !isBreeding) {
        throw new Error("Please select at least one profile type: Boarding, Breeding, or Both.");
      }

      // Compile breeding fields
      const sireId = isBreeding && sireOption === 'local' ? localSireId : undefined;
      const sireName = isBreeding
        ? (sireOption === 'local' 
            ? maleAnimals.find(m => m.id === localSireId)?.name || '' 
            : externalSireName)
        : undefined;

      const damId = isBreeding && damOption === 'local' ? localDamId : undefined;
      const damName = isBreeding
        ? (damOption === 'local' 
            ? femaleAnimals.find(f => f.id === localDamId)?.name || '' 
            : externalDamName)
        : undefined;

      const newAnimalData = {
        name,
        species,
        breed,
        dateOfBirth,
        sex,
        microchipId: microchipId || undefined,
        isBoarding,
        isBreeding,
        // Boarding fields
        ownerName: isBoarding ? ownerName : undefined,
        ownerContact: isBoarding ? ownerContact : undefined,
        checkInDate: isBoarding ? checkInDate : undefined,
        checkOutDate: isBoarding ? checkOutDate : undefined,
        kennelRun: isBoarding ? kennelRun : undefined,
        specialCare: isBoarding ? specialCare : undefined,
        // Breeding fields
        sireId,
        sireName,
        damId,
        damName,
        breedingStatus: isBreeding ? breedingStatus : undefined,
        breedingNotes: isBreeding ? breedingNotes : undefined,
        photoUrl: ''
      };

      const result = await dbService.createAnimal(user.orgId, newAnimalData);
      router.push(`/animals/${result.id}`);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to create animal profile");
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* HEADER */}
      <div className="flex items-center space-x-3">
        <Link
          href="/animals"
          className="p-2 bg-white rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors text-slate-600"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Create Animal Profile</h1>
          <p className="text-xs text-slate-500">Register a new boarding pet or breeding animal.</p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold">
          {errorMsg}
        </div>
      )}

      {/* FORM */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* SECTION 1: CORE INFORMATION */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center">
            <Dog className="h-4 w-4 text-emerald-700 mr-2" />
            Core Identification
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Animal Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Bella"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700/10 focus:border-emerald-700 text-slate-900 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Species *</label>
              <select
                value={species}
                onChange={(e) => setSpecies(e.target.value)}
                className="block w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700/10 focus:border-emerald-700 text-slate-900 transition-all"
              >
                <option value="Dog">Dog</option>
                <option value="Cat">Cat</option>
                <option value="Goat">Goat</option>
                <option value="Horse">Horse</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Breed *</label>
              <input
                type="text"
                required
                placeholder="e.g. Golden Retriever"
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
                className="block w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700/10 focus:border-emerald-700 text-slate-900 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Microchip / ID Number</label>
              <input
                type="text"
                placeholder="e.g. 985112000000000"
                value={microchipId}
                onChange={(e) => setMicrochipId(e.target.value)}
                className="block w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700/10 focus:border-emerald-700 text-slate-900 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Date of Birth *</label>
              <input
                type="date"
                required
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="block w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700/10 focus:border-emerald-700 text-slate-900 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Sex *</label>
              <div className="flex space-x-4 mt-2">
                <label className="inline-flex items-center text-sm text-slate-700">
                  <input
                    type="radio"
                    name="sex"
                    checked={sex === 'female'}
                    onChange={() => setSex('female')}
                    className="h-4 w-4 text-emerald-700 focus:ring-emerald-600 border-slate-300"
                  />
                  <span className="ml-2">Female (Dam / Queen)</span>
                </label>
                <label className="inline-flex items-center text-sm text-slate-700">
                  <input
                    type="radio"
                    name="sex"
                    checked={sex === 'male'}
                    onChange={() => setSex('male')}
                    className="h-4 w-4 text-emerald-700 focus:ring-emerald-600 border-slate-300"
                  />
                  <span className="ml-2">Male (Sire / Stud)</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: PROFILE PROFILE TYPES SELECTION */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center">
            <ShieldCheck className="h-4 w-4 text-emerald-700 mr-2" />
            Profile Purpose / Scope
          </h2>
          <p className="text-xs text-slate-500">Enable features by selecting what this animal is managed for.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Boarding Toggle */}
            <label className={`flex items-start p-4 rounded-xl border cursor-pointer transition-all ${
              isBoarding 
                ? 'border-emerald-700 bg-emerald-50/20' 
                : 'border-slate-200 bg-slate-50 hover:bg-slate-100/50'
            }`}>
              <input
                type="checkbox"
                checked={isBoarding}
                onChange={(e) => setIsBoarding(e.target.checked)}
                className="mt-1 h-4.5 w-4.5 text-emerald-700 rounded-sm focus:ring-emerald-500 border-slate-300"
              />
              <div className="ml-3">
                <span className="block text-sm font-bold text-slate-900">Boarding & Care Guest</span>
                <span className="block text-xs text-slate-500 mt-1">Add check-in/out scheduling, owner contact info, and kennel run tracking.</span>
              </div>
            </label>

            {/* Breeding Toggle */}
            <label className={`flex items-start p-4 rounded-xl border cursor-pointer transition-all ${
              isBreeding 
                ? 'border-emerald-700 bg-emerald-50/20' 
                : 'border-slate-200 bg-slate-50 hover:bg-slate-100/50'
            }`}>
              <input
                type="checkbox"
                checked={isBreeding}
                onChange={(e) => setIsBreeding(e.target.checked)}
                className="mt-1 h-4.5 w-4.5 text-emerald-700 rounded-sm focus:ring-emerald-500 border-slate-300"
              />
              <div className="ml-3">
                <span className="block text-sm font-bold text-slate-900">Breeding Stock Program</span>
                <span className="block text-xs text-slate-500 mt-1">Unlock pedigree tracking, mating logs, heat cycle charts, and pregnancy logs.</span>
              </div>
            </label>
          </div>
        </div>

        {/* SECTION 3: BOARDING DETAILS (CONDITIONAL) */}
        {isBoarding && (
          <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-xs space-y-4 animate-fade-in">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center">
              <Building className="h-4 w-4 text-emerald-700 mr-2" />
              Boarding Stay Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Owner Name</label>
                <input
                  type="text"
                  placeholder="e.g. Robert Chen"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="block w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700/10 focus:border-emerald-700 text-slate-900 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Owner Contact (Phone / Email)</label>
                <input
                  type="text"
                  placeholder="e.g. +1-555-0142, robert@mail.com"
                  value={ownerContact}
                  onChange={(e) => setOwnerContact(e.target.value)}
                  className="block w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700/10 focus:border-emerald-700 text-slate-900 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Check-In Date</label>
                <input
                  type="date"
                  value={checkInDate}
                  onChange={(e) => setCheckInDate(e.target.value)}
                  className="block w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700/10 focus:border-emerald-700 text-slate-900 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Check-Out Date</label>
                <input
                  type="date"
                  value={checkOutDate}
                  onChange={(e) => setCheckOutDate(e.target.value)}
                  className="block w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700/10 focus:border-emerald-700 text-slate-900 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Kennel / Run Assignment</label>
                <input
                  type="text"
                  placeholder="e.g. Run A-4 or Kitty Condo C"
                  value={kennelRun}
                  onChange={(e) => setKennelRun(e.target.value)}
                  className="block w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700/10 focus:border-emerald-700 text-slate-900 transition-all"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Special Care / Feeding Instructions</label>
                <textarea
                  rows={3}
                  placeholder="Provide allergy advice, daily feeding instructions, temperament notes, or custom schedules."
                  value={specialCare}
                  onChange={(e) => setSpecialCare(e.target.value)}
                  className="block w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700/10 focus:border-emerald-700 text-slate-900 transition-all"
                />
              </div>
            </div>
          </div>
        )}

        {/* SECTION 4: BREEDING DETAILS (CONDITIONAL) */}
        {isBreeding && (
          <div className="bg-white p-6 rounded-2xl border border-purple-100 shadow-xs space-y-4 animate-fade-in">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center">
              <Heart className="h-4 w-4 text-purple-700 mr-2" />
              Breeding & Pedigree Lineage
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* SIRE CHANGER */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">Sire (Father)</label>
                <div className="flex space-x-2 text-[10px] font-semibold text-slate-500">
                  <button
                    type="button"
                    onClick={() => setSireOption('local')}
                    className={`px-2 py-0.5 rounded ${sireOption === 'local' ? 'bg-purple-100 text-purple-800' : 'bg-slate-100'}`}
                  >
                    Select Local
                  </button>
                  <button
                    type="button"
                    onClick={() => setSireOption('external')}
                    className={`px-2 py-0.5 rounded ${sireOption === 'external' ? 'bg-purple-100 text-purple-800' : 'bg-slate-100'}`}
                  >
                    Enter External Name
                  </button>
                </div>
                {sireOption === 'local' ? (
                  <select
                    value={localSireId}
                    onChange={(e) => setLocalSireId(e.target.value)}
                    className="block w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                  >
                    <option value="">-- Choose local male --</option>
                    {maleAnimals.map(a => (
                      <option key={a.id} value={a.id}>{a.name} ({a.breed})</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    placeholder="e.g. Zeus Stud (Championship Sire)"
                    value={externalSireName}
                    onChange={(e) => setExternalSireName(e.target.value)}
                    className="block w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                  />
                )}
              </div>

              {/* DAM CHANGER */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">Dam (Mother)</label>
                <div className="flex space-x-2 text-[10px] font-semibold text-slate-500">
                  <button
                    type="button"
                    onClick={() => setDamOption('local')}
                    className={`px-2 py-0.5 rounded ${damOption === 'local' ? 'bg-purple-100 text-purple-800' : 'bg-slate-100'}`}
                  >
                    Select Local
                  </button>
                  <button
                    type="button"
                    onClick={() => setDamOption('external')}
                    className={`px-2 py-0.5 rounded ${damOption === 'external' ? 'bg-purple-100 text-purple-800' : 'bg-slate-100'}`}
                  >
                    Enter External Name
                  </button>
                </div>
                {damOption === 'local' ? (
                  <select
                    value={localDamId}
                    onChange={(e) => setLocalDamId(e.target.value)}
                    className="block w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                  >
                    <option value="">-- Choose local female --</option>
                    {femaleAnimals.map(a => (
                      <option key={a.id} value={a.id}>{a.name} ({a.breed})</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    placeholder="e.g. Sweet Princess Lilly"
                    value={externalDamName}
                    onChange={(e) => setExternalDamName(e.target.value)}
                    className="block w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Breeding Program Status</label>
                <select
                  value={breedingStatus}
                  onChange={(e) => setBreedingStatus(e.target.value as 'active' | 'retired')}
                  className="block w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700/10 focus:border-emerald-700 text-slate-900 transition-all"
                >
                  <option value="active">Active Breeding Stock</option>
                  <option value="retired">Retired / Spayed / Neutered</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Lineage Notes & Health Clearances</label>
                <textarea
                  rows={2}
                  placeholder="Record hip scores, OFA clearances, genetic testing, or pedigree notes."
                  value={breedingNotes}
                  onChange={(e) => setBreedingNotes(e.target.value)}
                  className="block w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700/10 focus:border-emerald-700 text-slate-900 transition-all"
                />
              </div>
            </div>
          </div>
        )}

        {/* SUBMIT BUTTONS */}
        <div className="flex items-center justify-end space-x-3 pt-4">
          <Link
            href="/animals"
            className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl text-sm hover:bg-slate-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center px-5 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-md transition-colors disabled:opacity-50 text-sm cursor-pointer"
          >
            <Save className="mr-2 h-4 w-4" />
            {submitting ? 'Creating Profile...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
}
