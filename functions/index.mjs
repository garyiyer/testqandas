// Uncomment and use these imports if needed
// import { onRequest } from 'firebase-functions/v2/https';
// import logger from 'firebase-functions/logger';

// Example function (uncomment and modify as needed)
// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", { structuredData: true });
//   response.send("Hello from Firebase!");
// });

import { onRequest } from "firebase-functions/v2/https";
import { logger } from "firebase-functions";
import cors from "cors";
import { initializeApp } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";
import { getFirestore } from "firebase-admin/firestore";

// Initialize Firebase app
initializeApp();

const corsHandler = cors({ origin: true });
const storage = getStorage();
const db = getFirestore();

// Simple tokenizer function
function simpleTokenize(text) {
  return text.toLowerCase().match(/\b(\w+)\b/g) || [];
}

export const prepareFileForAI = onRequest((request, response) => {
  return corsHandler(request, response, async () => {
    try {
      const { fileName } = request.body;
      if (!fileName) throw new Error("No file name provided");

      const fileBuffer = await retrieveFileFromStorage(fileName);
      const fileType = getFileType(fileName);
      const text = await extractTextFromFile(fileBuffer, fileType);
      const chunks = createChunks(text);
      const tokenizedChunks = tokenizeChunks(chunks);
      await storeProcessedData(fileName, tokenizedChunks);

      const totalChunks = tokenizedChunks.length;
      const totalTokens = tokenizedChunks.reduce((sum, chunk) => sum + chunk.tokenCount, 0);

      logger.info("File processing completed", { totalChunks, totalTokens });
      response.json({
        success: true,
        message: "File prepared for AI processing",
        totalChunks,
        totalTokens,
      });
    } catch (error) {
      logger.error("Error in prepareFileForAI:", error);
      response.status(500).json({ success: false, error: error.message });
    }
  });
});

function getFileType(fileName) {
  const extension = fileName.split(".").pop().toLowerCase();
  const supportedTypes = {
    pdf: "application/pdf",
    txt: "text/plain",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    webp: "image/webp",
  };
  const mimeType = supportedTypes[extension];
  if (!mimeType) throw new Error(`Unsupported file type: ${extension}`);
  return mimeType;
}

async function extractTextFromFile(fileBuffer, fileType) {
  if (fileType === "application/pdf") {
    // For now, we'll just return a placeholder for PDF files
    return "PDF content placeholder";
  } else if (fileType === "text/plain") {
    return fileBuffer.toString("utf-8");
  } else {
    // For image types, we can't extract text directly
    return "Image file processed";
  }
}

function createChunks(text, maxChunkSize = 1000, overlap = 100) {
  const words = text.split(/\s+/);
  const chunks = [];
  let currentChunk = [];

  for (let i = 0; i < words.length; i++) {
    currentChunk.push(words[i]);
    if (currentChunk.length === maxChunkSize) {
      chunks.push(currentChunk.join(" "));
      currentChunk = words.slice(i - overlap + 1, i + 1);
    }
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk.join(" "));
  }

  return chunks;
}

function tokenizeChunks(chunks) {
  return chunks.map((chunk) => {
    const tokens = simpleTokenize(chunk);
    return {
      text: chunk,
      tokens: tokens,
      tokenCount: tokens.length,
    };
  });
}

async function retrieveFileFromStorage(fileName) {
  const bucket = storage.bucket();
  const file = bucket.file(`uploads/${fileName}`);
  const [fileBuffer] = await file.download();
  return fileBuffer;
}

async function storeProcessedData(fileName, tokenizedChunks) {
  const docRef = db.collection("processedFiles").doc(fileName);
  const totalTokens = tokenizedChunks.reduce(
      (sum, chunk) => sum + chunk.tokenCount,
      0,
  );
  await docRef.set({
    fileName,
    chunks: tokenizedChunks,
    totalTokens,
    processedAt: new Date(),
  });
}
