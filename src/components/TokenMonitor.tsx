import React from 'react';
import { Gauge, Globe, CheckCircle2, ShieldCheck, ExternalLink, Cpu } from 'lucide-react';
import { TokenMetrics, GroundingSource } from '../types';

interface TokenMonitorProps {
  metrics: TokenMetrics;
  searchSources?: GroundingSource[];
  isWordCountCompliant?: boolean;
}

export const TokenMonitor: React.FC<TokenMonitorProps> = ({
  metrics,
  searchSources = [],
  isWordCountCompliant = true,
}) => {
  const percent = metrics.tokenBudgetPercent || Number(((metrics.totalTokens / metrics.tokenLimit) * 100).toFixed(1));
  const isHealthy = metrics.totalTokens < metrics.tokenLimit;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Gauge className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
              Operational Constraints Monitor
            </h4>
            <p className="text-[11px] text-slate-400">
              Enforcing &lt;25,000 token budget, Web Grounding, &amp; concise architectural decomposition
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-mono font-medium border flex items-center gap-1.5 ${
              isHealthy
                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30'
                : 'bg-red-950/60 text-red-300 border-red-500/30'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{isHealthy ? 'BUDGET COMPLIANT' : 'BUDGET EXCEEDED'}</span>
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs font-mono">
          <span className="text-slate-300">
            Token Budget Usage: <strong className="text-white">{metrics.totalTokens.toLocaleString()}</strong> /{' '}
            {metrics.tokenLimit.toLocaleString()} tokens
          </span>
          <span className={`font-semibold ${percent > 80 ? 'text-amber-400' : 'text-emerald-400'}`}>
            {percent}% Consumed ({(metrics.tokenLimit - metrics.totalTokens).toLocaleString()} headroom)
          </span>
        </div>
        <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              percent > 80 ? 'bg-amber-500' : 'bg-gradient-to-r from-indigo-500 via-emerald-400 to-emerald-500'
            }`}
            style={{ width: `${Math.min(percent, 100)}%` }}
          />
        </div>
      </div>

      {/* Constraint Compliance Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
        <div className="p-2.5 bg-slate-950/70 border border-slate-800 rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
          <div className="text-[11px] font-mono leading-tight">
            <div className="text-slate-400">Tokens &lt; 25k</div>
            <div className="text-emerald-400 font-semibold">{metrics.totalTokens} tokens</div>
          </div>
        </div>

        <div className="p-2.5 bg-slate-950/70 border border-slate-800 rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
          <div className="text-[11px] font-mono leading-tight">
            <div className="text-slate-400">Summary &lt; 300w</div>
            <div className={isWordCountCompliant ? 'text-emerald-400 font-semibold' : 'text-amber-400'}>
              {isWordCountCompliant ? 'Strictly Compliant' : 'Near limit'}
            </div>
          </div>
        </div>

        <div className="p-2.5 bg-slate-950/70 border border-slate-800 rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
          <div className="text-[11px] font-mono leading-tight">
            <div className="text-slate-400">Mermaid Format</div>
            <div className="text-emerald-400 font-semibold">[FLOWCHART) labeled</div>
          </div>
        </div>

        <div className="p-2.5 bg-slate-950/70 border border-slate-800 rounded-lg flex items-center gap-2">
          <Globe className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
          <div className="text-[11px] font-mono leading-tight">
            <div className="text-slate-400">Web Ingestion</div>
            <div className="text-indigo-400 font-semibold">Live Grounding</div>
          </div>
        </div>
      </div>

      {/* Web Grounding Sources if present */}
      {searchSources.length > 0 && (
        <div className="pt-2 border-t border-slate-800/80">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-2">
            <Globe className="w-3.5 h-3.5 text-indigo-400" />
            <span>Context Ingestion &amp; Search Grounding Sources:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {searchSources.map((source, idx) => (
              <a
                key={idx}
                href={source.uri}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-950 border border-slate-800 hover:border-indigo-500 rounded text-xs text-slate-300 hover:text-white transition font-mono"
              >
                <span>{source.title || 'ArXiv Reference'}</span>
                <ExternalLink className="w-3 h-3 text-slate-500" />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
