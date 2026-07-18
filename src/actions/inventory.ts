'use server';

import { prisma } from '@/lib/prisma';
import { getMockDb, updateMockDb } from '@/lib/mock-db';
import { getAuthUser } from '@/lib/auth';

export interface ProductData {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  barcode: string | null;
  purchasePrice: number;
  sellingPrice: number;
  stock: number;
  minimumStock: number;
  categoryId: string;
  categoryName: string;
  supplierId: string | null;
  supplierName: string;
  branchId: string;
  branchName: string;
  updatedAt: string;
}

export async function getCategories() {
  try {
    return await prisma.category.findMany({ orderBy: { name: 'asc' } });
  } catch {
    return getMockDb().categories;
  }
}

export async function getSuppliers() {
  try {
    return await prisma.supplier.findMany({ orderBy: { name: 'asc' } });
  } catch {
    return getMockDb().suppliers;
  }
}

export async function getProducts(filters?: {
  categoryId?: string;
  status?: string;
  supplierId?: string;
  search?: string;
}): Promise<ProductData[]> {
  try {
    // Build Prisma query filters
    const where: any = {};
    if (filters?.categoryId && filters.categoryId !== 'All Categories') {
      where.categoryId = filters.categoryId;
    }
    if (filters?.supplierId && filters.supplierId !== 'All Suppliers') {
      where.supplierId = filters.supplierId;
    }
    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { sku: { contains: filters.search, mode: 'insensitive' } },
        { barcode: { contains: filters.search, mode: 'insensitive' } },
      ];
    }
    if (filters?.status) {
      if (filters.status === 'Low Stock') {
        where.stock = { lte: prisma.product.fields.minimumStock };
        where.stock = { gt: 0 };
      } else if (filters.status === 'Out of Stock') {
        where.stock = 0;
      } else if (filters.status === 'In Stock') {
        where.stock = { gt: prisma.product.fields.minimumStock };
      }
    }

    const items = await prisma.product.findMany({
      where,
      include: {
        category: true,
        supplier: true,
        branch: true,
      },
      orderBy: { name: 'asc' },
    });

    return items.map((p) => ({
      id: p.id,
      sku: p.sku,
      name: p.name,
      description: p.description,
      barcode: p.barcode,
      purchasePrice: p.purchasePrice,
      sellingPrice: p.sellingPrice,
      stock: p.stock,
      minimumStock: p.minimumStock,
      categoryId: p.categoryId,
      categoryName: p.category.name,
      supplierId: p.supplierId,
      supplierName: p.supplier?.name || 'N/A',
      branchId: p.branchId,
      branchName: p.branch.name,
      updatedAt: p.updatedAt.toLocaleDateString(),
    }));
  } catch (error) {
    // Connection failed - fallback to mock DB
    const db = getMockDb();
    let filtered = [...db.products];

    if (filters?.categoryId && filters.categoryId !== 'All Categories') {
      filtered = filtered.filter(p => p.categoryId === filters.categoryId || p.categoryName === filters.categoryId);
    }
    if (filters?.supplierId && filters.supplierId !== 'All Suppliers') {
      filtered = filtered.filter(p => p.supplierId === filters.supplierId || p.supplierName === filters.supplierId);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.sku.toLowerCase().includes(q) || 
        (p.barcode && p.barcode.includes(q))
      );
    }
    if (filters?.status) {
      if (filters.status === 'Low Stock') {
        filtered = filtered.filter(p => p.stock > 0 && p.stock <= p.minimumStock);
      } else if (filters.status === 'Out of Stock') {
        filtered = filtered.filter(p => p.stock === 0);
      } else if (filters.status === 'In Stock') {
        filtered = filtered.filter(p => p.stock > p.minimumStock);
      }
    }

    return filtered.map((p) => {
      const cat = db.categories.find(c => c.id === p.categoryId) || { name: 'General' };
      const sup = db.suppliers.find(s => s.id === p.supplierId) || { name: 'N/A' };
      const branch = db.branches.find(b => b.id === p.branchId) || { name: 'Main HQ' };
      return {
        id: p.id,
        sku: p.sku,
        name: p.name,
        description: p.description || '',
        barcode: p.barcode || '',
        purchasePrice: p.purchasePrice,
        sellingPrice: p.sellingPrice,
        stock: p.stock,
        minimumStock: p.minimumStock,
        categoryId: p.categoryId,
        categoryName: cat.name,
        supplierId: p.supplierId,
        supplierName: sup.name,
        branchId: p.branchId,
        branchName: branch.name,
        updatedAt: new Date(p.updatedAt).toLocaleDateString(),
      };
    });
  }
}

export async function addProduct(data: {
  sku: string;
  name: string;
  description: string;
  barcode: string;
  purchasePrice: number;
  sellingPrice: number;
  stock: number;
  minimumStock: number;
  categoryId: string;
  supplierId: string;
}): Promise<boolean> {
  const user = await getAuthUser();
  const branchId = user.branchId || 'branch-1';

  try {
    const product = await prisma.product.create({
      data: {
        ...data,
        branchId,
      },
    });

    // Log movement
    await prisma.stockMovement.create({
      data: {
        productId: product.id,
        type: 'IN',
        quantity: data.stock,
        targetBranchId: branchId,
        userId: user.id,
        reason: 'New product creation cataloging',
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'ADD_PRODUCT',
        entityName: 'Product',
        entityId: product.id,
        branchId,
        reason: `Added product ${data.name} to catalog with initial stock ${data.stock}`,
      },
    });

    return true;
  } catch (error) {
    // Fallback Mock DB
    updateMockDb((db) => {
      const newId = `prod-${Date.now()}`;
      const newProduct = {
        id: newId,
        sku: data.sku,
        name: data.name,
        description: data.description,
        barcode: data.barcode,
        purchasePrice: data.purchasePrice,
        sellingPrice: data.sellingPrice,
        stock: data.stock,
        minimumStock: data.minimumStock,
        categoryId: data.categoryId,
        supplierId: data.supplierId,
        branchId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      db.products.push(newProduct);

      db.stockMovements.push({
        id: `mv-${Date.now()}`,
        productId: newId,
        type: 'IN',
        quantity: data.stock,
        sourceBranchId: null,
        targetBranchId: branchId,
        userId: user.id,
        reason: 'New product mock cataloging',
        timestamp: new Date(),
      });

      db.auditLogs.push({
        id: `log-${Date.now()}`,
        userId: user.id,
        action: 'ADD_PRODUCT',
        entityName: 'Product',
        entityId: newId,
        branchId,
        reason: `[Mock] Added product ${data.name} to catalog with initial stock ${data.stock}`,
        timestamp: new Date(),
      });
    });

    return true;
  }
}

export async function editProduct(
  id: string,
  data: Partial<{
    sku: string;
    name: string;
    description: string;
    barcode: string;
    purchasePrice: number;
    sellingPrice: number;
    stock: number;
    minimumStock: number;
    categoryId: string;
    supplierId: string;
  }>
): Promise<boolean> {
  const user = await getAuthUser();
  const branchId = user.branchId || 'branch-1';

  try {
    const oldProduct = await prisma.product.findUnique({ where: { id } });
    const product = await prisma.product.update({
      where: { id },
      data,
    });

    // Check stock difference for movement logs
    if (data.stock !== undefined && oldProduct && data.stock !== oldProduct.stock) {
      const diff = data.stock - oldProduct.stock;
      await prisma.stockMovement.create({
        data: {
          productId: id,
          type: diff > 0 ? 'IN' : 'OUT',
          quantity: Math.abs(diff),
          targetBranchId: diff > 0 ? branchId : null,
          sourceBranchId: diff < 0 ? branchId : null,
          userId: user.id,
          reason: 'Manual inventory adjustment / product editing',
        },
      });
    }

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'EDIT_PRODUCT',
        entityName: 'Product',
        entityId: id,
        branchId,
        reason: `Edited product details for ${product.name}`,
      },
    });

    return true;
  } catch (error) {
    // Fallback Mock DB
    updateMockDb((db) => {
      const prodIndex = db.products.findIndex(p => p.id === id);
      if (prodIndex !== -1) {
        const oldProduct = db.products[prodIndex];
        const updated = {
          ...oldProduct,
          ...data,
          updatedAt: new Date(),
        };
        db.products[prodIndex] = updated;

        if (data.stock !== undefined && data.stock !== oldProduct.stock) {
          const diff = data.stock - oldProduct.stock;
          db.stockMovements.push({
            id: `mv-${Date.now()}`,
            productId: id,
            type: diff > 0 ? 'IN' : 'OUT',
            quantity: Math.abs(diff),
            sourceBranchId: diff < 0 ? branchId : null,
            targetBranchId: diff > 0 ? branchId : null,
            userId: user.id,
            reason: 'Mock inventory adjustment',
            timestamp: new Date(),
          });
        }

        db.auditLogs.push({
          id: `log-${Date.now()}`,
          userId: user.id,
          action: 'EDIT_PRODUCT',
          entityName: 'Product',
          entityId: id,
          branchId,
          reason: `[Mock] Edited product details for ${updated.name}`,
          timestamp: new Date(),
        });
      }
    });

    return true;
  }
}

export async function deleteProduct(id: string): Promise<boolean> {
  const user = await getAuthUser();
  try {
    const product = await prisma.product.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'DELETE_PRODUCT',
        entityName: 'Product',
        entityId: id,
        branchId: user.branchId,
        reason: `Deleted product ${product.name} from catalog`,
      },
    });

    return true;
  } catch (error) {
    // Fallback Mock DB
    updateMockDb((db) => {
      const idx = db.products.findIndex(p => p.id === id);
      if (idx !== -1) {
        const name = db.products[idx].name;
        db.products.splice(idx, 1);

        db.auditLogs.push({
          id: `log-${Date.now()}`,
          userId: user.id,
          action: 'DELETE_PRODUCT',
          entityName: 'Product',
          entityId: id,
          branchId: user.branchId || 'branch-1',
          reason: `[Mock] Deleted product ${name} from catalog`,
          timestamp: new Date(),
        });
      }
    });
    return true;
  }
}

// Import products via CSV text
export async function importProductsCSV(csvText: string): Promise<boolean> {
  try {
    const lines = csvText.split('\n');
    const header = lines[0].split(',');
    
    // Simple parser
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      const values = lines[i].split(',');
      const sku = values[0]?.trim();
      const name = values[1]?.trim();
      const categoryId = values[2]?.trim() || 'cat-1';
      const purchasePrice = parseFloat(values[3] || '0');
      const sellingPrice = parseFloat(values[4] || '0');
      const stock = parseInt(values[5] || '0');
      const supplierId = values[6]?.trim() || 'sup-1';

      if (sku && name) {
        await addProduct({
          sku,
          name,
          description: `Imported from CSV`,
          barcode: sku,
          purchasePrice,
          sellingPrice,
          stock,
          minimumStock: 10,
          categoryId,
          supplierId,
        });
      }
    }
    return true;
  } catch {
    return false;
  }
}
