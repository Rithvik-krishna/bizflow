import React from 'react';
import { MainLayout } from '@/components/layout/main-layout';

export default function SettingsPage() {
  return (
    <MainLayout>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div>
          <h2 className="font-headline text-2xl font-bold text-slate-900 font-headline">Enterprise Settings</h2>
          <p className="text-xs text-slate-400 font-semibold">Configure organization profiles, GST rates, invoice layouts, and API integrations.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Settings Nav cards */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Organization profile */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-headline text-sm font-bold text-slate-800 uppercase tracking-wider">Company Profile</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-slate-600">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Registered Company Name</label>
                  <input className="border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 outline-none" defaultValue="BizFlow Operations India Pvt Ltd" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Corporate GSTIN</label>
                  <input className="border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 outline-none font-mono" defaultValue="27AAAAA0000A1Z0" />
                </div>
              </div>
              <div className="flex flex-col gap-1 text-xs font-semibold text-slate-600">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Principal Place of Business Address</label>
                <input className="border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 outline-none" defaultValue="Bandra BKC, Corporate Tower, Sector 3, Mumbai, Maharashtra" />
              </div>
            </div>

            {/* GST Rates configuration */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-headline text-sm font-bold text-slate-800 uppercase tracking-wider">Tax & GST Settings</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold text-slate-600">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">CGST Rate (%)</label>
                  <input className="border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 outline-none" defaultValue="9.0" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">SGST Rate (%)</label>
                  <input className="border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 outline-none" defaultValue="9.0" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">IGST Rate (%)</label>
                  <input className="border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 outline-none" defaultValue="18.0" />
                </div>
              </div>
            </div>
          </div>

          {/* Side Panels: Invoice templates & Integrations */}
          <div className="flex flex-col gap-6 text-xs text-slate-600">
            {/* Invoice template selector */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-headline text-sm font-bold text-slate-800 uppercase tracking-wider">Invoice Templates</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 border-2 border-primary bg-primary/5 rounded-xl">
                  <span className="material-symbols-outlined text-primary text-xl">receipt</span>
                  <div>
                    <p className="font-bold text-slate-800">Standard GST Invoice</p>
                    <p className="text-[10px] text-slate-400">CGST/SGST itemized grid printout</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 border border-slate-100 rounded-xl opacity-60">
                  <span className="material-symbols-outlined text-slate-400 text-xl">receipt</span>
                  <div>
                    <p className="font-bold text-slate-800">Minimalist Receipt</p>
                    <p className="text-[10px] text-slate-400">Thermal paper receipt structure</p>
                  </div>
                </div>
              </div>
            </div>

            {/* API Keys */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-headline text-sm font-bold text-slate-800 uppercase tracking-wider">Integrations & API</h3>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Active Access Token</label>
                <div className="flex gap-2">
                  <input readOnly className="border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 outline-none font-mono text-[10px] flex-1" value="sk_live_51Nz8G2..." />
                  <button onClick={() => alert('Token copied.')} className="px-3 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl font-bold transition-all">Copy</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
