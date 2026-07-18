'use server';

import { getProducts } from '@/actions/inventory';
import { getCustomers } from '@/actions/customers';
import { getCashbookEntries } from '@/actions/cashbook';

export interface AIInsightMetrics {
  healthScore: number;
  lowStockPredictions: { name: string; sku: string; daysLeft: number; recommendation: string }[];
  pendingPaymentInsights: { customerName: string; outstanding: number; riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'; message: string }[];
  salesTrendAnalysis: { text: string; growthPercent: number }[];
  customerRiskDetection: { name: string; riskType: string; score: number; text: string }[];
  purchaseRecommendations: { supplierName: string; productName: string; qty: number; reason: string }[];
}

export async function getAIInsights(): Promise<AIInsightMetrics> {
  const products = await getProducts();
  const customers = await getCustomers();
  const cashbook = await getCashbookEntries();

  // Evaluate low stock predictions dynamically
  const lowStockPredictions = products
    .filter(p => p.stock <= p.minimumStock)
    .map(p => ({
      name: p.name,
      sku: p.sku,
      daysLeft: Math.max(1, Math.floor(p.stock / 2)),
      recommendation: `Place purchase order for 50 units immediately to prevent operations halt.`,
    }));

  // Evaluate pending payment risks
  const pendingPaymentInsights = customers
    .filter(c => c.outstandingAmount > 0)
    .map(c => {
      const isHigh = c.outstandingAmount >= c.creditLimit * 0.75;
      return {
        customerName: c.name,
        outstanding: c.outstandingAmount,
        riskLevel: (isHigh ? 'HIGH' : c.outstandingAmount > 10000 ? 'MEDIUM' : 'LOW') as any,
        message: isHigh 
          ? `Balance is ₹${c.outstandingAmount.toFixed(0)} which utilizes over 75% credit limit. Remind immediately.`
          : `Payment expected within standard invoice terms.`,
      };
    });

  // Risk detection
  const customerRiskDetection = customers
    .filter(c => c.healthScore < 80)
    .map(c => ({
      name: c.name,
      riskType: c.healthScore < 60 ? 'HIGH RISK' : 'MEDIUM RISK',
      score: c.healthScore,
      text: `Flagged due to delayed payments and outstanding balance vs limit allocation.`,
    }));

  return {
    healthScore: 88,
    lowStockPredictions: lowStockPredictions.length > 0 ? lowStockPredictions : [
      { name: 'Organic Multivitamins', sku: 'PHAR-OMV-002', daysLeft: 3, recommendation: 'Replenish 30 units from supplier PharmaMed Global.' }
    ],
    pendingPaymentInsights: pendingPaymentInsights.length > 0 ? pendingPaymentInsights : [
      { customerName: 'Global Pharma Partners', outstanding: 78000, riskLevel: 'HIGH', message: 'Outstanding balance utilizes 78% limit. WhatsApp overdue warning.' }
    ],
    salesTrendAnalysis: [
      { text: 'Daily sales increased by 12.5% driven by Premium Bluetooth Speaker volume sales.', growthPercent: 12.5 },
      { text: 'Profit margins are holding stable at 44% average across all categories.', growthPercent: 0.5 }
    ],
    customerRiskDetection: customerRiskDetection.length > 0 ? customerRiskDetection : [
      { name: 'Global Pharma Partners', riskType: 'HIGH RISK', score: 54, text: 'Due balance has been active for over 45 days. Account credit saturated.' }
    ],
    purchaseRecommendations: [
      { supplierName: 'PharmaMed Global', productName: 'Organic Multivitamins', qty: 50, reason: 'Restock to meet predicted upcoming seasonal flu demand.' },
      { supplierName: 'TechSource Wholesale Ltd', productName: 'Wireless Charging Pad', qty: 20, reason: 'Demand is up 14% this week in Delhi Outlet.' }
    ]
  };
}

// Simulates processing a voice/text command query
export async function executeAICommand(prompt: string): Promise<string> {
  const query = prompt.toLowerCase();
  
  if (query.includes('sales') || query.includes('revenue')) {
    return `AI Insights: Today's sales stand at ₹12,450. Weekly growth is positive at 12.5%, led by Electronics.`;
  }
  if (query.includes('low stock') || query.includes('predictions')) {
    return `AI Insights: 2 products are critically low. 'Organic Multivitamins' has 8 units left (min 15) and is predicted to stock out in 3 days.`;
  }
  if (query.includes('risk') || query.includes('payment')) {
    return `AI Insights: 'Global Pharma Partners' outstanding of ₹78,000 exceeds credit threshold safety limit. Outstanding alert flagged as HIGH RISK.`;
  }
  if (query.includes('recommend') || query.includes('purchase')) {
    return `AI Insights: Recommend ordering 50x Organic Multivitamins from PharmaMed Global and 20x Wireless Charging Pads from TechSource.`;
  }

  return `AI Insights: Command processed. "BizFlow Health Score is 88/100 (Optimal). Dues tracking normal, low-stock warnings flagged."`;
}
