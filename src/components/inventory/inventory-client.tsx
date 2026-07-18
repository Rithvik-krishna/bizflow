'use client';

import React, { useState, useTransition } from 'react';
import { ProductData, addProduct, editProduct, deleteProduct, importProductsCSV } from '@/actions/inventory';

interface InventoryClientProps {
  initialProducts: ProductData[];
  categories: any[];
  suppliers: any[];
}

export function InventoryClient({ initialProducts, categories, suppliers }: InventoryClientProps) {
  const [products, setProducts] = useState<ProductData[]>(initialProducts);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedStatus, setSelectedStatus] = useState('Stock Status');
  const [selectedSupplier, setSelectedSupplier] = useState('All Suppliers');

  const [isPending, startTransition] = useTransition();

  // Modals state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [activeProduct, setActiveProduct] = useState<ProductData | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    description: '',
    barcode: '',
    purchasePrice: 0,
    sellingPrice: 0,
    stock: 0,
    minimumStock: 10,
    categoryId: categories[0]?.id || '',
    supplierId: suppliers[0]?.id || '',
  });

  const [csvText, setCsvText] = useState('');

  // Handle filter changes
  const applyFilters = async (
    qSearch: string,
    cat: string,
    stat: string,
    sup: string
  ) => {
    // Client-side quick filter representing database queries
    let filtered = [...initialProducts];

    if (cat && cat !== 'All Categories') {
      filtered = filtered.filter((p) => p.categoryId === cat || p.categoryName === cat);
    }
    if (sup && sup !== 'All Suppliers') {
      filtered = filtered.filter((p) => p.supplierId === sup || p.supplierName === sup);
    }
    if (qSearch) {
      const q = qSearch.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          (p.barcode && p.barcode.includes(q))
      );
    }
    if (stat && stat !== 'Stock Status') {
      if (stat === 'Low Stock') {
        filtered = filtered.filter((p) => p.stock > 0 && p.stock <= p.minimumStock);
      } else if (stat === 'Out of Stock') {
        filtered = filtered.filter((p) => p.stock === 0);
      } else if (stat === 'In Stock') {
        filtered = filtered.filter((p) => p.stock > p.minimumStock);
      }
    }

    setProducts(filtered);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const success = await addProduct(formData);
      if (success) {
        setAddModalOpen(false);
        // Refresh local view mock update
        const updated = [...products, {
          ...formData,
          id: `prod-${Date.now()}`,
          categoryName: categories.find(c => c.id === formData.categoryId)?.name || 'General',
          supplierName: suppliers.find(s => s.id === formData.supplierId)?.name || 'N/A',
          branchId: 'branch-1',
          branchName: 'Main HQ (Mumbai)',
          updatedAt: new Date().toLocaleDateString()
        } as any];
        setProducts(updated);
        alert('Product added successfully!');
      }
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProduct) return;
    startTransition(async () => {
      const success = await editProduct(activeProduct.id, formData);
      if (success) {
        setEditModalOpen(false);
        const updated = products.map((p) =>
          p.id === activeProduct.id
            ? ({
                ...p,
                ...formData,
                categoryName: categories.find(c => c.id === formData.categoryId)?.name || p.categoryName,
                supplierName: suppliers.find(s => s.id === formData.supplierId)?.name || p.supplierName,
              } as any)
            : p
        );
        setProducts(updated);
        alert('Product updated successfully!');
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    startTransition(async () => {
      const success = await deleteProduct(id);
      if (success) {
        setProducts(products.filter((p) => p.id !== id));
        alert('Product deleted successfully!');
      }
    });
  };

  const handleImportCSV = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const success = await importProductsCSV(csvText);
      if (success) {
        setImportModalOpen(false);
        alert('Products imported successfully! Reloading...');
        window.location.reload();
      } else {
        alert('Failed to parse CSV. Please ensure correct header columns.');
      }
    });
  };

  // CSV Export
  const triggerCSVExport = () => {
    const headers = ['SKU', 'Name', 'Category', 'Purchase Price', 'Selling Price', 'Stock', 'Supplier'];
    const rows = products.map(p => [
      p.sku,
      p.name,
      p.categoryName,
      p.purchasePrice,
      p.sellingPrice,
      p.stock,
      p.supplierName
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `BizFlow_Products_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openEditModal = (product: ProductData) => {
    setActiveProduct(product);
    setFormData({
      sku: product.sku,
      name: product.name,
      description: product.description || '',
      barcode: product.barcode || '',
      purchasePrice: product.purchasePrice,
      sellingPrice: product.sellingPrice,
      stock: product.stock,
      minimumStock: product.minimumStock,
      categoryId: product.categoryId,
      supplierId: product.supplierId || '',
    });
    setEditModalOpen(true);
  };

  const openAddModal = () => {
    setFormData({
      sku: '',
      name: '',
      description: '',
      barcode: '',
      purchasePrice: 0,
      sellingPrice: 0,
      stock: 0,
      minimumStock: 5,
      categoryId: categories[0]?.id || '',
      supplierId: suppliers[0]?.id || '',
    });
    setAddModalOpen(true);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-headline text-2xl font-bold text-slate-900">Inventory Catalog</h2>
          <nav className="flex text-xs text-slate-400 mt-1 gap-2">
            <span>Operations</span>
            <span>/</span>
            <span className="text-primary font-bold">Inventory Management</span>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setImportModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold hover:bg-slate-50 hover:border-primary transition-all"
          >
            <span className="material-symbols-outlined text-lg">upload</span>
            Import CSV
          </button>
          <button 
            onClick={triggerCSVExport}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold hover:bg-slate-50 hover:border-primary transition-all"
          >
            <span className="material-symbols-outlined text-lg">download</span>
            Export CSV
          </button>
          <button 
            onClick={openAddModal}
            className="flex items-center gap-2 px-5 py-2 bg-primary text-white rounded-xl text-xs font-semibold hover:opacity-90 shadow-lg shadow-primary/20 transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-lg">add</span>
            Add Product
          </button>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-wrap items-center gap-4">
        {/* Search */}
        <div className="relative w-full max-w-xs">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
            search
          </span>
          <input
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs focus:ring-2 focus:ring-primary/20 outline-none focus:bg-white transition-all"
            placeholder="Search SKU, name..."
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              applyFilters(e.target.value, selectedCategory, selectedStatus, selectedSupplier);
            }}
          />
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl min-w-[180px]">
          <span className="material-symbols-outlined text-slate-400 text-lg">filter_alt</span>
          <select
            className="bg-transparent border-none text-xs font-semibold text-slate-600 focus:ring-0 w-full cursor-pointer outline-none"
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              applyFilters(search, e.target.value, selectedStatus, selectedSupplier);
            }}
          >
            <option value="All Categories">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl min-w-[150px]">
          <span className="material-symbols-outlined text-slate-400 text-lg">signal_cellular_alt</span>
          <select
            className="bg-transparent border-none text-xs font-semibold text-slate-600 focus:ring-0 w-full cursor-pointer outline-none"
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              applyFilters(search, selectedCategory, e.target.value, selectedSupplier);
            }}
          >
            <option value="Stock Status">Stock Status</option>
            <option value="In Stock">In Stock</option>
            <option value="Low Stock">Low Stock</option>
            <option value="Out of Stock">Out of Stock</option>
          </select>
        </div>

        {/* Supplier Filter */}
        <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl min-w-[180px]">
          <span className="material-symbols-outlined text-slate-400 text-lg">local_shipping</span>
          <select
            className="bg-transparent border-none text-xs font-semibold text-slate-600 focus:ring-0 w-full cursor-pointer outline-none"
            value={selectedSupplier}
            onChange={(e) => {
              setSelectedSupplier(e.target.value);
              applyFilters(search, selectedCategory, selectedStatus, e.target.value);
            }}
          >
            <option value="All Suppliers">All Suppliers</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div className="ml-auto">
          <p className="text-xs text-slate-400">
            Showing <strong className="text-slate-800">{products.length}</strong> products
          </p>
        </div>
      </div>

      {/* High Density Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Product</th>
                <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">SKU</th>
                <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Category</th>
                <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Purchase</th>
                <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Selling</th>
                <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Stock</th>
                <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Status</th>
                <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Supplier</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((p) => {
                const isLow = p.stock > 0 && p.stock <= p.minimumStock;
                const isOut = p.stock === 0;

                return (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-slate-100 shrink-0 flex items-center justify-center border border-slate-200 text-slate-400">
                          <span className="material-symbols-outlined">package_2</span>
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-slate-800 text-sm truncate">{p.name}</span>
                          <span className="text-[10px] text-slate-400 font-semibold tracking-wide uppercase">
                            Barcode: {p.barcode || 'N/A'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 font-mono text-xs text-slate-600">{p.sku}</td>
                    <td className="px-4 py-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                        {p.categoryName}
                      </span>
                    </td>
                    <td className="px-4 py-4 font-semibold text-xs text-slate-700">₹{p.purchasePrice}</td>
                    <td className="px-4 py-4 font-bold text-xs text-primary">₹{p.sellingPrice}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold text-sm ${isLow || isOut ? 'text-rose-600' : 'text-slate-800'}`}>
                          {p.stock}
                        </span>
                        {isOut ? (
                          <div className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                        ) : isLow ? (
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        ) : (
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isOut ? 'bg-slate-100 text-slate-500' :
                        isLow ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                        'bg-emerald-50 text-emerald-700 border border-emerald-100'
                      }`}>
                        {isOut ? 'Out of Stock' : isLow ? 'Low Stock' : 'In Stock'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-xs text-slate-600 font-medium truncate max-w-[150px]">
                      {p.supplierName}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button 
                          onClick={() => openEditModal(p)}
                          className="p-1.5 text-slate-400 hover:text-primary hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <span className="material-symbols-outlined text-lg">edit</span>
                        </button>
                        <button 
                          onClick={() => handleDelete(p.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <span className="material-symbols-outlined text-lg">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {products.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-slate-400 text-sm">
                    No products found matching filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add & Edit Modal */}
      {(addModalOpen || editModalOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-headline text-lg font-bold text-slate-900">
                {addModalOpen ? 'Add New Product' : 'Edit Product Details'}
              </h3>
              <button 
                onClick={() => {
                  setAddModalOpen(false);
                  setEditModalOpen(false);
                }} 
                className="text-slate-400 hover:text-slate-600"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={addModalOpen ? handleAddSubmit : handleEditSubmit} className="p-6 flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Product SKU</label>
                  <input
                    required
                    className="border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    placeholder="E.g. ELEC-BTS-001"
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Barcode (EAN/UPC)</label>
                  <input
                    className="border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    placeholder="8901234..."
                    type="text"
                    value={formData.barcode}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Product Name</label>
                <input
                  required
                  className="border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="E.g. Premium Bluetooth Speaker"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Description</label>
                <textarea
                  className="border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all min-h-[60px]"
                  placeholder="Provide specifications or details..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Category</label>
                  <select
                    className="border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Supplier</label>
                  <select
                    className="border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    value={formData.supplierId}
                    onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                  >
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Cost (₹)</label>
                  <input
                    required
                    min={0}
                    type="number"
                    step="0.01"
                    className="border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    value={formData.purchasePrice}
                    onChange={(e) => setFormData({ ...formData, purchasePrice: parseFloat(e.target.value || '0') })}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Price (₹)</label>
                  <input
                    required
                    min={0}
                    type="number"
                    step="0.01"
                    className="border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    value={formData.sellingPrice}
                    onChange={(e) => setFormData({ ...formData, sellingPrice: parseFloat(e.target.value || '0') })}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Stock</label>
                  <input
                    required
                    min={0}
                    type="number"
                    className="border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value || '0') })}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Min Stock</label>
                  <input
                    required
                    min={0}
                    type="number"
                    className="border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    value={formData.minimumStock}
                    onChange={(e) => setFormData({ ...formData, minimumStock: parseInt(e.target.value || '0') })}
                  />
                </div>
              </div>

              <div className="border-t border-slate-100 mt-4 pt-4 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setAddModalOpen(false);
                    setEditModalOpen(false);
                  }}
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
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV Import Modal */}
      {importModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-headline text-lg font-bold text-slate-900">Import Products from CSV</h3>
              <button onClick={() => setImportModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleImportCSV} className="p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Paste CSV Contents</label>
                <p className="text-[10px] text-slate-400 mb-2">
                  Header format: <strong>SKU,Name,CategoryID,PurchasePrice,SellingPrice,Stock,SupplierID</strong>
                </p>
                <textarea
                  required
                  rows={8}
                  className="border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all w-full"
                  placeholder="ELEC-BTS-001,Bluetooth Speaker,cat-1,45.0,79.99,120,sup-1"
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                />
              </div>

              <div className="border-t border-slate-100 mt-4 pt-4 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setImportModalOpen(false)}
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
                  Execute Import
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
