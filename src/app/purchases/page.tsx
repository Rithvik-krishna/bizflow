import React from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { PurchaseClient } from '@/components/orders/purchase-client';
import { getPurchaseOrders } from '@/actions/orders';
import { getSuppliersList } from '@/actions/customers';
import { getProducts } from '@/actions/inventory';

export default async function PurchasesPage() {
  const purchaseOrders = await getPurchaseOrders();
  const suppliers = await getSuppliersList();
  const products = await getProducts();

  return (
    <MainLayout>
      <PurchaseClient
        initialOrders={purchaseOrders}
        suppliers={suppliers}
        products={products}
      />
    </MainLayout>
  );
}
