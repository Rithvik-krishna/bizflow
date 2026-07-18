'use server';

import { prisma } from '@/lib/prisma';
import { getMockDb, updateMockDb } from '@/lib/mock-db';
import { getAuthUser } from '@/lib/auth';

export interface CustomerData {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  address: string | null;
  gstNumber: string | null;
  creditLimit: number;
  outstandingAmount: number;
  healthScore: number;
}

export interface SupplierData {
  id: string;
  name: string;
  contactPerson: string | null;
  phone: string;
  email: string | null;
  address: string | null;
  gstNumber: string | null;
  outstandingAmount: number;
  performanceRating: number;
}

export async function getCustomers(): Promise<CustomerData[]> {
  try {
    return await prisma.customer.findMany({ orderBy: { name: 'asc' } });
  } catch {
    return getMockDb().customers;
  }
}

export async function getCustomerDetails(id: string) {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        ledgers: { orderBy: { timestamp: 'desc' } },
        timeline: { orderBy: { timestamp: 'desc' } },
      },
    });
    return customer;
  } catch {
    const db = getMockDb();
    const customer = db.customers.find(c => c.id === id);
    if (!customer) return null;

    const ledgers = db.customerLedgers.filter(l => l.customerId === id);
    const timeline = db.customerTimelineEvents.filter(t => t.customerId === id);

    return {
      ...customer,
      ledgers,
      timeline,
    };
  }
}

export async function addCustomer(data: {
  name: string;
  phone: string;
  email: string;
  address: string;
  gstNumber: string;
  creditLimit: number;
}): Promise<boolean> {
  const user = await getAuthUser();
  try {
    const customer = await prisma.customer.create({
      data: {
        ...data,
        outstandingAmount: 0.0,
        healthScore: 100.0,
      },
    });

    await prisma.customerTimelineEvent.create({
      data: {
        customerId: customer.id,
        type: 'LEDGER_UPDATE',
        title: 'Customer Profile Created',
        description: 'Authorized wholesale trade registration completed.',
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'ADD_CUSTOMER',
        entityName: 'Customer',
        entityId: customer.id,
        branchId: user.branchId,
        reason: `Registered customer ${data.name}`,
      },
    });

    return true;
  } catch {
    updateMockDb((db) => {
      const newId = `cust-${Date.now()}`;
      db.customers.push({
        id: newId,
        ...data,
        outstandingAmount: 0.0,
        healthScore: 100.0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      db.customerTimelineEvents.push({
        id: `evt-${Date.now()}`,
        customerId: newId,
        type: 'LEDGER_UPDATE',
        title: 'Customer Profile Created',
        description: '[Mock] Authorized wholesale trade registration completed.',
        timestamp: new Date(),
      });

      db.auditLogs.push({
        id: `log-${Date.now()}`,
        userId: user.id,
        action: 'ADD_CUSTOMER',
        entityName: 'Customer',
        entityId: newId,
        branchId: user.branchId || 'branch-1',
        reason: `[Mock] Registered customer ${data.name}`,
        timestamp: new Date(),
      });
    });
    return true;
  }
}

export async function sendWhatsAppReminder(customerId: string): Promise<boolean> {
  const user = await getAuthUser();
  try {
    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) return false;

    // Simulate WhatsApp send and add timeline event
    await prisma.customerTimelineEvent.create({
      data: {
        customerId,
        type: 'WHATSAPP',
        title: 'Payment Reminder Notification',
        description: `WhatsApp text alert sent to ${customer.phone} for ₹${customer.outstandingAmount.toFixed(2)} outstanding.`,
      },
    });

    return true;
  } catch {
    const db = getMockDb();
    const customer = db.customers.find(c => c.id === customerId);
    if (!customer) return false;

    updateMockDb((db) => {
      db.customerTimelineEvents.push({
        id: `evt-${Date.now()}`,
        customerId,
        type: 'WHATSAPP',
        title: 'Payment Reminder Notification',
        description: `[Mock] WhatsApp text alert sent to ${customer.phone} for ₹${customer.outstandingAmount.toFixed(2)} outstanding.`,
        timestamp: new Date(),
      });
    });
    return true;
  }
}

// Supplier Management
export async function getSuppliersList(): Promise<SupplierData[]> {
  try {
    return await prisma.supplier.findMany({ orderBy: { name: 'asc' } });
  } catch {
    return getMockDb().suppliers;
  }
}

export async function addSupplier(data: {
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  gstNumber: string;
}): Promise<boolean> {
  const user = await getAuthUser();
  try {
    const supplier = await prisma.supplier.create({
      data: {
        ...data,
        outstandingAmount: 0.0,
        performanceRating: 5.0,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'ADD_SUPPLIER',
        entityName: 'Supplier',
        entityId: supplier.id,
        branchId: user.branchId,
        reason: `Registered supplier ${data.name}`,
      },
    });

    return true;
  } catch {
    updateMockDb((db) => {
      const newId = `sup-${Date.now()}`;
      db.suppliers.push({
        id: newId,
        ...data,
        outstandingAmount: 0.0,
        performanceRating: 5.0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      db.auditLogs.push({
        id: `log-${Date.now()}`,
        userId: user.id,
        action: 'ADD_SUPPLIER',
        entityName: 'Supplier',
        entityId: newId,
        branchId: user.branchId || 'branch-1',
        reason: `[Mock] Registered supplier ${data.name}`,
        timestamp: new Date(),
      });
    });
    return true;
  }
}
