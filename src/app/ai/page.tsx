import React from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { AIClient } from '@/components/ai/ai-client';
import { getAIInsights } from '@/actions/ai';

export default async function AIPage() {
  const insights = await getAIInsights();

  return (
    <MainLayout>
      <AIClient insights={insights} />
    </MainLayout>
  );
}
