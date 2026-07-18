import { Role, OrderStatus, POStatus, TransferStatus, MovementType, CashbookType, CashbookCategory, AttendanceStatus, TaskStatus } from '@prisma/client';

// Simple in-memory mock database that falls back to seed data
export interface MockDbState {
  branches: any[];
  users: any[];
  categories: any[];
  products: any[];
  stockMovements: any[];
  customers: any[];
  customerLedgers: any[];
  customerTimelineEvents: any[];
  suppliers: any[];
  purchaseOrders: any[];
  salesOrders: any[];
  invoices: any[];
  cashbookEntries: any[];
  auditLogs: any[];
  stockTransfers: any[];
  staff: any[];
  attendance: any[];
  tasks: any[];
}

let mockDbState: MockDbState | null = null;

export function getMockDb(): MockDbState {
  if (mockDbState) return mockDbState;

  // Initialize with seed data
  const branches = [
    { id: "branch-1", name: "Main HQ (Mumbai)", location: "Bandra Kurla Complex, Mumbai", code: "BR-HQ", status: "ACTIVE", createdAt: new Date(), updatedAt: new Date() },
    { id: "branch-2", name: "Delhi Outlet", location: "Connaught Place, New Delhi", code: "BR-DEL", status: "ACTIVE", createdAt: new Date(), updatedAt: new Date() },
    { id: "branch-3", name: "Bengaluru Warehouse", location: "Whitefield, Bengaluru", code: "BR-BLR", status: "ACTIVE", createdAt: new Date(), updatedAt: new Date() },
  ];

  const users = [
    { id: "user-1", clerkId: "mock-user-123", email: "owner@bizflow.com", name: "Owner User (Mock)", role: "OWNER" as Role, branchId: "branch-1", createdAt: new Date(), updatedAt: new Date() },
    { id: "user-2", clerkId: "user-admin", email: "admin@bizflow.com", name: "Super Admin User", role: "SUPER_ADMIN" as Role, branchId: "branch-1", createdAt: new Date(), updatedAt: new Date() },
    { id: "user-3", clerkId: "user-inventory", email: "inventory@bizflow.com", name: "Ramesh Kumar (Inventory)", role: "INVENTORY_STAFF" as Role, branchId: "branch-3", createdAt: new Date(), updatedAt: new Date() },
    { id: "user-4", clerkId: "user-accountant", email: "accountant@bizflow.com", name: "Sanjay Mehta (Accountant)", role: "ACCOUNTANT" as Role, branchId: "branch-1", createdAt: new Date(), updatedAt: new Date() },
  ];

  const categories = [
    { id: "cat-1", name: "Electronics", description: "Phones, Speakers, Chargers and Accessories", createdAt: new Date(), updatedAt: new Date() },
    { id: "cat-2", name: "Pharma & Wellness", description: "Medicines, Vaccines, and Health supplements", createdAt: new Date(), updatedAt: new Date() },
    { id: "cat-3", name: "Hardware Tools", description: "Industrial hammers, drills, and components", createdAt: new Date(), updatedAt: new Date() },
    { id: "cat-4", name: "Fast-Moving Goods", description: "Groceries, daily essentials, and packaged foods", createdAt: new Date(), updatedAt: new Date() },
  ];

  const suppliers = [
    { id: "sup-1", name: "TechSource Wholesale Ltd", contactPerson: "John Smith", phone: "9812345678", email: "john@techsource.com", address: "Industrial Area, Pune", gstNumber: "27AAACT1234A1Z1", outstandingAmount: 6400.0, performanceRating: 4.8, createdAt: new Date(), updatedAt: new Date() },
    { id: "sup-2", name: "PharmaMed Global", contactPerson: "Dr. Sarah Patel", phone: "9823456789", email: "orders@pharmamed.com", address: "Special Economic Zone, Ahmedabad", gstNumber: "24AAACP4567B2Z2", outstandingAmount: 18000.0, performanceRating: 4.2, createdAt: new Date(), updatedAt: new Date() },
    { id: "sup-3", name: "Industrial Toolmakers Corp", contactPerson: "David Vance", phone: "9834567890", email: "david@toolmakers.com", address: "GIDC Industrial Estate, Rajkot", gstNumber: "24AAAIT7890C3Z3", outstandingAmount: 0.0, performanceRating: 3.9, createdAt: new Date(), updatedAt: new Date() },
  ];

  const products = [
    { id: "prod-1", sku: "ELEC-BTS-001", name: "Premium Bluetooth Speaker", description: "Waterproof outdoor speaker with 20h battery life", barcode: "8901234567890", purchasePrice: 45.0, sellingPrice: 79.99, stock: 120, minimumStock: 20, categoryId: "cat-1", supplierId: "sup-1", branchId: "branch-1", createdAt: new Date(), updatedAt: new Date() },
    { id: "prod-2", sku: "PHAR-OMV-002", name: "Organic Multivitamins", description: "60-capsule bottles for daily immune health support", barcode: "8901234567891", purchasePrice: 12.5, sellingPrice: 24.99, stock: 8, minimumStock: 15, categoryId: "cat-2", supplierId: "sup-2", branchId: "branch-1", createdAt: new Date(), updatedAt: new Date() },
    { id: "prod-3", sku: "ELEC-WCP-003", name: "Wireless Charging Pad", description: "15W fast-charging qi-enabled magnetic pad", barcode: "8901234567892", purchasePrice: 8.0, sellingPrice: 19.99, stock: 4, minimumStock: 10, categoryId: "cat-1", supplierId: "sup-1", branchId: "branch-2", createdAt: new Date(), updatedAt: new Date() },
    { id: "prod-4", sku: "HARD-HDH-004", name: "Heavy-Duty Claw Hammer", description: "Forged steel hammer with ergonomic grip", barcode: "8901234567893", purchasePrice: 15.0, sellingPrice: 29.99, stock: 45, minimumStock: 10, categoryId: "cat-3", supplierId: "sup-3", branchId: "branch-3", createdAt: new Date(), updatedAt: new Date() },
    { id: "prod-5", sku: "PHAR-CFR-005", name: "Cold & Flu Relief Tablet", description: "Pack of 10 rapid-action relief caplets", barcode: "8901234567894", purchasePrice: 2.5, sellingPrice: 5.99, stock: 250, minimumStock: 50, categoryId: "cat-2", supplierId: "sup-2", branchId: "branch-3", createdAt: new Date(), updatedAt: new Date() },
  ];

  const stockMovements = [
    { id: "mv-1", productId: "prod-1", type: "IN" as MovementType, quantity: 150, sourceBranchId: null, targetBranchId: "branch-1", userId: "user-1", reason: "Initial import batch", timestamp: new Date() },
    { id: "mv-2", productId: "prod-1", type: "OUT" as MovementType, quantity: 30, sourceBranchId: "branch-1", targetBranchId: null, userId: "user-1", reason: "Sales POS order #1001", timestamp: new Date() },
    { id: "mv-3", productId: "prod-2", type: "IN" as MovementType, quantity: 15, sourceBranchId: null, targetBranchId: "branch-1", userId: "user-1", reason: "Supplier delivery", timestamp: new Date() },
    { id: "mv-4", productId: "prod-2", type: "OUT" as MovementType, quantity: 7, sourceBranchId: "branch-1", targetBranchId: null, userId: "user-1", reason: "Store checkout", timestamp: new Date() },
  ];

  const customers = [
    { id: "cust-1", name: "Acme Distributors", phone: "9876543210", email: "info@acme.com", address: "Commercial Center, Sector 15, Navi Mumbai", gstNumber: "27AAAAC1234D1Z4", creditLimit: 50000.0, outstandingAmount: 12500.0, healthScore: 92.0, createdAt: new Date(), updatedAt: new Date() },
    { id: "cust-2", name: "Apex Retail Solutions", phone: "8765432109", email: "billing@apex.com", address: "Connaught Place, Block C, New Delhi", gstNumber: "07AAAAP4567E2Z5", creditLimit: 25000.0, outstandingAmount: 4300.0, healthScore: 85.0, createdAt: new Date(), updatedAt: new Date() },
    { id: "cust-3", name: "Global Pharma Partners", phone: "7654321098", email: "procurement@globalpharma.com", address: "Electronic City, Phase 1, Bengaluru", gstNumber: "29AAAAG7890F3Z6", creditLimit: 100000.0, outstandingAmount: 78000.0, healthScore: 54.0, createdAt: new Date(), updatedAt: new Date() },
  ];

  const customerLedgers = [
    { id: "ldg-1", customerId: "cust-1", type: "DEBIT", amount: 25000.0, description: "Invoice #INV-2026-001", timestamp: new Date(), referenceId: "so-1002" },
    { id: "ldg-2", customerId: "cust-1", type: "CREDIT", amount: 12500.0, description: "Bank Transfer Payment received", timestamp: new Date(), referenceId: null },
    { id: "ldg-3", customerId: "cust-3", type: "DEBIT", amount: 78000.0, description: "Bulk vaccine order invoice #INV-2026-002", timestamp: new Date(), referenceId: "so-1003" },
  ];

  const customerTimelineEvents = [
    { id: "evt-1", customerId: "cust-1", type: "ORDER", title: "Large order confirmed", description: "Sales Order #SO-1002 totaling $25,000", timestamp: new Date() },
    { id: "evt-2", customerId: "cust-1", type: "PAYMENT", title: "Partial payment received", description: "Paid $12,500 via RTGS transfer", timestamp: new Date() },
    { id: "evt-3", customerId: "cust-1", type: "WHATSAPP", title: "Payment Reminder Sent", description: "Auto-reminder for outstanding balance sent to contact person", timestamp: new Date() },
    { id: "evt-4", customerId: "cust-3", type: "WHATSAPP", title: "Credit Over-Limit Warning", description: "Notified accounting that client balance exceeds 75% limit", timestamp: new Date() },
  ];

  const cashbookEntries = [
    { id: "cb-1", type: "CASH_IN" as CashbookType, category: "SALES" as CashbookCategory, amount: 45000.0, description: "Daily counter sales summary", branchId: "branch-1", userId: "user-1", timestamp: new Date() },
    { id: "cb-2", type: "CASH_OUT" as CashbookType, category: "SALARY" as CashbookCategory, amount: 12000.0, description: "Salary payout (cash advances)", branchId: "branch-1", userId: "user-1", timestamp: new Date() },
    { id: "cb-3", type: "CASH_OUT" as CashbookType, category: "UTILITIES" as CashbookCategory, amount: 3200.0, description: "Electricity bill Payment", branchId: "branch-2", userId: "user-1", timestamp: new Date() },
    { id: "cb-4", type: "CASH_IN" as CashbookType, category: "SALES" as CashbookCategory, amount: 8900.0, description: "POS Register checkout sales", branchId: "branch-3", userId: "user-3", timestamp: new Date() },
  ];

  const staff = [
    { id: "staff-1", name: "Rajesh Kumar", role: "Warehouse Manager", phone: "9123456789", salary: 35000.0, createdAt: new Date(), updatedAt: new Date() },
    { id: "staff-2", name: "Priya Sharma", role: "Sales Executive", phone: "8123456790", salary: 28000.0, createdAt: new Date(), updatedAt: new Date() },
    { id: "staff-3", name: "Amit Patel", role: "Inventory Operator", phone: "7123456791", salary: 22000.0, createdAt: new Date(), updatedAt: new Date() },
  ];

  const attendance = [
    { id: "att-1", staffId: "staff-1", date: new Date(), clockIn: new Date(new Date().setHours(9,0,0)), clockOut: new Date(new Date().setHours(18,0,0)), status: "PRESENT" as AttendanceStatus },
    { id: "att-2", staffId: "staff-2", date: new Date(), clockIn: new Date(new Date().setHours(9,45,0)), clockOut: new Date(new Date().setHours(18,0,0)), status: "LATE" as AttendanceStatus },
    { id: "att-3", staffId: "staff-3", date: new Date(), clockIn: new Date(new Date().setHours(9,0,0)), clockOut: null, status: "PRESENT" as AttendanceStatus },
  ];

  const tasks = [
    { id: "task-1", staffId: "staff-1", title: "Reorganize Section C Shelves", description: "Arrange newly received hardware hammers and items in order.", status: "IN_PROGRESS" as TaskStatus, dueDate: new Date(Date.now() + 86400000 * 2), assigneeId: "user-1", creatorId: "user-1", createdAt: new Date(), updatedAt: new Date() },
    { id: "task-2", staffId: "staff-3", title: "Audit Low Stock Multivitamins", description: "Verify the actual physical stock of vitamins matches database count of 8.", status: "TODO" as TaskStatus, dueDate: new Date(Date.now() + 86400000), assigneeId: null, creatorId: "user-1", createdAt: new Date(), updatedAt: new Date() },
  ];

  const purchaseOrders = [
    {
      id: "po-1",
      supplierId: "sup-1",
      branchId: "branch-1",
      status: "APPROVED" as POStatus,
      totalAmount: 1800.0,
      creatorId: "user-1",
      createdAt: new Date(Date.now() - 86400000 * 3),
      updatedAt: new Date(Date.now() - 86400000 * 3),
      items: [
        { id: "poi-1", productId: "prod-1", quantity: 40, unitPrice: 45.0 }
      ]
    }
  ];

  const salesOrders = [
    {
      id: "so-1",
      customerId: "cust-1",
      branchId: "branch-1",
      status: "DELIVERED" as OrderStatus,
      totalAmount: 2399.7,
      creatorId: "user-1",
      createdAt: new Date(Date.now() - 86400000 * 2),
      updatedAt: new Date(Date.now() - 86400000 * 2),
      items: [
        { id: "soi-1", productId: "prod-1", quantity: 30, unitPrice: 79.99 }
      ]
    }
  ];

  const invoices = [
    { id: "inv-1", salesOrderId: "so-1", invoiceNumber: "INV-2026-001", amount: 2399.7, taxAmount: 120.0, status: "PAID", dueDate: new Date(), createdAt: new Date(), updatedAt: new Date() }
  ];

  const auditLogs = [
    { id: "log-1", userId: "user-1", action: "INITIAL_SEED", entityName: "DATABASE", entityId: "system", branchId: "branch-1", reason: "Initialize platform demo workspace seed data.", timestamp: new Date() }
  ];

  const stockTransfers = [
    {
      id: "tr-1",
      sourceBranchId: "branch-1",
      targetBranchId: "branch-2",
      status: "RECEIVED" as TransferStatus,
      creatorId: "user-1",
      approverId: "user-1",
      createdAt: new Date(Date.now() - 86400000 * 5),
      updatedAt: new Date(Date.now() - 86400000 * 5),
      items: [
        { id: "tri-1", productId: "prod-1", quantity: 10 }
      ]
    }
  ];

  mockDbState = {
    branches,
    users,
    categories,
    products,
    stockMovements,
    customers,
    customerLedgers,
    customerTimelineEvents,
    suppliers,
    purchaseOrders,
    salesOrders,
    invoices,
    cashbookEntries,
    auditLogs,
    stockTransfers,
    staff,
    attendance,
    tasks
  };

  return mockDbState;
}

// Helper to save a change in memory
export function updateMockDb(updater: (db: MockDbState) => void) {
  const db = getMockDb();
  updater(db);
}
