import * as XLSX from "xlsx";
import { getUploadedWorkbook } from "./localWorkbookStore";

// Path to the workbook. Swap this for your own file, or see README.md
// for how to point this at OneDrive/Google Sheets/an API instead.
export const DATA_SOURCE_URL = "/data/crm-data.xlsx";

const SHEETS = ["Candidates", "Jobs", "Recruiters", "Interviews", "TechnicalHelp", "Activity", "MarketingActivity"];

function parseWorkbook(buffer) {
  const workbook = XLSX.read(buffer, { type: "array", cellDates: true });
  const result = { fetchedAt: new Date().toISOString() };
  for (const sheetName of SHEETS) {
    const sheet = workbook.Sheets[sheetName];
    result[sheetName] = sheet ? XLSX.utils.sheet_to_json(sheet, { defval: "" }) : [];
  }
  return result;
}

/**
 * Fetches the workbook fresh (cache-busted) and returns
 * { Candidates: [...], Jobs: [...], ... , fetchedAt, source }
 *
 * If the person has uploaded a replacement file from Settings, that
 * uploaded workbook (stored in the browser via IndexedDB) is used instead
 * of fetching /data/crm-data.xlsx -- effectively "replacing" the bundled
 * demo data without needing a backend.
 */
export async function loadWorkbook(url = DATA_SOURCE_URL) {
  const uploaded = await getUploadedWorkbook().catch(() => null);
  if (uploaded?.buffer) {
    const parsed = parseWorkbook(uploaded.buffer);
    parsed.source = { type: "uploaded", name: uploaded.name, uploadedAt: uploaded.uploadedAt };
    return parsed;
  }

  const bust = url.includes("?") ? `&t=${Date.now()}` : `?t=${Date.now()}`;
  const res = await fetch(url + bust, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Could not load ${url} (${res.status}). Make sure the file exists in /public/data.`);
  }
  const buffer = await res.arrayBuffer();
  const parsed = parseWorkbook(buffer);
  parsed.source = { type: "bundled", name: "crm-data.xlsx" };
  return parsed;
}
