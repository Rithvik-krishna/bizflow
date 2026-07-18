import React from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { CashbookClient } from '@/components/finance/cashbook-client';
import { getCashbookEntries, getCashbookReportMetrics } from '@/actions/cashbook';

export default async function FinancePage() {
  const entries = await getCashbookEntries();
  const metrics = await getCashbookReportMetrics();

  return (
    <MainLayout>
      <CashbookClient initialEntries={entries} initialMetrics={metrics} />
    </MainLayout>
  );
}
