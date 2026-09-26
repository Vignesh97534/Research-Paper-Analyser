import React, { useState, useEffect, useRef } from 'react';
import { Search, Link as LinkIcon, FileText, Sparkles, Sliders, ChevronDown, ChevronUp, Loader2, ArrowRight } from 'lucide-react';
import { ArxivSearchResult } from '../types';

interface PaperInputBarProps {
  onAnalyze: (payload: {
    url?: string;
    paperTitle?: string;
    paperText?: string;
    focusArea: string;
    level: string;
  }) => void;
  onSelectPreset: (presetKey: string) => void;
  isLoading: boolean;
  activePresetKey?: string;
}

export const PaperInputBar: React.FC<PaperInputBarProps> = ({
  onAnalyze,
  onSelectPreset,
  isLoading,
  activePresetKey,
}) => {
  const [inputVal, setInputVal] = useState<string>('');
  const [showOptions, setShowOptions] = useState<boolean>(false);
  const [showTextPaste, setShowTextPaste] = useState<boolean>(false);
  const [paperText, setPaperText] = useState<string>('');
  const [focusArea, setFocusArea] = useState<string>('Edge AI & Systems Efficiency');
  const [level, setLevel] = useState<string>('3rd-Year CS Undergraduate');

  // ArXiv autocomplete
  const [searchResults, setSearchResults] = useState<ArxivSearchResult[]>([]);
  const [isSearchingArxiv, setIsSearchingArxiv] = useState<boolean>(false);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const searchDebounceRef = useRef<any>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounced search for arXiv papers when user types a non-URL title
  useEffect(() => {
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    const trimmed = inputVal.trim();
    if (!trimmed || trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.length < 3) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    searchDebounceRef.current = setTimeout(async () => {
      try {
        setIsSearchingArxiv(true);
        const res = await fetch(`/api/search-arxiv?q=${encodeURIComponent(trimmed)}`);
        if (res.ok) {
          const json = await res.json();
          setSearchResults(json.papers || []);
          setShowDropdown((json.papers || []).length > 0);
        }
      } catch (err) {
        console.warn('Autocomplete error:', err);
      } finally {
        setIsSearchingArxiv(false);
      }
    }, 450);

    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, [inputVal]);

  // Click outside listener for dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputVal.trim();
    if (!trimmed && !paperText.trim()) return;

    setShowDropdown(false);
    const isUrl = trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.includes('arxiv.org');
    onAnalyze({
      url: isUrl ? trimmed : undefined,
      paperTitle: !isUrl && trimmed ? trimmed : undefined,
      paperText: paperText.trim() || undefined,
      focusArea,
      level,
    });
  };

  const handleSelectArxivPaper = (paper: ArxivSearchResult) => {
    setInputVal(paper.link || `https://arxiv.org/abs/${paper.arxivId}`);
    setShowDropdown(false);
    onAnalyze({
      url: paper.link || `https://arxiv.org/abs/${paper.arxivId}`,
      paperTitle: paper.title,
      paperText: paper.summary,
      focusArea,
      level,
    });
  };

  const presetButtons = [
    { key: 'deepseek-r1', label: 'DeepSeek-R1 (2025)', badge: 'GRPO & Distill' },
    { key: 'mamba-linear-time', label: 'Mamba (Gu & Dao)', badge: 'O(N) State Spaces' },
    { key: 'lora-low-rank', label: 'LoRA (Hu et al.)', badge: 'PEFT Decomposition' },
  ];

  return (
    <div className="space-y-3">
      {/* Search & URL Input Form */}
      <div className="relative" ref={dropdownRef}>
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              {inputVal.startsWith('http') ? (
                <LinkIcon className="w-4 h-4 text-indigo-400" />
              ) : (
                <Search className="w-4 h-4" />
              )}
            </div>

            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Paste arXiv URL (e.g. https://arxiv.org/abs/2312.00752), PDF link, or paper title..."
              disabled={isLoading}
              className="w-full pl-10 pr-24 py-3 bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-xl transition"
            />

            <div className="absolute inset-y-0 right-2 flex items-center gap-1.5">
              {isSearchingArxiv && (
                <Loader2 className="w-4 h-4 text-indigo-400 animate-spin mr-1" />
              )}
              <button
                type="button"
                onClick={() => setShowOptions(!showOptions)}
                title="Customize Domain & Student Level"
                className={`p-1.5 rounded-lg border text-xs font-mono transition flex items-center gap-1 ${
                  showOptions
                    ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || (!inputVal.trim() && !paperText.trim())}
            className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-sm font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/25 transition cursor-pointer flex-shrink-0"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Parsing Paper...</span>
              </>
            ) : (
              <>
                <span>Analyze Paper</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Autocomplete arXiv Dropdown */}
        {showDropdown && searchResults.length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-2 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-30 overflow-hidden divide-y divide-slate-800">
            <div className="px-3.5 py-2 bg-slate-950 text-[11px] font-mono text-slate-400 flex items-center justify-between">
              <span>ArXiv Live Query Results:</span>
              <span>Click to analyze</span>
            </div>
            {searchResults.map((paper, idx) => (
              <div
                key={idx}
                onClick={() => handleSelectArxivPaper(paper)}
                className="p-3 hover:bg-slate-800/80 cursor-pointer transition space-y-1"
              >
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-semibold text-white line-clamp-1">{paper.title}</h4>
                  <span className="px-1.5 py-0.5 rounded bg-indigo-950 border border-indigo-700/50 text-[10px] text-indigo-300 font-mono flex-shrink-0">
                    {paper.arxivId}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-1">{paper.summary}</p>
                <div className="text-[10px] text-slate-500 font-mono">
                  {paper.authors.slice(0, 3).join(', ')} {paper.authors.length > 3 ? 'et al.' : ''} • {paper.published}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preset Papers Chips & Paste Accordion */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            Seminal Presets:
          </span>
          {presetButtons.map((preset) => (
            <button
              key={preset.key}
              onClick={() => onSelectPreset(preset.key)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition flex items-center gap-1.5 ${
                activePresetKey === preset.key
                  ? 'bg-indigo-950/80 border-indigo-500 text-indigo-200 shadow-md'
                  : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
              }`}
            >
              <span>{preset.label}</span>
              <span className="text-[10px] font-mono text-indigo-400 opacity-80">
                {preset.badge}
              </span>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setShowTextPaste(!showTextPaste)}
          className="text-xs text-indigo-400 hover:text-indigo-300 font-mono flex items-center gap-1 transition"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>{showTextPaste ? 'Hide Direct Text Paste' : 'Paste Paper Text / Abstract'}</span>
          {showTextPaste ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {/* Expandable Direct Text Paste Panel */}
      {showTextPaste && (
        <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl space-y-2 animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Direct Text / Abstract / BibTeX Ingestion:</span>
            <span>Token-efficient contextual summarization</span>
          </div>
          <textarea
            value={paperText}
            onChange={(e) => setPaperText(e.target.value)}
            rows={4}
            placeholder="Paste paper abstract, methodology section, or BibTeX snippet here if you don't have a direct URL..."
            className="w-full p-2.5 bg-slate-950 text-xs text-slate-200 font-mono rounded-lg border border-slate-800 focus:outline-none focus:border-indigo-500 resize-y"
          />
        </div>
      )}

      {/* Expandable Options Drawer */}
      {showOptions && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-900 border border-slate-800 rounded-xl animate-in fade-in duration-200">
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1.5">
              Student Project Focus Domain:
            </label>
            <select
              value={focusArea}
              onChange={(e) => setFocusArea(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
            >
              <option value="Edge AI & Systems Efficiency">Edge AI & Systems Efficiency (ONNX, mobile, quantization)</option>
              <option value="Novel Architectural Extensions">Novel Architectural Extensions (Mamba, FlashAttention, Hybrids)</option>
              <option value="Reasoning & Alignment">Reasoning & Alignment (GRPO, RL, self-reflection)</option>
              <option value="Data Infrastructure & Tooling">Data Infrastructure & Tooling (Sandboxing, verification)</option>
              <option value="Computer Vision & Multimodal">Computer Vision & Multimodal</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1.5">
              Target Audience / Education Level:
            </label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
            >
              <option value="3rd-Year CS Undergraduate">3rd-Year CS Undergraduate (Practical, resume-oriented)</option>
              <option value="Senior Capstone Team">Senior Capstone Team (End-to-end prototype)</option>
              <option value="Graduate Research Lab Applicant">Graduate Research Lab Applicant (Novel benchmark extension)</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};
