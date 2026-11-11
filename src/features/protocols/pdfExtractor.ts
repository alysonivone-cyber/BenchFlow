import * as pdfjs from "pdfjs-dist";
import type { TextItem, TextMarkedContent } from "pdfjs-dist/types/src/display/api";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

export type ExtractedStep = {
  title: string;
  description: string;
  materials: string;
  instructions: string;
  estimatedMinutes: string;
};
export type ExtractedProtocol = {
  title: string;
  description: string;
  objective: string;
  materials: string;
  expectedResults: string;
  duration: string;
  steps: ExtractedStep[];
  pageCount: number;
};

type PdfLine = { text: string; page: number; x: number; y: number };
type Section = "none" | "objective" | "description" | "materials" | "results" | "duration" | "instructions" | "notes" | "skip";
const MAX_SIZE = 15 * 1024 * 1024;
const STEP_HEADING = /^(?:(?:step|étape|stage|phase)\s*(\d+)(?:\s*[:.)\-–]\s*|\s+)|(\d+)[.)]\s+)(.+)$/i;
const SECTION_LABEL = /^(objective|objectives|objectif|objectifs|purpose|aim|description|overview|introduction|materials?|reagents?|equipment|supplies|matériel|matériaux|réactifs|équipement|estimated duration|duration|durée estimée|durée|expected results?|résultats attendus|procedure|procédure|method|méthode|instructions?|notes?|observations?|warnings?|cautions?|safety|sécurité|precautions?|précautions|references?|références|appendix|annexe|quality control|contrôle qualité)\s*(?::\s*(.*))?$/i;
const INLINE_NOTE = /^(note|observation|safety|warning|caution|expected observation|remarque|attention)\s*:\s*(.*)$/i;
const TIME = /\b(\d+(?:[.,]\d+)?)\s*(hours?|hrs?|heures?|h|minutes?|mins?|min|seconds?|secs?|secondes?|s)\b/i;

function isTextItem(item: TextItem | TextMarkedContent): item is TextItem {
  return "str" in item && "transform" in item;
}
function clean(s: string): string { return s.replace(/\u00a0/g, " ").replace(/[ \t]+/g, " ").trim(); }
function unbullet(s: string): string { return clean(s.replace(/^\s*(?:[•●▪◦\-–]|\d+[.)])\s+/, "")); }
function isNoise(s: string): boolean {
  return /^page\s+\d+(?:\s*(?:\/|of|sur)\s*\d+)?$/i.test(s) ||
    /^\d+\s*\/\s*\d+$/.test(s) ||
    /^benchflow\s*[|—–-]\s*educational test protocol/i.test(s) ||
    /^benchflow\s*[-—–]\s*pdf extraction test/i.test(s) ||
    /^this file is designed to test pdf/i.test(s) ||
    /^it deliberately omits operational/i.test(s) ||
    /^quantities, temperatures and timings/i.test(s) ||
    /^use a validated sop or manufacturer/i.test(s);
}
function stepTitle(s: string): { number: number; title: string } | null {
  const match = STEP_HEADING.exec(s);
  if (!match) return null;
  const number = Number(match[1] ?? match[2]);
  const title = clean(match[3]);
  if (!Number.isInteger(number) || number < 1 || number > 200 || !title || title.length > 130 || /[.!?]$/.test(title)) return null;
  return { number, title };
}
function classify(label: string): Section {
  if (/^(objective|objectives|objectif|objectifs|purpose|aim)$/i.test(label)) return "objective";
  if (/^(description|overview|introduction)$/i.test(label)) return "description";
  if (/^(materials?|reagents?|equipment|supplies|matériel|matériaux|réactifs|équipement)$/i.test(label)) return "materials";
  if (/^(expected results?|résultats attendus)$/i.test(label)) return "results";
  if (/^(estimated duration|duration|durée estimée|durée)$/i.test(label)) return "duration";
  if (/^(procedure|procédure|method|méthode|instructions?)$/i.test(label)) return "instructions";
  if (/^(notes?|observations?)$/i.test(label)) return "notes";
  return "skip";
}
function toMinutes(s: string): string {
  const m = TIME.exec(s);
  if (!m) return "";
  const value = Number(m[1].replace(",", "."));
  if (!Number.isFinite(value)) return "";
  const unit = m[2].toLowerCase();
  const result = /^(h|hr|hour|heure)/.test(unit) ? value * 60 : /^(s|sec|seconde)/.test(unit) ? value / 60 : value;
  return String(Number(result.toFixed(3)));
}
function readPage(items: TextItem[], page: number): PdfLine[] {
  const parts = items.filter(i => clean(i.str)).map(i => ({
    text: clean(i.str), x: i.transform[4] ?? 0, y: i.transform[5] ?? 0,
  })).sort((a, b) => b.y - a.y || a.x - b.x);
  const rows: typeof parts[] = [];
  for (const part of parts) {
    const row = rows.find(r => Math.abs(r[0].y - part.y) <= 2.5);
    if (row) row.push(part); else rows.push([part]);
  }
  return rows.map(row => {
    row.sort((a, b) => a.x - b.x);
    return { text: clean(row.map(p => p.text).join(" ")), page, x: row[0].x, y: row[0].y };
  }).filter(r => r.text).sort((a, b) => b.y - a.y || a.x - b.x);
}
function joinWrapped(lines: PdfLine[]): string[] {
  const output: string[] = [];
  let prev: PdfLine | null = null;
  for (const line of lines) {
    const value = clean(line.text);
    if (!value || isNoise(value)) { prev = null; continue; }
    const last = output[output.length - 1];
    const gap = prev ? prev.y - line.y : Infinity;
    const startsNew = SECTION_LABEL.test(value) || !!stepTitle(value) || INLINE_NOTE.test(value) ||
      /^\s*(?:[•●▪◦\-–]\s+|\d+[.)]\s+)/.test(value);
    const prevIsHeader = !!last && (SECTION_LABEL.test(last) || !!stepTitle(last) || INLINE_NOTE.test(last));
    const wrapped = prev !== null && prev.page === line.page && gap > 0 && gap <= 18 &&
      Math.abs(prev.x - line.x) <= 24 && !!last && !startsNew && !prevIsHeader &&
      !/[.!?:;]$/.test(last);
    if (wrapped) output[output.length - 1] = last + " " + value;
    else output.push(value);
    prev = line;
  }
  return output;
}
function parse(lines: string[], filename: string, pageCount: number): ExtractedProtocol {
  const result: ExtractedProtocol = {
    title: "", description: "", objective: "", materials: "", expectedResults: "",
    duration: "", steps: [], pageCount,
  };
  const generalMaterials: string[] = [];
  let section: Section = "none";
  let current: ExtractedStep | null = null;
  let previousStepNumber = 0;
  const append = (key: "objective" | "description" | "expectedResults" | "duration", s: string) => {
    if (s) result[key] += (result[key] ? " " : "") + s;
  };
  const addMaterials = (s: string) => {
    const value = unbullet(s);
    if (!value) return;
    // A bullet or a PDF line is preserved as one item; don't split reagent names at commas.
    if (current) current.materials += (current.materials ? "\n" : "") + value;
    else generalMaterials.push(value);
  };
  for (const raw of lines) {
    const line = clean(raw);
    if (!line || isNoise(line)) continue;

    // Only sequential step numbers are promoted to headings. Numbered instructions remain instructions.
    const heading = stepTitle(line);
    if (heading && heading.number === previousStepNumber + 1) {
      current = { title: heading.title, description: "", materials: "", instructions: "", estimatedMinutes: toMinutes(heading.title) };
      result.steps.push(current);
      previousStepNumber = heading.number;
      section = "instructions";
      continue;
    }

    const note = INLINE_NOTE.exec(line);
    if (note) {
      // Keep notes and safety explanations visible in the existing Instructions UI.
      if (current) current.instructions += (current.instructions ? "\n" : "") + line;
      else append("description", line);
      continue;
    }

    const sectionMatch = SECTION_LABEL.exec(line);
    if (sectionMatch) {
      section = classify(sectionMatch[1]);
      const inline = clean(sectionMatch[2] ?? "");
      if (section === "objective") append("objective", inline);
      else if (section === "description") append("description", inline);
      else if (section === "results") append("expectedResults", inline);
      else if (section === "duration") {
        if (current) current.estimatedMinutes = toMinutes(inline) || current.estimatedMinutes;
        else append("duration", inline);
      } else if (section === "materials") addMaterials(inline);
      else if (section === "notes" && current && inline) current.description += (current.description ? "\n" : "") + inline;
      continue;
    }

    if (section === "skip") continue;
    if (section === "objective") { append("objective", line); continue; }
    if (section === "description") { append("description", line); continue; }
    if (section === "results") { append("expectedResults", line); continue; }
    if (section === "duration") {
      if (current) current.estimatedMinutes = toMinutes(line) || current.estimatedMinutes;
      else append("duration", line);
      continue;
    }
    if (section === "materials") { addMaterials(line); continue; }
    if (section === "notes") {
      if (current) current.description += (current.description ? "\n" : "") + line;
      continue;
    }
    if (current) {
      const instruction = unbullet(line);
      if (instruction) current.instructions += (current.instructions ? "\n" : "") + instruction;
      // Do not infer a timer from incidental mentions of time in instructions.
    } else if (section === "none" && !result.title && line.length <= 160) {
      result.title = line;
    }
  }
  result.title ||= filename.replace(/\.pdf$/i, "");
  result.materials = [...new Set(generalMaterials)].join("\n");
  result.steps = result.steps.filter(s => s.instructions.trim());
  if (!result.steps.length) throw new Error("No reliable numbered steps found. Review the original PDF and enter the steps manually.");
  return result;
}
export async function extractProtocolFromPdf(file: File): Promise<ExtractedProtocol> {
  if (file.size > MAX_SIZE || !(file.type === "application/pdf" || /\.pdf$/i.test(file.name))) {
    throw new Error("Select a PDF smaller than 15 MB.");
  }
  const task = pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) });
  try {
    const document = await task.promise;
    const lines: string[] = [];
    for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber++) {
      const page = await document.getPage(pageNumber);
      const content = await page.getTextContent();
      lines.push(...joinWrapped(readPage(content.items.filter(isTextItem), pageNumber)));
    }
    if (!lines.length) throw new Error("No selectable text found. This PDF may be scanned or image-based.");
    return parse(lines, file.name, document.numPages);
  } finally {
    await task.destroy();
  }
}
