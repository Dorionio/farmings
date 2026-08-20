export interface Organization {
  id: string;
  name: string;
  createdAt: string;
  ownerId: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  subscriptionStatus?: 'trialing' | 'active' | 'past_due' | 'canceled';
  trialEnd?: string;
  currentPeriodEnd?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  orgId: string;
  role: 'owner' | 'staff';
  createdAt: string;
  phone?: string;
  photoUrl?: string;
  hasSeenOnboarding?: boolean;
}

export interface Animal {
  id: string;
  orgId: string;
  name: string;
  species: string;
  breed: string;
  dateOfBirth: string;
  sex: 'male' | 'female';
  photoUrl?: string;
  microchipId?: string;
  isBoarding: boolean;
  isBreeding: boolean;
  
  // Boarding fields
  ownerName?: string;
  ownerContact?: string;
  checkInDate?: string;
  checkOutDate?: string;
  kennelRun?: string;
  specialCare?: string;

  // Breeding fields
  sireId?: string;
  damId?: string;
  sireName?: string;
  damName?: string;
  breedingStatus?: 'active' | 'retired';
  breedingNotes?: string;

  createdAt: string;
  updatedAt: string;
}

export interface Vaccination {
  id: string;
  orgId: string;
  animalId: string;
  animalName: string;
  type: string;
  dateGiven: string;
  nextDueDate: string;
}

export interface VetVisit {
  id: string;
  orgId: string;
  animalId: string;
  animalName: string;
  date: string;
  reason: string;
  notes: string;
  fileUrl?: string;
}

export interface Medication {
  id: string;
  orgId: string;
  animalId: string;
  animalName: string;
  name: string;
  dosage: string;
  schedule: string;
  status: 'active' | 'inactive';
}

export interface WeightRecord {
  id: string;
  orgId: string;
  animalId: string;
  date: string;
  weight: number;
}

export interface CareSchedule {
  id: string;
  orgId: string;
  animalId: string;
  animalName: string;
  taskName: string;
  schedule: string; // e.g. "8:00 AM" or "08:00"
  notes?: string;
}

export interface CareLog {
  id: string;
  orgId: string;
  animalId: string;
  animalName: string;
  taskName: string;
  schedule: string;
  completedAt: string;
  completedBy: string;
  completedByName: string;
  date: string; // YYYY-MM-DD
}

export interface HeatCycle {
  id: string;
  orgId: string;
  animalId: string;
  startDate: string;
  notes?: string;
}

export interface MatingRecord {
  id: string;
  orgId: string;
  date: string;
  sireId?: string;
  sireName?: string;
  damId?: string;
  damName?: string;
  notes?: string;
}

export interface PregnancyRecord {
  id: string;
  orgId: string;
  damId: string;
  matingRecordId?: string;
  expectedDueDate: string;
  status: 'active' | 'completed' | 'failed';
  notes?: string;
}

export interface Litter {
  id: string;
  orgId: string;
  damId: string;
  sireId?: string;
  pregnancyRecordId?: string;
  birthDate: string;
  offspringCount: number;
  notes?: string;
  offspringIds: string[];
}

export interface Kennel {
  id: string;
  orgId: string;
  name: string;
  status: 'available' | 'occupied' | 'maintenance';
  currentAnimalId?: string;
  currentAnimalName?: string;
  notes?: string;
}
