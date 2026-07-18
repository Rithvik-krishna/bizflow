'use client';

import React from 'react';
import Link from 'next/link';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { DashboardStats } from '@/actions/dashboard';

interface DashboardClientProps {
  stats: DashboardStats;
}

export function DashboardClient({ stats }: DashboardClientProps) {
  // Format currency
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Hero Title */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-headline text-2xl font-bold tracking-tight text-slate-900">Operations Dashboard</h2>
          <p className="font-body text-sm text-slate-500">Monitor your enterprise health and logistics in real-time.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold hover:bg-slate-50 transition-all flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">calendar_today</span>
            Last 30 Days
          </button>
          <button className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-semibold hover:opacity-90 shadow-lg shadow-primary/20 flex items-center gap-2 transition-all">
            <span className="material-symbols-outlined text-sm">download</span>
            Export Report
          </button>
        </div>
      </div>

      {/* KPI Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Today's Revenue */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="p-3 bg-primary/10 text-primary rounded-xl">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                payments
              </span>
            </div>
            <span className="text-emerald-600 text-xs font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">trending_up</span>
              +12.5%
            </span>
          </div>
          <p className="text-xs text-slate-400 font-semibold mb-1 relative z-10">Today's Revenue</p>
          <h3 className="text-2xl font-bold text-slate-900 relative z-10">{formatCurrency(stats.todayRevenue)}</h3>
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-[120px]">payments</span>
          </div>
        </div>

        {/* Monthly Revenue */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-600/10 text-blue-600 rounded-xl">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                account_balance_wallet
              </span>
            </div>
            <span className="text-emerald-600 text-xs font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">trending_up</span>
              +8.2%
            </span>
          </div>
          <p className="text-xs text-slate-400 font-semibold mb-1">Monthly Revenue</p>
          <h3 className="text-2xl font-bold text-slate-900">{formatCurrency(stats.monthlyRevenue)}</h3>
        </div>

        {/* Total Products */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-emerald-600/10 text-emerald-600 rounded-xl">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                inventory_2
              </span>
            </div>
            <span className={`text-xs font-bold flex items-center gap-1 ${stats.lowStockAlertsCount > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
              <span className="material-symbols-outlined text-sm">warning</span>
              {stats.lowStockAlertsCount} Low
            </span>
          </div>
          <p className="text-xs text-slate-400 font-semibold mb-1">Total Products</p>
          <h3 className="text-2xl font-bold text-slate-900">{stats.totalProducts}</h3>
        </div>

        {/* Active Orders */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-indigo-600 text-white rounded-xl">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                shopping_cart
              </span>
            </div>
            <span className="text-slate-400 text-xs font-semibold">Active</span>
          </div>
          <p className="text-xs text-slate-400 font-semibold mb-1">Active Orders</p>
          <h3 className="text-2xl font-bold text-slate-900">{stats.activeOrdersCount}</h3>
        </div>
      </div>

      {/* Mini KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <span className="material-symbols-outlined text-slate-400">group</span>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Customers</p>
            <p className="text-sm font-bold text-slate-800">{stats.totalCustomersCount}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <span className="material-symbols-outlined text-slate-400">badge</span>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Staff</p>
            <p className="text-sm font-bold text-slate-800">{stats.totalStaffCount}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <span className="material-symbols-outlined text-slate-400">hourglass_empty</span>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Pending Invoices</p>
            <p className="text-sm font-bold text-slate-800">{stats.pendingPaymentsCount}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 bg-rose-50 rounded-2xl border border-rose-100">
          <span className="material-symbols-outlined text-rose-500">notification_important</span>
          <div>
            <p className="text-[10px] text-rose-500 font-bold uppercase tracking-wider">Low Stock Alerts</p>
            <p className="text-sm font-bold text-rose-600">{stats.lowStockAlertsCount}</p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend AreaChart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-headline text-lg font-bold text-slate-900">Revenue Trend</h4>
              <p className="text-xs text-slate-400">Weekly sales vs utility & payroll expenses</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                Sales
              </span>
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                Expenses
              </span>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.revenueTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="amount" stroke="var(--color-primary)" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSales)" name="Sales" />
                <Area type="monotone" dataKey="expenses" stroke="#94a3b8" strokeWidth={2} fillOpacity={0} name="Expenses" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Branch Performance BarChart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4">
          <div>
            <h4 className="font-headline text-lg font-bold text-slate-900">Branch Performance</h4>
            <p className="text-xs text-slate-400">Total volume of sales vs net profit</p>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.branchPerformance} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip />
                <Bar dataKey="sales" fill="var(--color-primary)" radius={[4, 4, 0, 0]} name="Sales" />
                <Bar dataKey="profit" fill="#10b981" radius={[4, 4, 0, 0]} name="Net Profit" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Lists / Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity Feed */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm lg:col-span-2 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h4 className="font-headline text-lg font-bold text-slate-900">Recent Activity Feed</h4>
            <span className="text-xs text-primary font-bold hover:underline cursor-pointer">View Audit Logs</span>
          </div>
          <div className="flex flex-col gap-4">
            {stats.recentActivities.map((act) => (
              <div key={act.id} className="flex gap-4 items-start pb-4 border-b border-slate-100 last:border-b-0 last:pb-0">
                <div className={`p-2 rounded-xl flex items-center justify-center shrink-0 ${
                  act.type === 'ORDER' ? 'bg-primary/10 text-primary' :
                  act.type === 'STOCK' ? 'bg-rose-50 text-rose-500' : 'bg-slate-100 text-slate-500'
                }`}>
                  <span className="material-symbols-outlined text-lg">
                    {act.type === 'ORDER' ? 'shopping_cart' :
                     act.type === 'STOCK' ? 'warning' : 'info'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 leading-snug">{act.title}</p>
                  <p className="text-xs text-slate-500 truncate leading-snug">{act.description}</p>
                </div>
                <span className="text-[10px] text-slate-400 font-bold shrink-0">{act.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* AI Insight Highlight Card */}
        <div className="bg-gradient-to-br from-primary to-indigo-800 p-6 rounded-2xl border border-primary/20 text-white shadow-lg shadow-primary/10 flex flex-col justify-between min-h-[280px]">
          <div className="flex items-start justify-between">
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-md">
              <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>
                smart_toy
              </span>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-widest bg-white/20 px-2.5 py-1 rounded-full">
              AI Insight
            </span>
          </div>

          <div className="my-6">
            <h5 className="font-headline text-lg font-bold mb-2">Business Health Score is 88</h5>
            <p className="text-xs text-slate-100 leading-relaxed">
              Sales are up 12% this week. However, Outstanding accounts for <strong>Global Pharma Partners</strong> ($78,000) are higher than average. Low stock warnings require replenishment.
            </p>
          </div>

          <Link
            href="/ai"
            className="w-full bg-white text-primary text-xs font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-50 transition-all shadow-md active:scale-98"
          >
            Open Insight Engine
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
