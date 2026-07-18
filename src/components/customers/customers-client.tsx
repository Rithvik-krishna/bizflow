'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { CustomerData, addCustomer } from '@/actions/customers';

interface CustomersClientProps {
  initialCustomers: CustomerData[];
}

export function CustomersClient({ initialCustomers }: CustomersClientProps) {
  const [customers, setCustomers] = useState<CustomerData[]>(initialCustomers);
  const [searchQuery, setSearchQuery] = useState('');
  const [isPending, startTransition] = useTransition();

  // Modal toggle
  const [modalOpen, setModalOpen] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    gstNumber: '',
    creditLimit: 25000,
  });

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone.includes(searchQuery)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const success = await addCustomer(formData);
      if (success) {
        setModalOpen(false);
        alert('Customer added successfully! Reloading...');
        window.location.reload();
      }
    });
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-headline text-2xl font-bold text-slate-900 font-headline">Customers Directory</h2>
          <p className="text-xs text-slate-400 font-semibold">Manage wholesale accounts, credit limits, and timelines.</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-xs font-bold hover:opacity-90 shadow-lg shadow-primary/20 transition-all active:scale-95 cursor-pointer"
        >
          <span className="material-symbols-outlined text-base">person_add</span>
          Add Customer Account
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full max-w-xs">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
            search
          </span>
          <input
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs focus:ring-2 focus:ring-primary/20 outline-none focus:bg-white transition-all font-medium"
            placeholder="Search name, phone number..."
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <p className="text-xs text-slate-400 font-semibold">
          Active Wholesale Records: <strong className="text-slate-800">{filteredCustomers.length}</strong>
        </p>
      </div>

      {/* High Density Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Customer Merchant</th>
                <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Phone</th>
                <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">GSTIN</th>
                <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Credit Limit</th>
                <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Outstanding Due</th>
                <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">CRM Health Score</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 text-right">Ledger Statement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.map((c) => {
                const isCritical = c.outstandingAmount >= c.creditLimit * 0.75;
                const isLowScore = c.healthScore < 60;

                return (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm select-none">
                          {c.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800 text-sm">{c.name}</span>
                          <span className="text-[10px] text-slate-400">{c.email || 'No email registered'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 font-semibold text-xs text-slate-700">{c.phone}</td>
                    <td className="px-4 py-4 font-mono text-xs text-slate-600 uppercase">{c.gstNumber || 'N/A'}</td>
                    <td className="px-4 py-4 font-semibold text-xs text-slate-700">{formatCurrency(c.creditLimit)}</td>
                    <td className={`px-4 py-4 font-bold text-xs ${isCritical ? 'text-rose-600' : 'text-slate-800'}`}>
                      {formatCurrency(c.outstandingAmount)}
                      {isCritical && (
                        <span className="block text-[8px] text-rose-500 font-bold uppercase tracking-wider">
                          Over 75% Limit
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              isLowScore ? 'bg-rose-500' : c.healthScore < 80 ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${c.healthScore}%` }}
                          />
                        </div>
                        <span className={`text-xs font-bold ${
                          isLowScore ? 'text-rose-600' : c.healthScore < 80 ? 'text-amber-600' : 'text-emerald-700'
                        }`}>
                          {c.healthScore.toFixed(0)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/customers/${c.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 hover:border-primary hover:bg-primary/5 text-primary text-xs font-bold rounded-lg transition-colors"
                      >
                        <span className="material-symbols-outlined text-sm">analytics</span>
                        View Statement
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {filteredCustomers.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400 text-sm">
                    No customer accounts found matching search filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Customer Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-headline text-base font-bold text-slate-900">Add Customer Wholesale Account</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Customer / Merchant Name</label>
                <input
                  required
                  className="border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="E.g. Sharma Traders"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Phone Number</label>
                  <input
                    required
                    className="border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    placeholder="10-digit number"
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Email Address</label>
                  <input
                    className="border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    placeholder="merchant@biz.com"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">GSTIN Registration</label>
                <input
                  className="border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-mono uppercase"
                  placeholder="15-digit GST number"
                  type="text"
                  value={formData.gstNumber}
                  onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Credit Limit Allocation (₹)</label>
                <input
                  required
                  min={0}
                  type="number"
                  className="border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold"
                  value={formData.creditLimit}
                  onChange={(e) => setFormData({ ...formData, creditLimit: parseFloat(e.target.value || '0') })}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Business Address</label>
                <textarea
                  rows={2}
                  className="border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="Street address, City, Pincode"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              <div className="border-t border-slate-100 mt-4 pt-4 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-6 py-2 bg-primary text-white rounded-xl text-xs font-semibold hover:opacity-90 transition-opacity flex items-center gap-2"
                >
                  {isPending && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  Register Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
