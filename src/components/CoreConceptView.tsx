import React, { useState } from 'react';
import { Volume2, VolumeX, Copy, Check, Sparkles, BookOpen, Cpu, Sigma, CheckCircle2, AlertTriangle } from 'lucide-react';
import { CoreConceptExtraction, PaperMetadata } from '../types';

interface CoreConceptViewProps {
  concept: CoreConceptExtraction;
  metadata: PaperMetadata;
}

export const CoreConceptView: React.FC<CoreConceptViewProps> = ({ concept, metadata }) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);

  const wordCount = concept.wordCount || concept.fullSummaryUnder300Words.split(/\s+/).filter(Boolean).length;
  const isUnderLimit = wordCount <= 300;

  const handleCopy = () => {
    const textToCopy = `**Core Concept Extraction: ${metadata.title}**\n\n**Problem Statement:**\n${concept.problemStatement}\n\n**Primary Methodology:**\n${concept.primaryMethodology}\n\n**Mathematical & Algorithmic Breakthroughs:**\n${concept.mathematicalAlgorithmicBreakthroughs}\n\n*Word Count: ${wordCount} words (Under 300-word constraint: ${isUnderLimit ? 'Compliant' : 'Non-compliant'})*`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleSpeech = () => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in this browser.');
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
    } else {
      window.speechSynthesis.cancel();
      const textToRead = `${metadata.title}. Problem statement: ${concept.problemStatement}. Primary methodology: ${concept.primaryMethodology}. Mathematical breakthroughs: ${concept.mathematicalAlgorithmicBreakthroughs}`;
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
      setIsPlayingAudio(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Constraint Compliance Banner & Quick Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-900/90 border border-slate-800 rounded-xl">
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium border ${
              isUnderLimit
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                : 'bg-amber-950/60 border-amber-500/40 text-amber-300'
            }`}
          >
            {isUnderLimit ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span>
              {wordCount} / 300 words {isUnderLimit ? '(Strictly Compliant)' : '(Exceeds target)'}
            </span>
          </div>

          <span className="hidden sm:inline text-xs text-slate-400">
            Step 1: Core Concept Extraction (Plain, accessible language)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleSpeech}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
              isPlayingAudio
                ? 'bg-indigo-600 text-white border-indigo-500 animate-pulse'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white hover:bg-slate-700'
            }`}
          >
            {isPlayingAudio ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            <span>{isPlayingAudio ? 'Stop Audio' : 'Listen Summary'}</span>
          </button>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 text-slate-300 border border-slate-700 hover:text-white hover:bg-slate-700 rounded-lg text-xs font-medium transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Summary'}</span>
          </button>
        </div>
      </div>

      {/* Intuitive Plain-Language Analogy Callout */}
      {concept.plainLanguageAnalogy && (
        <div className="relative overflow-hidden rounded-xl border border-indigo-900/60 bg-gradient-to-r from-indigo-950/40 via-purple-950/20 to-slate-900 p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-indigo-600/20 border border-indigo-500/30 rounded-lg text-indigo-400 mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-indigo-300 uppercase tracking-wider font-mono">
                The Intuitive Mental Model
              </h4>
              <p className="mt-1 text-sm text-slate-200 italic leading-relaxed">
                "{concept.plainLanguageAnalogy}"
              </p>
            </div>
          </div>
        </div>
      )}

      {/* The 3 Core Pillars: Problem, Methodology, Breakthroughs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Pillar 1: Problem Statement */}
        <div className="flex flex-col p-5 bg-slate-900/80 border border-slate-800 rounded-xl hover:border-slate-700 transition">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <BookOpen className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-white">The Problem Statement</h3>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed flex-1">
            {concept.problemStatement}
          </p>
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <span>Root Bottleneck</span>
            <span className="text-rose-400">Addressed</span>
          </div>
        </div>

        {/* Pillar 2: Primary Methodology Introduced */}
        <div className="flex flex-col p-5 bg-slate-900/80 border border-slate-800 rounded-xl hover:border-slate-700 transition">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Cpu className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-white">Primary Methodology</h3>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed flex-1">
            {concept.primaryMethodology}
          </p>
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <span>Architecture Design</span>
            <span className="text-indigo-400">Novel Paradigm</span>
          </div>
        </div>

        {/* Pillar 3: Mathematical & Algorithmic Breakthroughs */}
        <div className="flex flex-col p-5 bg-slate-900/80 border border-slate-800 rounded-xl hover:border-slate-700 transition">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Sigma className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-white">Mathematical Breakthroughs</h3>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed font-mono text-xs flex-1 bg-slate-950/60 p-3 rounded-lg border border-slate-800">
            {concept.mathematicalAlgorithmicBreakthroughs}
          </p>
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <span>Complexity & Formalism</span>
            <span className="text-emerald-400">Verified</span>
          </div>
        </div>
      </div>

      {/* Complete Accessible Synthesis (< 300 words) */}
      <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-xl">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider font-mono">
              Complete Synthesis (Under 300 Words)
            </span>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Target: &lt; 300 words • Actual: {wordCount} words
          </span>
        </div>
        <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line font-serif text-base">
          {concept.fullSummaryUnder300Words}
        </p>
      </div>
    </div>
  );
};
