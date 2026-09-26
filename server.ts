import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Shared server-side Gemini client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper to count words
function countWords(str: string): number {
  return str.trim().split(/\s+/).filter(Boolean).length;
}

// Extract arXiv ID if present
function parseArxivId(input: string): string | null {
  const match = input.match(/(\d{4}\.\d{4,5}(?:v\d+)?)/);
  if (match) return match[1];
  const absMatch = input.match(/arxiv\.org\/(?:abs|pdf)\/([a-zA-Z\-]+(?:\/\d+)?|\d{4}\.\d{4,5}(?:v\d+)?)/i);
  return absMatch ? absMatch[1].replace('.pdf', '') : null;
}

// Clean and sanitize Mermaid graph string
function sanitizeMermaid(raw: string): string {
  let cleaned = raw.trim();
  // Strip out markdown code fences if model accidentally included them
  cleaned = cleaned.replace(/^```(?:mermaid)?\s*/i, '').replace(/\s*```$/i, '').trim();
  
  // Strip label prefix like [FLOWCHART) or [FLOWCHART]
  cleaned = cleaned.replace(/^\[FLOWCHART[\)\]]\s*/i, '').trim();

  // Ensure it starts with graph TD if not already
  if (!cleaned.startsWith('graph ') && !cleaned.startsWith('flowchart ')) {
    cleaned = 'graph TD\n' + cleaned;
  }
  
  return cleaned;
}

// Search arXiv API for quick paper discovery
app.get('/api/search-arxiv', async (req: Request, res: Response) => {
  try {
    const query = (req.query.q as string || '').trim();
    if (!query) {
      return res.json({ papers: [] });
    }

    const arxivUrl = `https://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(query)}&start=0&max_results=6&sortBy=relevance&sortOrder=descending`;
    const response = await fetch(arxivUrl);
    const xml = await response.text();

    // Basic regex XML parsing to avoid large heavy XML dependencies
    const entries: Array<{
      id: string;
      title: string;
      summary: string;
      authors: string[];
      published: string;
      link: string;
      arxivId: string;
    }> = [];

    const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
    let match;
    while ((match = entryRegex.exec(xml)) !== null) {
      const entryText = match[1];
      const idMatch = entryText.match(/<id>([\s\S]*?)<\/id>/);
      const titleMatch = entryText.match(/<title>([\s\S]*?)<\/title>/);
      const summaryMatch = entryText.match(/<summary>([\s\S]*?)<\/summary>/);
      const publishedMatch = entryText.match(/<published>([\s\S]*?)<\/published>/);

      const authors: string[] = [];
      const authorRegex = /<author>\s*<name>([\s\S]*?)<\/name>/g;
      let authorMatch;
      while ((authorMatch = authorRegex.exec(entryText)) !== null) {
        authors.push(authorMatch[1].trim());
      }

      const rawId = idMatch ? idMatch[1].trim() : '';
      const arxivId = parseArxivId(rawId) || rawId;

      if (titleMatch) {
        entries.push({
          id: rawId,
          arxivId,
          title: titleMatch[1].replace(/\s+/g, ' ').trim(),
          summary: summaryMatch ? summaryMatch[1].replace(/\s+/g, ' ').trim() : '',
          authors,
          published: publishedMatch ? publishedMatch[1].substring(0, 10) : '',
          link: rawId,
        });
      }
    }

    res.json({ papers: entries });
  } catch (error: any) {
    console.error('arXiv search error:', error);
    res.status(500).json({ error: error.message || 'Failed to search arXiv' });
  }
});

// Analyze Paper endpoint implementing exact Research Agent system prompt & operational constraints
app.post('/api/analyze-paper', async (req: Request, res: Response) => {
  try {
    const {
      url = '',
      paperTitle = '',
      paperText = '',
      focusArea = 'Systems & Edge AI',
      level = '3rd-Year CS Undergraduate',
    } = req.body;

    if (!url && !paperTitle && !paperText) {
      return res.status(400).json({ error: 'Please provide a paper URL, paper title, or paper text/abstract.' });
    }

    const arxivId = parseArxivId(url);
    const paperContext = [
      url ? `Paper URL: ${url}` : '',
      arxivId ? `ArXiv ID: ${arxivId}` : '',
      paperTitle ? `Paper Title: ${paperTitle}` : '',
      paperText ? `Provided Paper Content/Abstract: ${paperText.slice(0, 10000)}` : '',
      `Target Student Audience: ${level}`,
      `Desired Student Focus Domain: ${focusArea}`
    ].filter(Boolean).join('\n');

    // System prompt as specified by user instructions
    const systemInstruction = `You are an advanced Computer Science Research Agent specializing in parsing academic papers, extracting system architectures, and identifying student development opportunities.

OPERATIONAL CONSTRAINTS:
- You must always prioritize token efficiency. Ensure your total analysis and tool execution stays well under 25,000 tokens.
- If a paper is too long to ingest entirely, use the Web Search tool to look up summaries, abstracts, and open-source implementations (e.g., GitHub) of the paper's title to gather context efficiently.

When a user provides a research paper URL or title, execute these exact steps:

1. CORE CONCEPT EXTRACTION:
Summarize the problem statement, the primary methodology introduced, and the key mathematical/algorithmic breakthroughs in under 300 words using plain, accessible language.
Strictly ensure the Core Concept Extraction word count is under 300 words.

2. ARCHITECTURAL FLOWCHART (Mermaid.js)
Generate a clean, syntactically correct Mermaid.js flowchart (graph TD) that charts the components, data inputs, model layers, and data outputs of the system described in the paper.
Do not use Markdown code blocks inside the Mermaid string itself. Output it as a clear text segment labeled [FLOWCHART)

3. FUTURE WORK & INTERNSHIP OPPORTUNITIES:
Brainstorm 3 concrete, realistic ways a 3rd-year CS student could build upon, extend, or optimize this paper for a resume project. For each idea provide:
- The exact extension (e.g., "Replacing the heavy transformer layer with a lightweight Mamba block for edge deployment").
- The targeted performance metric (e.g., latency reduction, accuracy trade-off).
- The recommended tech stack (e.g., PyTorch, ONNX Runtime).

Return your response in clean JSON matching the following schema.`;

    const prompt = `Please analyze the following computer science research paper according to the Operational Constraints and Steps 1, 2, and 3:

${paperContext}

Provide the output in structured JSON with these exact properties:
{
  "paperMetadata": {
    "title": "Exact or inferred title of the paper",
    "authors": ["Author 1", "Author 2"],
    "year": "Publication year",
    "arxivIdOrVenue": "arXiv ID or publication venue",
    "field": "e.g. LLM Reasoning / Efficient Transformers / Systems / Vision"
  },
  "coreConceptExtraction": {
    "problemStatement": "Clear summary of the problem being solved in plain, accessible language",
    "primaryMethodology": "Primary methodology introduced by the authors",
    "mathematicalAlgorithmicBreakthroughs": "Key mathematical or algorithmic breakthroughs (include formulas or complexity notation if relevant)",
    "plainLanguageAnalogy": "A short, intuitive 1-sentence real-world analogy of how the architecture works",
    "fullSummaryUnder300Words": "The complete coherent synthesis combining problem, methodology, and breakthrough strictly under 300 words",
    "wordCount": 240
  },
  "architecturalFlowchart": {
    "mermaidCode": "graph TD\\n  A[Input Data / Query] --> B[Embedding Layer]\\n  ...",
    "rawTextSegment": "[FLOWCHART)\\ngraph TD\\n  A[Input Data / Query] --> B[Embedding Layer]\\n  ...",
    "nodesDescription": [
      {"id": "A", "label": "Input Data", "role": "input"},
      {"id": "B", "label": "Embedding Layer", "role": "layer"},
      {"id": "C", "label": "Core Mechanism", "role": "breakthrough"},
      {"id": "D", "label": "Output", "role": "output"}
    ]
  },
  "studentOpportunities": [
    {
      "id": 1,
      "projectTitle": "Catchy, resume-worthy project title",
      "exactExtension": "Replacing the heavy transformer layer with a lightweight Mamba block for edge deployment",
      "targetedPerformanceMetric": "3.2x latency reduction on edge devices with <1% accuracy loss on GLUE benchmark",
      "recommendedTechStack": ["PyTorch", "ONNX Runtime", "HuggingFace Transformers"],
      "resumeBulletPoint": "Designed and benchmarked a lightweight Mamba-based transformer variant, achieving a 3.2x inference speedup on edge hardware with minimal accuracy degradation.",
      "implementationRoadmap": [
        "1. Baseline: Clone official repo and benchmark inference latency on CPU/edge target.",
        "2. Swap: Implement custom PyTorch module replacing the multi-head attention block with selective state space.",
        "3. Train/Fine-tune: Fine-tune on smaller task-specific dataset with LoRA.",
        "4. Profile: Export to ONNX Runtime and measure P99 latency and memory reduction."
      ],
      "starterBoilerplate": "# PyTorch model extension skeleton\\nimport torch\\nimport torch.nn as nn\\n..."
    },
    {
      "id": 2,
      "projectTitle": "...",
      "exactExtension": "...",
      "targetedPerformanceMetric": "...",
      "recommendedTechStack": ["..."],
      "resumeBulletPoint": "...",
      "implementationRoadmap": ["..."],
      "starterBoilerplate": "..."
    },
    {
      "id": 3,
      "projectTitle": "...",
      "exactExtension": "...",
      "targetedPerformanceMetric": "...",
      "recommendedTechStack": ["..."],
      "resumeBulletPoint": "...",
      "implementationRoadmap": ["..."],
      "starterBoilerplate": "..."
    }
  ],
  "agentVerbatimText": "The full formatted text output of the agent including 1. CORE CONCEPT EXTRACTION, 2. ARCHITECTURAL FLOWCHART (Mermaid.js) with [FLOWCHART) header, and 3. FUTURE WORK & INTERNSHIP OPPORTUNITIES",
  "operationalConstraintsReport": {
    "tokenEfficiencyStrategy": "Efficient contextual ingestion via web search and concise architectural decomposition",
    "wordCountCompliant": true,
    "mermaidValid": true
  }
}`;

    // Call Gemini 3.8 Flash with googleSearch tool enabled for token-efficient retrieval
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.2,
        tools: [{ googleSearch: {} }],
        responseMimeType: 'application/json',
      },
    });

    const responseText = response.text || '{}';
    let parsedData: any;
    try {
      parsedData = JSON.parse(responseText);
    } catch (parseErr) {
      console.warn('JSON parse error from Gemini, stripping markdown code block fences:', parseErr);
      const cleaned = responseText.replace(/```(?:json)?\s*/gi, '').replace(/\s*```$/gi, '').trim();
      parsedData = JSON.parse(cleaned);
    }

    // Sanitize and validate Mermaid code
    if (parsedData.architecturalFlowchart?.mermaidCode) {
      parsedData.architecturalFlowchart.mermaidCode = sanitizeMermaid(
        parsedData.architecturalFlowchart.mermaidCode
      );
    }

    // Ensure rawTextSegment has [FLOWCHART) label as explicitly requested
    if (!parsedData.architecturalFlowchart?.rawTextSegment || !parsedData.architecturalFlowchart.rawTextSegment.includes('[FLOWCHART')) {
      parsedData.architecturalFlowchart.rawTextSegment = `[FLOWCHART)\n${parsedData.architecturalFlowchart?.mermaidCode || 'graph TD\n  Input[Input] --> Process[Model] --> Output[Output]'}`;
    }

    // Calculate actual word count of core concept extraction
    const fullSummary = parsedData.coreConceptExtraction?.fullSummaryUnder300Words ||
      `${parsedData.coreConceptExtraction?.problemStatement || ''} ${parsedData.coreConceptExtraction?.primaryMethodology || ''} ${parsedData.coreConceptExtraction?.mathematicalAlgorithmicBreakthroughs || ''}`;
    
    const computedWordCount = countWords(fullSummary);
    if (parsedData.coreConceptExtraction) {
      parsedData.coreConceptExtraction.wordCount = computedWordCount;
      parsedData.coreConceptExtraction.isUnder300Words = computedWordCount <= 300;
    }

    // Token metadata tracking
    const usageMetadata = response.usageMetadata;
    const inputTokens = usageMetadata?.promptTokenCount || 1200;
    const outputTokens = usageMetadata?.candidatesTokenCount || 1800;
    const totalTokens = usageMetadata?.totalTokenCount || (inputTokens + outputTokens);
    const tokenLimit = 25000;
    const tokenBudgetPercent = Number(((totalTokens / tokenLimit) * 100).toFixed(1));

    // Grounding / Web Search attribution
    const searchChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const searchSources = searchChunks
      .map((c: any) => ({
        title: c.web?.title || 'Web Context',
        uri: c.web?.uri || '',
      }))
      .filter((s: any) => s.uri);

    res.json({
      success: true,
      data: parsedData,
      tokenMetrics: {
        inputTokens,
        outputTokens,
        totalTokens,
        tokenLimit,
        tokenBudgetPercent,
        isCompliant: totalTokens < tokenLimit,
      },
      searchSources,
    });
  } catch (error: any) {
    console.error('Error analyzing paper:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'An error occurred while analyzing the paper.',
    });
  }
});

// Setup Vite in development or static serving in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
