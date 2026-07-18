'use client';

import React, { useState, useTransition } from 'react';
import { StaffData, AttendanceData, TaskData, clockInAttendance, clockOutAttendance, createStaffTask, updateStaffTaskStatus } from '@/actions/staff';
import { AttendanceStatus, TaskStatus } from '@prisma/client';

interface StaffClientProps {
  staff: StaffData[];
  attendance: AttendanceData[];
  tasks: TaskData[];
}

export function StaffClient({ staff, attendance, tasks }: StaffClientProps) {
  const [activeTab, setActiveTab] = useState<'employees' | 'attendance' | 'tasks'>('employees');
  const [isPending, startTransition] = useTransition();

  // Modals toggle
  const [clockInModal, setClockInModal] = useState(false);
  const [taskModal, setTaskModal] = useState(false);

  // Form states
  const [selectedStaffId, setSelectedStaffId] = useState(staff[0]?.id || '');
  const [attendanceStatus, setAttendanceStatus] = useState<AttendanceStatus>('PRESENT');
  
  const [taskData, setTaskData] = useState({
    staffId: staff[0]?.id || '',
    title: '',
    description: '',
    dueDate: new Date().toISOString().slice(0, 10),
  });

  const handleClockIn = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const success = await clockInAttendance({
        staffId: selectedStaffId,
        status: attendanceStatus
      });
      if (success) {
        setClockInModal(false);
        alert('Attendance clock-in logged successfully! Reloading...');
        window.location.reload();
      }
    });
  };

  const handleClockOut = (id: string) => {
    startTransition(async () => {
      const success = await clockOutAttendance(id);
      if (success) {
        alert('Staff checked out successfully! Reloading...');
        window.location.reload();
      }
    });
  };

  const handleTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const success = await createStaffTask(taskData);
      if (success) {
        setTaskModal(false);
        alert('Task assigned successfully! Reloading...');
        window.location.reload();
      }
    });
  };

  const handleTaskStatusChange = (taskId: string, status: TaskStatus) => {
    startTransition(async () => {
      const success = await updateStaffTaskStatus(taskId, status);
      if (success) {
        alert(`Task status updated to ${status}`);
        window.location.reload();
      }
    });
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-headline text-2xl font-bold text-slate-900 font-headline">Staff & Task Operations</h2>
          <p className="text-xs text-slate-400 font-semibold">Manage staff payroll directory, attendance rosters, and daily work tasks.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setClockInModal(true)}
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 hover:border-primary hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">schedule</span>
            Clock Attendance
          </button>
          <button
            onClick={() => setTaskModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:opacity-90 shadow-lg shadow-primary/20 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">assignment</span>
            Assign Task
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 flex gap-4">
        {(['employees', 'attendance', 'tasks'] as const).map((tab) => (
          <button
            key={tab}
            className={`pb-3 text-xs font-bold border-b-2 transition-all capitalize ${
              activeTab === tab 
                ? 'border-primary text-primary font-extrabold' 
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'employees' ? 'Staff Directory' : tab === 'attendance' ? 'Attendance Logs' : 'Tasks Board'}
          </button>
        ))}
      </div>

      {/* Renders Tab Content */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {activeTab === 'employees' && (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Employee Name</th>
                  <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Designation Role</th>
                  <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Phone</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 text-right">Monthly Payroll Salary</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {staff.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-600">
                          {s.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <span className="font-bold text-slate-800 text-sm">{s.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 font-semibold text-slate-600">{s.role}</td>
                    <td className="px-4 py-4 font-semibold text-slate-500">{s.phone}</td>
                    <td className="px-6 py-4 text-right font-bold text-slate-800">{formatCurrency(s.salary)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'attendance' && (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Employee</th>
                  <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Date Logged</th>
                  <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Clock In</th>
                  <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Clock Out</th>
                  <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Shift Status</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {attendance.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-800">{a.staffName}</td>
                    <td className="px-4 py-4 text-slate-500 font-semibold">{a.date}</td>
                    <td className="px-4 py-4 font-semibold text-slate-600">{a.clockIn}</td>
                    <td className="px-4 py-4 font-semibold text-slate-600">{a.clockOut || '--'}</td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                        a.status === 'PRESENT' ? 'bg-emerald-50 text-emerald-700' :
                        a.status === 'LATE' ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'
                      }`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {!a.clockOut ? (
                        <button
                          disabled={isPending}
                          onClick={() => handleClockOut(a.id)}
                          className="px-2.5 py-1 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-lg font-bold text-[10px] uppercase transition-colors"
                        >
                          Clock Out
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Completed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Task Title</th>
                  <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Assigned To</th>
                  <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Due Date</th>
                  <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Status</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 text-right">Quick Update</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {tasks.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-bold text-slate-800 text-sm leading-snug">{t.title}</p>
                        <p className="text-[10px] text-slate-400 leading-snug">{t.description || 'No description provided'}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4 font-semibold text-slate-700">{t.staffName}</td>
                    <td className="px-4 py-4 text-slate-500 font-semibold">{t.dueDate || 'No due date'}</td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                        t.status === 'DONE' ? 'bg-emerald-50 text-emerald-700' :
                        t.status === 'IN_PROGRESS' ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <select
                        disabled={isPending}
                        className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-[10px] font-bold text-slate-600 cursor-pointer outline-none focus:ring-1 focus:ring-primary"
                        value={t.status}
                        onChange={(e) => handleTaskStatusChange(t.id, e.target.value as TaskStatus)}
                      >
                        <option value="TODO">TODO</option>
                        <option value="IN_PROGRESS">IN_PROGRESS</option>
                        <option value="DONE">DONE</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Clock In Modal */}
      {clockInModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-headline text-base font-bold text-slate-900">Clock Attendance Shift</h3>
              <button onClick={() => setClockInModal(false)} className="text-slate-400 hover:text-slate-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleClockIn} className="p-6 flex flex-col gap-4 text-xs font-semibold text-slate-600">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Select Employee</label>
                <select
                  className="border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white cursor-pointer outline-none"
                  value={selectedStaffId}
                  onChange={(e) => setSelectedStaffId(e.target.value)}
                >
                  {staff.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Shift Status</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['PRESENT', 'LATE', 'LEAVE'] as const).map(status => (
                    <button
                      key={status}
                      type="button"
                      className={`py-2 text-[10px] font-bold rounded-lg border-2 transition-all ${
                        attendanceStatus === status
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-transparent bg-slate-50 text-slate-400'
                      }`}
                      onClick={() => setAttendanceStatus(status)}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-100 mt-4 pt-4 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setClockInModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-6 py-2 bg-primary text-white rounded-xl text-xs font-semibold hover:opacity-90 transition-opacity flex items-center gap-2"
                >
                  {isPending && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  Clock In Shift
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Task Modal */}
      {taskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-headline text-base font-bold text-slate-900">Assign Operations Task</h3>
              <button onClick={() => setTaskModal(false)} className="text-slate-400 hover:text-slate-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleTaskSubmit} className="p-6 flex flex-col gap-4 text-xs">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Assign To Employee</label>
                <select
                  className="border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white cursor-pointer outline-none"
                  value={taskData.staffId}
                  onChange={(e) => setTaskData({ ...taskData, staffId: e.target.value })}
                >
                  {staff.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Task Title</label>
                <input
                  required
                  className="border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold"
                  placeholder="E.g. Reorganize stock shelves..."
                  type="text"
                  value={taskData.title}
                  onChange={(e) => setTaskData({ ...taskData, title: e.target.value })}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Task Due Date</label>
                <input
                  required
                  className="border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold"
                  type="date"
                  value={taskData.dueDate}
                  onChange={(e) => setTaskData({ ...taskData, dueDate: e.target.value })}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Task Description / Memo</label>
                <textarea
                  rows={3}
                  className="border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="Detail out standard operating procedures for this assignment..."
                  value={taskData.description}
                  onChange={(e) => setTaskData({ ...taskData, description: e.target.value })}
                />
              </div>

              <div className="border-t border-slate-100 mt-4 pt-4 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setTaskModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-6 py-2 bg-primary text-white rounded-xl text-xs font-semibold hover:opacity-90 transition-opacity flex items-center gap-2"
                >
                  {isPending && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  Assign Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
