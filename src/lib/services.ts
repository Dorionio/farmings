import { supabase } from './supabaseClient';
import { 
  Organization, 
  UserProfile, 
  Animal, 
  Vaccination, 
  VetVisit, 
  Medication, 
  WeightRecord, 
  CareSchedule, 
  CareLog, 
  HeatCycle, 
  MatingRecord, 
  PregnancyRecord, 
  Litter,
  Kennel
} from '../types';

// ==========================================
// MAPPING HELPERS (Database <-> Frontend)
// ==========================================

const mapProfile = (p: any): UserProfile => {
  const baseProfile: UserProfile = {
    id: p.id,
    email: p.email,
    name: p.name,
    orgId: p.organization_id,
    role: p.role,
    createdAt: p.created_at,
    phone: p.phone || '',
    photoUrl: p.photo_url || p.avatar_url || '',
    hasSeenOnboarding: p.has_seen_onboarding || false
  };

  if (typeof window !== 'undefined') {
    const localProfiles = JSON.parse(localStorage.getItem('local_user_profiles') || '{}');
    const localUser = localProfiles[p.id];
    if (localUser) {
      if (localUser.phone) baseProfile.phone = localUser.phone;
      if (localUser.photoUrl) baseProfile.photoUrl = localUser.photoUrl;
      if (localUser.name) baseProfile.name = localUser.name;
      if (localUser.hasSeenOnboarding !== undefined) baseProfile.hasSeenOnboarding = localUser.hasSeenOnboarding;
    }
  }

  return baseProfile;
};

const mapAnimal = (a: any): Animal => ({
  id: a.id,
  orgId: a.organization_id,
  name: a.name,
  species: a.species,
  breed: a.breed,
  dateOfBirth: a.date_of_birth,
  sex: a.sex,
  photoUrl: a.photo_url || undefined,
  microchipId: a.microchip_id || undefined,
  isBoarding: a.is_boarding,
  isBreeding: a.is_breeding,
  ownerName: a.owner_name || undefined,
  ownerContact: a.owner_contact || undefined,
  checkInDate: a.check_in_date || undefined,
  checkOutDate: a.check_out_date || undefined,
  kennelRun: a.kennel_run || undefined,
  specialCare: a.special_care || undefined,
  sireId: a.sire_id || undefined,
  damId: a.dam_id || undefined,
  sireName: a.sire_name || undefined,
  damName: a.dam_name || undefined,
  breedingStatus: a.breeding_status || undefined,
  breedingNotes: a.breeding_notes || undefined,
  createdAt: a.created_at,
  updatedAt: a.updated_at
});

const mapAnimalToDb = (a: Partial<Animal>) => {
  const row: any = {};
  if (a.name !== undefined) row.name = a.name;
  if (a.species !== undefined) row.species = a.species;
  if (a.breed !== undefined) row.breed = a.breed;
  if (a.dateOfBirth !== undefined) row.date_of_birth = a.dateOfBirth;
  if (a.sex !== undefined) row.sex = a.sex;
  if (a.photoUrl !== undefined) row.photo_url = a.photoUrl || null;
  if (a.microchipId !== undefined) row.microchip_id = a.microchipId || null;
  if (a.isBoarding !== undefined) row.is_boarding = a.isBoarding;
  if (a.isBreeding !== undefined) row.is_breeding = a.isBreeding;
  
  // Boarding
  if (a.ownerName !== undefined) row.owner_name = a.ownerName || null;
  if (a.ownerContact !== undefined) row.owner_contact = a.ownerContact || null;
  if (a.checkInDate !== undefined) row.check_in_date = a.checkInDate || null;
  if (a.checkOutDate !== undefined) row.check_out_date = a.checkOutDate || null;
  if (a.kennelRun !== undefined) row.kennel_run = a.kennelRun || null;
  if (a.specialCare !== undefined) row.special_care = a.specialCare || null;

  // Breeding
  if (a.sireId !== undefined) row.sire_id = a.sireId || null;
  if (a.damId !== undefined) row.dam_id = a.damId || null;
  if (a.sireName !== undefined) row.sire_name = a.sireName || null;
  if (a.damName !== undefined) row.dam_name = a.damName || null;
  if (a.breedingStatus !== undefined) row.breeding_status = a.breedingStatus || null;
  if (a.breedingNotes !== undefined) row.breeding_notes = a.breedingNotes || null;
  
  return row;
};

const mapVaccination = (v: any): Vaccination => ({
  id: v.id,
  orgId: v.organization_id,
  animalId: v.animal_id,
  animalName: v.animal_name,
  type: v.type,
  dateGiven: v.date_given,
  nextDueDate: v.next_due_date
});

const mapVetVisit = (v: any): VetVisit => ({
  id: v.id,
  orgId: v.organization_id,
  animalId: v.animal_id,
  animalName: v.animal_name,
  date: v.date,
  reason: v.reason,
  notes: v.notes,
  fileUrl: v.file_url || undefined
});

const mapMedication = (m: any): Medication => ({
  id: m.id,
  orgId: m.organization_id,
  animalId: m.animal_id,
  animalName: m.animal_name,
  name: m.name,
  dosage: m.dosage,
  schedule: m.schedule,
  status: m.status
});

const mapWeight = (w: any): WeightRecord => ({
  id: w.id,
  orgId: w.organization_id,
  animalId: w.animal_id,
  date: w.date,
  weight: Number(w.weight)
});

const mapCareSchedule = (s: any): CareSchedule => ({
  id: s.id,
  orgId: s.organization_id,
  animalId: s.animal_id,
  animalName: s.animal_name,
  taskName: s.task_name,
  schedule: s.schedule,
  notes: s.notes || undefined
});

const mapCareLog = (l: any): CareLog => ({
  id: l.id,
  orgId: l.organization_id,
  animalId: l.animal_id,
  animalName: l.animal_name,
  taskName: l.task_name,
  schedule: l.schedule,
  completedAt: l.completed_at,
  completedBy: l.completed_by,
  completedByName: l.completed_by_name,
  date: l.date
});

const mapHeatCycle = (h: any): HeatCycle => ({
  id: h.id,
  orgId: h.organization_id,
  animalId: h.animal_id,
  startDate: h.start_date,
  notes: h.notes || undefined
});

const mapMatingRecord = (m: any): MatingRecord => ({
  id: m.id,
  orgId: m.organization_id,
  date: m.date,
  sireId: m.sire_id || undefined,
  sireName: m.sire_name || undefined,
  damId: m.dam_id || undefined,
  damName: m.dam_name || undefined,
  notes: m.notes || undefined
});

const mapPregnancyRecord = (p: any): PregnancyRecord => ({
  id: p.id,
  orgId: p.organization_id,
  damId: p.dam_id,
  matingRecordId: p.mating_record_id || undefined,
  expectedDueDate: p.expected_due_date,
  status: p.status,
  notes: p.notes || undefined
});

const mapLitter = (l: any): Litter => ({
  id: l.id,
  orgId: l.organization_id,
  damId: l.dam_id,
  sireId: l.sire_id || undefined,
  pregnancyRecordId: l.pregnancy_record_id || undefined,
  birthDate: l.birth_date,
  offspringCount: l.offspring_count,
  notes: l.notes || undefined,
  offspringIds: l.offspring_ids || []
});

const mapKennel = (k: any): Kennel => ({
  id: k.id,
  orgId: k.organization_id,
  name: k.name,
  status: k.status,
  currentAnimalId: k.current_animal_id || undefined,
  currentAnimalName: k.current_animal_name || undefined,
  notes: k.notes || undefined
});

// ==========================================
// THE AUTH SERVICE INTERFACE (Supabase implementation)
// ==========================================

export const authService = {
  // Always true now, representing we are connected to a cloud database
  usingFirebase: () => true,

  onAuthStateChanged: (callback: (user: UserProfile | null) => void) => {
    // Fire callback immediately with current session user if loaded
    const initializeSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

          if (profile) {
            callback(mapProfile(profile));
            return;
          } else {
            // Profile is missing. Check if this is a staff user completing signup from an invite
            const metadata = session.user.user_metadata || {};
            const inviteCode = metadata.invite_code;
            const fullName = metadata.full_name || '';

            if (inviteCode) {
              try {
                const staffProfile = await authService.completeOnboardingStaff(
                  session.user.id,
                  session.user.email || '',
                  fullName,
                  inviteCode
                );
                callback(staffProfile);
                return;
              } catch (err) {
                console.error("Failed to auto-complete staff onboarding:", err);
              }
            }

            callback({
              id: session.user.id,
              email: session.user.email || '',
              name: fullName,
              orgId: '',
              role: 'owner',
              createdAt: session.user.created_at
            });
            return;
          }
        }
      } catch (e) {
        console.error("Error loading initial session profile", e);
      }
      callback(null);
    };

    initializeSession();

    // Listen to updates
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

          if (profile) {
            callback(mapProfile(profile));
          } else {
            // Profile is missing. Check if this is a staff user completing signup from an invite
            const metadata = session.user.user_metadata || {};
            const inviteCode = metadata.invite_code;
            const fullName = metadata.full_name || '';

            if (inviteCode) {
              try {
                const staffProfile = await authService.completeOnboardingStaff(
                  session.user.id,
                  session.user.email || '',
                  fullName,
                  inviteCode
                );
                callback(staffProfile);
                return;
              } catch (err) {
                console.error("Failed to auto-complete staff onboarding:", err);
              }
            }

            callback({
              id: session.user.id,
              email: session.user.email || '',
              name: fullName,
              orgId: '',
              role: 'owner',
              createdAt: session.user.created_at
            });
          }
        } catch (e) {
          console.error("Error retrieving user profile on auth state change", e);
          callback(null);
        }
      } else {
        callback(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  },

  signUp: async (email: string, password: string, name: string, orgName: string): Promise<UserProfile> => {
    const emailNormalized = email.toLowerCase().trim();

    // Clear any stale local auth sessions first to prevent token headers mismatch
    try {
      await supabase.auth.signOut();
    } catch (e) {
      // Ignore signout errors
    }

    // 1. Sign up auth credentials with metadata
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: emailNormalized,
      password,
      options: {
        data: {
          full_name: name
        }
      }
    });
    if (authError || !authData.user) {
      throw authError || new Error("Sign up failed");
    }

    if (authData.session) {
      await supabase.auth.setSession(authData.session);
    }

    const userId = authData.user.id;

    // If email confirmation is enabled, we won't have a session yet.
    // Skip database creation now and handle it during onboarding.
    if (!authData.session) {
      return {
        id: userId,
        email: emailNormalized,
        name: name,
        orgId: '',
        role: 'owner',
        createdAt: authData.user.created_at,
        emailConfirmationRequired: true
      } as any;
    }

    // 2. Complete setup immediately if session is active
    return await authService.completeOnboarding(userId, emailNormalized, name, orgName);
  },

  // Sign in
  signIn: async (email: string, password: string): Promise<UserProfile> => {
    const emailNormalized = email.toLowerCase().trim();
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: emailNormalized,
      password
    });
    if (authError || !authData.user) {
      throw authError || new Error("Sign in failed");
    }

    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError || !profileData) {
      console.warn("User profile not found in profiles table, returning onboarding fallback profile:", profileError);
      return {
        id: authData.user.id,
        email: emailNormalized,
        name: authData.user.user_metadata?.full_name || '',
        orgId: '',
        role: 'owner',
        createdAt: authData.user.created_at
      };
    }

    return mapProfile(profileData);
  },

  // Sign out
  signOut: async (): Promise<void> => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Synchronous getter is stubbed; state is fully react/async driven
  getCurrentUserSync: (): UserProfile | null => {
    return null;
  },

  // Generate Invite URL link code
  generateInviteCode: async (orgId: string, role: 'owner' | 'staff'): Promise<string> => {
    const code = "invite-" + Math.random().toString(36).substring(2, 11);
    const { error } = await supabase
      .from('invites')
      .insert({
        code,
        organization_id: orgId,
        role,
        active: true
      });
    if (error) throw error;
    return code;
  },

  // Verify Invite Code
  verifyInviteCode: async (code: string): Promise<{ orgId: string; role: 'owner' | 'staff' }> => {
    const { data, error } = await supabase
      .from('invites')
      .select('organization_id, role')
      .eq('code', code)
      .eq('active', true)
      .maybeSingle();

    if (error || !data) {
      throw error || new Error("Invalid or expired invite code");
    }
    return { orgId: data.organization_id, role: data.role as 'owner' | 'staff' };
  },

  joinWithInvite: async (inviteCode: string, email: string, password: string, name: string): Promise<UserProfile> => {
    const inviteInfo = await authService.verifyInviteCode(inviteCode);
    const emailNormalized = email.toLowerCase().trim();

    // Clear any stale local auth sessions first to prevent token headers mismatch
    try {
      await supabase.auth.signOut();
    } catch (e) {
      // Ignore signout errors
    }

    // 1. Sign up the credentials and pass invite_code in metadata
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: emailNormalized,
      password,
      options: {
        data: {
          full_name: name,
          invite_code: inviteCode
        }
      }
    });
    if (authError || !authData.user) {
      throw authError || new Error("Sign up failed");
    }

    if (authData.session) {
      await supabase.auth.setSession(authData.session);
    }

    const userId = authData.user.id;

    // If email confirmation is enabled, we won't have a session yet.
    // Skip profile creation now and handle it during onboarding when they verify email.
    if (!authData.session) {
      return {
        id: userId,
        email: emailNormalized,
        name: name,
        orgId: '',
        role: inviteInfo.role,
        createdAt: authData.user.created_at,
        emailConfirmationRequired: true
      } as any;
    }

    // 2. Complete setup immediately if session is active
    return await authService.completeOnboardingStaff(userId, emailNormalized, name, inviteCode);
  },

  // Complete onboarding for users with missing profiles
  completeOnboarding: async (userId: string, email: string, name: string, orgName: string): Promise<UserProfile> => {
    // 1. Create tenant organization
    const { data: orgData, error: orgError } = await supabase
      .from('organizations')
      .insert({
        name: orgName,
        owner_id: userId
      })
      .select()
      .single();

    if (orgError || !orgData) {
      throw orgError || new Error("Failed to create organization");
    }

    const orgId = orgData.id;

    // 2. Create or update owner profile (upsert handles triggers that auto-create profiles)
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        organization_id: orgId,
        email: email,
        name,
        role: 'owner'
      })
      .select()
      .single();

    if (profileError || !profileData) {
      throw profileError || new Error("Failed to create user profile");
    }

    return mapProfile(profileData);
  },

  // Complete onboarding for staff joining an organization
  completeOnboardingStaff: async (userId: string, email: string, name: string, inviteCode: string): Promise<UserProfile> => {
    const inviteInfo = await authService.verifyInviteCode(inviteCode);
    
    // Create or update staff profile (upsert handles triggers that auto-create profiles)
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        organization_id: inviteInfo.orgId,
        email: email,
        name,
        role: inviteInfo.role
      })
      .select()
      .single();

    if (profileError || !profileData) {
      throw profileError || new Error("Failed to create user profile");
    }

    // Deactivate invite code
    await supabase
      .from('invites')
      .update({ active: false })
      .eq('code', inviteCode);

    return mapProfile(profileData);
  },

  // Get staff for organization
  getStaff: async (orgId: string): Promise<UserProfile[]> => {
    if (!orgId) return [];
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('organization_id', orgId);
      
    if (error) throw error;
    return (data || []).map(mapProfile);
  },

  updateProfile: async (userId: string, updates: Partial<UserProfile>): Promise<UserProfile> => {
    const mappedUpdates: any = {};
    if (updates.name !== undefined) mappedUpdates.name = updates.name;
    if (updates.email !== undefined) mappedUpdates.email = updates.email;
    if (updates.hasSeenOnboarding !== undefined) mappedUpdates.has_seen_onboarding = updates.hasSeenOnboarding;

    try {
      const { data: profileData, error } = await supabase
        .from('profiles')
        .update(mappedUpdates)
        .eq('id', userId)
        .select()
        .single();
        
      if (error) throw error;
      
      if (typeof window !== 'undefined') {
        const localProfiles = JSON.parse(localStorage.getItem('local_user_profiles') || '{}');
        localProfiles[userId] = { ...localProfiles[userId], ...updates };
        localStorage.setItem('local_user_profiles', JSON.stringify(localProfiles));
      }
      
      return mapProfile(profileData);
    } catch (err) {
      console.warn("Database write failed, persisting updates locally:", err);
      
      if (typeof window !== 'undefined') {
        const localProfiles = JSON.parse(localStorage.getItem('local_user_profiles') || '{}');
        localProfiles[userId] = { ...localProfiles[userId], ...updates };
        localStorage.setItem('local_user_profiles', JSON.stringify(localProfiles));
      }
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
        
      const base = profile ? mapProfile(profile) : {
        id: userId,
        email: updates.email || '',
        name: updates.name || '',
        orgId: '',
        role: 'owner' as const,
        createdAt: new Date().toISOString()
      };
      
      return {
        ...base,
        ...updates
      };
    }
  }
};

// ==========================================
// THE DATABASE SERVICE INTERFACE (Supabase implementation)
// ==========================================

export const dbService = {
  // Organizations API
  getOrganization: async (orgId: string): Promise<Organization | null> => {
    if (!orgId) return null;
    
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', orgId)
        .single();
        
      if (error) throw error;
      
      const org: Organization = {
        id: data.id,
        name: data.name,
        createdAt: data.created_at,
        ownerId: data.owner_id,
        stripeCustomerId: data.stripe_customer_id || '',
        stripeSubscriptionId: data.stripe_subscription_id || '',
        subscriptionStatus: (data.subscription_status || 'trialing') as any,
        trialEnd: data.trial_end || '',
        currentPeriodEnd: data.current_period_end || ''
      };
      
      if (typeof window !== 'undefined') {
        const localSubscriptions = JSON.parse(localStorage.getItem('local_organization_subscriptions') || '{}');
        const localOrg = localSubscriptions[orgId];
        if (localOrg) {
          if (localOrg.stripeCustomerId) org.stripeCustomerId = localOrg.stripeCustomerId;
          if (localOrg.stripeSubscriptionId) org.stripeSubscriptionId = localOrg.stripeSubscriptionId;
          if (localOrg.subscriptionStatus) org.subscriptionStatus = localOrg.subscriptionStatus;
          if (localOrg.trialEnd) org.trialEnd = localOrg.trialEnd;
          if (localOrg.currentPeriodEnd) org.currentPeriodEnd = localOrg.currentPeriodEnd;
        }
      }
      
      return org;
    } catch (err) {
      console.warn("Failed to fetch organization from database, returning local storage fallback context:", err);
      
      if (typeof window !== 'undefined') {
        const localSubscriptions = JSON.parse(localStorage.getItem('local_organization_subscriptions') || '{}');
        const localOrg = localSubscriptions[orgId] || {
          id: orgId,
          name: orgId === 'org-packleader' ? 'Pack Leader Kennel' : 'My Animal Biz',
          createdAt: new Date().toISOString(),
          ownerId: '',
          stripeCustomerId: '',
          stripeSubscriptionId: '',
          subscriptionStatus: 'trialing',
          trialEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          currentPeriodEnd: ''
        };
        return localOrg;
      }
      
      return {
        id: orgId,
        name: 'My Animal Biz',
        createdAt: new Date().toISOString(),
        ownerId: '',
        stripeCustomerId: '',
        stripeSubscriptionId: '',
        subscriptionStatus: 'trialing',
        trialEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        currentPeriodEnd: ''
      };
    }
  },

  updateOrganizationSubscription: async (orgId: string, updates: Partial<Organization>): Promise<Organization> => {
    const mappedUpdates: any = {};
    if (updates.stripeCustomerId !== undefined) mappedUpdates.stripe_customer_id = updates.stripeCustomerId;
    if (updates.stripeSubscriptionId !== undefined) mappedUpdates.stripe_subscription_id = updates.stripeSubscriptionId;
    if (updates.subscriptionStatus !== undefined) mappedUpdates.subscription_status = updates.subscriptionStatus;
    if (updates.trialEnd !== undefined) mappedUpdates.trial_end = updates.trialEnd;
    if (updates.currentPeriodEnd !== undefined) mappedUpdates.current_period_end = updates.currentPeriodEnd;

    try {
      const { data, error } = await supabase
        .from('organizations')
        .update(mappedUpdates)
        .eq('id', orgId)
        .select()
        .single();
        
      if (error) throw error;
      
      if (typeof window !== 'undefined') {
        const localSubscriptions = JSON.parse(localStorage.getItem('local_organization_subscriptions') || '{}');
        localSubscriptions[orgId] = { ...localSubscriptions[orgId], ...updates };
        localStorage.setItem('local_organization_subscriptions', JSON.stringify(localSubscriptions));
      }
      
      return {
        id: data.id,
        name: data.name,
        createdAt: data.created_at,
        ownerId: data.owner_id,
        stripeCustomerId: data.stripe_customer_id || '',
        stripeSubscriptionId: data.stripe_subscription_id || '',
        subscriptionStatus: (data.subscription_status || 'trialing') as any,
        trialEnd: data.trial_end || '',
        currentPeriodEnd: data.current_period_end || ''
      };
    } catch (err) {
      console.warn("Failed to update organization database fields, saving updates locally:", err);
      
      if (typeof window !== 'undefined') {
        const localSubscriptions = JSON.parse(localStorage.getItem('local_organization_subscriptions') || '{}');
        const currentLocal = localSubscriptions[orgId] || {
          id: orgId,
          name: orgId === 'org-packleader' ? 'Pack Leader Kennel' : 'My Animal Biz',
          createdAt: new Date().toISOString(),
          ownerId: '',
          stripeCustomerId: '',
          stripeSubscriptionId: '',
          subscriptionStatus: 'trialing',
          trialEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          currentPeriodEnd: ''
        };
        const updated = { ...currentLocal, ...updates };
        localSubscriptions[orgId] = updated;
        localStorage.setItem('local_organization_subscriptions', JSON.stringify(localSubscriptions));
        return updated;
      }
      
      return {
        id: orgId,
        name: 'My Animal Biz',
        createdAt: new Date().toISOString(),
        ownerId: '',
        stripeCustomerId: updates.stripeCustomerId || '',
        stripeSubscriptionId: updates.stripeSubscriptionId || '',
        subscriptionStatus: updates.subscriptionStatus || 'trialing',
        trialEnd: updates.trialEnd || '',
        currentPeriodEnd: updates.currentPeriodEnd || ''
      };
    }
  },

  // Animals API
  getAnimals: async (orgId: string): Promise<Animal[]> => {
    if (!orgId) return [];
    const { data, error } = await supabase
      .from('animals')
      .select('*')
      .eq('organization_id', orgId);
    if (error) throw error;
    return (data || []).map(mapAnimal);
  },

  getAnimal: async (orgId: string, animalId: string): Promise<Animal | null> => {
    if (!orgId || !animalId) return null;
    const { data, error } = await supabase
      .from('animals')
      .select('*')
      .eq('organization_id', orgId)
      .eq('id', animalId)
      .maybeSingle();
    if (error) throw error;
    return data ? mapAnimal(data) : null;
  },

  createAnimal: async (orgId: string, animal: Omit<Animal, 'id' | 'orgId' | 'createdAt' | 'updatedAt'>): Promise<Animal> => {
    const row = mapAnimalToDb(animal);
    row.organization_id = orgId;
    
    const { data, error } = await supabase
      .from('animals')
      .insert(row)
      .select()
      .single();
    if (error || !data) throw error || new Error("Failed to create animal");
    return mapAnimal(data);
  },

  updateAnimal: async (orgId: string, animalId: string, animal: Partial<Omit<Animal, 'id' | 'orgId'>>): Promise<void> => {
    const row = mapAnimalToDb(animal);
    row.updated_at = new Date().toISOString();
    
    const { error } = await supabase
      .from('animals')
      .update(row)
      .eq('organization_id', orgId)
      .eq('id', animalId);
    if (error) throw error;
  },

  deleteAnimal: async (orgId: string, animalId: string): Promise<void> => {
    // 1. Cascade delete associated health and chore records first
    try {
      await Promise.all([
        supabase.from('vaccinations').delete().eq('organization_id', orgId).eq('animal_id', animalId),
        supabase.from('medications').delete().eq('organization_id', orgId).eq('animal_id', animalId),
        supabase.from('vet_visits').delete().eq('organization_id', orgId).eq('animal_id', animalId),
        supabase.from('weight_records').delete().eq('organization_id', orgId).eq('animal_id', animalId),
        supabase.from('care_schedules').delete().eq('organization_id', orgId).eq('animal_id', animalId),
        supabase.from('care_logs').delete().eq('organization_id', orgId).eq('animal_id', animalId),
        supabase.from('heat_cycles').delete().eq('organization_id', orgId).eq('animal_id', animalId)
      ]);
    } catch (e) {
      console.warn("Non-critical cleanup warning during animal deletion:", e);
    }

    // 2. Delete the main animal record
    const { error } = await supabase
      .from('animals')
      .delete()
      .eq('organization_id', orgId)
      .eq('id', animalId);
    if (error) throw error;
  },

  // Vaccinations
  getVaccinations: async (orgId: string, animalId?: string): Promise<Vaccination[]> => {
    if (!orgId) return [];
    let query = supabase
      .from('vaccinations')
      .select('*')
      .eq('organization_id', orgId);
    if (animalId) {
      query = query.eq('animal_id', animalId);
    }
    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(mapVaccination);
  },

  addVaccination: async (orgId: string, vaccination: Omit<Vaccination, 'id' | 'orgId'>): Promise<Vaccination> => {
    const row = {
      organization_id: orgId,
      animal_id: vaccination.animalId,
      animal_name: vaccination.animalName,
      type: vaccination.type,
      date_given: vaccination.dateGiven,
      next_due_date: vaccination.nextDueDate
    };
    const { data, error } = await supabase
      .from('vaccinations')
      .insert(row)
      .select()
      .single();
    if (error || !data) throw error || new Error("Failed to add vaccination");
    return mapVaccination(data);
  },

  // Vet Visits
  getVetVisits: async (orgId: string, animalId?: string): Promise<VetVisit[]> => {
    if (!orgId) return [];
    let query = supabase
      .from('vet_visits')
      .select('*')
      .eq('organization_id', orgId);
    if (animalId) {
      query = query.eq('animal_id', animalId);
    }
    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(mapVetVisit);
  },

  addVetVisit: async (orgId: string, visit: Omit<VetVisit, 'id' | 'orgId'>): Promise<VetVisit> => {
    const row = {
      organization_id: orgId,
      animal_id: visit.animalId,
      animal_name: visit.animalName,
      date: visit.date,
      reason: visit.reason,
      notes: visit.notes,
      file_url: visit.fileUrl || null
    };
    const { data, error } = await supabase
      .from('vet_visits')
      .insert(row)
      .select()
      .single();
    if (error || !data) throw error || new Error("Failed to add vet visit");
    return mapVetVisit(data);
  },

  // Medications
  getMedications: async (orgId: string, animalId?: string): Promise<Medication[]> => {
    if (!orgId) return [];
    let query = supabase
      .from('medications')
      .select('*')
      .eq('organization_id', orgId);
    if (animalId) {
      query = query.eq('animal_id', animalId);
    }
    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(mapMedication);
  },

  addMedication: async (orgId: string, medication: Omit<Medication, 'id' | 'orgId'>): Promise<Medication> => {
    const row = {
      organization_id: orgId,
      animal_id: medication.animalId,
      animal_name: medication.animalName,
      name: medication.name,
      dosage: medication.dosage,
      schedule: medication.schedule,
      status: medication.status
    };
    const { data, error } = await supabase
      .from('medications')
      .insert(row)
      .select()
      .single();
    if (error || !data) throw error || new Error("Failed to add medication");
    return mapMedication(data);
  },

  updateMedicationStatus: async (orgId: string, medId: string, status: 'active' | 'inactive'): Promise<void> => {
    const { error } = await supabase
      .from('medications')
      .update({ status })
      .eq('organization_id', orgId)
      .eq('id', medId);
    if (error) throw error;
  },

  // Weight Records
  getWeights: async (orgId: string, animalId: string): Promise<WeightRecord[]> => {
    if (!orgId || !animalId) return [];
    const { data, error } = await supabase
      .from('weight_records')
      .select('*')
      .eq('organization_id', orgId)
      .eq('animal_id', animalId)
      .order('date', { ascending: true });
    if (error) throw error;
    return (data || []).map(mapWeight);
  },

  addWeight: async (orgId: string, weight: Omit<WeightRecord, 'id' | 'orgId'>): Promise<WeightRecord> => {
    const row = {
      organization_id: orgId,
      animal_id: weight.animalId,
      date: weight.date,
      weight: weight.weight
    };
    const { data, error } = await supabase
      .from('weight_records')
      .insert(row)
      .select()
      .single();
    if (error || !data) throw error || new Error("Failed to add weight record");
    return mapWeight(data);
  },

  // Care Schedules
  getCareSchedules: async (orgId: string, animalId?: string): Promise<CareSchedule[]> => {
    if (!orgId) return [];
    let query = supabase
      .from('care_schedules')
      .select('*')
      .eq('organization_id', orgId);
    if (animalId) {
      query = query.eq('animal_id', animalId);
    }
    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(mapCareSchedule);
  },

  addCareSchedule: async (orgId: string, schedule: Omit<CareSchedule, 'id' | 'orgId'>): Promise<CareSchedule> => {
    const row = {
      organization_id: orgId,
      animal_id: schedule.animalId,
      animal_name: schedule.animalName,
      task_name: schedule.taskName,
      schedule: schedule.schedule,
      notes: schedule.notes || null
    };
    const { data, error } = await supabase
      .from('care_schedules')
      .insert(row)
      .select()
      .single();
    if (error || !data) throw error || new Error("Failed to add care schedule");
    return mapCareSchedule(data);
  },

  deleteCareSchedule: async (orgId: string, scheduleId: string): Promise<void> => {
    const { error } = await supabase
      .from('care_schedules')
      .delete()
      .eq('organization_id', orgId)
      .eq('id', scheduleId);
    if (error) throw error;
  },

  // Care Logs
  getCareLogs: async (orgId: string, date: string): Promise<CareLog[]> => {
    if (!orgId) return [];
    const { data, error } = await supabase
      .from('care_logs')
      .select('*')
      .eq('organization_id', orgId)
      .eq('date', date);
    if (error) throw error;
    return (data || []).map(mapCareLog);
  },

  toggleCareLog: async (
    orgId: string, 
    log: Omit<CareLog, 'id' | 'orgId' | 'completedAt'> & { completed: boolean }
  ): Promise<void> => {
    const { animalId, taskName, schedule, date, completedBy, completedByName, animalName } = log;
    const logId = `${animalId}_${taskName.replace(/\s+/g, '_')}_${schedule.replace(/:/g, '_')}_${date}`;

    if (log.completed) {
      const row = {
        id: logId,
        organization_id: orgId,
        animal_id: animalId,
        animal_name: animalName,
        task_name: taskName,
        schedule: schedule,
        date: date,
        completed_at: new Date().toISOString(),
        completed_by: completedBy,
        completed_by_name: completedByName
      };
      
      const { error } = await supabase
        .from('care_logs')
        .upsert(row);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('care_logs')
        .delete()
        .eq('organization_id', orgId)
        .eq('id', logId);
      if (error) throw error;
    }
  },

  // Breeding: Heat Cycles
  getHeatCycles: async (orgId: string, animalId?: string): Promise<HeatCycle[]> => {
    if (!orgId) return [];
    let query = supabase
      .from('heat_cycles')
      .select('*')
      .eq('organization_id', orgId);
    if (animalId) {
      query = query.eq('animal_id', animalId);
    }
    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(mapHeatCycle);
  },

  addHeatCycle: async (orgId: string, cycle: Omit<HeatCycle, 'id' | 'orgId'>): Promise<HeatCycle> => {
    const row = {
      organization_id: orgId,
      animal_id: cycle.animalId,
      start_date: cycle.startDate,
      notes: cycle.notes || null
    };
    const { data, error } = await supabase
      .from('heat_cycles')
      .insert(row)
      .select()
      .single();
    if (error || !data) throw error || new Error("Failed to add heat cycle");
    return mapHeatCycle(data);
  },

  // Breeding: Mating Records
  getMatingRecords: async (orgId: string): Promise<MatingRecord[]> => {
    if (!orgId) return [];
    const { data, error } = await supabase
      .from('mating_records')
      .select('*')
      .eq('organization_id', orgId)
      .order('date', { ascending: false });
    if (error) throw error;
    return (data || []).map(mapMatingRecord);
  },

  addMatingRecord: async (orgId: string, record: Omit<MatingRecord, 'id' | 'orgId'>): Promise<MatingRecord> => {
    const row = {
      organization_id: orgId,
      date: record.date,
      sire_id: record.sireId || null,
      sire_name: record.sireName || null,
      dam_id: record.damId || null,
      dam_name: record.damName || null,
      notes: record.notes || null
    };
    const { data, error } = await supabase
      .from('mating_records')
      .insert(row)
      .select()
      .single();
    if (error || !data) throw error || new Error("Failed to add mating record");
    return mapMatingRecord(data);
  },

  // Breeding: Pregnancy Records
  getPregnancies: async (orgId: string): Promise<PregnancyRecord[]> => {
    if (!orgId) return [];
    const { data, error } = await supabase
      .from('pregnancy_records')
      .select('*')
      .eq('organization_id', orgId)
      .order('expected_due_date', { ascending: false });
    if (error) throw error;
    return (data || []).map(mapPregnancyRecord);
  },

  addPregnancy: async (orgId: string, record: Omit<PregnancyRecord, 'id' | 'orgId'>): Promise<PregnancyRecord> => {
    const row = {
      organization_id: orgId,
      dam_id: record.damId,
      mating_record_id: record.matingRecordId || null,
      expected_due_date: record.expectedDueDate,
      status: record.status,
      notes: record.notes || null
    };
    const { data, error } = await supabase
      .from('pregnancy_records')
      .insert(row)
      .select()
      .single();
    if (error || !data) throw error || new Error("Failed to add pregnancy record");
    return mapPregnancyRecord(data);
  },

  updatePregnancyStatus: async (orgId: string, id: string, status: 'active' | 'completed' | 'failed'): Promise<void> => {
    const { error } = await supabase
      .from('pregnancy_records')
      .update({ status })
      .eq('organization_id', orgId)
      .eq('id', id);
    if (error) throw error;
  },

  // Breeding: Litters
  getLitters: async (orgId: string): Promise<Litter[]> => {
    if (!orgId) return [];
    const { data, error } = await supabase
      .from('litters')
      .select('*')
      .eq('organization_id', orgId)
      .order('birth_date', { ascending: false });
    if (error) throw error;
    return (data || []).map(mapLitter);
  },

  addLitter: async (orgId: string, record: Omit<Litter, 'id' | 'orgId'>): Promise<Litter> => {
    const row = {
      organization_id: orgId,
      dam_id: record.damId,
      sire_id: record.sireId || null,
      pregnancy_record_id: record.pregnancyRecordId || null,
      birth_date: record.birthDate,
      offspring_count: record.offspringCount,
      notes: record.notes || null,
      offspring_ids: record.offspringIds || []
    };
    const { data, error } = await supabase
      .from('litters')
      .insert(row)
      .select()
      .single();
    if (error || !data) throw error || new Error("Failed to add litter");
    return mapLitter(data);
  },

  // Kennels API
  getKennels: async (orgId: string): Promise<Kennel[]> => {
    if (!orgId) return [];
    const { data, error } = await supabase
      .from('kennels')
      .select('*')
      .eq('organization_id', orgId)
      .order('name', { ascending: true });
    if (error) throw error;
    return (data || []).map(mapKennel);
  },

  createKennel: async (orgId: string, name: string, notes?: string): Promise<Kennel> => {
    const row = {
      organization_id: orgId,
      name,
      status: 'available' as const,
      notes: notes || null
    };
    const { data, error } = await supabase
      .from('kennels')
      .insert(row)
      .select()
      .single();
    if (error || !data) throw error || new Error("Failed to create kennel");
    return mapKennel(data);
  },

  updateKennelStatus: async (
    orgId: string, 
    kennelId: string, 
    status: 'available' | 'occupied' | 'maintenance',
    animalId?: string,
    animalName?: string,
    notes?: string
  ): Promise<void> => {
    const row: any = { status };
    if (animalId !== undefined) row.current_animal_id = animalId || null;
    if (animalName !== undefined) row.current_animal_name = animalName || null;
    if (notes !== undefined) row.notes = notes || null;

    const { error } = await supabase
      .from('kennels')
      .update(row)
      .eq('organization_id', orgId)
      .eq('id', kennelId);
    if (error) throw error;
  }
};
