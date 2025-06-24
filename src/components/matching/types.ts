
export interface EnhancedMatchingResult {
  id: number | string;
  caseId: number | string;
  candidateId: number | string;
  caseName: string;
  candidateName: string;
  matchingRate: string; // e.g. "85%"
  matchingReason: string;
  caseCompany?: string;
  candidateCompany?: string;
  caseManager?: string; // Added case manager property
  caseManagerEmail?: string; // Added case manager email property
  affiliationManager?: string; // Added affiliation manager property
  affiliationManagerEmail?: string; // Added affiliation manager email property
  memo?: string;
  recommendationComment?: string; // Added recommendation comment property
}

export interface CaseDetailItem {
  id: number | string;
  title: string;
  client: string;
  skills: string[];
  experience: string;
  budget: string;
  description: string;
  detailDescription: string;
  manager?: string; // Added manager property
}

export interface CandidateItem {
  id: string;
  name: string;
  skills: string | string[];
  companyType?: string;
  companyName?: string;
  source?: string;
  nationality?: string;
  age?: string;
  gender?: string;
  experience?: string;
  japaneseLevel?: string;
  availability?: string;
  status?: string[];
  nearestStation?: string;
  managerName?: string;
  managerEmail?: string;
}
