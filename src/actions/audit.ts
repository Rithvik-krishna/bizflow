'use server';

import { prisma } from '@/lib/prisma';
import { getMockDb } from '@/lib/mock-db';

export interface AuditLogData {
  id: string;
  userName: string;
  action: string;
  entityName: string;
  entityId: string | null;
  branchName: string;
  reason: string | null;
  timestamp: string;
}

export async function getAuditLogs(): Promise<AuditLogData[]> {
  try {
    const logs = await prisma.auditLog.findMany({
      include: {
        user: true,
        branch: true
      },
      orderBy: { timestamp: 'desc' },
      take: 50
    });

    return logs.map(l => ({
      id: l.id,
      userName: l.user.name || 'User',
      action: l.action,
      entityName: l.entityName,
      entityId: l.entityId,
      branchName: l.branch?.name || 'Main HQ',
      reason: l.reason,
      timestamp: l.timestamp.toLocaleString('en-IN')
    }));
  } catch {
    const db = getMockDb();
    return db.auditLogs.map(l => {
      const user = db.users.find(u => u.id === l.userId) || { name: 'Staff' };
      const branch = db.branches.find(b => b.id === l.branchId) || { name: 'Main HQ' };
      return {
        id: l.id,
        userName: user.name,
        action: l.action,
        entityName: l.entityName,
        entityId: l.entityId,
        branchName: branch.name,
        reason: l.reason,
        timestamp: new Date(l.timestamp).toLocaleString('en-IN')
      };
    });
  }
}
