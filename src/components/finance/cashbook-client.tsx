'use client';

import React, { useState, useTransition } from 'react';
import { CashbookData, addCashbookEntry } from '@/actions/cashbook';
import { CashbookType, CashbookCategory } from '@prisma/client';

interface CashbookClientProps {
  initialEntries: CashbookData[];
  initialMetrics: { totalIn: number; totalOut: number; balance: number };
}

export function CashbookClient({ initialEntries, initialMetrics }: CashbookClientProps) {
  const [entries, setEntries] = useState<CashbookData[]>(initialEntries);
  const [metrics, setMetrics] = useState(initialMetrics);
  const [isPending, startTransition] = useTransition();

  // Filters
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  // Modal toggle
  const [modalOpen, setModalOpen] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    type: 'CASH_IN' as CashbookType,
    category: 'SALES' as CashbookCategory,
    amount: 0,
    description: '',
  });

  const categories = ['SALES', 'SALARY', 'PURCHASE', 'TRANSPORT', 'UTILITIES', 'OTHER'];

  const applyFilters = (type: string, category: string) => {
    let filtered = [...initialEntries];
    if (type !== 'ALL') {
      filtered = filtered.filter(e => e.type === type);
    }
    if (category !== 'ALL') {
      filtered = filtered.filter(e => e.category === category);
    }
    setEntries(filtered);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.amount <= 0) {
      alert('Please enter a valid amount.');
      return;
    }
    startTransition(async () => {
      const success = await addCashbookEntry(formData);
      if (success) {
        setModalOpen(false);
        alert('Transaction logged successfully! Reloading...');
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
          <h2 className="font-headline text-2xl font-bold text-slate-900">Cashbook & Finance</h2>
          <p className="text-xs text-slate-400 font-semibold">Track operational cash flows, receipts, and payouts.</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-xs font-bold hover:opacity-90 shadow-lg shadow-primary/20 transition-all active:scale-95 cursor-pointer"
        >
          <span className="material-symbols-outlined text-base">add</span>
          Record Cash Flow
        </button>
      </div>

      {/* Metrics Strips */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Cash In */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-xl shrink-0">
            <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              trending_up
            </span>
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Cash In</p>
            <p className="text-xl font-bold text-slate-800">{formatCurrency(metrics.totalIn)}</p>
          </div>
        </div>

        {/* Cash Out */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-rose-50 text-rose-600 rounded-xl shrink-0">
            <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              trending_down
            </span>
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Cash Out</p>
            <p className="text-xl font-bold text-slate-800">{formatCurrency(metrics.totalOut)}</p>
          </div>
        </div>

        {/* Net Balance */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className={`p-3.5 rounded-xl shrink-0 ${
            metrics.balance >= 0 ? 'bg-primary/10 text-primary' : 'bg-rose-50 text-rose-600'
          }`}>
            <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              account_balance_wallet
            </span>
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Net Cash Balance</p>
            <p className={`text-xl font-bold ${metrics.balance >= 0 ? 'text-primary' : 'text-rose-600'}`}>
              {formatCurrency(metrics.balance)}
            </p>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-wrap items-center gap-4">
        {/* Type Select */}
        <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl min-w-[150px]">
          <span className="material-symbols-outlined text-slate-400 text-lg">swap_horiz</span>
          <select
            className="bg-transparent border-none text-xs font-semibold text-slate-600 focus:ring-0 w-full cursor-pointer outline-none"
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value);
              applyFilters(e.target.value, filterCategory);
            }}
          >
            <option value="ALL">All Types</option>
            <option value="CASH_IN">Cash In (Receipts)</option>
            <option value="CASH_OUT">Cash Out (Payouts)</option>
          </select>
        </div>

        {/* Category Select */}
        <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl min-w-[180px]">
          <span className="material-symbols-outlined text-slate-400 text-lg">category</span>
          <select
            className="bg-transparent border-none text-xs font-semibold text-slate-600 focus:ring-0 w-full cursor-pointer outline-none"
            value={filterCategory}
            onChange={(e) => {
              setFilterCategory(e.target.value);
              applyFilters(filterType, e.target.value);
            }}
          >
            <option value="ALL">All Categories</option>
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Date & Time</th>
                <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Type</th>
                <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Category</th>
                <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Amount</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Description</th>
                <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Recorded By</th>
                <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Branch</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {entries.map((e) => (
                <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-xs text-slate-500 font-semibold">{e.timestamp}</td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                      e.type === 'CASH_IN' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                    }`}>
                      {e.type === 'CASH_IN' ? 'Inward' : 'Outward'}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                      {e.category}
                    </span>
                  </td>
                  <td className={`px-4 py-4 font-bold text-xs ${
                    e.type === 'CASH_IN' ? 'text-emerald-600' : 'text-rose-600'
                  }`}>
                    {e.type === 'CASH_IN' ? '+' : '-'} ₹{e.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-600 font-medium max-w-xs truncate">{e.description}</td>
                  <td className="px-4 py-4 text-xs text-slate-600 font-medium">{e.userName}</td>
                  <td className="px-4 py-4 text-xs text-slate-500 font-semibold">{e.branchName}</td>
                </tr>
              ))}
              {entries.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400 text-sm">
                    No transaction entries recorded.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Cash Entry Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-headline text-base font-bold text-slate-900">Record Cash Flow Transaction</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Flow Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    className={`py-2 text-xs font-bold rounded-xl border-2 transition-all ${
                      formData.type === 'CASH_IN'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : 'border-transparent bg-slate-50 text-slate-500'
                    }`}
                    onClick={() => setFormData({ ...formData, type: 'CASH_IN', category: 'SALES' })}
                  >
                    Cash In (Income)
                  </button>
                  <button
                    type="button"
                    className={`py-2 text-xs font-bold rounded-xl border-2 transition-all ${
                      formData.type === 'CASH_OUT'
                        ? 'border-rose-500 bg-rose-50 text-rose-700'
                        : 'border-transparent bg-slate-50 text-slate-500'
                    }`}
                    onClick={() => setFormData({ ...formData, type: 'CASH_OUT', category: 'PURCHASE' })}
                  >
                    Cash Out (Expense)
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Transaction Category</label>
                <select
                  className="border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as CashbookCategory })}
                >
                  {formData.type === 'CASH_IN' ? (
                    <>
                      <option value="SALES">Sales Receipts</option>
                      <option value="OTHER">Other Income</option>
                    </>
                  ) : (
                    <>
                      <option value="PURCHASE">Inventory Purchase</option>
                      <option value="SALARY">Payroll / Staff Salary</option>
                      <option value="UTILITIES">Office Utilities</option>
                      <option value="TRANSPORT">Freight & Transport</option>
                      <option value="OTHER">Other Expenses</option>
                    </>
                  )}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Amount (₹)</label>
                <input
                  required
                  min={0.01}
                  step="0.01"
                  type="number"
                  className="border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value || '0') })}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Description / Memo</label>
                <textarea
                  required
                  rows={3}
                  className="border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="E.g. Electricity bill payment Mumbai HQ..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                  Record Flow
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
