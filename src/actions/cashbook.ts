'use server';

import { prisma } from '@/lib/prisma';
import { getMockDb, updateMockDb } from '@/lib/mock-db';
import { getAuthUser } from '@/lib/auth';
import { CashbookType, CashbookCategory } from '@prisma/client';

export interface CashbookData {
  id: string;
  type: CashbookType;
  category: CashbookCategory;
  amount: number;
  description: string;
  branchId: string;
  branchName: string;
  userName: string;
  timestamp: string;
}

export async function getCashbookEntries(filters?: {
  type?: CashbookType;
  category?: CashbookCategory;
}): Promise<CashbookData[]> {
  try {
    const where: any = {};
    if (filters?.type) where.type = filters.type;
    if (filters?.category) where.category = filters.category;

    const items = await prisma.cashbookEntry.findMany({
      where,
      include: {
        branch: true,
        user: true,
      },
      orderBy: { timestamp: 'desc' },
    });

    return items.map((c) => ({
      id: c.id,
      type: c.type,
      category: c.category,
      amount: c.amount,
      description: c.description,
      branchId: c.branchId,
      branchName: c.branch.name,
      userName: c.user.name || 'User',
      timestamp: c.timestamp.toLocaleString('en-IN'),
    }));
  } catch {
    // Fallback Mock DB
    const db = getMockDb();
    let filtered = [...db.cashbookEntries];

    if (filters?.type) {
      filtered = filtered.filter(c => c.type === filters.type);
    }
    if (filters?.category) {
      filtered = filtered.filter(c => c.category === filters.category);
    }

    return filtered.map((c) => {
      const branch = db.branches.find(b => b.id === c.branchId) || { name: 'Main HQ' };
      const user = db.users.find(u => u.id === c.userId) || { name: 'Staff' };
      return {
        id: c.id,
        type: c.type,
        category: c.category,
        amount: c.amount,
        description: c.description,
        branchId: c.branchId,
        branchName: branch.name,
        userName: user.name,
        timestamp: new Date(c.timestamp).toLocaleString('en-IN'),
      };
    });
  }
}

export async function addCashbookEntry(data: {
  type: CashbookType;
  category: CashbookCategory;
  amount: number;
  description: string;
}): Promise<boolean> {
  const user = await getAuthUser();
  const branchId = user.branchId || 'branch-1';

  try {
    const entry = await prisma.cashbookEntry.create({
      data: {
        ...data,
        branchId,
        userId: user.id,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'ADD_CASHBOOK_ENTRY',
        entityName: 'CashbookEntry',
        entityId: entry.id,
        branchId,
        reason: `Added cashbook transaction: ${data.type} under category ${data.category} of amount ${data.amount}`,
      },
    });

    return true;
  } catch (error) {
    // Fallback Mock DB
    updateMockDb((db) => {
      const newId = `cb-${Date.now()}`;
      db.cashbookEntries.push({
        id: newId,
        type: data.type,
        category: data.category,
        amount: data.amount,
        description: data.description,
        branchId,
        userId: user.id,
        timestamp: new Date(),
      });

      db.auditLogs.push({
        id: `log-${Date.now()}`,
        userId: user.id,
        action: 'ADD_CASHBOOK_ENTRY',
        entityName: 'CashbookEntry',
        entityId: newId,
        branchId,
        reason: `[Mock] Added cashbook transaction: ${data.type} of amount ${data.amount}`,
        timestamp: new Date(),
      });
    });

    return true;
  }
}
export async function getCashbookReportMetrics() {
  const entries = await getCashbookEntries();
  const totalIn = entries.filter(e => e.type === 'CASH_IN').reduce((sum, e) => sum + e.amount, 0);
  const totalOut = entries.filter(e => e.type === 'CASH_OUT').reduce((sum, e) => sum + e.amount, 0);
  
  return {
    totalIn,
    totalOut,
    balance: totalIn - totalOut,
  };
}
