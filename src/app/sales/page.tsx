import React from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { SalesClient } from '@/components/orders/sales-client';
import { getSalesOrders } from '@/actions/orders';

export default async function SalesPage() {
  const orders = await getSalesOrders();

  return (
    <MainLayout>
      <SalesClient initialOrders={orders} />
    </MainLayout>
  );
}
