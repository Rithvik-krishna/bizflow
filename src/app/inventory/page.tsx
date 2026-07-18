import React from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { InventoryClient } from '@/components/inventory/inventory-client';
import { getProducts, getCategories, getSuppliers } from '@/actions/inventory';

export default async function InventoryPage() {
  const products = await getProducts();
  const categories = await getCategories();
  const suppliers = await getSuppliers();

  return (
    <MainLayout>
      <InventoryClient
        initialProducts={products}
        categories={categories}
        suppliers={suppliers}
      />
    </MainLayout>
  );
}
