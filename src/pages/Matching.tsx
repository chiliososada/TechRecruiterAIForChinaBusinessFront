
import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Users } from 'lucide-react';
import { CaseToCandidate } from '@/components/matching/CaseToCandidate';
import { CandidateToCase } from '@/components/matching/CandidateToCase';
import { toast } from '@/hooks/use-toast';

export function Matching() {
  // Common state
  const [activeTab, setActiveTab] = useState<"case-to-candidate" | "candidate-to-case">("case-to-candidate");

  return (
    <MainLayout>
      <div className="flex-1 space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight japanese-text">案件とのマッチング</h2>
        </div>

        <Tabs defaultValue="case-to-candidate" value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
          <TabsList className="mb-4">
            <TabsTrigger value="case-to-candidate" className="japanese-text">
              <FileText className="mr-2 h-4 w-4" />
              案件から人材を探す
            </TabsTrigger>
            <TabsTrigger value="candidate-to-case" className="japanese-text">
              <Users className="mr-2 h-4 w-4" />
              人材に合う案件を探す
            </TabsTrigger>
          </TabsList>
          
          {/* Case to Candidate Tab */}
          <TabsContent value="case-to-candidate">
            <CaseToCandidate />
          </TabsContent>
          
          {/* Candidate to Case Tab */}
          <TabsContent value="candidate-to-case">
            <CandidateToCase />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}

export default Matching;
