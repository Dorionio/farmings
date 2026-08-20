"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { dbService } from '@/lib/services';
import { Kennel } from '@/types';
import { LayoutGrid, Plus, Save, PenTool, CheckCircle, AlertTriangle, Dog, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function KennelsPage() {
  const { user } = useAuth();
  const [kennels, setKennels] = useState<Kennel[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newNotes, setNewNotes] = useState('');
  
  // Submit state
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;
    refreshKennels();
  }, [user]);

  const refreshKennels = async () => {
    if (!user) return;
    try {
      const list = await dbService.getKennels(user.orgId);
      setKennels(list);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleAddKennel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newName) return;
    setSubmitting(true);
    try {
      await dbService.createKennel(user.orgId, newName, newNotes || undefined);
      setNewName('');
      setNewNotes('');
      setShowAddForm(false);
      await refreshKennels();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (
    kennelId: string, 
    status: 'available' | 'occupied' | 'maintenance'
  ) => {
    if (!user) return;
    try {
      // If we move to available or maintenance, we clear current guest fields
      const animalId = status !== 'occupied' ? null : undefined;
      const animalName = status !== 'occupied' ? null : undefined;
      
      await dbService.updateKennelStatus(
        user.orgId, 
        kennelId, 
        status, 
        animalId as any, 
        animalName as any
      );
      await refreshKennels();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCheckOut = async (kennelId: string, animalId: string, kennelName: string) => {
    if (!user) return;
    if (confirm(`Check out guest and release kennel ${kennelName}?`)) {
      try {
        await dbService.updateAnimal(user.orgId, animalId, {
          isBoarding: false,
          kennelRun: null as any,
          checkInDate: null as any,
          checkOutDate: null as any
        });
        await dbService.updateKennelStatus(user.orgId, kennelId, 'available', null as any, null as any);
        await refreshKennels();
      } catch (err) {
        console.error(err);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <LayoutGrid className="h-10 w-10 text-emerald-700 animate-bounce mb-3" />
        <p className="text-sm font-semibold text-slate-500">Loading kennels status...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Link
            href="/boarding"
            className="p-2 bg-white rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors text-slate-600"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Kennel & Run Directory</h1>
            <p className="text-sm text-slate-500 mt-1">Manage boarding enclosures, status allocations, and guests.</p>
          </div>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center justify-center px-4 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-md transition-colors cursor-pointer text-sm"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Kennel Run
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* ADD KENNEL FORM (Collapsible) */}
        {showAddForm && (
          <div className="lg:col-span-3 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm animate-fade-in">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center">
              <LayoutGrid className="h-4.5 w-4.5 text-emerald-700 mr-2" />
              Register New Boarding Kennel/Run
            </h3>
            <form onSubmit={handleAddKennel} className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Enclosure Name/Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Run A-5 or Suite 10"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Enclosure Notes / Details</label>
                <input
                  type="text"
                  placeholder="e.g. Standard dog run with heated floor. Max weight 80lbs."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none"
                />
              </div>
              <div className="md:col-span-3 flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white font-semibold rounded-xl disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Register Enclosure'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* KENNELS GRID */}
        <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {kennels.map((kennel) => (
            <div
              key={kennel.id}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <h3 className="font-bold text-slate-900 text-sm">{kennel.name}</h3>
                  <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                    kennel.status === 'available'
                      ? 'bg-green-50 text-green-700 border-green-100'
                      : kennel.status === 'occupied'
                        ? 'bg-blue-50 text-blue-700 border-blue-100'
                        : 'bg-amber-50 text-amber-700 border-amber-100'
                  }`}>
                    {kennel.status}
                  </span>
                </div>

                {/* CURRENT GUEST INFO */}
                <div className="mt-4 space-y-2">
                  {kennel.status === 'occupied' ? (
                    <div className="p-3 bg-blue-50/20 border border-blue-100/50 rounded-xl flex items-center space-x-2.5 text-xs">
                      <div className="p-1.5 bg-blue-100 rounded-lg text-blue-700">
                        <Dog className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="block text-[10px] text-slate-400 font-bold uppercase">Current Guest</span>
                        {kennel.currentAnimalId ? (
                          <Link
                            href={`/animals/${kennel.currentAnimalId}`}
                            className="font-bold text-blue-800 hover:underline leading-tight block mt-0.5"
                          >
                            {kennel.currentAnimalName}
                          </Link>
                        ) : (
                          <span className="font-semibold text-slate-800 mt-0.5 block">{kennel.currentAnimalName}</span>
                        )}
                      </div>
                    </div>
                  ) : kennel.status === 'maintenance' ? (
                    <div className="p-3 bg-amber-50/20 border border-amber-100/50 rounded-xl flex items-center space-x-2.5 text-xs text-amber-900 leading-normal">
                      <AlertTriangle className="h-4 w-4 text-amber-700 flex-shrink-0" />
                      <p className="text-[11px] font-medium">{kennel.notes || 'Undergoing routine cleaning/maintenance.'}</p>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">Enclosure is vacant and clean.</p>
                  )}
                </div>
              </div>

              {/* ACTION TOGGLES */}
              <div className="mt-5 border-t border-slate-100 pt-3.5 flex justify-end space-x-2 text-[10px] font-bold">
                {kennel.status === 'available' && (
                  <>
                    <button
                      onClick={() => handleUpdateStatus(kennel.id, 'maintenance')}
                      className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-lg cursor-pointer"
                    >
                      Hold Maintenance
                    </button>
                    <Link
                      href={`/boarding/check-in?kennel=${kennel.name}`}
                      className="px-2.5 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg cursor-pointer"
                    >
                      Assign Guest
                    </Link>
                  </>
                )}
                {kennel.status === 'maintenance' && (
                  <button
                    onClick={() => handleUpdateStatus(kennel.id, 'available')}
                    className="px-2.5 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 rounded-lg cursor-pointer"
                  >
                    Set Available
                  </button>
                )}
                {kennel.status === 'occupied' && (
                  <div className="flex items-center justify-between w-full">
                    <div className="text-[10px] text-slate-400 font-semibold italic flex items-center">
                      <CheckCircle className="h-3.5 w-3.5 mr-1 text-blue-750" />
                      Guest checked in
                    </div>
                    <button
                      onClick={() => handleCheckOut(kennel.id, kennel.currentAnimalId || '', kennel.name)}
                      className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg cursor-pointer"
                    >
                      Check Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
