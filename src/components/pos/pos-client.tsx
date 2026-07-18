'use client';

import React, { useState, useTransition } from 'react';
import { ProductData } from '@/actions/inventory';
import { useCartStore } from '@/store/use-cart-store';
import { processPOSCheckout } from '@/actions/pos';

interface POSClientProps {
  products: ProductData[];
  customers: any[];
}

export function POSClient({ products: initialProducts, customers }: POSClientProps) {
  const [productsList, setProductsList] = useState<ProductData[]>(initialProducts);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Zustand Cart Store
  const { 
    cartItems, 
    selectedCustomerId, 
    selectedCustomerName, 
    discount, 
    paymentMethod,
    addItem, 
    removeItem, 
    updateQuantity, 
    setCustomer, 
    setDiscount, 
    setPaymentMethod,
    clearCart 
  } = useCartStore();

  const [isPending, startTransition] = useTransition();

  // Autocomplete state
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerDropdownOpen, setCustomerDropdownOpen] = useState(false);

  // Scanner animation state
  const [scannerActive, setScannerActive] = useState(false);

  // Invoice output modal
  const [invoiceModal, setInvoiceModal] = useState<{
    open: boolean;
    invoiceNumber: string;
    total: number;
    paymentMethod: string;
    items: any[];
    customerName: string;
  } | null>(null);

  // Filter products by search
  const filteredProducts = productsList.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.quantity * item.product.sellingPrice), 0);
  const gst = subtotal * 0.18;
  const total = subtotal + gst - discount;

  // Simulate scanning
  const handleScannerTrigger = () => {
    setScannerActive(true);
    setTimeout(() => {
      setScannerActive(false);
      // Pick a random product with stock to scan
      const availableProds = productsList.filter(p => p.stock > 0);
      if (availableProds.length > 0) {
        const randProd = availableProds[Math.floor(Math.random() * availableProds.length)];
        addItem(randProd);
        // Alert sound or message
        console.log(`Scanned barcode: ${randProd.barcode}`);
      }
    }, 1200);
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      alert('Your cart is empty.');
      return;
    }
    if (!selectedCustomerId) {
      alert('Please select or add a customer to the bill.');
      return;
    }

    startTransition(async () => {
      const checkoutItems = cartItems.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
        unitPrice: item.product.sellingPrice
      }));

      const res = await processPOSCheckout({
        customerId: selectedCustomerId,
        items: checkoutItems,
        discount,
        paymentMethod
      });

      if (res.success && res.invoiceNumber) {
        // Adjust client-side local product stock count
        const updatedProds = productsList.map(p => {
          const cartItem = cartItems.find(item => item.product.id === p.id);
          if (cartItem) {
            return { ...p, stock: Math.max(0, p.stock - cartItem.quantity) };
          }
          return p;
        });
        setProductsList(updatedProds);

        // Open Invoice print-out preview modal
        setInvoiceModal({
          open: true,
          invoiceNumber: res.invoiceNumber,
          total: res.total || total,
          paymentMethod,
          items: [...cartItems],
          customerName: selectedCustomerName || 'Retail Customer'
        });

        // Clear cart
        clearCart();
      } else {
        alert(res.error || 'Failed to complete checkout.');
      }
    });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-[calc(100vh-160px)]">
      {/* Left Area: Product Catalogue */}
      <section className="flex-[3] flex flex-col gap-6">
        {/* Header Tools */}
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div>
            <h2 className="font-headline text-2xl font-bold text-slate-900 font-headline">Point of Sale</h2>
            <p className="text-xs text-slate-400 font-semibold">Select products and checkout order billing.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleScannerTrigger}
              className="flex items-center gap-2 px-4 py-2 border-2 border-primary/20 bg-primary/5 text-primary rounded-xl text-xs font-bold hover:bg-primary hover:text-white transition-all shadow-sm"
            >
              <span className="material-symbols-outlined text-sm">qr_code_scanner</span>
              Simulate Scan (Ctrl+F)
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
            search
          </span>
          <input
            className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none focus:border-primary transition-all shadow-sm"
            placeholder="Search products by barcode, SKU, name..."
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 overflow-y-auto max-h-[60vh] custom-scrollbar pr-1">
          {filteredProducts.map((p) => {
            const isOut = p.stock === 0;
            const isLow = p.stock > 0 && p.stock <= p.minimumStock;

            return (
              <div
                key={p.id}
                onClick={() => !isOut && addItem(p)}
                className={`bg-white border rounded-2xl p-4 flex flex-col gap-3 justify-between cursor-pointer transition-all shadow-sm hover:shadow-md hover:border-primary/40 relative group ${
                  isOut ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {/* Stock Indicator */}
                <span className={`absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold ${
                  isOut ? 'bg-slate-100 text-slate-500' :
                  isLow ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-600'
                }`}>
                  {isOut ? 'Out of Stock' : isLow ? `Low Stock: ${p.stock}` : `In Stock: ${p.stock}`}
                </span>

                <div className="flex flex-col gap-1 pt-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100 text-slate-400 mb-2">
                    <span className="material-symbols-outlined text-xl">package_2</span>
                  </div>
                  <p className="text-sm font-bold text-slate-800 truncate leading-snug">{p.name}</p>
                  <p className="text-[10px] text-slate-400 font-mono">{p.sku}</p>
                </div>

                <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-50">
                  <p className="text-sm font-bold text-primary">₹{p.sellingPrice.toFixed(2)}</p>
                  {isOut ? (
                    <button className="px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-400 text-xs font-semibold" disabled>
                      Out
                    </button>
                  ) : (
                    <button className="px-2.5 py-1.5 rounded-lg bg-slate-50 group-hover:bg-primary group-hover:text-white text-slate-600 text-xs font-semibold transition-colors flex items-center gap-0.5">
                      <span className="material-symbols-outlined text-xs">add</span>
                      Add
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Right Panel: Checkout Billing summary */}
      <section className="flex-[2] bg-white border border-slate-200 rounded-3xl flex flex-col overflow-hidden shadow-xl max-w-md w-full shrink-0">
        {/* Customer Search & Order ID */}
        <div className="p-6 border-b border-slate-200 bg-slate-50/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-headline text-lg font-bold text-slate-800">Current Order</h3>
            <span className="bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded font-mono font-bold">
              ID: POS-{Date.now().toString().slice(-5)}
            </span>
          </div>

          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
              person_add
            </span>
            <input
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-primary/20 outline-none focus:border-primary transition-all font-medium"
              placeholder="Search or add customer..."
              type="text"
              value={customerSearch}
              onFocus={() => setCustomerDropdownOpen(true)}
              onChange={(e) => {
                setCustomerSearch(e.target.value);
                setCustomerDropdownOpen(true);
              }}
            />

            {/* Selected customer badge */}
            {selectedCustomerId && (
              <div className="mt-2.5 flex items-center justify-between bg-primary/5 border border-primary/20 rounded-lg px-3 py-1.5">
                <span className="text-xs font-bold text-primary">Active Customer: {selectedCustomerName}</span>
                <button 
                  onClick={() => {
                    setCustomer(null, null);
                    setCustomerSearch('');
                  }}
                  className="text-primary hover:text-rose-500"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>
            )}

            {/* Dropdown Auto Complete list */}
            {customerDropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setCustomerDropdownOpen(false)} />
                <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto py-1">
                  {customers
                    .filter(c => c.name.toLowerCase().includes(customerSearch.toLowerCase()))
                    .map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        className="w-full text-left px-4 py-2 text-xs hover:bg-slate-50 transition-colors flex justify-between items-center"
                        onClick={() => {
                          setCustomer(c.id, c.name);
                          setCustomerSearch(c.name);
                          setCustomerDropdownOpen(false);
                        }}
                      >
                        <span className="font-semibold text-slate-800">{c.name}</span>
                        <span className="text-[10px] text-slate-400">{c.phone}</span>
                      </button>
                    ))}
                  {customers.filter(c => c.name.toLowerCase().includes(customerSearch.toLowerCase())).length === 0 && (
                    <p className="px-4 py-2 text-xs text-slate-400 italic">No customers found.</p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Cart Item list */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4 max-h-[30vh]">
          {cartItems.map((item) => (
            <div key={item.product.id} className="flex items-center gap-4 group pb-3 border-b border-slate-50 last:border-b-0 last:pb-0">
              <div className="w-10 h-10 rounded-lg bg-slate-50 shrink-0 border border-slate-100 flex items-center justify-center text-slate-400">
                <span className="material-symbols-outlined">package</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-800 truncate">{item.product.name}</p>
                <p className="text-[9px] text-slate-400 uppercase font-mono">{item.product.sku}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                  <button 
                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                    className="px-2 py-1 hover:bg-slate-200 transition-colors"
                  >
                    <span className="material-symbols-outlined text-xs">remove</span>
                  </button>
                  <span className="px-2 text-xs font-bold text-slate-700 min-w-4 text-center">
                    {item.quantity.toString().padStart(2, '0')}
                  </span>
                  <button 
                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                    className="px-2 py-1 hover:bg-slate-200 transition-colors"
                  >
                    <span className="material-symbols-outlined text-xs">add</span>
                  </button>
                </div>
                <p className="text-xs font-bold text-slate-800 w-16 text-right">
                  ₹{(item.quantity * item.product.sellingPrice).toFixed(2)}
                </p>
                <button 
                  onClick={() => removeItem(item.product.id)}
                  className="text-slate-400 hover:text-rose-500 transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">delete</span>
                </button>
              </div>
            </div>
          ))}
          {cartItems.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 py-12 gap-2">
              <span className="material-symbols-outlined text-4xl">shopping_cart</span>
              <p className="text-xs font-medium">Checkout list is empty.</p>
            </div>
          )}
        </div>

        {/* Totals & Payment Checkout */}
        <div className="p-6 border-t border-slate-200 space-y-4 bg-slate-50/20">
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Subtotal</span>
              <span className="font-semibold text-slate-700">₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">GST (18%)</span>
              <span className="font-semibold text-slate-700">₹{gst.toFixed(2)}</span>
            </div>
            
            {/* Discount field */}
            <div className="flex justify-between items-center text-xs text-emerald-600">
              <span>Discount</span>
              <div className="flex items-center gap-1">
                <span>- ₹</span>
                <input
                  type="number"
                  min={0}
                  className="w-16 bg-white border border-slate-200 rounded px-1.5 py-0.5 text-xs text-right outline-none focus:ring-1 focus:ring-emerald-500 font-bold"
                  value={discount}
                  onChange={(e) => setDiscount(parseFloat(e.target.value || '0'))}
                />
              </div>
            </div>

            <div className="flex justify-between text-base font-bold border-t border-slate-200 pt-2 mt-2">
              <span className="text-slate-800">Total</span>
              <span className="text-primary text-lg">₹{total.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Method selectors */}
          <div className="grid grid-cols-3 gap-2">
            {(['CASH', 'CARD', 'UPI'] as const).map((method) => {
              const isSel = paymentMethod === method;
              return (
                <button
                  key={method}
                  type="button"
                  className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 transition-all hover:scale-95 ${
                    isSel
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-transparent bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                  onClick={() => setPaymentMethod(method)}
                >
                  <span className="material-symbols-outlined text-lg">
                    {method === 'CASH' ? 'payments' : method === 'CARD' ? 'credit_card' : 'qr_code_2'}
                  </span>
                  <span className="text-[9px] font-bold uppercase">{method}</span>
                </button>
              );
            })}
          </div>

          {/* Checkout Submit Trigger */}
          <button
            onClick={handleCheckout}
            disabled={isPending || cartItems.length === 0}
            className="w-full bg-primary text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:hover:scale-100 cursor-pointer text-sm"
          >
            {isPending ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                PROCESS BILLING
                <span className="material-symbols-outlined text-base">chevron_right</span>
              </>
            )}
          </button>
        </div>
      </section>

      {/* Barcode scanning animation overlay */}
      {scannerActive && (
        <div className="fixed inset-0 bg-black/30 z-[100] flex flex-col items-center justify-center gap-4">
          <div className="w-72 h-44 border-2 border-dashed border-white rounded-2xl relative flex items-center justify-center bg-black/60 shadow-2xl">
            <span className="material-symbols-outlined text-4xl text-white animate-pulse">qr_code_scanner</span>
            <div className="absolute left-0 right-0 h-1 bg-red-500 animate-[scan_1.5s_infinite]" />
          </div>
          <p className="text-white font-bold text-sm tracking-wide bg-black/40 px-4 py-2 rounded-full">
            Scanning for barcodes...
          </p>
        </div>
      )}

      {/* Invoice Output Template Modal */}
      {invoiceModal?.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-primary px-6 py-8 text-white flex flex-col items-center gap-1 text-center">
              <span className="material-symbols-outlined text-4xl text-emerald-300">check_circle</span>
              <h4 className="font-headline text-lg font-bold mt-2">Billing Invoice Generated</h4>
              <p className="text-xs text-slate-100">Invoice Number: {invoiceModal.invoiceNumber}</p>
            </div>
            
            {/* Invoice Bill Body */}
            <div className="p-6 flex-1 space-y-4 text-xs text-slate-600">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <div>
                  <p className="font-bold text-slate-800">BizFlow Retail POS</p>
                  <p className="text-[10px] text-slate-400">HQ Mumbai, Bandra BKC</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-800">Customer</p>
                  <p className="text-[10px] text-slate-400">{invoiceModal.customerName}</p>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                {invoiceModal.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-800 truncate">{item.product.name}</p>
                      <p className="text-[9px] text-slate-400">{item.quantity} x ₹{item.product.sellingPrice}</p>
                    </div>
                    <span className="font-bold text-slate-800">₹{(item.quantity * item.product.sellingPrice).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Total Summary */}
              <div className="pt-3 border-t border-slate-100 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Net Amount</span>
                  <span className="font-bold text-slate-800">₹{invoiceModal.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Payment Mode</span>
                  <span className="font-bold text-slate-800 uppercase">{invoiceModal.paymentMethod}</span>
                </div>
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Invoice Status</span>
                  <span>PAID</span>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3">
              <button
                onClick={() => {
                  window.print();
                }}
                className="flex-1 py-3 border border-slate-200 hover:border-primary hover:bg-white rounded-xl text-xs font-bold text-slate-700 flex items-center justify-center gap-1.5 transition-colors"
              >
                <span className="material-symbols-outlined text-sm">print</span>
                Print Invoice
              </button>
              <button
                onClick={() => setInvoiceModal(null)}
                className="flex-1 py-3 bg-primary text-white rounded-xl text-xs font-bold hover:opacity-90 flex items-center justify-center gap-1.5 transition-all shadow-md shadow-primary/10"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
