'use client';

import React, { useState, useTransition } from 'react';
import { PurchaseOrderData, createPurchaseOrder, updatePurchaseOrderStatus } from '@/actions/orders';
import { ProductData } from '@/actions/inventory';
import { POStatus } from '@prisma/client';

interface PurchaseClientProps {
  initialOrders: PurchaseOrderData[];
  suppliers: any[];
  products: ProductData[];
}

export function PurchaseClient({ initialOrders, suppliers, products }: PurchaseClientProps) {
  const [orders, setOrders] = useState<PurchaseOrderData[]>(initialOrders);
  const [activeOrder, setActiveOrder] = useState<PurchaseOrderData | null>(null);
  const [isPending, startTransition] = useTransition();

  // Create PO Modal toggle
  const [modalOpen, setModalOpen] = useState(false);

  // Form states for creating PO
  const [selectedSupplierId, setSelectedSupplierId] = useState(suppliers[0]?.id || '');
  const [selectedItems, setSelectedItems] = useState<{ productId: string; quantity: number; unitPrice: number }[]>([]);

  // Add Item to drafting list
  const [addProdId, setAddProdId] = useState(products[0]?.id || '');
  const [addQty, setAddQty] = useState(10);
  const [addPrice, setAddPrice] = useState(products[0]?.purchasePrice || 0);

  const handleAddDraftItem = () => {
    const prod = products.find(p => p.id === addProdId);
    if (!prod) return;

    // Check if already in list
    const existing = selectedItems.find(item => item.productId === addProdId);
    if (existing) {
      alert('Product already added to drafting sheet. Adjust quantity in the list.');
      return;
    }

    setSelectedItems([
      ...selectedItems,
      { productId: addProdId, quantity: addQty, unitPrice: addPrice }
    ]);
  };

  const handleRemoveDraftItem = (productId: string) => {
    setSelectedItems(selectedItems.filter(item => item.productId !== productId));
  };

  const handleStatusChange = (orderId: string, status: POStatus) => {
    startTransition(async () => {
      const success = await updatePurchaseOrderStatus(orderId, status);
      if (success) {
        setOrders(orders.map(o => o.id === orderId ? { ...o, status } : o));
        alert(`Purchase Order status updated to ${status}`);
        if (status === 'RECEIVED') {
          alert('Stock catalog updated automatically.');
        }
      }
    });
  };

  const handleSubmitPO = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedItems.length === 0) {
      alert('Please add at least one product to the purchase order.');
      return;
    }

    startTransition(async () => {
      const success = await createPurchaseOrder({
        supplierId: selectedSupplierId,
        items: selectedItems
      });

      if (success) {
        setModalOpen(false);
        alert('Purchase Order drafted successfully! Reloading...');
        window.location.reload();
      }
    });
  };

  const getStatusStyle = (status: POStatus) => {
    switch (status) {
      case 'RECEIVED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'APPROVED':
        return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'SENT':
        return 'bg-indigo-50 text-indigo-700 border-indigo-100';
      default:
        return 'bg-slate-100 text-slate-500 border-slate-200';
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-headline text-2xl font-bold text-slate-900 font-headline">Purchase Orders</h2>
          <p className="text-xs text-slate-400 font-semibold">Draft supply requisitions, send purchase approvals, and receive stock.</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-xs font-bold hover:opacity-90 shadow-lg shadow-primary/20 transition-all active:scale-95 cursor-pointer"
        >
          <span className="material-symbols-outlined text-base">receipt_long</span>
          Draft Purchase Order
        </button>
      </div>

      {/* PO Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">PO Number</th>
                <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Supplier Vendor</th>
                <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Date Issued</th>
                <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Total Bill</th>
                <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Billing Branch</th>
                <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">PO Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-slate-800">{o.id.toUpperCase()}</td>
                  <td className="px-4 py-4 font-bold text-slate-800">{o.supplierName}</td>
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
                        onChange={(e) => handleStatusChange(o.id, e.target.value as POStatus)}
                      >
                        <option value="DRAFT">DRAFT</option>
                        <option value="SENT">SENT</option>
                        <option value="APPROVED">APPROVED</option>
                        <option value="RECEIVED">RECEIVED</option>
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

      {/* Draft PO Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-xl w-full max-h-[90vh] overflow-y-auto border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-headline text-base font-bold text-slate-900">Draft Purchase Order</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleSubmitPO} className="p-6 flex flex-col gap-4 text-xs">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Select Supplier Partner</label>
                <select
                  className="border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
                  value={selectedSupplierId}
                  onChange={(e) => setSelectedSupplierId(e.target.value)}
                >
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              {/* Add Draft Item Sub-form */}
              <div className="border border-slate-100 bg-slate-50 p-4 rounded-xl space-y-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Add Item To Order Sheet</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase">Product</label>
                    <select
                      className="border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white cursor-pointer outline-none text-xs"
                      value={addProdId}
                      onChange={(e) => {
                        setAddProdId(e.target.value);
                        const prod = products.find(p => p.id === e.target.value);
                        if (prod) setAddPrice(prod.purchasePrice);
                      }}
                    >
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name} (SKU: {p.sku})</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase">Quantity</label>
                    <input
                      type="number"
                      min={1}
                      className="border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white outline-none text-xs"
                      value={addQty}
                      onChange={(e) => setAddQty(parseInt(e.target.value || '1'))}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase">Purchase Cost (₹)</label>
                    <div className="flex gap-1.5">
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        className="border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white outline-none text-xs flex-1"
                        value={addPrice}
                        onChange={(e) => setAddPrice(parseFloat(e.target.value || '0'))}
                      />
                      <button
                        type="button"
                        onClick={handleAddDraftItem}
                        className="px-3 bg-primary text-white font-bold rounded-lg hover:bg-secondary active:scale-95 transition-all text-xs"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items List in current PO draft */}
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Requisition Items List</p>
                <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                  {selectedItems.map((item, idx) => {
                    const prod = products.find(p => p.id === item.productId);
                    return (
                      <div key={idx} className="flex justify-between items-center bg-white border border-slate-200 p-2.5 rounded-lg shadow-sm">
                        <div>
                          <p className="font-bold text-slate-800">{prod?.name || 'Product'}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{item.quantity} units x ₹{item.unitPrice}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-slate-800">₹{(item.quantity * item.unitPrice).toFixed(2)}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveDraftItem(item.productId)}
                            className="text-slate-400 hover:text-rose-500"
                          >
                            <span className="material-symbols-outlined text-sm">delete</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  {selectedItems.length === 0 && (
                    <p className="text-center text-slate-400 italic py-4">No items added to draft list.</p>
                  )}
                </div>
              </div>

              {/* Grand Total */}
              <div className="border-t border-slate-100 pt-3 flex justify-between items-center text-sm font-bold mt-2">
                <span className="text-slate-800">Grand Total Cost</span>
                <span className="text-primary">
                  ₹{selectedItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0).toFixed(2)}
                </span>
              </div>

              <div className="border-t border-slate-100 mt-4 pt-4 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
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
                  Submit Requisition
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Dialog */}
      {activeOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-headline text-base font-bold text-slate-900">Purchase Order Details</h3>
              <button onClick={() => setActiveOrder(null)} className="text-slate-400 hover:text-slate-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 space-y-4 text-xs text-slate-600">
              <div className="grid grid-cols-2 gap-4 pb-3 border-b border-slate-100">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Supplier Vendor</p>
                  <p className="font-bold text-slate-800 mt-0.5">{activeOrder.supplierName}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Receiving Branch</p>
                  <p className="font-bold text-slate-800 mt-0.5">{activeOrder.branchName}</p>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Requisitioned Items</p>
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
                <span className="text-slate-800">Total Purchase Cost</span>
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
