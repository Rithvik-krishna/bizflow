import React from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { getAuditLogs } from '@/actions/audit';

export default async function AuditLogsPage() {
  const logs = await getAuditLogs();

  return (
    <MainLayout>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div>
          <h2 className="font-headline text-2xl font-bold text-slate-900 font-headline">Enterprise Audit Logs</h2>
          <p className="text-xs text-slate-400 font-semibold">Security audit feed logging critical database adjustments, edits, and POS transactions.</p>
        </div>

        {/* Table */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Timestamp</th>
                  <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Operator</th>
                  <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Action Event</th>
                  <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Modified Entity</th>
                  <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Entity ID</th>
                  <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Active Branch</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Reason / Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-slate-500 font-semibold">{log.timestamp}</td>
                    <td className="px-4 py-4 font-bold text-slate-800">{log.userName}</td>
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 uppercase tracking-wide">
                        {log.action.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-4 font-semibold text-slate-700">{log.entityName}</td>
                    <td className="px-4 py-4 font-mono text-slate-400 font-semibold">{log.entityId || 'N/A'}</td>
                    <td className="px-4 py-4 text-slate-500 font-semibold">{log.branchName}</td>
                    <td className="px-6 py-4 text-slate-600 font-medium max-w-sm truncate">{log.reason}</td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400 text-sm">
                      No security audit records logged yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
