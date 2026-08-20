"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { dbService } from '@/lib/services';
import { Animal } from '@/types';
import { Dog, Plus, Search, Calendar, MapPin, User, ChevronRight, Shield } from 'lucide-react';
import Link from 'next/link';

export default function AnimalsPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter state
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'boarding' | 'breeding'>('all');
  const [selectedSpecies, setSelectedSpecies] = useState<string>('All');
  
  useEffect(() => {
    if (!user) return;
    dbService.getAnimals(user.orgId)
      .then((data) => {
        setAnimals(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching animals", err);
        setLoading(false);
      });
  }, [user]);

  // Unique species list for filter dropdown
  const speciesList = ['All', ...Array.from(new Set(animals.map(a => a.species)))];

  // Filter animals based on search, tab, and species dropdown
  const filteredAnimals = animals.filter(animal => {
    const matchesSearch = 
      animal.name.toLowerCase().includes(search.toLowerCase()) ||
      animal.breed.toLowerCase().includes(search.toLowerCase()) ||
      (animal.microchipId && animal.microchipId.includes(search)) ||
      (animal.ownerName && animal.ownerName.toLowerCase().includes(search.toLowerCase()));

    const matchesSpecies = selectedSpecies === 'All' || animal.species === selectedSpecies;

    const matchesTab = 
      activeTab === 'all' ||
      (activeTab === 'boarding' && animal.isBoarding) ||
      (activeTab === 'breeding' && animal.isBreeding);

    return matchesSearch && matchesSpecies && matchesTab;
  });

  // Calculate age from DOB
  const calculateAge = (dobString: string) => {
    try {
      const dob = new Date(dobString);
      const diffMs = Date.now() - dob.getTime();
      const ageDate = new Date(diffMs);
      const years = Math.abs(ageDate.getUTCFullYear() - 1970);
      const months = ageDate.getUTCMonth();
      
      if (years === 0) {
        return `${months}m`;
      }
      return `${years}y ${months}m`;
    } catch {
      return "Unknown";
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Dog className="h-10 w-10 text-emerald-700 animate-bounce mb-3" />
        <p className="text-sm font-semibold text-slate-500">Loading animals directory...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{t('animals_title')}</h1>
          <p className="text-sm text-slate-500 mt-1">{t('animals_subtitle')}</p>
        </div>
        <Link
          href="/animals/new"
          className="inline-flex items-center justify-center px-4 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-md transition-colors cursor-pointer text-sm"
        >
          <Plus className="mr-2 ltr:mr-2 rtl:ml-2 h-4 w-4" />
          {t('animals_btn_add')}
        </Link>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex flex-col md:flex-row md:items-center gap-4 justify-between">
        {/* Search */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className="h-4.5 w-4.5 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder={t('animals_search_placeholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full pl-10 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700/10 focus:border-emerald-700 text-slate-900 placeholder-slate-400 transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <select
            value={selectedSpecies}
            onChange={(e) => setSelectedSpecies(e.target.value)}
            className="px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-700/10 focus:border-emerald-700 transition-all"
          >
            {speciesList.map((spec) => (
              <option key={spec} value={spec}>
                Species: {spec}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* TABS */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('all')}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'all'
              ? 'border-emerald-700 text-emerald-800'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          {t('animals_tab_all')} ({animals.length})
        </button>
        <button
          onClick={() => setActiveTab('boarding')}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'boarding'
              ? 'border-emerald-700 text-emerald-800'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          {t('animals_tab_boarding')} ({animals.filter(a => a.isBoarding).length})
        </button>
        <button
          onClick={() => setActiveTab('breeding')}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'breeding'
              ? 'border-emerald-700 text-emerald-800'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          {t('animals_tab_breeding')} ({animals.filter(a => a.isBreeding).length})
        </button>
      </div>

      {/* ANIMALS GRID */}
      {filteredAnimals.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAnimals.map((animal) => (
            <Link
              key={animal.id}
              href={`/animals/${animal.id}`}
              className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between"
            >
              {/* TOP BAR */}
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3.5">
                    {/* Visual avatar */}
                    <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-lg border border-emerald-100/50 flex-shrink-0 group-hover:scale-105 transition-transform duration-200">
                      {animal.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">{animal.name}</h3>
                      <p className="text-xs text-slate-400">{animal.breed} ({animal.species})</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                    animal.sex === 'female' 
                      ? 'bg-rose-50 text-rose-700 border border-rose-100' 
                      : 'bg-blue-50 text-blue-700 border border-blue-100'
                  }`}>
                    {animal.sex}
                  </span>
                </div>

                {/* DETAILS METRICS */}
                <div className="mt-5 space-y-2.5">
                  <div className="flex items-center text-xs text-slate-500">
                    <Calendar className="h-4 w-4 text-slate-400 mr-2 flex-shrink-0" />
                    <span>DOB: {animal.dateOfBirth} ({calculateAge(animal.dateOfBirth)})</span>
                  </div>

                  {animal.isBoarding && (
                    <>
                      <div className="flex items-center text-xs text-slate-500">
                        <MapPin className="h-4 w-4 text-slate-400 mr-2 flex-shrink-0" />
                        <span>Kennel: <strong className="text-slate-700 font-semibold">{animal.kennelRun || 'Not Assigned'}</strong></span>
                      </div>
                      <div className="flex items-center text-xs text-slate-500">
                        <User className="h-4 w-4 text-slate-400 mr-2 flex-shrink-0" />
                        <span>Owner: {animal.ownerName || 'Unknown'}</span>
                      </div>
                    </>
                  )}

                  {animal.isBreeding && (
                    <div className="flex items-center text-xs text-slate-500">
                      <Shield className="h-4 w-4 text-slate-400 mr-2 flex-shrink-0" />
                      <span>Breeding Status: <span className="font-bold capitalize text-slate-700">{animal.breedingStatus || 'active'}</span></span>
                    </div>
                  )}
                </div>
              </div>

              {/* FOOTER BAR */}
              <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-emerald-800 font-semibold">
                <div className="flex gap-1.5">
                  {animal.isBoarding && (
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200/50 rounded-md font-bold text-[9px] uppercase tracking-wider">
                      Boarding
                    </span>
                  )}
                  {animal.isBreeding && (
                    <span className="px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200/50 rounded-md font-bold text-[9px] uppercase tracking-wider">
                      Breeding
                    </span>
                  )}
                </div>
                <div className="flex items-center group-hover:translate-x-0.5 transition-transform duration-200">
                  <span>View Details</span>
                  <ChevronRight className="h-3.5 w-3.5 ml-1 text-emerald-700" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-white py-16 px-4 border border-slate-100 rounded-3xl text-center max-w-md mx-auto shadow-xs">
          <Dog className="mx-auto h-12 w-12 text-slate-300" />
          <h3 className="mt-4 text-sm font-bold text-slate-900">No animals found</h3>
          <p className="mt-2 text-xs text-slate-500 leading-normal">
            No animal profiles match your current filters. Try relaxing search criteria, switching tabs, or create a new profile!
          </p>
          <div className="mt-6">
            <Link
              href="/animals/new"
              className="inline-flex items-center px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs shadow-md"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add First Animal
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
