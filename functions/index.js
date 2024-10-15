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

const corsHandler = cors({ origin: true });

export const prepareFileForAI = onRequest((request, response) => {
  return corsHandler(request, response, async () => {
    // Set CORS headers for the preflight request
    if (request.method === "OPTIONS") {
      // Send response to OPTIONS requests
      response.set("Access-Control-Allow-Methods", "GET, POST");
      response.set("Access-Control-Allow-Headers", "Content-Type");
      response.set("Access-Control-Max-Age", "3600");
      response.status(204).send("");
      return;
    }

    try {
      // Ensure the request is a POST
      if (request.method !== "POST") {
        throw new Error("Only POST requests are accepted");
      }

      const { fileName } = request.body;
      if (!fileName) {
        throw new Error("No file name provided");
      }

      logger.info("Preparing file for AI processing", { fileName });

      // TODO: Add file processing logic here in future steps

      logger.info("File processing completed");

      response.json({ success: true, message: "File prepared for AI processing" });
    } catch (error) {
      logger.error("Error in prepareFileForAI:", error);
      response.status(500).json({ success: false, error: error.message });
    }
  });
});
