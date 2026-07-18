import React from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { SuppliersClient } from '@/components/suppliers/suppliers-client';
import { getSuppliersList } from '@/actions/customers';

export default async function SuppliersPage() {
  const suppliers = await getSuppliersList();

  return (
    <MainLayout>
      <SuppliersClient initialSuppliers={suppliers} />
    </MainLayout>
  );
}
