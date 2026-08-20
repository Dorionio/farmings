"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { dbService } from '@/lib/services';
import { Organization } from '@/types';
import { CreditCard, Check, ShieldAlert, Sparkles, Calendar, Clock, Lock, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function BillingSettings() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [org, setOrg] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [billingInterval, setBillingInterval] = useState<'month' | 'year'>('month');
  const [actionLoading, setActionLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Stripe Price IDs (from create script or Stripe Catalog)
  const MONTHLY_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY || 'price_monthly_placeholder';
  const YEARLY_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_PRICE_YEARLY || 'price_yearly_placeholder';

  useEffect(() => {
    if (!user) return;
    fetchBillingInfo();

    // Check URL parameters for alerts
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('checkout_success')) {
        setSuccessMsg(t('billing_success_checkout') || 'Subscription successfully set up! Your 1-month free trial has begun.');
        // Clean params
        window.history.replaceState({}, '', window.location.pathname);
      } else if (params.get('checkout_cancel')) {
        setErrorMsg(t('billing_cancel_checkout') || 'Subscription checkout was canceled.');
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
  }, [user]);

  const fetchBillingInfo = async () => {
    if (!user) return;
    try {
      const orgData = await dbService.getOrganization(user.orgId);
      setOrg(orgData);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  // 1. Owner restriction check
  if (!user) return null;
  if (user.role !== 'owner') {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center space-y-4">
        <Lock className="mx-auto h-12 w-12 text-slate-400" />
        <h2 className="text-lg font-bold text-slate-900">{t('billing_owner_only_title') || 'Access Restricted'}</h2>
        <p className="text-xs text-slate-500 font-semibold leading-relaxed">
          {t('billing_owner_only_desc') || 'Billing dashboard and plan configurations are accessible to the organization owner profile only.'}
        </p>
        <div className="pt-2">
          <Link href="/dashboard" className="px-4 py-2 bg-slate-900 text-white font-bold rounded-xl text-xs">
            {t('btn_back_dashboard') || 'Return to Dashboard'}
          </Link>
        </div>
      </div>
    );
  }

  // Calculate Trial Remaining
  const getTrialDaysLeft = () => {
    if (!org?.trialEnd) return 0;
    const diff = new Date(org.trialEnd).getTime() - Date.now();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const trialDaysLeft = getTrialDaysLeft();

  // Create checkout session
  const handleStartCheckout = async () => {
    if (!org) return;
    setActionLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    const priceId = billingInterval === 'month' ? MONTHLY_PRICE_ID : YEARLY_PRICE_ID;
    
    try {
      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId,
          orgId: org.id,
          orgName: org.name,
          userId: user.id,
          email: user.email,
          customerId: org.stripeCustomerId || '',
          redirectOrigin: window.location.origin
        })
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      // Save customer ID locally to persist state fallbacks
      await dbService.updateOrganizationSubscription(org.id, {
        stripeCustomerId: data.customerId
      });

      // Redirect to Stripe Hosted Checkout
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No redirect url returned");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to initialize subscription checkout.");
      setActionLoading(false);
    }
  };

  // Redirect to customer portal
  const handleManagePortal = async () => {
    if (!org?.stripeCustomerId) return;
    setActionLoading(true);
    setErrorMsg('');

    try {
      const response = await fetch('/api/billing/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: org.stripeCustomerId,
          redirectOrigin: window.location.origin
        })
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No redirect portal url returned");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to launch billing customer portal.");
      setActionLoading(false);
    }
  };

  // Mock activation for testing local fallbacks if Stripe keys are missing
  const handleMockActivate = async () => {
    if (!org) return;
    setActionLoading(true);
    try {
      await dbService.updateOrganizationSubscription(org.id, {
        subscriptionStatus: 'active',
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      });
      setSuccessMsg("System mock activated: Subscription toggled to Active.");
      fetchBillingInfo();
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const isSubscribed = org?.subscriptionStatus === 'active' || org?.stripeSubscriptionId;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* HEADER */}
      <div>
        <h1 className="text-xl font-black text-slate-900 tracking-tight">Facility Billing & Plan</h1>
        <p className="text-xs text-slate-400 font-semibold mt-1">Manage subscription billing, payment intervals, and Stripe invoices.</p>
      </div>

      {/* ALERTS */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center space-x-3 text-emerald-800 font-bold text-xs">
          <Sparkles className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center space-x-3 text-red-800 font-bold text-xs">
          <ShieldAlert className="h-4 w-4 shrink-0 text-red-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* TRIAL NOTICE & BANNER PREVIEW */}
      {!isSubscribed && (
        <div className="p-5 bg-gradient-to-r from-purple-900 to-indigo-900 text-white rounded-3xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="px-2 py-0.5 bg-purple-500/30 border border-purple-400/30 rounded-md font-bold text-[9px] uppercase tracking-wider">
              {org?.subscriptionStatus || 'trialing'}
            </span>
            <h3 className="text-sm font-bold mt-1">
              {trialDaysLeft > 0 ? `${trialDaysLeft} Days Remaining in Free Trial` : 'Free Trial Has Ended'}
            </h3>
            <p className="text-[11px] text-purple-200 font-semibold">
              You are currently utilizing DorionAnima SaaS Standard standard package features free for 1 month. Add a payment method to ensure continuous service.
            </p>
          </div>
          <div className="shrink-0 flex items-center space-x-2">
            <button
              onClick={handleStartCheckout}
              disabled={actionLoading}
              className="px-4 py-2.5 bg-white hover:bg-slate-50 text-purple-900 font-extrabold text-xs rounded-2xl flex items-center space-x-1.5 transition-all shadow-md cursor-pointer disabled:opacity-50"
            >
              {actionLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CreditCard className="h-3.5 w-3.5" />}
              <span>Subscribe Now</span>
            </button>
          </div>
        </div>
      )}

      {/* GRID LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* COL 1: PLAN SELECTOR & CHECKOUT */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 border border-slate-100 rounded-2xl shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Select Subscription Cycle</h3>
                <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Upgrade or toggle subscription renewal periods.</p>
              </div>
              
              {/* MONTHLY / YEARLY TOGGLE */}
              <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200/50">
                <button
                  type="button"
                  onClick={() => setBillingInterval('month')}
                  className={`px-3 py-1.5 font-bold text-[10px] rounded-lg transition-all ${
                    billingInterval === 'month' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  onClick={() => setBillingInterval('year')}
                  className={`px-3 py-1.5 font-bold text-[10px] rounded-lg transition-all flex items-center space-x-1 ${
                    billingInterval === 'year' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <span>Yearly</span>
                  <span className="bg-purple-100 text-purple-700 text-[8px] font-black px-1 rounded">Save 17%</span>
                </button>
              </div>
            </div>

            {/* PRODUCT CARD */}
            <div className="p-5 border border-slate-200 rounded-2xl bg-slate-50/50 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-1.5">
                  <span className="p-1 bg-purple-100 text-purple-700 rounded-lg">
                    <Sparkles className="h-3.5 w-3.5" />
                  </span>
                  <span className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">DorionAnima SaaS Standard</span>
                </div>
                <p className="text-[11px] text-slate-500 font-semibold leading-relaxed max-w-sm pt-2">
                  Access standard dashboards, animal histories, custom vaccinations calendars, double-booking protections, and digital checklist logs.
                </p>
                
                {/* Features List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1 pt-3 text-[10px] font-bold text-slate-600">
                  <div className="flex items-center"><Check className="h-3.5 w-3.5 mr-1 text-purple-600 shrink-0" /> Unlimited Animals</div>
                  <div className="flex items-center"><Check className="h-3.5 w-3.5 mr-1 text-purple-600 shrink-0" /> Kennels Management</div>
                  <div className="flex items-center"><Check className="h-3.5 w-3.5 mr-1 text-purple-600 shrink-0" /> Mating & Due Date Calculators</div>
                  <div className="flex items-center"><Check className="h-3.5 w-3.5 mr-1 text-purple-600 shrink-0" /> Staff Directory Directory</div>
                </div>
              </div>

              {/* Price Details */}
              <div className="text-left md:text-right shrink-0 border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-6 space-y-1.5">
                <div>
                  <span className="text-3xl font-black text-slate-900">
                    {billingInterval === 'month' ? '$69' : '$690'}
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">
                    {billingInterval === 'month' ? '/month' : '/year'}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  {billingInterval === 'month' ? 'Billed monthly' : 'Billed annually'}
                </p>
                <div className="pt-2">
                  {isSubscribed ? (
                    <button
                      onClick={handleManagePortal}
                      disabled={actionLoading}
                      className="w-full px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-[10px] rounded-xl flex items-center justify-center space-x-1.5 transition-all shadow-sm cursor-pointer disabled:opacity-50"
                    >
                      {actionLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                      <span>Manage Portal</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleStartCheckout}
                      disabled={actionLoading}
                      className="w-full px-4 py-2 bg-purple-800 hover:bg-purple-700 text-white font-bold text-[10px] rounded-xl flex items-center justify-center space-x-1.5 transition-all shadow-sm cursor-pointer disabled:opacity-50"
                    >
                      {actionLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <CreditCard className="h-3 w-3" />}
                      <span>Subscribe & Start Trial</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Test Simulation Section (for Sandbox / Dev convenience if keys missing) */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="text-slate-400 font-semibold">Need to test billing lock states manually?</span>
              <button
                onClick={handleMockActivate}
                disabled={actionLoading}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-lg font-bold cursor-pointer"
              >
                Mock Activate Subscription (Active)
              </button>
            </div>
          </div>
        </div>

        {/* COL 2: BILLING STATUS SUMMARY CARD */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-5 border border-slate-100 rounded-2xl shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2.5">
              Billing Account Overview
            </h3>

            <div className="space-y-4 text-xs">
              
              {/* Account Status */}
              <div>
                <span className="text-slate-400 font-semibold block">Subscription Status</span>
                <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full font-bold text-[10px] mt-1 ${
                  isSubscribed 
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' 
                    : 'bg-amber-50 text-amber-800 border border-amber-100'
                }`}>
                  {isSubscribed ? <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> : <Clock className="h-3.5 w-3.5 text-amber-600" />}
                  <span className="capitalize">{org?.subscriptionStatus || 'trialing'}</span>
                </span>
              </div>

              {/* Stripe Customer */}
              <div>
                <span className="text-slate-400 font-semibold block">Stripe Customer ID</span>
                <span className="font-mono text-[10px] text-slate-600 block mt-0.5 truncate bg-slate-50 p-1.5 border rounded-lg">
                  {org?.stripeCustomerId || 'Not allocated yet'}
                </span>
              </div>

              {/* Next Renewal */}
              <div>
                <span className="text-slate-400 font-semibold block">
                  {isSubscribed ? 'Next Billing Date' : 'Trial Ends On'}
                </span>
                <span className="font-bold text-slate-800 flex items-center space-x-1.5 mt-1">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  <span>
                    {isSubscribed 
                      ? (org?.currentPeriodEnd ? new Date(org.currentPeriodEnd).toLocaleDateString() : 'N/A')
                      : (org?.trialEnd ? new Date(org.trialEnd).toLocaleDateString() : 'N/A')
                    }
                  </span>
                </span>
              </div>

              {/* Customer Portal Launcher */}
              {isSubscribed && org?.stripeCustomerId && (
                <div className="pt-2 border-t border-slate-100">
                  <button
                    onClick={handleManagePortal}
                    disabled={actionLoading}
                    className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-[11px] rounded-xl flex items-center justify-center space-x-1 transition-all cursor-pointer"
                  >
                    <span>Stripe Customer Portal</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
