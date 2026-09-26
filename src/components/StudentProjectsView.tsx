import React, { useState } from 'react';
import { Briefcase, Terminal, Award, Copy, Check, ChevronRight, CheckSquare, Square, Layers, Code, Zap } from 'lucide-react';
import { StudentOpportunity } from '../types';

interface StudentProjectsViewProps {
  opportunities: StudentOpportunity[];
  paperTitle: string;
}

export const StudentProjectsView: React.FC<StudentProjectsViewProps> = ({ opportunities, paperTitle }) => {
  const [selectedProject, setSelectedProject] = useState<number>(opportunities[0]?.id || 1);
  const [copiedBulletId, setCopiedBulletId] = useState<number | null>(null);
  const [copiedCodeId, setCopiedCodeId] = useState<number | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});

  const activeProject = opportunities.find((o) => o.id === selectedProject) || opportunities[0];

  const handleCopyResumeBullet = (id: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedBulletId(id);
    setTimeout(() => setCopiedBulletId(null), 2000);
  };

  const handleCopyCode = (id: number, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const toggleStep = (key: string) => {
    setCompletedSteps((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-900/40 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-white">
                3rd-Year CS Student Project & Internship Opportunities
              </h2>
              <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-700/50 text-emerald-300 text-[10px] font-mono">
                3 Concrete Paths
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Actionable extensions designed for undergraduate resume impact, FAANG/AI lab interviews, and practical reproducibility.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {opportunities.map((opp) => (
            <button
              key={opp.id}
              onClick={() => setSelectedProject(opp.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                selectedProject === opp.id
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
              }`}
            >
              <span>Idea #{opp.id}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Opportunity Detail View */}
      {activeProject && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Project Specs & Requirements */}
          <div className="lg:col-span-7 space-y-5">
            {/* Title & Badge */}
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded bg-indigo-950 border border-indigo-700/50 text-indigo-300 text-xs font-mono font-medium">
                  Opportunity #{activeProject.id} of 3
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Target: 3rd-Year Undergrad Project
                </span>
              </div>

              <h3 className="text-lg font-bold text-white leading-snug">
                {activeProject.projectTitle}
              </h3>

              {/* Requirement 1: The Exact Extension */}
              <div className="p-4 bg-slate-950/70 border border-slate-800/90 rounded-lg space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 font-mono uppercase tracking-wider">
                  <Layers className="w-3.5 h-3.5" />
                  <span>The Exact Extension</span>
                </div>
                <p className="text-sm text-slate-200 leading-relaxed font-medium">
                  {activeProject.exactExtension}
                </p>
              </div>

              {/* Requirement 2: Targeted Performance Metric */}
              <div className="p-4 bg-emerald-950/30 border border-emerald-800/40 rounded-lg space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 font-mono uppercase tracking-wider">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Targeted Performance Metric</span>
                </div>
                <p className="text-sm text-emerald-200 font-mono leading-relaxed">
                  {activeProject.targetedPerformanceMetric}
                </p>
              </div>

              {/* Requirement 3: Recommended Tech Stack */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 font-mono uppercase tracking-wider">
                  <Terminal className="w-3.5 h-3.5 text-slate-500" />
                  <span>Recommended Tech Stack</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {activeProject.recommendedTechStack.map((tech, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-md bg-slate-800/90 border border-slate-700 text-slate-200 text-xs font-mono font-medium hover:border-indigo-500 transition"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Resume Bullet Point Generator */}
            <div className="p-5 bg-gradient-to-br from-slate-900 to-indigo-950/30 border border-indigo-900/50 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 font-mono uppercase tracking-wider">
                  <Award className="w-4 h-4" />
                  <span>Resume Ready Bullet Point (STAR Method)</span>
                </div>
                <button
                  onClick={() => handleCopyResumeBullet(activeProject.id, activeProject.resumeBulletPoint)}
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-medium transition"
                >
                  {copiedBulletId === activeProject.id ? (
                    <Check className="w-3.5 h-3.5 text-emerald-300" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedBulletId === activeProject.id ? 'Copied to Clipboard!' : 'Copy Bullet'}</span>
                </button>
              </div>

              <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-lg text-sm text-slate-200 leading-relaxed font-sans">
                • {activeProject.resumeBulletPoint}
              </div>

              <p className="text-[11px] text-slate-400">
                Formula: Action Verb + Core Architectural Extension + Specific Tech Stack + Quantified Performance Metric.
              </p>
            </div>
          </div>

          {/* Right Column: Implementation Roadmap & Starter Boilerplate */}
          <div className="lg:col-span-5 space-y-5">
            {/* 4-Step Implementation Roadmap */}
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
                  Student Implementation Roadmap
                </h4>
                <span className="text-[11px] text-slate-500 font-mono">
                  Check off as you build
                </span>
              </div>

              <div className="space-y-2.5">
                {activeProject.implementationRoadmap.map((step, idx) => {
                  const stepKey = `proj-${activeProject.id}-step-${idx}`;
                  const isDone = completedSteps[stepKey];
                  return (
                    <div
                      key={idx}
                      onClick={() => toggleStep(stepKey)}
                      className={`flex items-start gap-2.5 p-3 rounded-lg border transition cursor-pointer ${
                        isDone
                          ? 'bg-emerald-950/20 border-emerald-800/40 text-slate-300'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-200'
                      }`}
                    >
                      <button className="mt-0.5 text-indigo-400 flex-shrink-0">
                        {isDone ? (
                          <CheckSquare className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-600" />
                        )}
                      </button>
                      <span className={`text-xs leading-relaxed ${isDone ? 'line-through text-slate-500' : ''}`}>
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Python / PyTorch Starter Boilerplate */}
            {activeProject.starterBoilerplate && (
              <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-1.5 text-xs font-mono text-slate-300">
                    <Code className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Starter Boilerplate Skeleton</span>
                  </div>
                  <button
                    onClick={() => handleCopyCode(activeProject.id, activeProject.starterBoilerplate || '')}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition font-mono"
                  >
                    {copiedCodeId === activeProject.id ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    <span>{copiedCodeId === activeProject.id ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                <div className="bg-slate-950 rounded-lg p-3 border border-slate-800/80 overflow-x-auto max-h-[220px]">
                  <pre className="text-[11px] font-mono text-indigo-300 leading-relaxed">
                    {activeProject.starterBoilerplate}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Comparison Grid of All 3 Ideas */}
      <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-xl">
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono mb-3">
          All 3 Student Paths At A Glance
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {opportunities.map((opp) => (
            <div
              key={opp.id}
              onClick={() => setSelectedProject(opp.id)}
              className={`p-3.5 rounded-lg border transition cursor-pointer ${
                selectedProject === opp.id
                  ? 'bg-indigo-950/40 border-indigo-500'
                  : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1">
                <span>Idea #{opp.id}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
              <p className="text-xs font-semibold text-white line-clamp-1">{opp.projectTitle}</p>
              <p className="text-[11px] text-emerald-400 font-mono mt-1 line-clamp-1">
                {opp.targetedPerformanceMetric}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
