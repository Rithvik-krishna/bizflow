'use server';

import { prisma } from '@/lib/prisma';
import { getMockDb, updateMockDb } from '@/lib/mock-db';
import { getAuthUser } from '@/lib/auth';
import { OrderStatus, POStatus } from '@prisma/client';

export interface OrderData {
  id: string;
  customerName: string;
  branchName: string;
  status: OrderStatus;
  totalAmount: number;
  creatorName: string;
  createdAt: string;
  items: { productName: string; quantity: number; unitPrice: number }[];
}

export interface PurchaseOrderData {
  id: string;
  supplierName: string;
  branchName: string;
  status: POStatus;
  totalAmount: number;
  creatorName: string;
  createdAt: string;
  items: { productName: string; quantity: number; unitPrice: number }[];
}

// === Sales Orders ===
export async function getSalesOrders(): Promise<OrderData[]> {
  try {
    const orders = await prisma.salesOrder.findMany({
      include: {
        customer: true,
        branch: true,
        creator: true,
        items: {
          include: { product: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return orders.map(o => ({
      id: o.id,
      customerName: o.customer.name,
      branchName: o.branch.name,
      status: o.status,
      totalAmount: o.totalAmount,
      creatorName: o.creator.name || 'User',
      createdAt: o.createdAt.toLocaleDateString(),
      items: o.items.map(i => ({
        productName: i.product.name,
        quantity: i.quantity,
        unitPrice: i.unitPrice
      }))
    }));
  } catch {
    const db = getMockDb();
    return db.salesOrders.map(o => {
      const cust = db.customers.find(c => c.id === o.customerId) || { name: 'Customer' };
      const branch = db.branches.find(b => b.id === o.branchId) || { name: 'Branch' };
      const user = db.users.find(u => u.id === o.creatorId) || { name: 'User' };
      
      const items = o.items.map((i: any) => {
        const prod = db.products.find(p => p.id === i.productId) || { name: 'Product' };
        return {
          productName: prod.name,
          quantity: i.quantity,
          unitPrice: i.unitPrice
        };
      });

      return {
        id: o.id,
        customerName: cust.name,
        branchName: branch.name,
        status: o.status,
        totalAmount: o.totalAmount,
        creatorName: user.name,
        createdAt: new Date(o.createdAt).toLocaleDateString(),
        items
      };
    });
  }
}

export async function updateSalesOrderStatus(orderId: string, status: OrderStatus): Promise<boolean> {
  const user = await getAuthUser();
  try {
    const oldOrder = await prisma.salesOrder.findUnique({
      where: { id: orderId },
      include: { items: true }
    });

    if (!oldOrder) return false;

    // Check if moving to CONFIRMED or DELIVERED, and stock wasn't already reduced
    const shouldReduceInventory = 
      ['CONFIRMED', 'PACKED', 'DISPATCHED', 'DELIVERED'].includes(status) && 
      !['CONFIRMED', 'PACKED', 'DISPATCHED', 'DELIVERED'].includes(oldOrder.status);

    await prisma.$transaction(async (tx) => {
      await tx.salesOrder.update({
        where: { id: orderId },
        data: { status }
      });

      if (shouldReduceInventory) {
        for (const item of oldOrder.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                decrement: item.quantity
              }
            }
          });

          await tx.stockMovement.create({
            data: {
              productId: item.productId,
              type: 'OUT',
              quantity: item.quantity,
              sourceBranchId: oldOrder.branchId,
              userId: user.id,
              reason: `Sales Order ${orderId} confirmed/fulfilled`
            }
          });
        }
      }

      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: 'UPDATE_SALES_ORDER_STATUS',
          entityName: 'SalesOrder',
          entityId: orderId,
          branchId: oldOrder.branchId,
          reason: `Shifted status of SO ${orderId} to ${status}`
        }
      });
    });

    return true;
  } catch {
    updateMockDb((db) => {
      const idx = db.salesOrders.findIndex(so => so.id === orderId);
      if (idx !== -1) {
        const oldOrder = db.salesOrders[idx];
        const oldStatus = oldOrder.status;
        oldOrder.status = status;

        const shouldReduceInventory = 
          ['CONFIRMED', 'PACKED', 'DISPATCHED', 'DELIVERED'].includes(status) && 
          !['CONFIRMED', 'PACKED', 'DISPATCHED', 'DELIVERED'].includes(oldStatus);

        if (shouldReduceInventory) {
          for (const item of oldOrder.items) {
            const pIdx = db.products.findIndex(p => p.id === item.productId);
            if (pIdx !== -1) {
              db.products[pIdx].stock = Math.max(0, db.products[pIdx].stock - item.quantity);
            }
            db.stockMovements.push({
              id: `mv-${Date.now()}-${item.productId}`,
              productId: item.productId,
              type: 'OUT',
              quantity: item.quantity,
              sourceBranchId: oldOrder.branchId,
              userId: user.id,
              reason: `[Mock] Sales Order ${orderId} confirmed/fulfilled`,
              timestamp: new Date()
            });
          }
        }

        db.auditLogs.push({
          id: `log-${Date.now()}`,
          userId: user.id,
          action: 'UPDATE_SALES_ORDER_STATUS',
          entityName: 'SalesOrder',
          entityId: orderId,
          branchId: oldOrder.branchId || 'branch-1',
          reason: `[Mock] Shifted status of SO ${orderId} to ${status}`,
          timestamp: new Date()
        });
      }
    });
    return true;
  }
}

// === Purchase Orders ===
export async function getPurchaseOrders(): Promise<PurchaseOrderData[]> {
  try {
    const orders = await prisma.purchaseOrder.findMany({
      include: {
        supplier: true,
        branch: true,
        creator: true,
        items: {
          include: { product: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return orders.map(o => ({
      id: o.id,
      supplierName: o.supplier.name,
      branchName: o.branch.name,
      status: o.status,
      totalAmount: o.totalAmount,
      creatorName: o.creator.name || 'User',
      createdAt: o.createdAt.toLocaleDateString(),
      items: o.items.map(i => ({
        productName: i.product.name,
        quantity: i.quantity,
        unitPrice: i.unitPrice
      }))
    }));
  } catch {
    const db = getMockDb();
    return db.purchaseOrders.map(o => {
      const sup = db.suppliers.find(s => s.id === o.supplierId) || { name: 'Supplier' };
      const branch = db.branches.find(b => b.id === o.branchId) || { name: 'Branch' };
      const user = db.users.find(u => u.id === o.creatorId) || { name: 'User' };
      
      const items = o.items.map((i: any) => {
        const prod = db.products.find(p => p.id === i.productId) || { name: 'Product' };
        return {
          productName: prod.name,
          quantity: i.quantity,
          unitPrice: i.unitPrice
        };
      });

      return {
        id: o.id,
        supplierName: sup.name,
        branchName: branch.name,
        status: o.status,
        totalAmount: o.totalAmount,
        creatorName: user.name,
        createdAt: new Date(o.createdAt).toLocaleDateString(),
        items
      };
    });
  }
}

export async function createPurchaseOrder(data: {
  supplierId: string;
  items: { productId: string; quantity: number; unitPrice: number }[];
}): Promise<boolean> {
  const user = await getAuthUser();
  const branchId = user.branchId || 'branch-1';
  
  const total = data.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const poId = `po-${Date.now()}`;

  try {
    await prisma.purchaseOrder.create({
      data: {
        id: poId,
        supplierId: data.supplierId,
        branchId,
        status: 'DRAFT',
        totalAmount: total,
        creatorId: user.id,
        items: {
          create: data.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice
          }))
        }
      }
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'CREATE_PURCHASE_ORDER',
        entityName: 'PurchaseOrder',
        entityId: poId,
        branchId,
        reason: `Created purchase order drafting for supplier ${data.supplierId} totaling ${total}`
      }
    });

    return true;
  } catch {
    updateMockDb((db) => {
      db.purchaseOrders.push({
        id: poId,
        supplierId: data.supplierId,
        branchId,
        status: 'DRAFT' as POStatus,
        totalAmount: total,
        creatorId: user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
        items: data.items.map((item, idx) => ({
          id: `poi-${Date.now()}-${idx}`,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice
        }))
      });

      db.auditLogs.push({
        id: `log-${Date.now()}`,
        userId: user.id,
        action: 'CREATE_PURCHASE_ORDER',
        entityName: 'PurchaseOrder',
        entityId: poId,
        branchId,
        reason: `[Mock] Created purchase order drafting for supplier ${data.supplierId} totaling ₹${total}`,
        timestamp: new Date()
      });
    });
    return true;
  }
}

export async function updatePurchaseOrderStatus(orderId: string, status: POStatus): Promise<boolean> {
  const user = await getAuthUser();
  try {
    const oldPO = await prisma.purchaseOrder.findUnique({
      where: { id: orderId },
      include: { items: true }
    });

    if (!oldPO) return false;

    // Check if moving to RECEIVED, and stock wasn't already incremented
    const shouldAddInventory = status === 'RECEIVED' && oldPO.status !== 'RECEIVED';

    await prisma.$transaction(async (tx) => {
      await tx.purchaseOrder.update({
        where: { id: orderId },
        data: { status }
      });

      if (shouldAddInventory) {
        for (const item of oldPO.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                increment: item.quantity
              }
            }
          });

          await tx.stockMovement.create({
            data: {
              productId: item.productId,
              type: 'IN',
              quantity: item.quantity,
              targetBranchId: oldPO.branchId,
              userId: user.id,
              reason: `Received Purchase Order ${orderId}`
            }
          });
        }
      }

      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: 'UPDATE_PURCHASE_ORDER_STATUS',
          entityName: 'PurchaseOrder',
          entityId: orderId,
          branchId: oldPO.branchId,
          reason: `Updated status of PO ${orderId} to ${status}`
        }
      });
    });

    return true;
  } catch {
    updateMockDb((db) => {
      const idx = db.purchaseOrders.findIndex(po => po.id === orderId);
      if (idx !== -1) {
        const oldPO = db.purchaseOrders[idx];
        const oldStatus = oldPO.status;
        oldPO.status = status;

        const shouldAddInventory = status === 'RECEIVED' && oldStatus !== 'RECEIVED';

        if (shouldAddInventory) {
          for (const item of oldPO.items) {
            const pIdx = db.products.findIndex(p => p.id === item.productId);
            if (pIdx !== -1) {
              db.products[pIdx].stock += item.quantity;
            }
            db.stockMovements.push({
              id: `mv-${Date.now()}-${item.productId}`,
              productId: item.productId,
              type: 'IN',
              quantity: item.quantity,
              targetBranchId: oldPO.branchId,
              userId: user.id,
              reason: `[Mock] Received Purchase Order ${orderId}`,
              timestamp: new Date()
            });
          }
        }

        db.auditLogs.push({
          id: `log-${Date.now()}`,
          userId: user.id,
          action: 'UPDATE_PURCHASE_ORDER_STATUS',
          entityName: 'PurchaseOrder',
          entityId: orderId,
          branchId: oldPO.branchId || 'branch-1',
          reason: `[Mock] Updated status of PO ${orderId} to ${status}`,
          timestamp: new Date()
        });
      }
    });
    return true;
  }
}
