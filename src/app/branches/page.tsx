import React from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { getMockDb } from '@/lib/mock-db';

export default async function BranchesPage() {
  const db = getMockDb();
  
  const transfers = db.stockTransfers.map(tr => {
    const src = db.branches.find(b => b.id === tr.sourceBranchId) || { name: 'Source' };
    const target = db.branches.find(b => b.id === tr.targetBranchId) || { name: 'Target' };
    
    const items = tr.items.map((i: any) => {
      const prod = db.products.find(p => p.id === i.productId) || { name: 'Product' };
      return `${i.quantity}x ${prod.name}`;
    }).join(', ');

    return {
      id: tr.id,
      source: src.name,
      target: target.name,
      items,
      status: tr.status,
      date: new Date(tr.createdAt).toLocaleDateString()
    };
  });

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'RECEIVED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'DISPATCHED':
        return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'APPROVED':
        return 'bg-indigo-50 text-indigo-700 border-indigo-100';
      default:
        return 'bg-slate-100 text-slate-500 border-slate-200';
    }
  };

  return (
    <MainLayout>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-headline text-2xl font-bold text-slate-900 font-headline">Branch & Transfer Management</h2>
            <p className="text-xs text-slate-400 font-semibold">Monitor inter-branch stock replenishments, transfer sheets, and transit logistics.</p>
          </div>
          <button 
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-xs font-bold hover:opacity-90 shadow-lg shadow-primary/20 transition-all active:scale-95 cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">swap_horiz</span>
            Request Stock Transfer
          </button>
        </div>

        {/* Branches Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {db.branches.map((b) => {
            const branchProds = db.products.filter(p => p.branchId === b.id);
            const totalStock = branchProds.reduce((sum, p) => sum + p.stock, 0);
            
            return (
              <div key={b.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                    <span className="material-symbols-outlined">corporate_fare</span>
                  </div>
                  <div>
                    <h4 className="font-headline text-sm font-bold text-slate-800">{b.name}</h4>
                    <p className="text-[10px] text-slate-400 font-mono uppercase">{b.code}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-xs pt-2 border-t border-slate-50 font-semibold">
                  <div>
                    <p className="text-[9px] text-slate-400 uppercase">Product SKU Types</p>
                    <p className="text-sm font-bold text-slate-700 mt-0.5">{branchProds.length}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-400 uppercase">Cumulative Stock</p>
                    <p className="text-sm font-bold text-slate-700 mt-0.5">{totalStock} units</p>
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 font-medium">{b.location}</p>
              </div>
            );
          })}
        </div>

        {/* Transfer Sheets Table */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mt-2">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/20">
            <h4 className="font-headline text-base font-bold text-slate-800">Inter-Branch Stock Transfer Sheets</h4>
          </div>
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-400">
                <tr>
                  <th className="px-6 py-4">Transfer ID</th>
                  <th className="px-4 py-4">Source Branch</th>
                  <th className="px-4 py-4">Target Branch</th>
                  <th className="px-4 py-4">Items Transferred</th>
                  <th className="px-4 py-4">Date Placed</th>
                  <th className="px-6 py-4 text-right">Transfer Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {transfers.map((tr) => (
                  <tr key={tr.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-slate-800">{tr.id.toUpperCase()}</td>
                    <td className="px-4 py-4 font-semibold text-slate-700">{tr.source}</td>
                    <td className="px-4 py-4 font-semibold text-slate-700">{tr.target}</td>
                    <td className="px-4 py-4 text-slate-600 font-medium truncate max-w-xs">{tr.items}</td>
                    <td className="px-4 py-4 text-slate-500 font-semibold">{tr.date}</td>
                    <td className="px-6 py-4 text-right">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusStyle(tr.status)}`}>
                        {tr.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
