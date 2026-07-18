'use client';

import React, { useState, useTransition } from 'react';
import { AIInsightMetrics, executeAICommand } from '@/actions/ai';

interface AIClientProps {
  insights: AIInsightMetrics;
}

export function AIClient({ insights }: AIClientProps) {
  const [command, setCommand] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [listening, setListening] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim()) return;
    
    startTransition(async () => {
      const res = await executeAICommand(command);
      setResponse(res);
    });
  };

  const handleVoiceSimulate = () => {
    setListening(true);
    setResponse(null);
    const mockPrompts = [
      "Show me low stock predictions",
      "Which customer accounts are at risk?",
      "What are the purchase recommendations?",
      "Give me today's sales and revenue metrics"
    ];
    const chosen = mockPrompts[Math.floor(Math.random() * mockPrompts.length)];
    
    setTimeout(() => {
      setCommand(chosen);
      setListening(false);
      startTransition(async () => {
        const res = await executeAICommand(chosen);
        setResponse(res);
      });
    }, 1800);
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
        <h2 className="font-headline text-2xl font-bold text-slate-900 font-headline">AI Insight Engine</h2>
        <p className="text-xs text-slate-400 font-semibold">Automated machine learning analysis on sales, outstanding collections, and supply demands.</p>
      </div>

      {/* Voice Prompt Interactive Interface */}
      <div className="bg-gradient-to-br from-primary to-indigo-800 p-6 rounded-3xl text-white shadow-xl shadow-primary/10 flex flex-col gap-4 relative overflow-hidden">
        {/* Listening Animation */}
        {listening && (
          <div className="absolute inset-0 bg-black/40 z-20 flex flex-col items-center justify-center gap-2">
            <div className="flex gap-1 items-center">
              <span className="w-1.5 h-6 bg-white rounded-full animate-[bounce_0.8s_infinite_100ms]" />
              <span className="w-1.5 h-10 bg-white rounded-full animate-[bounce_0.8s_infinite_200ms]" />
              <span className="w-1.5 h-8 bg-white rounded-full animate-[bounce_0.8s_infinite_300ms]" />
              <span className="w-1.5 h-4 bg-white rounded-full animate-[bounce_0.8s_infinite_400ms]" />
            </div>
            <p className="text-xs font-bold font-headline uppercase tracking-wider">Listening to voice query...</p>
          </div>
        )}

        <div className="flex justify-between items-start">
          <div className="p-3 bg-white/10 rounded-xl backdrop-blur-md flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              smart_toy
            </span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2.5 py-1 rounded-full">
            BizFlow AI Prompt
          </span>
        </div>

        <form onSubmit={handleCommandSubmit} className="flex gap-2 relative z-10 mt-3">
          <button
            type="button"
            onClick={handleVoiceSimulate}
            className="p-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-2xl flex items-center justify-center transition-all shrink-0 hover:scale-95 active:scale-90"
            title="Simulate Voice Command"
          >
            <span className="material-symbols-outlined text-xl">mic</span>
          </button>
          <input
            className="flex-1 bg-white border-none rounded-2xl px-4 py-3 text-slate-800 placeholder-slate-400 outline-none text-xs focus:ring-2 focus:ring-white/30 font-medium"
            placeholder="Type operations commands (e.g. sales report, low stock predictions, recommendations)..."
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
          />
          <button
            type="submit"
            disabled={isPending}
            className="px-6 bg-white text-primary font-bold rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer text-xs"
          >
            {isPending ? 'Executing...' : 'Run Query'}
          </button>
        </form>

        {/* AI Output Stream */}
        {response && (
          <div className="mt-4 p-4 bg-white/10 border border-white/15 rounded-2xl text-xs leading-relaxed relative z-10 font-medium text-slate-100 flex items-start gap-3">
            <span className="material-symbols-outlined text-emerald-300">chat_bubble</span>
            <p>{response}</p>
          </div>
        )}
      </div>

      {/* Grid: Health Dial, Stock Predictions, CRM Payment Dues */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Health Score radial dial */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between items-center text-center">
          <h4 className="font-headline text-sm font-bold text-slate-800 uppercase tracking-wider mb-2">Business Health Index</h4>
          
          <div className="relative w-36 h-36 flex items-center justify-center">
            {/* SVG radial ring */}
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="72" cy="72" r="60" stroke="#f1f5f9" strokeWidth="10" fill="transparent" />
              <circle 
                cx="72" 
                cy="72" 
                r="60" 
                stroke="var(--color-primary)" 
                strokeWidth="10" 
                fill="transparent" 
                strokeDasharray="376.8" 
                strokeDashoffset={376.8 - (376.8 * insights.healthScore) / 100} 
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-3xl font-extrabold text-slate-800">{insights.healthScore}</span>
              <span className="text-[9px] text-slate-400 font-bold uppercase">Optimal</span>
            </div>
          </div>
          
          <p className="text-xs text-slate-500 leading-relaxed mt-4">
            Operations output is healthy. Stock ratios, client ledgers, and cash balances align with targets.
          </p>
        </div>

        {/* Low Stock Predictions */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4">
          <h4 className="font-headline text-sm font-bold text-slate-800 uppercase tracking-wider">Stock-Out Predictions</h4>
          <div className="flex flex-col gap-3 flex-1 overflow-y-auto max-h-48 custom-scrollbar">
            {insights.lowStockPredictions.map((pred, idx) => (
              <div key={idx} className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex gap-3 items-start">
                <span className="material-symbols-outlined text-rose-500 text-lg mt-0.5">warning</span>
                <div>
                  <p className="text-xs font-bold text-rose-800 leading-snug">{pred.name}</p>
                  <p className="text-[9px] text-rose-400 font-bold uppercase leading-snug mt-0.5">
                    Est. Out in {pred.daysLeft} Days
                  </p>
                  <p className="text-[10px] text-rose-600 mt-1 leading-snug">{pred.recommendation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CRM Due Insights */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4">
          <h4 className="font-headline text-sm font-bold text-slate-800 uppercase tracking-wider">CRM Collection Dues</h4>
          <div className="flex flex-col gap-3 flex-1 overflow-y-auto max-h-48 custom-scrollbar">
            {insights.pendingPaymentInsights.map((due, idx) => (
              <div key={idx} className="p-3 bg-amber-50 border border-amber-100 rounded-xl flex gap-3 items-start">
                <span className="material-symbols-outlined text-amber-600 text-lg mt-0.5">hourglass_empty</span>
                <div>
                  <p className="text-xs font-bold text-amber-800 leading-snug">{due.customerName}</p>
                  <p className="text-[9px] text-amber-500 font-bold uppercase leading-snug mt-0.5">
                    Risk: {due.riskLevel} • Due: {formatCurrency(due.outstanding)}
                  </p>
                  <p className="text-[10px] text-amber-600 mt-1 leading-snug">{due.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grid: Purchase suggestions, sales trends, risk board */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Purchase Suggestions */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4">
          <h4 className="font-headline text-sm font-bold text-slate-800 uppercase tracking-wider">Supplier Procurement Recommendations</h4>
          <div className="space-y-3">
            {insights.purchaseRecommendations.map((rec, idx) => (
              <div key={idx} className="p-3 border border-slate-100 rounded-xl flex gap-3 items-center justify-between">
                <div>
                  <p className="font-bold text-slate-800 text-xs">{rec.productName}</p>
                  <p className="text-[9px] text-slate-400 mt-0.5">Order {rec.qty} units from {rec.supplierName}</p>
                  <p className="text-[10px] text-slate-500 mt-1">{rec.reason}</p>
                </div>
                <button 
                  onClick={() => alert(`Drafted PO for ${rec.qty}x ${rec.productName} in approval center.`)}
                  className="px-3 py-1.5 bg-primary/10 hover:bg-primary hover:text-white text-primary rounded-lg text-[10px] font-bold uppercase transition-all shrink-0"
                >
                  Draft PO
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Customer credit risks */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4">
          <h4 className="font-headline text-sm font-bold text-slate-800 uppercase tracking-wider">Dues Collection Account Risks</h4>
          <div className="space-y-3">
            {insights.customerRiskDetection.map((risk, idx) => (
              <div key={idx} className="p-3 border border-slate-100 rounded-xl flex gap-3 items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 text-xs">{risk.name}</span>
                    <span className="bg-rose-50 border border-rose-100 text-[8px] px-1.5 py-0.5 rounded font-bold text-rose-600">
                      {risk.riskType}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1 leading-snug">{risk.text}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Risk Score</p>
                  <p className="font-extrabold text-rose-600 text-sm mt-0.5">{risk.score}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
