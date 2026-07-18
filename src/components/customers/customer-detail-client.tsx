'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { sendWhatsAppReminder } from '@/actions/customers';

interface CustomerDetailClientProps {
  customer: any;
}

export function CustomerDetailClient({ customer }: CustomerDetailClientProps) {
  const [timeline, setTimeline] = useState<any[]>(customer.timeline);
  const [isPending, startTransition] = useTransition();

  const limitUtilizedPercent = Math.min(
    100,
    customer.creditLimit > 0 ? (customer.outstandingAmount / customer.creditLimit) * 100 : 0
  );

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleWhatsAppReminder = () => {
    startTransition(async () => {
      const success = await sendWhatsAppReminder(customer.id);
      if (success) {
        alert('WhatsApp Payment Reminder sent successfully!');
        // Update local activity timeline dynamically
        setTimeline([
          {
            id: `evt-${Date.now()}`,
            type: 'WHATSAPP',
            title: 'Payment Reminder Notification',
            description: `[Mock] WhatsApp text alert sent to ${customer.phone} for ₹${customer.outstandingAmount.toFixed(2)} outstanding.`,
            timestamp: new Date(),
          },
          ...timeline,
        ]);
      }
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb Navigation & Profile Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <nav className="flex text-xs text-slate-400 mb-2 items-center gap-1.5">
            <Link href="/customers" className="hover:text-primary transition-colors">
              Customers
            </Link>
            <span>/</span>
            <span className="text-slate-800 font-semibold">{customer.name}</span>
          </nav>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-white text-base font-bold shadow-md shadow-primary/10">
              {customer.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 className="font-headline text-xl font-bold text-slate-900 leading-tight">{customer.name}</h2>
              <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
                <span className="material-symbols-outlined text-sm text-slate-400">location_on</span>
                {customer.address || 'India'} • <span className="text-primary font-bold">Gold Tier Merchant</span>
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-2.5">
          <button className="px-4 py-2 border border-slate-200 hover:border-primary hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-colors">
            <span className="material-symbols-outlined text-sm">edit</span>
            Edit Profile
          </button>
          <button className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:opacity-90 transition-all flex items-center gap-1.5 shadow-sm">
            <span className="material-symbols-outlined text-sm">share</span>
            Share Ledger
          </button>
        </div>
      </div>

      {/* Bento Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side (2 cols): Finance Metrics & Payments Table */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Financial Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Current Due */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-20 h-20 bg-rose-50 rounded-bl-full -mr-8 -mt-8 group-hover:bg-rose-100/50 transition-all" />
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5 relative z-10">Current Due</p>
              <h3 className="text-xl font-bold text-rose-600 relative z-10">{formatCurrency(customer.outstandingAmount)}</h3>
              <div className="mt-3 flex items-center text-[9px] text-rose-600 font-bold bg-rose-50 w-fit px-2 py-0.5 rounded-full relative z-10">
                <span className="material-symbols-outlined text-xs mr-0.5">trending_up</span>
                Overdue balance
              </div>
            </div>

            {/* Credit Limit utilized progress bar */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-20 h-20 bg-slate-50 rounded-bl-full -mr-8 -mt-8 group-hover:bg-slate-100/50 transition-all" />
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5 relative z-10">Credit Limit</p>
              <h3 className="text-xl font-bold text-slate-800 relative z-10">{formatCurrency(customer.creditLimit)}</h3>
              <div className="mt-4 w-full bg-slate-100 rounded-full h-1.5 relative z-10">
                <div 
                  className={`h-full rounded-full ${limitUtilizedPercent >= 75 ? 'bg-rose-500' : 'bg-primary'}`} 
                  style={{ width: `${limitUtilizedPercent}%` }}
                />
              </div>
              <p className="text-[9px] text-slate-400 mt-2 font-semibold">{limitUtilizedPercent.toFixed(0)}% limit utilized</p>
            </div>

            {/* Total Sales Order Value or Outstanding balance */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-50 rounded-bl-full -mr-8 -mt-8 group-hover:bg-indigo-100/50 transition-all" />
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5 relative z-10">Outstanding Balance</p>
              <h3 className="text-xl font-bold text-slate-700 relative z-10">{formatCurrency(customer.outstandingAmount)}</h3>
              <p className="text-[9px] text-indigo-700 mt-4 font-bold bg-indigo-50 w-fit px-2 py-0.5 rounded-full relative z-10">
                Credit health status
              </p>
            </div>
          </div>

          {/* Recent Payments Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/20">
              <h4 className="font-headline text-base font-bold text-slate-800">Recent Ledger Statement Transactions</h4>
              <span className="text-xs text-primary font-bold hover:underline cursor-pointer">View Statement History</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[10px] text-slate-400 uppercase tracking-wider">
                    <th className="px-6 py-3 font-bold">Transaction Reference</th>
                    <th className="px-4 py-3 font-bold">Date</th>
                    <th className="px-4 py-3 font-bold">Type</th>
                    <th className="px-4 py-3 font-bold">Amount</th>
                    <th className="px-6 py-3 font-bold">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {customer.ledgers.map((ldg: any) => (
                    <tr key={ldg.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-slate-800">
                        {ldg.id.slice(0, 8).toUpperCase()}
                      </td>
                      <td className="px-4 py-4 text-slate-500 font-medium">
                        {new Date(ldg.timestamp).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          ldg.type === 'CREDIT' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                        }`}>
                          {ldg.type === 'CREDIT' ? 'Payment In' : 'Invoice Out'}
                        </span>
                      </td>
                      <td className={`px-4 py-4 font-bold ${
                        ldg.type === 'CREDIT' ? 'text-emerald-600' : 'text-rose-600'
                      }`}>
                        ₹{ldg.amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-medium">{ldg.description}</td>
                    </tr>
                  ))}
                  {customer.ledgers.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-slate-400 italic">
                        No transactions recorded for this account.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Side (1 col): WhatsApp CRM & Activity Timeline */}
        <div className="flex flex-col gap-6">
          {/* WhatsApp CRM Box */}
          <div className="bg-gradient-to-br from-primary to-indigo-800 text-white p-6 rounded-3xl shadow-xl shadow-primary/10 flex flex-col justify-between min-h-[250px] relative overflow-hidden group">
            <div className="absolute top-0 right-0 opacity-10 -mr-6 -mt-6 group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[150px] -rotate-12">send</span>
            </div>
            <div>
              <h4 className="font-headline text-lg font-bold mb-1.5">WhatsApp CRM Alerts</h4>
              <p className="text-xs text-slate-100 opacity-90 leading-relaxed mb-6">
                Direct engagement triggers to contact <strong>{customer.name}</strong> via WhatsApp Business.
              </p>
            </div>
            <div className="space-y-2 relative z-10 text-xs font-bold">
              <button className="w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all">
                <span className="material-symbols-outlined text-base">description</span>
                Send Balance Statement
              </button>
              <button 
                onClick={handleWhatsAppReminder}
                disabled={isPending}
                className="w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
              >
                {isPending ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span className="material-symbols-outlined text-base">notification_important</span>
                    Send Overdue Reminder
                  </>
                )}
              </button>
              <button className="w-full bg-white text-primary py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all">
                <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
                  campaign
                </span>
                Send Custom Catalog
              </button>
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col">
            <h4 className="font-headline text-base font-bold text-slate-800 mb-6">Activity Timeline</h4>
            <div className="space-y-6 relative before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-0 before:w-px before:bg-slate-200">
              {timeline.map((evt) => (
                <div key={evt.id} className="relative pl-8 text-xs">
                  <div className={`absolute left-0 top-0.5 w-6 h-6 rounded-full flex items-center justify-center z-10 border-4 border-white shadow-sm text-[12px] ${
                    evt.type === 'PAYMENT' ? 'bg-emerald-50 text-emerald-600' :
                    evt.type === 'WHATSAPP' ? 'bg-rose-50 text-rose-500' :
                    evt.type === 'ORDER' ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-500'
                  }`}>
                    <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>
                      {evt.type === 'PAYMENT' ? 'check_circle' :
                       evt.type === 'WHATSAPP' ? 'priority_high' :
                       evt.type === 'ORDER' ? 'shopping_bag' : 'info'}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 font-semibold mb-0.5">
                      {new Date(evt.timestamp).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}
                    </span>
                    <span className="font-bold text-slate-800 text-sm leading-snug">{evt.title}</span>
                    <p className="text-slate-500 mt-0.5 leading-relaxed">{evt.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="mt-6 w-full py-2.5 border border-dashed border-slate-300 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-400 transition-all cursor-pointer">
              Load More Activity
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
