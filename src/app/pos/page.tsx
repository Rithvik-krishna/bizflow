import React from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { POSClient } from '@/components/pos/pos-client';
import { getProducts } from '@/actions/inventory';
import { getPOSCustomers } from '@/actions/pos';

export default async function POSPage() {
  const products = await getProducts();
  const customers = await getPOSCustomers();

  return (
    <MainLayout>
      <POSClient products={products} customers={customers} />
    </MainLayout>
  );
}
