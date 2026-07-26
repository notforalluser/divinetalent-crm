// pdfjs-dist and mammoth are dynamically imported below (see getPdfjs and
// extractFromDocx) so their sizeable parsing code only loads when someone
// actually uploads a PDF or DOCX -- not on every page load.

let pdfjsLibPromise = null;
function getPdfjs() {
  if (!pdfjsLibPromise) {
    pdfjsLibPromise = Promise.all([
      import("pdfjs-dist"),
      import("pdfjs-dist/build/pdf.worker.mjs?url"),
    ]).then(([pdfjsLib, workerUrlModule]) => {
      pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrlModule.default;
      return pdfjsLib;
    });
  }
  return pdfjsLibPromise;
}

async function extractFromPdf(file) {
  const pdfjsLib = await getPdfjs();
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
  let text = "";
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    text += content.items.map((item) => item.str).join(" ") + "\n";
  }
  return text;
}

async function extractFromDocx(file) {
  const { default: mammoth } = await import("mammoth");
  const buffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer: buffer });
  return result.value || "";
}

async function extractFromPlainText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Could not read that file."));
    reader.readAsText(file);
  });
}

/**
 * Renders page 1 of an uploaded PDF to a small PNG data URL, so the AI
 * Match "scanning" animation can sweep a scanline across the person's
 * actual resume instead of a generic placeholder. Returns null for
 * anything that isn't a renderable PDF (DOCX/DOC/TXT/MD, or a PDF that
 * fails to render for any reason) -- callers should fall back to a
 * generic document icon in that case.
 */
export async function generateResumeThumbnail(file, maxWidth = 280) {
  if (!file.name.toLowerCase().endsWith(".pdf")) return null;
  try {
    const pdfjsLib = await getPdfjs();
    const buffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: buffer.slice(0) }).promise;
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 1 });
    const scale = maxWidth / viewport.width;
    const scaledViewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    canvas.width = scaledViewport.width;
    canvas.height = scaledViewport.height;
    await page.render({ canvasContext: canvas.getContext("2d"), viewport: scaledViewport }).promise;
    return canvas.toDataURL("image/png");
  } catch {
    return null;
  }
}

/**
 * Extracts plain text from an uploaded resume file. Supports PDF, DOCX,
 * TXT and MD natively. Legacy .doc (old binary Word format) can't be
 * parsed in the browser without a server -- for that case we fall back to
 * a short synthetic placeholder so the rest of the flow (ATS scoring,
 * job matching) still has something to work with instead of crashing.
 */
export async function extractResumeText(file) {
  const name = file.name.toLowerCase();
  try {
    if (name.endsWith(".pdf")) return await extractFromPdf(file);
    if (name.endsWith(".docx")) return await extractFromDocx(file);
    if (name.endsWith(".txt") || name.endsWith(".md")) return await extractFromPlainText(file);
    // Legacy .doc or anything else unsupported client-side.
    return `Resume file: ${file.name}. (Binary .doc format -- text preview unavailable in-browser.)`;
  } catch {
    return `Resume file: ${file.name}. (Could not extract text from this file.)`;
  }
}

export const ACCEPTED_RESUME_TYPES = ".pdf,.doc,.docx,.txt,.md";
