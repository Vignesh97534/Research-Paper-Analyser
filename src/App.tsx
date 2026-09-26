import React, { useState } from 'react';
import {
  Cpu,
  Layers,
  FileText,
  Briefcase,
  Terminal,
  Activity,
  ExternalLink,
  BookOpen,
  Share2,
  Check,
  AlertCircle,
  HelpCircle,
  GraduationCap,
} from 'lucide-react';
import { AnalysisResponse } from './types';
import { PRESET_PAPERS } from './data/presetPapers';
import { PaperInputBar } from './components/PaperInputBar';
import { MermaidViewer } from './components/MermaidViewer';
import { CoreConceptView } from './components/CoreConceptView';
import { StudentProjectsView } from './components/StudentProjectsView';
import { AgentRawOutput } from './components/AgentRawOutput';
import { TokenMonitor } from './components/TokenMonitor';

export default function App() {
  const [activePresetKey, setActivePresetKey] = useState<string>('deepseek-r1');
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisResponse>(PRESET_PAPERS['deepseek-r1']);
  const [activeTab, setActiveTab] = useState<'architecture' | 'core_concept' | 'student_projects' | 'verbatim' | 'monitor'>('architecture');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedShare, setCopiedShare] = useState<boolean>(false);

  // Handle Preset Selection
  const handleSelectPreset = (key: string) => {
    setActivePresetKey(key);
    setErrorMessage(null);
    if (PRESET_PAPERS[key]) {
      setCurrentAnalysis(PRESET_PAPERS[key]);
    }
  };

  // Handle Live Paper Analysis Request
  const handleAnalyze = async (payload: {
    url?: string;
    paperTitle?: string;
    paperText?: string;
    focusArea: string;
    level: string;
  }) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/analyze-paper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to analyze paper');
      }

      setCurrentAnalysis(data);
      setActivePresetKey('');
    } catch (err: any) {
      console.error('Analysis error:', err);
      setErrorMessage(
        err.message || 'An error occurred while connecting to the CS Research Agent. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  const paperData = currentAnalysis?.data;
  const tokenMetrics = currentAnalysis?.tokenMetrics;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/90 px-4 lg:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Logo & Identity */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-600/30 border border-indigo-400/30">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-white">
                  PaperArchitect
                </span>
                <span className="px-2 py-0.5 rounded-full bg-indigo-950 border border-indigo-700/60 text-indigo-300 text-[10px] font-mono font-medium">
                  CS Research Agent v3.8
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                System Architecture Synthesizer &amp; Student Project Engine
              </p>
            </div>
          </div>

          {/* Operational Constraint Status & Actions */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-400">Budget:</span>
              <span className="text-emerald-400 font-semibold">
                {tokenMetrics?.totalTokens?.toLocaleString() || '3,600'} / 25k tokens
              </span>
            </div>

            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-800 hover:bg-slate-850 hover:border-slate-700 rounded-lg text-xs font-medium text-slate-300 transition"
              title="Share Agent Workspace"
            >
              {copiedShare ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copiedShare ? 'Copied Link' : 'Share'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 space-y-6">
        {/* Agent Operational Briefing Callout */}
        <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <GraduationCap className="w-4 h-4" />
            </div>
            <span>
              <strong>CS Research Agent Protocol:</strong> Extracting core breakthroughs (<strong className="text-slate-300">&lt;300 words</strong>), charting system architecture (<strong className="text-slate-300">[FLOWCHART)</strong> in Mermaid.js), and generating <strong className="text-slate-300">3 concrete 3rd-year CS student resume projects</strong> with token efficiency.
            </span>
          </div>

          <div className="flex items-center gap-3 font-mono text-[11px]">
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Token Budget &lt; 25,000
            </span>
            <span className="flex items-center gap-1 text-indigo-400">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
              Web Context Ingestion
            </span>
          </div>
        </div>

        {/* Paper Input & Quick Select Bar */}
        <PaperInputBar
          onAnalyze={handleAnalyze}
          onSelectPreset={handleSelectPreset}
          isLoading={isLoading}
          activePresetKey={activePresetKey}
        />

        {/* Error Notification if any */}
        {errorMessage && (
          <div className="p-4 bg-red-950/80 border border-red-700/80 rounded-xl flex items-start gap-3 text-red-200 text-xs shadow-lg">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Analysis Notice:</p>
              <p className="mt-0.5 text-red-300">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Active Paper Header Banner */}
        {paperData && (
          <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-900/90 to-indigo-950/30 border border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1.5 flex-1 min-w-[280px]">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded bg-indigo-950/80 border border-indigo-700/40 text-indigo-300 text-xs font-mono">
                  {paperData.paperMetadata.arxivIdOrVenue || 'Research Publication'}
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-xs font-mono">
                  {paperData.paperMetadata.year}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {paperData.paperMetadata.field}
                </span>
              </div>

              <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                {paperData.paperMetadata.title}
              </h1>

              <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                <span className="text-slate-500">Authors:</span>
                <span>{paperData.paperMetadata.authors.join(', ')}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <a
                href={
                  paperData.paperMetadata.arxivIdOrVenue.includes('arXiv:')
                    ? `https://arxiv.org/abs/${paperData.paperMetadata.arxivIdOrVenue.replace('arXiv:', '').trim()}`
                    : '#'
                }
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-mono transition"
              >
                <span>Read Original arXiv</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            </div>
          </div>
        )}

        {/* Workspace Tab Navigation */}
        <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-px gap-2">
          <div className="flex flex-wrap items-center gap-1">
            <button
              onClick={() => setActiveTab('architecture')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg text-xs font-medium border-b-2 transition ${
                activeTab === 'architecture'
                  ? 'border-indigo-500 text-white bg-slate-900/60 font-semibold'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
              }`}
            >
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>Step 2: Architecture Flowchart</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300">
                Mermaid.js
              </span>
            </button>

            <button
              onClick={() => setActiveTab('core_concept')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg text-xs font-medium border-b-2 transition ${
                activeTab === 'core_concept'
                  ? 'border-indigo-500 text-white bg-slate-900/60 font-semibold'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
              }`}
            >
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <span>Step 1: Core Concept Extraction</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300">
                &lt; 300 words
              </span>
            </button>

            <button
              onClick={() => setActiveTab('student_projects')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg text-xs font-medium border-b-2 transition ${
                activeTab === 'student_projects'
                  ? 'border-indigo-500 text-white bg-slate-900/60 font-semibold'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
              }`}
            >
              <Briefcase className="w-4 h-4 text-amber-400" />
              <span>Step 3: Student Projects</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-950 text-amber-300">
                3 Ideas
              </span>
            </button>

            <button
              onClick={() => setActiveTab('verbatim')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg text-xs font-medium border-b-2 transition ${
                activeTab === 'verbatim'
                  ? 'border-indigo-500 text-white bg-slate-900/60 font-semibold'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
              }`}
            >
              <FileText className="w-4 h-4 text-slate-400" />
              <span>Verbatim Agent Spec</span>
            </button>
          </div>

          <button
            onClick={() => setActiveTab('monitor')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition border ${
              activeTab === 'monitor'
                ? 'bg-slate-800 border-indigo-500 text-indigo-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-indigo-400" />
            <span>Constraints &amp; Token Gauge</span>
          </button>
        </div>

        {/* Tab Content Panels */}
        {paperData && (
          <div className="space-y-6">
            {activeTab === 'architecture' && (
              <div className="space-y-4">
                <MermaidViewer
                  flowchart={paperData.architecturalFlowchart}
                  paperTitle={paperData.paperMetadata.title}
                />
              </div>
            )}

            {activeTab === 'core_concept' && (
              <CoreConceptView
                concept={paperData.coreConceptExtraction}
                metadata={paperData.paperMetadata}
              />
            )}

            {activeTab === 'student_projects' && (
              <StudentProjectsView
                opportunities={paperData.studentOpportunities}
                paperTitle={paperData.paperMetadata.title}
              />
            )}

            {activeTab === 'verbatim' && (
              <AgentRawOutput data={paperData} />
            )}

            {activeTab === 'monitor' && tokenMetrics && (
              <TokenMonitor
                metrics={tokenMetrics}
                searchSources={currentAnalysis.searchSources}
                isWordCountCompliant={paperData.coreConceptExtraction.wordCount <= 300}
              />
            )}
          </div>
        )}

        {/* Quick FAQ / Guide for Students & Researchers */}
        <div className="mt-12 p-5 bg-slate-900/50 border border-slate-800 rounded-2xl space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
            <HelpCircle className="w-4 h-4 text-indigo-400" />
            <span>How to utilize this for your CS resume &amp; research interviews</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-400 leading-relaxed">
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-1">
              <strong className="text-white block font-medium">1. Fast Paper Deconstruction:</strong>
              Use the &lt;300 word summary and Mermaid flowchart to master novel architectures before research group meetings or lab interviews.
            </div>
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-1">
              <strong className="text-white block font-medium">2. Concrete Resume Projects:</strong>
              Instead of generic toy apps, build one of the 3 targeted extensions. Use the provided STAR bullet points directly on your resume.
            </div>
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-1">
              <strong className="text-white block font-medium">3. Token-Efficient Pipeline:</strong>
              Our agent ingests context via live web grounding and abstracts to guarantee analysis stays under the 25,000 token operational constraint.
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 px-4 text-center text-xs text-slate-500 font-mono">
        <p>
          PaperArchitect • Advanced CS Research Agent for System Architectures &amp; Student Project Opportunities
        </p>
        <p className="mt-1 text-[11px] text-slate-600">
          Operates under strict 25k token efficiency constraints with live Mermaid.js visualization.
        </p>
      </footer>
    </div>
  );
}
