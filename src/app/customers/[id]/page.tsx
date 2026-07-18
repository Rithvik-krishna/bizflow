import React from 'react';
import { notFound } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import { CustomerDetailClient } from '@/components/customers/customer-detail-client';
import { getCustomerDetails } from '@/actions/customers';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CustomerDetailPage({ params }: PageProps) {
  const { id } = await params;
  const customer = await getCustomerDetails(id);

  if (!customer) {
    notFound();
  }

  return (
    <MainLayout>
      <CustomerDetailClient customer={customer} />
    </MainLayout>
  );
}
