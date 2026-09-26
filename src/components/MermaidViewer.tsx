import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { ZoomIn, ZoomOut, RotateCcw, Copy, Check, Download, Code, Eye, AlertCircle, Maximize2, Minimize2 } from 'lucide-react';
import { ArchitecturalFlowchart } from '../types';

interface MermaidViewerProps {
  flowchart: ArchitecturalFlowchart;
  paperTitle?: string;
}

export const MermaidViewer: React.FC<MermaidViewerProps> = ({ flowchart, paperTitle = 'System Architecture' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>('');
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [copiedRawText, setCopiedRawText] = useState<boolean>(false);
  const [showCodeEditor, setShowCodeEditor] = useState<boolean>(false);
  const [editableCode, setEditableCode] = useState<string>(flowchart.mermaidCode);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Initialize mermaid configuration once
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'dark',
      securityLevel: 'loose',
      fontFamily: 'Fira Code, monospace',
      flowchart: {
        htmlLabels: true,
        curve: 'basis',
        useMaxWidth: false,
      },
      themeVariables: {
        darkMode: true,
        background: '#090d16',
        primaryColor: '#6366f1',
        primaryTextColor: '#f8fafc',
        primaryBorderColor: '#4f46e5',
        lineColor: '#60a5fa',
        secondaryColor: '#10b981',
        tertiaryColor: '#1e293b',
        nodeBorder: '#3b82f6',
        clusterBkg: '#0f172a',
        clusterBorder: '#334155',
        edgeLabelBackground: '#1e293b',
      },
    });
  }, []);

  // Update editable code when flowchart prop changes
  useEffect(() => {
    setEditableCode(flowchart.mermaidCode);
  }, [flowchart.mermaidCode]);

  // Render diagram whenever editableCode changes
  useEffect(() => {
    let isMounted = true;
    const renderDiagram = async () => {
      if (!editableCode.trim()) return;

      try {
        setRenderError(null);
        const uniqueId = `mermaid-svg-${Date.now()}`;
        const { svg } = await mermaid.render(uniqueId, editableCode);
        if (isMounted) {
          setSvgContent(svg);
        }
      } catch (err: any) {
        console.warn('Mermaid rendering error:', err);
        if (isMounted) {
          setRenderError(err.message || 'Failed to render Mermaid diagram. Check syntax.');
        }
      }
    };

    renderDiagram();
    return () => {
      isMounted = false;
    };
  }, [editableCode]);

  // Pan and drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (showCodeEditor) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.2, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.2, 0.4));
  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const copyMermaidCode = () => {
    navigator.clipboard.writeText(editableCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const copyRawSegment = () => {
    const rawSegment = flowchart.rawTextSegment || `[FLOWCHART)\n${editableCode}`;
    navigator.clipboard.writeText(rawSegment);
    setCopiedRawText(true);
    setTimeout(() => setCopiedRawText(false), 2000);
  };

  const downloadSvg = () => {
    if (!svgContent) return;
    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${paperTitle.replace(/[^a-zA-Z0-9]/g, '_')}_architecture.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className={`relative flex flex-col bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl transition-all ${
        isFullscreen ? 'fixed inset-4 z-50 rounded-2xl border-indigo-500 shadow-indigo-950/50' : 'h-[620px]'
      }`}
    >
      {/* Top Controls Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-slate-950/80 border-b border-slate-800 backdrop-blur z-10">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-indigo-950/60 border border-indigo-700/40 text-indigo-300 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            <span>Mermaid.js Flowchart (graph TD)</span>
          </div>
          <span className="hidden sm:inline-block text-xs text-slate-400 font-mono">
            [Labeled Spec: [FLOWCHART)]
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Zoom controls */}
          <div className="flex items-center bg-slate-800/80 border border-slate-700/60 rounded-lg p-0.5 mr-1">
            <button
              onClick={handleZoomIn}
              title="Zoom In"
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono text-slate-400 px-1.5">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={handleZoomOut}
              title="Zoom Out"
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleReset}
              title="Reset View"
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition border-l border-slate-700/80"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>

          {/* Code vs Visual toggle */}
          <button
            onClick={() => setShowCodeEditor(!showCodeEditor)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition ${
              showCodeEditor
                ? 'bg-indigo-600 text-white border-indigo-500'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white hover:bg-slate-700'
            }`}
          >
            {showCodeEditor ? <Eye className="w-3.5 h-3.5" /> : <Code className="w-3.5 h-3.5" />}
            <span>{showCodeEditor ? 'Preview Diagram' : 'Edit Source'}</span>
          </button>

          {/* Copy Mermaid Code */}
          <button
            onClick={copyMermaidCode}
            title="Copy Mermaid.js source"
            className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 text-slate-300 border border-slate-700 hover:text-white hover:bg-slate-700 rounded-lg text-xs font-medium transition"
          >
            {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden md:inline">{copiedCode ? 'Copied!' : 'Copy Code'}</span>
          </button>

          {/* Copy strict [FLOWCHART) segment */}
          <button
            onClick={copyRawSegment}
            title="Copy exact labeled [FLOWCHART) text segment"
            className="hidden lg:flex items-center gap-1 px-2 py-1.5 bg-slate-800/80 text-amber-300 border border-amber-500/30 hover:bg-slate-700 rounded-lg text-xs font-mono transition"
          >
            {copiedRawText ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>[FLOWCHART) Text</span>
          </button>

          {/* Download SVG */}
          <button
            onClick={downloadSvg}
            title="Download SVG Diagram"
            className="p-1.5 bg-slate-800 text-slate-300 border border-slate-700 hover:text-white hover:bg-slate-700 rounded-lg transition"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          {/* Fullscreen toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            className="p-1.5 bg-slate-800 text-slate-300 border border-slate-700 hover:text-white hover:bg-slate-700 rounded-lg transition"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Diagram Canvas or Code Editor */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={`relative flex-1 overflow-hidden select-none bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
      >
        {renderError && (
          <div className="absolute top-4 left-4 right-4 z-20 p-3 bg-red-950/90 border border-red-700 text-red-200 text-xs rounded-lg flex items-start gap-2 shadow-lg backdrop-blur">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Mermaid Syntax Parsing Warning:</p>
              <p className="font-mono mt-0.5 text-red-300">{renderError}</p>
              <button
                onClick={() => setEditableCode(flowchart.mermaidCode)}
                className="mt-2 px-2 py-0.5 bg-red-800/80 hover:bg-red-700 text-white rounded text-[11px] font-medium"
              >
                Reset to Original Code
              </button>
            </div>
          </div>
        )}

        {showCodeEditor ? (
          <div className="absolute inset-0 p-4 bg-slate-950 z-10 flex flex-col">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-xs text-slate-400 font-mono">
              <span>Live Mermaid.js Code Editor (Updates preview automatically)</span>
              <span>Syntax: graph TD</span>
            </div>
            <textarea
              value={editableCode}
              onChange={(e) => setEditableCode(e.target.value)}
              className="flex-1 w-full bg-slate-900 text-emerald-300 font-mono text-xs p-3 rounded-lg border border-slate-800 focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
              spellCheck={false}
            />
          </div>
        ) : (
          <div
            className="w-full h-full flex items-center justify-center p-6 transition-transform duration-75 ease-out"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: 'center center',
            }}
          >
            {svgContent ? (
              <div
                className="mermaid-svg-container max-w-none"
                dangerouslySetInnerHTML={{ __html: svgContent }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 text-slate-500">
                <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-mono">Compiling Mermaid architecture nodes...</span>
              </div>
            )}
          </div>
        )}

        {/* Legend / Key overlay */}
        <div className="absolute bottom-3 left-3 z-10 hidden sm:flex items-center gap-3 px-3 py-1.5 bg-slate-950/80 border border-slate-800 rounded-lg backdrop-blur text-[11px] text-slate-400">
          <span className="font-mono text-slate-500">Node Legend:</span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-blue-500/80" /> Inputs / Prompts
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-indigo-500/80" /> Layers & Modules
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500/80" /> Core Breakthrough
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-amber-500/80" /> Output / Distill
          </span>
        </div>

        {/* Drag instruction helper */}
        <div className="absolute bottom-3 right-3 z-10 hidden sm:block text-[10px] text-slate-500 font-mono bg-slate-950/60 px-2 py-1 rounded border border-slate-800/40 pointer-events-none">
          Click & drag to pan • Scroll / buttons to zoom
        </div>
      </div>
    </div>
  );
};
