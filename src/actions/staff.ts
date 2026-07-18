'use server';

import { prisma } from '@/lib/prisma';
import { getMockDb, updateMockDb } from '@/lib/mock-db';
import { getAuthUser } from '@/lib/auth';
import { AttendanceStatus, TaskStatus } from '@prisma/client';

export interface StaffData {
  id: string;
  name: string;
  phone: string;
  role: string;
  salary: number;
}

export interface AttendanceData {
  id: string;
  staffId: string;
  staffName: string;
  date: string;
  clockIn: string;
  clockOut: string | null;
  status: AttendanceStatus;
}

export interface TaskData {
  id: string;
  staffId: string;
  staffName: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  dueDate: string | null;
}

export async function getStaffList(): Promise<StaffData[]> {
  try {
    return await prisma.staff.findMany({ orderBy: { name: 'asc' } });
  } catch {
    return getMockDb().staff;
  }
}

export async function getStaffAttendance(): Promise<AttendanceData[]> {
  try {
    const items = await prisma.attendance.findMany({
      include: { staff: true },
      orderBy: { date: 'desc' }
    });
    return items.map(a => ({
      id: a.id,
      staffId: a.staffId,
      staffName: a.staff.name,
      date: a.date.toLocaleDateString(),
      clockIn: a.clockIn.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      clockOut: a.clockOut ? a.clockOut.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null,
      status: a.status
    }));
  } catch {
    const db = getMockDb();
    return db.attendance.map(a => {
      const emp = db.staff.find(s => s.id === a.staffId) || { name: 'Staff' };
      return {
        id: a.id,
        staffId: a.staffId,
        staffName: emp.name,
        date: new Date(a.date).toLocaleDateString(),
        clockIn: new Date(a.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        clockOut: a.clockOut ? new Date(a.clockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null,
        status: a.status
      };
    });
  }
}

export async function getStaffTasks(): Promise<TaskData[]> {
  try {
    const items = await prisma.task.findMany({
      include: { staff: true },
      orderBy: { dueDate: 'asc' }
    });
    return items.map(t => ({
      id: t.id,
      staffId: t.staffId,
      staffName: t.staff.name,
      title: t.title,
      description: t.description,
      status: t.status,
      dueDate: t.dueDate ? t.dueDate.toLocaleDateString() : null
    }));
  } catch {
    const db = getMockDb();
    return db.tasks.map(t => {
      const emp = db.staff.find(s => s.id === t.staffId) || { name: 'Staff' };
      return {
        id: t.id,
        staffId: t.staffId,
        staffName: emp.name,
        title: t.title,
        description: t.description,
        status: t.status,
        dueDate: t.dueDate ? new Date(t.dueDate).toLocaleDateString() : null
      };
    });
  }
}

export async function clockInAttendance(data: {
  staffId: string;
  status: AttendanceStatus;
}): Promise<boolean> {
  try {
    await prisma.attendance.create({
      data: {
        staffId: data.staffId,
        date: new Date(),
        clockIn: new Date(),
        status: data.status
      }
    });
    return true;
  } catch {
    updateMockDb((db) => {
      db.attendance.push({
        id: `att-${Date.now()}`,
        staffId: data.staffId,
        date: new Date(),
        clockIn: new Date(),
        clockOut: null,
        status: data.status
      });
    });
    return true;
  }
}

export async function clockOutAttendance(attendanceId: string): Promise<boolean> {
  try {
    await prisma.attendance.update({
      where: { id: attendanceId },
      data: {
        clockOut: new Date()
      }
    });
    return true;
  } catch {
    updateMockDb((db) => {
      const idx = db.attendance.findIndex(a => a.id === attendanceId);
      if (idx !== -1) {
        db.attendance[idx].clockOut = new Date();
      }
    });
    return true;
  }
}

export async function createStaffTask(data: {
  staffId: string;
  title: string;
  description: string;
  dueDate: string;
}): Promise<boolean> {
  const user = await getAuthUser();
  const branchId = user.branchId || 'branch-1';
  try {
    await prisma.task.create({
      data: {
        staffId: data.staffId,
        title: data.title,
        description: data.description,
        dueDate: new Date(data.dueDate),
        creatorId: user.id
      }
    });
    return true;
  } catch {
    updateMockDb((db) => {
      db.tasks.push({
        id: `task-${Date.now()}`,
        staffId: data.staffId,
        title: data.title,
        description: data.description,
        status: 'TODO' as TaskStatus,
        dueDate: new Date(data.dueDate),
        assigneeId: null,
        creatorId: user.id,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    });
    return true;
  }
}

export async function updateStaffTaskStatus(taskId: string, status: TaskStatus): Promise<boolean> {
  try {
    await prisma.task.update({
      where: { id: taskId },
      data: { status }
    });
    return true;
  } catch {
    updateMockDb((db) => {
      const idx = db.tasks.findIndex(t => t.id === taskId);
      if (idx !== -1) {
        db.tasks[idx].status = status;
      }
    });
    return true;
  }
}
