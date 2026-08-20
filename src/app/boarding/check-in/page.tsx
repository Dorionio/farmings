"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@/context/AuthContext';
import { dbService } from '@/lib/services';
import { supabase } from '@/lib/supabaseClient';
import { Animal, Kennel } from '@/types';
import { Save, ArrowLeft, Building2, Dog, Clipboard } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

function CheckInForm() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const preSelectedKennel = searchParams?.get('kennel') || '';

  // Data lists
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [kennels, setKennels] = useState<Kennel[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Selector mode
  const [animalMode, setAnimalMode] = useState<'existing' | 'new'>('existing');

  // Input states
  const [selectedAnimalId, setSelectedAnimalId] = useState('');
  
  // New Animal core states
  const [newAnimalName, setNewAnimalName] = useState('');
  const [newAnimalSpecies, setNewAnimalSpecies] = useState('Dog');
  const [newAnimalBreed, setNewAnimalBreed] = useState('');
  const [newAnimalDOB, setNewAnimalDOB] = useState('');
  const [newAnimalSex, setNewAnimalSex] = useState<'male' | 'female'>('female');
  const [newAnimalMicrochip, setNewAnimalMicrochip] = useState('');

  // Boarding states
  const [checkInDate, setCheckInDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [checkOutDate, setCheckOutDate] = useState('');
  const [selectedKennelId, setSelectedKennelId] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerContact, setOwnerContact] = useState('');
  const [specialCare, setSpecialCare] = useState('');

  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!user) return;
    refreshData();
  }, [user]);

  const refreshData = async () => {
    if (!user) return;
    try {
      const [aList, kList] = await Promise.all([
        dbService.getAnimals(user.orgId),
        dbService.getKennels(user.orgId)
      ]);
      
      // Filter out animals that are already boarding
      setAnimals(aList.filter(a => !a.isBoarding));
      setKennels(kList);

      // Pre-select kennel run if parameter matches
      if (preSelectedKennel) {
        const found = kList.find(k => k.name === preSelectedKennel && k.status === 'available');
        if (found) {
          setSelectedKennelId(found.id);
        }
      }

      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setErrorMsg('');
    setSubmitting(true);

    try {
      if (!selectedKennelId) throw new Error("Please select a kennel/run assignment.");
      if (!checkOutDate) throw new Error("Expected check-out date is required.");

      const kennel = kennels.find(k => k.id === selectedKennelId);
      if (!kennel) throw new Error("Selected kennel run does not exist.");

      // Verify kennel occupancy status from database to prevent double bookings
      const { data: dbKennel, error: dbKennelError } = await supabase
        .from('kennels')
        .select('status')
        .eq('organization_id', user.orgId)
        .eq('id', selectedKennelId)
        .single();
      
      if (dbKennelError || !dbKennel) {
        throw new Error("Failed to verify kennel availability. Please try again.");
      }
      
      if (dbKennel.status === 'occupied') {
        throw new Error("Double-booking prevented: This kennel run is already occupied.");
      }

      let targetAnimal: Animal;

      if (animalMode === 'existing') {
        if (!selectedAnimalId) throw new Error("Please select an animal guest.");
        const anim = animals.find(a => a.id === selectedAnimalId);
        if (!anim) throw new Error("Selected animal profile not found.");
        
        // Update animal profile fields
        const updateFields = {
          isBoarding: true,
          checkInDate,
          checkOutDate,
          kennelRun: kennel.name,
          ownerName: ownerName || undefined,
          ownerContact: ownerContact || undefined,
          specialCare: specialCare || undefined
        };
        await dbService.updateAnimal(user.orgId, anim.id, updateFields);
        targetAnimal = { ...anim, ...updateFields };
      } else {
        // Create new animal
        if (!newAnimalName || !newAnimalBreed || !newAnimalDOB) {
          throw new Error("Please complete the new animal guest core identification.");
        }
        const newAnimalData = {
          name: newAnimalName,
          species: newAnimalSpecies,
          breed: newAnimalBreed,
          dateOfBirth: newAnimalDOB,
          sex: newAnimalSex,
          microchipId: newAnimalMicrochip || undefined,
          isBoarding: true,
          isBreeding: false,
          ownerName: ownerName || undefined,
          ownerContact: ownerContact || undefined,
          checkInDate,
          checkOutDate,
          kennelRun: kennel.name,
          specialCare: specialCare || undefined,
          photoUrl: ''
        };
        targetAnimal = await dbService.createAnimal(user.orgId, newAnimalData);
      }

      // Mark Kennel run occupied
      await dbService.updateKennelStatus(
        user.orgId, 
        kennel.id, 
        'occupied', 
        targetAnimal.id, 
        targetAnimal.name
      );

      router.push('/boarding');
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to process check-in.");
      setSubmitting(false);
    }
  };

  const handleAnimalSelectChange = (id: string) => {
    setSelectedAnimalId(id);
    const anim = animals.find(a => a.id === id);
    if (anim) {
      // Auto-populate owner fields if they exist in system
      setOwnerName(anim.ownerName || '');
      setOwnerContact(anim.ownerContact || '');
      setSpecialCare(anim.specialCare || '');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Building2 className="h-10 w-10 text-emerald-700 animate-bounce mb-3" />
        <p className="text-sm font-semibold text-slate-500">Loading check-in registry...</p>
      </div>
    );
  }

  // Available kennels dropdown choices
  const availableKennels = kennels.filter(k => k.status === 'available' || k.id === selectedKennelId);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* HEADER */}
      <div className="flex items-center space-x-3">
        <Link
          href="/boarding"
          className="p-2 bg-white rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors text-slate-600"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Boarding Check-In Guest</h1>
          <p className="text-xs text-slate-500">Log a check-in record and allocate physical run accommodations.</p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold">
          {errorMsg}
        </div>
      )}

      {/* FORM */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* STEP 1: SELECT OR ADD ANIMAL */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center">
            <Dog className="h-4.5 w-4.5 text-emerald-700 mr-2" />
            Animal Guest Selector
          </h2>

          <div className="flex bg-slate-100 p-1 rounded-xl w-fit text-xs font-semibold mb-2">
            <button
              type="button"
              onClick={() => setAnimalMode('existing')}
              className={`px-4 py-1.5 rounded-lg transition-all ${
                animalMode === 'existing' ? 'bg-white text-emerald-950 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Select Existing Animal
            </button>
            <button
              type="button"
              onClick={() => setAnimalMode('new')}
              className={`px-4 py-1.5 rounded-lg transition-all ${
                animalMode === 'new' ? 'bg-white text-emerald-950 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Add New Guest Profile
            </button>
          </div>

          {animalMode === 'existing' ? (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Select Animal Guest *</label>
              <select
                value={selectedAnimalId}
                onChange={(e) => handleAnimalSelectChange(e.target.value)}
                className="block w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
              >
                <option value="">-- Choose guest --</option>
                {animals.map(a => (
                  <option key={a.id} value={a.id}>{a.name} ({a.breed} - {a.sex})</option>
                ))}
              </select>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Name *</label>
                <input
                  type="text" placeholder="e.g. Buddy" value={newAnimalName} onChange={(e) => setNewAnimalName(e.target.value)}
                  className="block w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Species *</label>
                <select
                  value={newAnimalSpecies} onChange={(e) => setNewAnimalSpecies(e.target.value)}
                  className="block w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="Dog">Dog</option>
                  <option value="Cat">Cat</option>
                  <option value="Goat">Goat</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Breed *</label>
                <input
                  type="text" placeholder="e.g. Cocker Spaniel" value={newAnimalBreed} onChange={(e) => setNewAnimalBreed(e.target.value)}
                  className="block w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Microchip / ID</label>
                <input
                  type="text" placeholder="e.g. 98511..." value={newAnimalMicrochip} onChange={(e) => setNewAnimalMicrochip(e.target.value)}
                  className="block w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Date of Birth *</label>
                <input
                  type="date" value={newAnimalDOB} onChange={(e) => setNewAnimalDOB(e.target.value)}
                  className="block w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Sex *</label>
                <div className="flex space-x-4 mt-2">
                  <label className="inline-flex items-center text-xs text-slate-700">
                    <input
                      type="radio" name="newSex" checked={newAnimalSex === 'female'} onChange={() => setNewAnimalSex('female')}
                      className="h-4 w-4 text-emerald-700"
                    />
                    <span className="ml-2">Female</span>
                  </label>
                  <label className="inline-flex items-center text-xs text-slate-700">
                    <input
                      type="radio" name="newSex" checked={newAnimalSex === 'male'} onChange={() => setNewAnimalSex('male')}
                      className="h-4 w-4 text-emerald-700"
                    />
                    <span className="ml-2">Male</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* STEP 2: ASSIGNMENT & STAY DATES */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center">
            <Building2 className="h-4.5 w-4.5 text-emerald-700 mr-2" />
            Check-In Stay Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Kennel / Run Enclosure *</label>
              <select
                required
                value={selectedKennelId}
                onChange={(e) => setSelectedKennelId(e.target.value)}
                className="block w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none"
              >
                <option value="">-- Choose vacant run --</option>
                {availableKennels.map(k => (
                  <option key={k.id} value={k.id}>
                    {k.name} {k.status === 'occupied' && '(Currently Selected)'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Check-In Date *</label>
              <input
                type="date"
                required
                value={checkInDate}
                onChange={(e) => setCheckInDate(e.target.value)}
                className="block w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Expected Check-Out Date *</label>
              <input
                type="date"
                required
                value={checkOutDate}
                onChange={(e) => setCheckOutDate(e.target.value)}
                className="block w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* STEP 3: CONTACTS & SPECIAL CARE */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center">
            <Clipboard className="h-4.5 w-4.5 text-emerald-700 mr-2" />
            Special Care Instructions & Contacts
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Owner Full Name</label>
              <input
                type="text"
                placeholder="e.g. Linda Gomez"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                className="block w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Owner Contact Details (Phone / Email)</label>
              <input
                type="text"
                placeholder="e.g. +1-555-0142"
                value={ownerContact}
                onChange={(e) => setOwnerContact(e.target.value)}
                className="block w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Special Care / Feeding Instructions</label>
              <textarea
                rows={3}
                placeholder="List special diet instructions, feeding schedule, medications details, or behavioral checks."
                value={specialCare}
                onChange={(e) => setSpecialCare(e.target.value)}
                className="block w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* SUBMIT */}
        <div className="flex items-center justify-end space-x-3 pt-4">
          <Link
            href="/boarding"
            className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl text-xs hover:bg-slate-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center px-5 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-md transition-colors disabled:opacity-50 text-xs cursor-pointer"
          >
            <Save className="mr-2 h-4 w-4" />
            {submitting ? 'Checking In...' : 'Process Guest Check-In'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function CheckInPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center py-20">
        <Building2 className="h-10 w-10 text-emerald-700 animate-bounce mb-3" />
        <p className="text-sm font-semibold text-slate-500">Loading check-in registry...</p>
      </div>
    }>
      <CheckInForm />
    </Suspense>
  );
}
