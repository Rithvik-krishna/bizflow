import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clean existing database
  await prisma.task.deleteMany({});
  await prisma.attendance.deleteMany({});
  await prisma.staff.deleteMany({});
  await prisma.stockTransferItem.deleteMany({});
  await prisma.stockTransfer.deleteMany({});
  await prisma.auditLog.deleteMany({});
  await prisma.cashbookEntry.deleteMany({});
  await prisma.invoice.deleteMany({});
  await prisma.salesOrderItem.deleteMany({});
  await prisma.salesOrder.deleteMany({});
  await prisma.purchaseOrderItem.deleteMany({});
  await prisma.purchaseOrder.deleteMany({});
  await prisma.customerTimelineEvent.deleteMany({});
  await prisma.customerLedger.deleteMany({});
  await prisma.customer.deleteMany({});
  await prisma.stockMovement.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.supplier.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.branch.deleteMany({});

  // 1. Create Branches
  const brHq = await prisma.branch.create({
    data: {
      name: "Main HQ (Mumbai)",
      location: "Bandra Kurla Complex, Mumbai",
      code: "BR-HQ",
      status: "ACTIVE",
    },
  });

  const brDel = await prisma.branch.create({
    data: {
      name: "Delhi Outlet",
      location: "Connaught Place, New Delhi",
      code: "BR-DEL",
      status: "ACTIVE",
    },
  });

  const brBlr = await prisma.branch.create({
    data: {
      name: "Bengaluru Warehouse",
      location: "Whitefield, Bengaluru",
      code: "BR-BLR",
      status: "ACTIVE",
    },
  });

  console.log("Created branches.");

  // 2. Create Seed User (linked to mock-user-123)
  const seedUser = await prisma.user.create({
    data: {
      clerkId: "mock-user-123",
      email: "owner@bizflow.com",
      name: "Owner User (Mock)",
      role: "OWNER",
      branchId: brHq.id,
    },
  });

  // Create additional users
  const adminUser = await prisma.user.create({
    data: {
      clerkId: "user-admin",
      email: "admin@bizflow.com",
      name: "Super Admin User",
      role: "SUPER_ADMIN",
      branchId: brHq.id,
    },
  });

  const inventoryStaff = await prisma.user.create({
    data: {
      clerkId: "user-inventory",
      email: "inventory@bizflow.com",
      name: "Ramesh Kumar (Inventory)",
      role: "INVENTORY_STAFF",
      branchId: brBlr.id,
    },
  });

  const accountant = await prisma.user.create({
    data: {
      clerkId: "user-accountant",
      email: "accountant@bizflow.com",
      name: "Sanjay Mehta (Accountant)",
      role: "ACCOUNTANT",
      branchId: brHq.id,
    },
  });

  console.log("Created users.");

  // 3. Create Categories
  const catElectronics = await prisma.category.create({
    data: { name: "Electronics", description: "Phones, Speakers, Chargers and Accessories" },
  });

  const catPharma = await prisma.category.create({
    data: { name: "Pharma & Wellness", description: "Medicines, Vaccines, and Health supplements" },
  });

  const catHardware = await prisma.category.create({
    data: { name: "Hardware Tools", description: "Industrial hammers, drills, and components" },
  });

  const catFmcg = await prisma.category.create({
    data: { name: "Fast-Moving Goods", description: "Groceries, daily essentials, and packaged foods" },
  });

  console.log("Created categories.");

  // 4. Create Suppliers
  const supTechSource = await prisma.supplier.create({
    data: {
      name: "TechSource Wholesale Ltd",
      contactPerson: "John Smith",
      phone: "9812345678",
      email: "john@techsource.com",
      address: "Industrial Area, Pune",
      gstNumber: "27AAACT1234A1Z1",
      outstandingAmount: 6400.0,
      performanceRating: 4.8,
    },
  });

  const supPharmaMed = await prisma.supplier.create({
    data: {
      name: "PharmaMed Global",
      contactPerson: "Dr. Sarah Patel",
      phone: "9823456789",
      email: "orders@pharmamed.com",
      address: "Special Economic Zone, Ahmedabad",
      gstNumber: "24AAACP4567B2Z2",
      outstandingAmount: 18000.0,
      performanceRating: 4.2,
    },
  });

  const supIndustrialTools = await prisma.supplier.create({
    data: {
      name: "Industrial Toolmakers Corp",
      contactPerson: "David Vance",
      phone: "9834567890",
      email: "david@toolmakers.com",
      address: "GIDC Industrial Estate, Rajkot",
      gstNumber: "24AAAIT7890C3Z3",
      outstandingAmount: 0.0,
      performanceRating: 3.9,
    },
  });

  console.log("Created suppliers.");

  // 5. Create Products
  const prodSpeaker = await prisma.product.create({
    data: {
      sku: "ELEC-BTS-001",
      name: "Premium Bluetooth Speaker",
      description: "Waterproof outdoor speaker with 20h battery life",
      barcode: "8901234567890",
      purchasePrice: 45.0,
      sellingPrice: 79.99,
      stock: 120,
      minimumStock: 20,
      categoryId: catElectronics.id,
      supplierId: supTechSource.id,
      branchId: brHq.id,
    },
  });

  const prodMultivitamin = await prisma.product.create({
    data: {
      sku: "PHAR-OMV-002",
      name: "Organic Multivitamins",
      description: "60-capsule bottles for daily immune health support",
      barcode: "8901234567891",
      purchasePrice: 12.5,
      sellingPrice: 24.99,
      stock: 8,
      minimumStock: 15, // LOW STOCK!
      categoryId: catPharma.id,
      supplierId: supPharmaMed.id,
      branchId: brHq.id,
    },
  });

  const prodCharger = await prisma.product.create({
    data: {
      sku: "ELEC-WCP-003",
      name: "Wireless Charging Pad",
      description: "15W fast-charging qi-enabled magnetic pad",
      barcode: "8901234567892",
      purchasePrice: 8.0,
      sellingPrice: 19.99,
      stock: 4,
      minimumStock: 10, // LOW STOCK!
      categoryId: catElectronics.id,
      supplierId: supTechSource.id,
      branchId: brDel.id,
    },
  });

  const prodHammer = await prisma.product.create({
    data: {
      sku: "HARD-HDH-004",
      name: "Heavy-Duty Claw Hammer",
      description: "Forged steel hammer with ergonomic grip",
      barcode: "8901234567893",
      purchasePrice: 15.0,
      sellingPrice: 29.99,
      stock: 45,
      minimumStock: 10,
      categoryId: catHardware.id,
      supplierId: supIndustrialTools.id,
      branchId: brBlr.id,
    },
  });

  const prodFluTablet = await prisma.product.create({
    data: {
      sku: "PHAR-CFR-005",
      name: "Cold & Flu Relief Tablet",
      description: "Pack of 10 rapid-action relief caplets",
      barcode: "8901234567894",
      purchasePrice: 2.5,
      sellingPrice: 5.99,
      stock: 250,
      minimumStock: 50,
      categoryId: catPharma.id,
      supplierId: supPharmaMed.id,
      branchId: brBlr.id,
    },
  });

  console.log("Created products.");

  // 6. Create Stock Movements
  await prisma.stockMovement.createMany({
    data: [
      {
        productId: prodSpeaker.id,
        type: "IN",
        quantity: 150,
        targetBranchId: brHq.id,
        userId: seedUser.id,
        reason: "Initial import batch",
      },
      {
        productId: prodSpeaker.id,
        type: "OUT",
        quantity: 30,
        sourceBranchId: brHq.id,
        userId: seedUser.id,
        reason: "Sales POS order #1001",
      },
      {
        productId: prodMultivitamin.id,
        type: "IN",
        quantity: 15,
        targetBranchId: brHq.id,
        userId: seedUser.id,
        reason: "Supplier delivery",
      },
      {
        productId: prodMultivitamin.id,
        type: "OUT",
        quantity: 7,
        sourceBranchId: brHq.id,
        userId: seedUser.id,
        reason: "Store checkout",
      },
    ],
  });

  console.log("Created stock movements.");

  // 7. Create Customers
  const custAcme = await prisma.customer.create({
    data: {
      name: "Acme Distributors",
      phone: "9876543210",
      email: "info@acme.com",
      address: "Commercial Center, Sector 15, Navi Mumbai",
      gstNumber: "27AAAAC1234D1Z4",
      creditLimit: 50000.0,
      outstandingAmount: 12500.0,
      healthScore: 92.0,
    },
  });

  const custApex = await prisma.customer.create({
    data: {
      name: "Apex Retail Solutions",
      phone: "8765432109",
      email: "billing@apex.com",
      address: "Connaught Place, Block C, New Delhi",
      gstNumber: "07AAAAP4567E2Z5",
      creditLimit: 25000.0,
      outstandingAmount: 4300.0,
      healthScore: 85.0,
    },
  });

  const custGlobalPharma = await prisma.customer.create({
    data: {
      name: "Global Pharma Partners",
      phone: "7654321098",
      email: "procurement@globalpharma.com",
      address: "Electronic City, Phase 1, Bengaluru",
      gstNumber: "29AAAAG7890F3Z6",
      creditLimit: 100000.0,
      outstandingAmount: 78000.0, // HIGH OUTSTANDING AMOUNT!
      healthScore: 54.0, // LOW HEALTH SCORE - CUSTOMER RISK DETECTED
    },
  });

  console.log("Created customers.");

  // 8. Create Customer Ledgers & Timeline Events
  await prisma.customerLedger.createMany({
    data: [
      {
        customerId: custAcme.id,
        type: "DEBIT",
        amount: 25000.0,
        description: "Invoice #INV-2026-001",
      },
      {
        customerId: custAcme.id,
        type: "CREDIT",
        amount: 12500.0,
        description: "Bank Transfer Payment received",
      },
      {
        customerId: custGlobalPharma.id,
        type: "DEBIT",
        amount: 78000.0,
        description: "Bulk vaccine order invoice #INV-2026-002",
      },
    ],
  });

  await prisma.customerTimelineEvent.createMany({
    data: [
      {
        customerId: custAcme.id,
        type: "ORDER",
        title: "Large order confirmed",
        description: "Sales Order #SO-1002 totaling $25,000",
      },
      {
        customerId: custAcme.id,
        type: "PAYMENT",
        title: "Partial payment received",
        description: "Paid $12,500 via RTGS transfer",
      },
      {
        customerId: custAcme.id,
        type: "WHATSAPP",
        title: "Payment Reminder Sent",
        description: "Auto-reminder for outstanding balance sent to contact person",
      },
      {
        customerId: custGlobalPharma.id,
        type: "WHATSAPP",
        title: "Credit Over-Limit Warning",
        description: "Notified accounting that client balance exceeds 75% limit",
      },
    ],
  });

  console.log("Created customer ledger and timeline records.");

  // 9. Create Cashbook Entries
  await prisma.cashbookEntry.createMany({
    data: [
      {
        type: "CASH_IN",
        category: "SALES",
        amount: 45000.0,
        description: "Daily counter sales summary",
        branchId: brHq.id,
        userId: seedUser.id,
      },
      {
        type: "CASH_OUT",
        category: "SALARY",
        amount: 12000.0,
        description: "Salary payout (cash advances)",
        branchId: brHq.id,
        userId: seedUser.id,
      },
      {
        type: "CASH_OUT",
        category: "UTILITIES",
        amount: 3200.0,
        description: "Electricity bill Payment",
        branchId: brDel.id,
        userId: seedUser.id,
      },
      {
        type: "CASH_IN",
        category: "SALES",
        amount: 8900.0,
        description: "POS Register checkout sales",
        branchId: brBlr.id,
        userId: inventoryStaff.id,
      },
    ],
  });

  console.log("Created cashbook entries.");

  // 10. Create Staff, Attendances, and Tasks
  const staffRajesh = await prisma.staff.create({
    data: {
      name: "Rajesh Kumar",
      phone: "9123456789",
      role: "Warehouse Manager",
      salary: 35000.0,
    },
  });

  const staffPriya = await prisma.staff.create({
    data: {
      name: "Priya Sharma",
      phone: "8123456790",
      role: "Sales Executive",
      salary: 28000.0,
    },
  });

  const staffAmit = await prisma.staff.create({
    data: {
      name: "Amit Patel",
      phone: "7123456791",
      role: "Inventory Operator",
      salary: 22000.0,
    },
  });

  await prisma.attendance.createMany({
    data: [
      {
        staffId: staffRajesh.id,
        date: new Date("2026-07-16"),
        clockIn: new Date("2026-07-16T09:00:00Z"),
        clockOut: new Date("2026-07-16T18:00:00Z"),
        status: "PRESENT",
      },
      {
        staffId: staffRajesh.id,
        date: new Date("2026-07-17"),
        clockIn: new Date("2026-07-17T09:05:00Z"),
        clockOut: new Date("2026-07-17T18:00:00Z"),
        status: "PRESENT",
      },
      {
        staffId: staffPriya.id,
        date: new Date("2026-07-17"),
        clockIn: new Date("2026-07-17T09:45:00Z"), // Late!
        clockOut: new Date("2026-07-17T18:00:00Z"),
        status: "LATE",
      },
      {
        staffId: staffAmit.id,
        date: new Date("2026-07-17"),
        clockIn: new Date("2026-07-17T09:00:00Z"),
        clockOut: undefined, // Still active or missed clockout
        status: "PRESENT",
      },
    ],
  });

  await prisma.task.createMany({
    data: [
      {
        staffId: staffRajesh.id,
        title: "Reorganize Section C Shelves",
        description: "Arrange newly received hardware hammers and items in order.",
        status: "IN_PROGRESS",
        dueDate: new Date("2026-07-20"),
        creatorId: seedUser.id,
      },
      {
        staffId: staffAmit.id,
        title: "Audit Low Stock Multivitamins",
        description: "Verify the actual physical stock of vitamins matches database count of 8.",
        status: "TODO",
        dueDate: new Date("2026-07-19"),
        creatorId: seedUser.id,
      },
    ],
  });

  console.log("Created staff, attendances, and tasks.");

  // 11. Create Audit Logs
  await prisma.auditLog.createMany({
    data: [
      {
        userId: seedUser.id,
        action: "INITIAL_SEED",
        entityName: "DATABASE",
        entityId: "system",
        branchId: brHq.id,
        reason: "Initialize platform demo workspace seed data.",
      },
      {
        userId: seedUser.id,
        action: "UPDATE_PRODUCT",
        entityName: "Product",
        entityId: prodMultivitamin.id,
        branchId: brHq.id,
        reason: "Adjusted minimum alert stock threshold from 10 to 15.",
      },
    ],
  });

  console.log("Created initial audit logs.");

  console.log("Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Seeding failed: ", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
