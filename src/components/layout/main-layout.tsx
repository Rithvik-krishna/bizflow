'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUiStore } from '@/store/use-ui-store';
import { getAuthUser, AuthUser } from '@/lib/auth';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname();
  const { sidebarOpen, activeBranch, toggleSidebar, setSidebarOpen, setActiveBranch } = useUiStore();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [branchDropdownOpen, setBranchDropdownOpen] = useState(false);

  useEffect(() => {
    // Fetch auth user (either Clerk session or fallback mock session)
    getAuthUser().then(setUser);
  }, []);

  // Close mobile sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname, setSidebarOpen]);

  const navItems = [
    { label: 'Dashboard', icon: 'dashboard', href: '/dashboard' },
    { label: 'Inventory', icon: 'inventory_2', href: '/inventory' },
    { label: 'Purchase Orders', icon: 'receipt_long', href: '/purchases' },
    { label: 'Sales Orders', icon: 'shopping_cart', href: '/sales' },
    { label: 'Customers', icon: 'group', href: '/customers' },
    { label: 'Suppliers', icon: 'local_shipping', href: '/suppliers' },
    { label: 'Staff & Tasks', icon: 'badge', href: '/staff' },
    { label: 'Cashbook', icon: 'account_balance_wallet', href: '/finance' },
    { label: 'Branch Audit', icon: 'corporate_fare', href: '/branches' },
    { label: 'AI Assistant', icon: 'smart_toy', href: '/ai' },
    { label: 'Settings', icon: 'settings', href: '/settings' },
  ];

  const branches = [
    { id: 'branch-1', name: 'Main HQ (Mumbai)', code: 'BR-HQ' },
    { id: 'branch-2', name: 'Delhi Outlet', code: 'BR-DEL' },
    { id: 'branch-3', name: 'Bengaluru Warehouse', code: 'BR-BLR' },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed left-0 top-0 h-screen w-[260px] bg-white border-r border-border shadow-sm z-50 flex flex-col transition-transform duration-300 md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="px-6 py-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary flex items-center justify-center rounded-lg shadow-md">
            <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>
              dashboard
            </span>
          </div>
          <div>
            <h1 className="font-headline text-lg font-bold text-primary">BizFlow</h1>
            <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">Enterprise OS</p>
          </div>
        </div>

        {/* Sidebar Menu Items */}
        <nav className="flex-1 px-4 overflow-y-auto custom-scrollbar flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                  isActive
                    ? 'text-primary font-bold border-l-4 border-primary bg-accent/40'
                    : 'text-muted-foreground hover:text-primary hover:bg-accent/20'
                }`}
              >
                <span className="material-symbols-outlined" style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>
                  {item.icon}
                </span>
                <span className="font-body text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* New Order POS Shortcut */}
        <div className="p-6 border-t border-border">
          <Link
            href="/pos"
            className="w-full bg-primary text-white font-body text-sm font-semibold py-3 px-4 rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 hover:bg-secondary transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-base">add</span>
            New POS Order
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:pl-[260px] min-h-screen">
        {/* Header Bar */}
        <header className="fixed top-0 right-0 z-30 bg-white/80 backdrop-blur-md border-b border-border shadow-sm flex justify-between items-center h-16 w-full md:w-[calc(100%-260px)] px-6">
          {/* Left: Mobile Toggle & Search */}
          <div className="flex items-center gap-4 flex-1">
            <button className="md:hidden text-foreground flex items-center" onClick={toggleSidebar}>
              <span className="material-symbols-outlined text-2xl">menu</span>
            </button>
            <div className="relative w-full max-w-md group hidden sm:block">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary">
                search
              </span>
              <input
                className="w-full bg-slate-50 border border-slate-200 rounded-full pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all outline-none"
                placeholder="Search products, orders, customers..."
                type="text"
              />
            </div>
          </div>

          {/* Right: Branch Selector & Notifications & User Profile */}
          <div className="flex items-center gap-6">
            {/* Branch Selector Dropdown */}
            <div className="relative">
              <div
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors"
                onClick={() => setBranchDropdownOpen(!branchDropdownOpen)}
              >
                <span className="material-symbols-outlined text-muted-foreground text-lg">corporate_fare</span>
                <span className="font-body text-xs font-semibold text-slate-700 hidden md:inline">
                  {activeBranch?.name || 'Select Branch'}
                </span>
                <span className="material-symbols-outlined text-muted-foreground text-xs">expand_more</span>
              </div>
              
              {branchDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setBranchDropdownOpen(false)} />
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-border rounded-xl shadow-xl z-50 py-1">
                    <p className="px-4 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      Select active branch
                    </p>
                    {branches.map((b) => (
                      <button
                        key={b.id}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 transition-colors flex justify-between items-center ${
                          activeBranch?.id === b.id ? 'bg-primary/5 text-primary font-semibold' : ''
                        }`}
                        onClick={() => {
                          setActiveBranch(b);
                          setBranchDropdownOpen(false);
                        }}
                      >
                        <span>{b.name}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 font-mono text-slate-500">
                          {b.code}
                        </span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Notification Bell */}
            <div className="relative cursor-pointer hover:text-primary transition-colors flex items-center">
              <span className="material-symbols-outlined text-slate-600 hover:text-primary">notifications</span>
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-destructive rounded-full border-2 border-white"></span>
            </div>

            {/* User Profile Info & Dropdown */}
            <div className="relative">
              <div
                className="flex items-center gap-3 cursor-pointer group"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <div className="text-right hidden lg:block">
                  <p className="font-body text-xs font-bold text-foreground leading-tight">
                    {user?.name || 'Alex Sterling'}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-semibold leading-tight uppercase tracking-wider">
                    {user?.role || 'Owner'}
                  </p>
                </div>
                <div className="w-9 h-9 rounded-full border-2 border-primary/20 overflow-hidden shadow-sm group-hover:ring-4 ring-primary/10 transition-all flex items-center justify-center bg-slate-100">
                  <span className="material-symbols-outlined text-slate-400">person</span>
                </div>
              </div>

              {dropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-border rounded-xl shadow-xl z-50 py-1">
                    <div className="px-4 py-2 border-b border-border">
                      <p className="text-xs font-bold text-foreground">{user?.name || 'Alex Sterling'}</p>
                      <p className="text-[10px] text-muted-foreground">{user?.email || 'owner@bizflow.com'}</p>
                    </div>
                    <Link
                      href="/settings"
                      className="block px-4 py-2 text-sm text-foreground hover:bg-slate-50 transition-colors"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Profile Settings
                    </Link>
                    <Link
                      href="/settings"
                      className="block px-4 py-2 text-sm text-foreground hover:bg-slate-50 transition-colors"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Security & Roles
                    </Link>
                    <div className="border-t border-border mt-1"></div>
                    <button
                      className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-slate-50 transition-colors"
                      onClick={() => {
                        alert('Logged out (Demo Session)');
                        setDropdownOpen(false);
                      }}
                    >
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Content Shell Container */}
        <main className="pt-24 pb-12 px-6 max-w-[1440px] w-full mx-auto flex-1 flex flex-col">
          {children}
        </main>
      </div>
    </div>
  );
}
