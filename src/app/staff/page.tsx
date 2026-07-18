import React from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { StaffClient } from '@/components/staff/staff-client';
import { getStaffList, getStaffAttendance, getStaffTasks } from '@/actions/staff';

export default async function StaffPage() {
  const staff = await getStaffList();
  const attendance = await getStaffAttendance();
  const tasks = await getStaffTasks();

  return (
    <MainLayout>
      <StaffClient staff={staff} attendance={attendance} tasks={tasks} />
    </MainLayout>
  );
}
