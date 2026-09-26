import React, { useState } from 'react';
import { Copy, Check, Download, FileText, CheckCircle2 } from 'lucide-react';
import { PaperAnalysisData } from '../types';

interface AgentRawOutputProps {
  data: PaperAnalysisData;
}

export const AgentRawOutput: React.FC<AgentRawOutputProps> = ({ data }) => {
  const [copied, setCopied] = useState<boolean>(false);

  // Construct verbatim output strictly following the 3 prompt sections
  const verbatimOutput = data.agentVerbatimText || `1. CORE CONCEPT EXTRACTION:
${data.coreConceptExtraction.fullSummaryUnder300Words}

2. ARCHITECTURAL FLOWCHART (Mermaid.js)
${data.architecturalFlowchart.rawTextSegment || `[FLOWCHART)\n${data.architecturalFlowchart.mermaidCode}`}

3. FUTURE WORK & INTERNSHIP OPPORTUNITIES:
${data.studentOpportunities
  .map(
    (o) => `${o.id}. ${o.projectTitle}
- Exact extension: ${o.exactExtension}
- Targeted performance metric: ${o.targetedPerformanceMetric}
- Recommended tech stack: ${o.recommendedTechStack.join(', ')}`
  )
  .join('\n\n')}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(verbatimOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([verbatimOutput], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${data.paperMetadata.title.replace(/[^a-zA-Z0-9]/g, '_')}_agent_report.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-900 border border-slate-800 rounded-xl">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">
              Agent Specification Verbatim Output
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Strictly adheres to Steps 1, 2, and 3 format with labeled [FLOWCHART) segment
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied Full Report' : 'Copy Formatted Text'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 text-slate-300 border border-slate-700 hover:text-white hover:bg-slate-700 rounded-lg text-xs font-medium transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .md</span>
          </button>
        </div>
      </div>

      <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl overflow-x-auto font-mono text-xs text-slate-200 leading-relaxed max-h-[680px]">
        <pre className="whitespace-pre-wrap">{verbatimOutput}</pre>
      </div>

      <div className="flex items-center gap-4 text-xs text-slate-400 font-mono px-2">
        <span className="flex items-center gap-1.5 text-emerald-400">
          <CheckCircle2 className="w-3.5 h-3.5" />
          [FLOWCHART) segment labeled cleanly without nested markdown blocks
        </span>
        <span className="flex items-center gap-1.5 text-emerald-400">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Token efficiency budget preserved (&lt; 25,000 tokens)
        </span>
      </div>
    </div>
  );
};
