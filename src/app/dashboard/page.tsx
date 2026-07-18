import React from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { DashboardClient } from '@/components/dashboard/dashboard-client';
import { getDashboardStats } from '@/actions/dashboard';

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return (
    <MainLayout>
      <DashboardClient stats={stats} />
    </MainLayout>
  );
}
