"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { dbService } from '@/lib/services';
import { Animal, CareSchedule, Medication, CareLog } from '@/types';
import { CheckSquare, Square, Dog, MapPin, Clock, CheckCircle2, RefreshCw } from 'lucide-react';

interface CombinedTask {
  id: string; // scheduleId or medId-custom
  animalId: string;
  animalName: string;
  kennelRun: string;
  taskName: string;
  schedule: string;
  isMedication: boolean;
  notes?: string;
  completed: boolean;
  completedAt?: string;
  completedByName?: string;
}

export default function ChecklistPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]); // YYYY-MM-DD
  
  // Data states
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [schedules, setSchedules] = useState<CareSchedule[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [logs, setLogs] = useState<CareLog[]>([]);

  // Filter states
  const [filterTab, setFilterTab] = useState<'pending' | 'completed' | 'all'>('pending');
  const [filterKennel, setFilterKennel] = useState<string>('All');
  
  // Action load state
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    refreshChecklist();
  }, [user, date]);

  const refreshChecklist = async () => {
    if (!user) return;
    try {
      const [aList, sList, mList, lList] = await Promise.all([
        dbService.getAnimals(user.orgId),
        dbService.getCareSchedules(user.orgId),
        dbService.getMedications(user.orgId),
        dbService.getCareLogs(user.orgId, date)
      ]);
      setAnimals(aList);
      setSchedules(sList);
      setMedications(mList.filter(m => m.status === 'active'));
      setLogs(lList);
      setLoading(false);
    } catch (err) {
      console.error("Error refreshing daily checklist", err);
      setLoading(false);
    }
  };

  // Compile checklist tasks
  const tasks: CombinedTask[] = [];

  // 1. Process recurring care schedules
  schedules.forEach(s => {
    const animal = animals.find(a => a.id === s.animalId);
    if (!animal) return; // Animal might have been deleted

    // Find if completed in logs
    // Match by animalId, taskName, schedule, date
    const logMatch = logs.find(l => 
      l.animalId === s.animalId && 
      l.taskName === s.taskName && 
      l.schedule === s.schedule
    );

    tasks.push({
      id: `sched-${s.id}`,
      animalId: s.animalId,
      animalName: s.animalName,
      kennelRun: animal.kennelRun || 'Not Assigned',
      taskName: s.taskName,
      schedule: s.schedule,
      isMedication: false,
      notes: s.notes,
      completed: !!logMatch,
      completedAt: logMatch?.completedAt,
      completedByName: logMatch?.completedByName
    });
  });

  // 2. Process active medications as daily tasks
  medications.forEach(m => {
    const animal = animals.find(a => a.id === m.animalId);
    if (!animal) return;

    const taskName = `Give medication: ${m.name} (${m.dosage})`;
    const logMatch = logs.find(l => 
      l.animalId === m.animalId && 
      l.taskName === taskName && 
      l.schedule === m.schedule
    );

    tasks.push({
      id: `med-${m.id}`,
      animalId: m.animalId,
      animalName: m.animalName,
      kennelRun: animal.kennelRun || 'Not Assigned',
      taskName,
      schedule: m.schedule,
      isMedication: true,
      notes: `Instructions: ${m.schedule}`,
      completed: !!logMatch,
      completedAt: logMatch?.completedAt,
      completedByName: logMatch?.completedByName
    });
  });

  // Unique kennel runs for filtering dropdown
  const kennelList = ['All', ...Array.from(new Set(tasks.map(t => t.kennelRun)))];

  // Apply filters and sort by time
  const filteredTasks = tasks.filter(t => {
    const matchesTab = 
      filterTab === 'all' ||
      (filterTab === 'pending' && !t.completed) ||
      (filterTab === 'completed' && t.completed);

    const matchesKennel = filterKennel === 'All' || t.kennelRun === filterKennel;

    return matchesTab && matchesKennel;
  }).sort((a, b) => a.schedule.localeCompare(b.schedule));

  const handleToggleTask = async (task: CombinedTask) => {
    if (!user) return;
    setTogglingId(task.id);
    try {
      await dbService.toggleCareLog(user.orgId, {
        animalId: task.animalId,
        animalName: task.animalName,
        taskName: task.taskName,
        schedule: task.schedule,
        date,
        completed: !task.completed,
        completedBy: user.id,
        completedByName: user.name
      });
      await refreshChecklist();
    } catch (err) {
      console.error(err);
    } finally {
      setTogglingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <CheckSquare className="h-10 w-10 text-emerald-700 animate-bounce mb-3" />
        <p className="text-sm font-semibold text-slate-500">Loading daily checklist...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{t('checklist_title')}</h1>
          <p className="text-sm text-slate-500 mt-1">{t('checklist_subtitle')}</p>
        </div>
        <div className="flex items-center space-x-3">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-700/10 focus:border-emerald-700 font-semibold"
          />
          <button
            onClick={refreshChecklist}
            title={t('checklist_btn_refresh')}
            className="p-2 bg-white rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 cursor-pointer"
          >
            <RefreshCw className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>

      {/* FILTER & STATS BANNER */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex flex-col md:flex-row md:items-center gap-4 justify-between">
        {/* Status Tab buttons */}
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setFilterTab('pending')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              filterTab === 'pending' ? 'bg-white text-emerald-950 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {t('auth_signin') === 'تسجيل الدخول' ? 'قيد الانتظار' : 'Pending'} ({tasks.filter(t => !t.completed).length})
          </button>
          <button
            onClick={() => setFilterTab('completed')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              filterTab === 'completed' ? 'bg-white text-emerald-950 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {t('auth_signin') === 'تسجيل الدخول' ? 'مكتملة' : 'Completed'} ({tasks.filter(t => t.completed).length})
          </button>
          <button
            onClick={() => setFilterTab('all')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              filterTab === 'all' ? 'bg-white text-emerald-950 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {t('auth_signin') === 'تسجيل الدخول' ? 'الكل' : 'All'} ({tasks.length})
          </button>
        </div>

        {/* Kennel Run Filter */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 font-bold uppercase">{t('boarding_btn_kennels')} / Run:</span>
          <select
            value={filterKennel}
            onChange={(e) => setFilterKennel(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none"
          >
            {kennelList.map((kennel) => (
              <option key={kennel} value={kennel}>
                {kennel === 'All' ? (t('auth_signin') === 'تسجيل الدخول' ? 'كل المناطق' : 'All Areas') : kennel}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* CHECKLIST LIST */}
      {filteredTasks.length > 0 ? (
        <div className="space-y-3.5">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              onClick={() => togglingId !== task.id && handleToggleTask(task)}
              className={`p-4 bg-white rounded-2xl border transition-all duration-200 flex items-center justify-between cursor-pointer select-none ${
                task.completed 
                  ? 'border-emerald-100 bg-emerald-50/10 opacity-75' 
                  : 'border-slate-100 hover:border-emerald-700/30 shadow-xs'
              }`}
            >
              <div className="flex items-center space-x-4 flex-1">
                {/* Large Checkbox (Tablet Friendly) */}
                <button
                  type="button"
                  disabled={togglingId === task.id}
                  className="focus:outline-none flex-shrink-0 text-slate-400 hover:text-emerald-700 transition-colors"
                >
                  {task.completed ? (
                    <CheckCircle2 className="h-7 w-7 text-emerald-700 fill-emerald-100/50" />
                  ) : (
                    <div className="h-6.5 w-6.5 border-2 border-slate-300 rounded-lg hover:border-emerald-600" />
                  )}
                </button>

                {/* Task description */}
                <div className="min-w-0">
                  <div className="flex flex-wrap items-baseline gap-x-2">
                    <span className="font-bold text-sm text-slate-900">{task.animalName}</span>
                    <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-sm ${
                      task.isMedication
                        ? 'bg-rose-50 text-rose-700 border border-rose-100'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                    }`}>
                      {task.isMedication ? 'Medication' : 'Care Task'}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-700 mt-1">{task.taskName}</h4>
                  {task.notes && <p className="text-xs text-slate-400 mt-0.5 leading-normal">{task.notes}</p>}
                </div>
              </div>

              {/* Meta information tags */}
              <div className="flex flex-col items-end text-right ml-4 space-y-1.5 flex-shrink-0">
                <div className="flex items-center text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-lg">
                  <Clock className="h-3.5 w-3.5 mr-1 text-slate-400" />
                  {task.schedule}
                </div>
                <div className="flex items-center text-[10px] text-slate-400 font-semibold">
                  <MapPin className="h-3 w-3 mr-1 text-slate-300" />
                  {task.kennelRun}
                </div>
                {task.completed && task.completedByName && (
                  <span className="text-[9px] font-medium text-emerald-700 italic">
                    Done by {task.completedByName}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white py-16 px-4 border border-slate-100 rounded-3xl text-center max-w-md mx-auto shadow-xs">
          <CheckSquare className="mx-auto h-12 w-12 text-slate-300" />
          <h3 className="mt-4 text-sm font-bold text-slate-900">All caught up!</h3>
          <p className="mt-2 text-xs text-slate-500 leading-normal">
            No care tasks match the selected checklist filters. Select another date, area, or check the Completed tab!
          </p>
        </div>
      )}
    </div>
  );
}
