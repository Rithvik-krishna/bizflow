'use client';

import React, { useState, useTransition } from 'react';
import { OrderData, updateSalesOrderStatus } from '@/actions/orders';
import { OrderStatus } from '@prisma/client';

interface SalesClientProps {
  initialOrders: OrderData[];
}

export function SalesClient({ initialOrders }: SalesClientProps) {
  const [orders, setOrders] = useState<OrderData[]>(initialOrders);
  const [activeOrder, setActiveOrder] = useState<OrderData | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (orderId: string, status: OrderStatus) => {
    startTransition(async () => {
      const success = await updateSalesOrderStatus(orderId, status);
      if (success) {
        setOrders(orders.map(o => o.id === orderId ? { ...o, status } : o));
        alert(`Sales order status updated to ${status}`);
      }
    });
  };

  const getStatusStyle = (status: OrderStatus) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'CANCELLED':
        return 'bg-slate-100 text-slate-500 border-slate-200';
      case 'PENDING':
        return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'DISPATCHED':
        return 'bg-blue-50 text-blue-700 border-blue-100';
      default:
        return 'bg-indigo-50 text-indigo-700 border-indigo-100';
    }
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
      <div>
        <h2 className="font-headline text-2xl font-bold text-slate-900 font-headline">Sales Orders Registry</h2>
        <p className="text-xs text-slate-400 font-semibold">Monitor wholesale orders lifecycles, shipping statuses, and dispatch sheets.</p>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Order ID</th>
                <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Customer Account</th>
                <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Date Placed</th>
                <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Total Value</th>
                <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Dispatch Branch</th>
                <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Order Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-slate-800">{o.id.toUpperCase()}</td>
                  <td className="px-4 py-4 font-bold text-slate-800">{o.customerName}</td>
                  <td className="px-4 py-4 text-slate-500 font-semibold">{o.createdAt}</td>
                  <td className="px-4 py-4 font-bold text-primary">{formatCurrency(o.totalAmount)}</td>
                  <td className="px-4 py-4 text-slate-600 font-semibold">{o.branchName}</td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusStyle(o.status)}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      {/* Status select dropdown */}
                      <select
                        disabled={isPending}
                        className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-[10px] font-bold text-slate-600 cursor-pointer outline-none focus:ring-1 focus:ring-primary"
                        value={o.status}
                        onChange={(e) => handleStatusChange(o.id, e.target.value as OrderStatus)}
                      >
                        <option value="DRAFT">DRAFT</option>
                        <option value="PENDING">PENDING</option>
                        <option value="CONFIRMED">CONFIRMED</option>
                        <option value="PACKED">PACKED</option>
                        <option value="DISPATCHED">DISPATCHED</option>
                        <option value="DELIVERED">DELIVERED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                      <button
                        onClick={() => setActiveOrder(o)}
                        className="text-primary hover:underline font-bold"
                      >
                        Details
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Dialog Popup */}
      {activeOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-headline text-base font-bold text-slate-900">Sales Order Specifications</h3>
              <button onClick={() => setActiveOrder(null)} className="text-slate-400 hover:text-slate-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 space-y-4 text-xs text-slate-600">
              <div className="grid grid-cols-2 gap-4 pb-3 border-b border-slate-100">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Customer Merchant</p>
                  <p className="font-bold text-slate-800 mt-0.5">{activeOrder.customerName}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Origin Branch</p>
                  <p className="font-bold text-slate-800 mt-0.5">{activeOrder.branchName}</p>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Items Cataloged</p>
                <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                  {activeOrder.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <div>
                        <p className="font-bold text-slate-800">{item.productName}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{item.quantity} units x {formatCurrency(item.unitPrice)}</p>
                      </div>
                      <span className="font-bold text-slate-800">{formatCurrency(item.quantity * item.unitPrice)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Summary */}
              <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-sm font-bold">
                <span className="text-slate-800">Total Net Amount</span>
                <span className="text-primary text-base">{formatCurrency(activeOrder.totalAmount)}</span>
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setActiveOrder(null)}
                className="px-5 py-2.5 bg-slate-800 text-white rounded-xl text-xs font-bold hover:opacity-90 transition-opacity"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
