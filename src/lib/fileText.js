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

function groupItemsIntoLines(items) {
  const sorted = [...items].sort((a, b) => {
    const yDiff = b.transform[5] - a.transform[5];
    if (Math.abs(yDiff) > 3) return yDiff;
    return a.transform[4] - b.transform[4];
  });

  const lines = [];
  let currentLine = [];
  let lastY = null;

  for (const item of sorted) {
    const y = Math.round(item.transform[5]);
    if (lastY === null || Math.abs(y - lastY) <= 3) {
      currentLine.push(item.str);
    } else {
      lines.push(currentLine.join(" ").replace(/\s+/g, " ").trim());
      currentLine = [item.str];
    }
    lastY = y;
  }
  if (currentLine.length) lines.push(currentLine.join(" ").replace(/\s+/g, " ").trim());
  return lines.filter((l) => l.length > 0);
}

async function extractFromPdf(file) {
  const pdfjsLib = await getPdfjs();
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
  let text = "";
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    const lines = groupItemsIntoLines(content.items);
    text += lines.join("\n") + "\n";
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