import React from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { CustomersClient } from '@/components/customers/customers-client';
import { getCustomers } from '@/actions/customers';

export default async function CustomersPage() {
  const customers = await getCustomers();

  return (
    <MainLayout>
      <CustomersClient initialCustomers={customers} />
    </MainLayout>
  );
}
