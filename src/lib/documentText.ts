import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.mjs?url";
import mammoth from "mammoth/mammoth.browser";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const SUPPORTED_EXTENSIONS = ["txt", "pdf", "docx"] as const;

export type SupportedDocumentExtension = (typeof SUPPORTED_EXTENSIONS)[number];

export const supportedDocumentLabel = "TXT, PDF, DOCX";

const getExtension = (filename: string) => filename.split(".").pop()?.toLowerCase() ?? "";

export const isSupportedDocument = (file: File) =>
  SUPPORTED_EXTENSIONS.includes(getExtension(file.name) as SupportedDocumentExtension);

export const validateDocumentFile = (file: File) => {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error("File size must be less than 5MB.");
  }

  if (!isSupportedDocument(file)) {
    throw new Error(`Unsupported file type. Please upload ${supportedDocumentLabel} files.`);
  }
};

const assertExtractedText = (text: string, filename: string) => {
  const normalized = text.replace(/\s+/g, " ").trim();

  if (!normalized) {
    throw new Error(
      `No readable text was found in ${filename}. Try a text-based contract instead of a scanned or encrypted file.`,
    );
  }

  return text.trim();
};

const extractPdfText = async (file: File) => {
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) }).promise;
  const pages: string[] = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    const text = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .filter(Boolean)
      .join(" ");

    pages.push(text);
  }

  return pages.join("\n\n");
};

const extractDocxText = async (file: File) => {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });

  return result.value;
};

export const extractDocumentText = async (file: File) => {
  validateDocumentFile(file);

  const extension = getExtension(file.name);

  try {
    if (extension === "txt") {
      return assertExtractedText(await file.text(), file.name);
    }

    if (extension === "pdf") {
      return assertExtractedText(await extractPdfText(file), file.name);
    }

    if (extension === "docx") {
      return assertExtractedText(await extractDocxText(file), file.name);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "This document could not be read.";
    throw new Error(message.includes("No readable text") ? message : `Could not read ${file.name}. ${message}`);
  }

  throw new Error(`Unsupported file type. Please upload ${supportedDocumentLabel} files.`);
};
