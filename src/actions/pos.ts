'use server';

import { prisma } from '@/lib/prisma';
import { getMockDb, updateMockDb } from '@/lib/mock-db';
import { getAuthUser } from '@/lib/auth';
import { OrderStatus } from '@prisma/client';

export interface CheckoutItem {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export interface CheckoutResult {
  success: boolean;
  orderId?: string;
  total?: number;
  invoiceNumber?: string;
  error?: string;
}

export async function getPOSCustomers() {
  try {
    return await prisma.customer.findMany({ orderBy: { name: 'asc' } });
  } catch {
    return getMockDb().customers;
  }
}

export async function processPOSCheckout(data: {
  customerId: string;
  items: CheckoutItem[];
  discount: number;
  paymentMethod: 'CASH' | 'CARD' | 'UPI';
}): Promise<CheckoutResult> {
  const user = await getAuthUser();
  const branchId = user.branchId || 'branch-1';
  
  // Calculate total amount
  const subtotal = data.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const gst = subtotal * 0.18;
  const total = subtotal + gst - data.discount;

  const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
  const orderId = `so-${Date.now()}`;

  try {
    // 1. Transaction wrapping to ensure atomic database operations
    await prisma.$transaction(async (tx) => {
      // Create Sales Order
      const salesOrder = await tx.salesOrder.create({
        data: {
          id: orderId,
          customerId: data.customerId,
          branchId,
          status: 'DELIVERED',
          totalAmount: total,
          creatorId: user.id,
          items: {
            create: data.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
            })),
          },
        },
      });

      // Reduce stock & Create movements
      for (const item of data.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });

        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            type: 'OUT',
            quantity: item.quantity,
            sourceBranchId: branchId,
            userId: user.id,
            reason: `POS checkout order ${salesOrder.id}`,
          },
        });
      }

      // Create Invoice
      await tx.invoice.create({
        data: {
          salesOrderId: salesOrder.id,
          invoiceNumber,
          amount: total,
          taxAmount: gst,
          status: 'PAID',
          dueDate: new Date(),
        },
      });

      // Update customer ledger
      // Debit (Purchase)
      await tx.customerLedger.create({
        data: {
          customerId: data.customerId,
          type: 'DEBIT',
          amount: total,
          description: `POS Checkout Invoice #${invoiceNumber}`,
          referenceId: salesOrder.id,
        },
      });
      // Credit (Immediate Payment)
      await tx.customerLedger.create({
        data: {
          customerId: data.customerId,
          type: 'CREDIT',
          amount: total,
          description: `Immediate payment via ${data.paymentMethod} for Invoice #${invoiceNumber}`,
          referenceId: salesOrder.id,
        },
      });

      // Create Cashbook Entry
      await tx.cashbookEntry.create({
        data: {
          type: 'CASH_IN',
          category: 'SALES',
          amount: total,
          description: `POS checkout ${invoiceNumber} (${data.paymentMethod})`,
          branchId,
          userId: user.id,
        },
      });

      // Audit log
      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: 'POS_CHECKOUT',
          entityName: 'SalesOrder',
          entityId: salesOrder.id,
          branchId,
          reason: `POS retail sale checkout invoice ${invoiceNumber} totaling ${total}`,
        },
      });
    });

    return {
      success: true,
      orderId,
      total,
      invoiceNumber,
    };
  } catch (error: any) {
    // FALLBACK TO MOCK DB (Connection failure)
    let errMessage = error.message;

    updateMockDb((db) => {
      // 1. Create Sales Order
      const newOrder = {
        id: orderId,
        customerId: data.customerId,
        branchId,
        status: 'DELIVERED' as OrderStatus,
        totalAmount: total,
        creatorId: user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
        items: data.items.map((item, idx) => ({
          id: `soi-${Date.now()}-${idx}`,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      };
      db.salesOrders.push(newOrder);

      // 2. Reduce stock & Create movements in memory
      for (const item of data.items) {
        const prodIndex = db.products.findIndex(p => p.id === item.productId);
        if (prodIndex !== -1) {
          db.products[prodIndex].stock = Math.max(0, db.products[prodIndex].stock - item.quantity);
        }

        db.stockMovements.push({
          id: `mv-${Date.now()}-${item.productId}`,
          productId: item.productId,
          type: 'OUT',
          quantity: item.quantity,
          sourceBranchId: branchId,
          targetBranchId: null,
          userId: user.id,
          reason: `[Mock] POS checkout order ${orderId}`,
          timestamp: new Date(),
        });
      }

      // 3. Create Invoice
      db.invoices.push({
        id: `inv-${Date.now()}`,
        salesOrderId: orderId,
        invoiceNumber,
        amount: total,
        taxAmount: gst,
        status: 'PAID',
        dueDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // 4. Update customer ledgers
      db.customerLedgers.push({
        id: `ldg-${Date.now()}-1`,
        customerId: data.customerId,
        type: 'DEBIT',
        amount: total,
        description: `[Mock] POS Checkout Invoice #${invoiceNumber}`,
        timestamp: new Date(),
        referenceId: orderId,
      });

      db.customerLedgers.push({
        id: `ldg-${Date.now()}-2`,
        customerId: data.customerId,
        type: 'CREDIT',
        amount: total,
        description: `[Mock] Payment via ${data.paymentMethod} for #${invoiceNumber}`,
        timestamp: new Date(),
        referenceId: orderId,
      });

      // 5. Add timeline event
      db.customerTimelineEvents.push({
        id: `evt-${Date.now()}`,
        customerId: data.customerId,
        type: 'ORDER',
        title: `POS Checkout Completed`,
        description: `Purchased items worth ₹${total.toFixed(2)} via ${data.paymentMethod}. Invoice #${invoiceNumber}`,
        timestamp: new Date(),
      });

      // 6. Create Cashbook Entry
      db.cashbookEntries.push({
        id: `cb-${Date.now()}`,
        type: 'CASH_IN',
        category: 'SALES',
        amount: total,
        description: `[Mock] POS checkout ${invoiceNumber} (${data.paymentMethod})`,
        branchId,
        userId: user.id,
        timestamp: new Date(),
      });

      // 7. Audit log
      db.auditLogs.push({
        id: `log-${Date.now()}`,
        userId: user.id,
        action: 'POS_CHECKOUT',
        entityName: 'SalesOrder',
        entityId: orderId,
        branchId,
        reason: `[Mock] POS checkout invoice ${invoiceNumber} totaling ₹${total.toFixed(2)}`,
        timestamp: new Date(),
      });
    });

    return {
      success: true,
      orderId,
      total,
      invoiceNumber,
    };
  }
}
