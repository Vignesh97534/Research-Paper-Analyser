export interface PaperMetadata {
  title: string;
  authors: string[];
  year: string;
  arxivIdOrVenue: string;
  field: string;
}

export interface CoreConceptExtraction {
  problemStatement: string;
  primaryMethodology: string;
  mathematicalAlgorithmicBreakthroughs: string;
  plainLanguageAnalogy: string;
  fullSummaryUnder300Words: string;
  wordCount: number;
  isUnder300Words?: boolean;
}

export interface FlowchartNodeDescription {
  id: string;
  label: string;
  role: 'input' | 'layer' | 'breakthrough' | 'output' | 'loss' | 'other';
}

export interface ArchitecturalFlowchart {
  mermaidCode: string;
  rawTextSegment: string;
  nodesDescription?: FlowchartNodeDescription[];
}

export interface StudentOpportunity {
  id: number;
  projectTitle: string;
  exactExtension: string;
  targetedPerformanceMetric: string;
  recommendedTechStack: string[];
  resumeBulletPoint: string;
  implementationRoadmap: string[];
  starterBoilerplate?: string;
}

export interface OperationalConstraintsReport {
  tokenEfficiencyStrategy: string;
  wordCountCompliant: boolean;
  mermaidValid: boolean;
}

export interface PaperAnalysisData {
  paperMetadata: PaperMetadata;
  coreConceptExtraction: CoreConceptExtraction;
  architecturalFlowchart: ArchitecturalFlowchart;
  studentOpportunities: StudentOpportunity[];
  agentVerbatimText: string;
  operationalConstraintsReport?: OperationalConstraintsReport;
}

export interface TokenMetrics {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  tokenLimit: number;
  tokenBudgetPercent: number;
  isCompliant: boolean;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface AnalysisResponse {
  success: boolean;
  data: PaperAnalysisData;
  tokenMetrics: TokenMetrics;
  searchSources?: GroundingSource[];
  error?: string;
}

export interface ArxivSearchResult {
  id: string;
  arxivId: string;
  title: string;
  summary: string;
  authors: string[];
  published: string;
  link: string;
}
