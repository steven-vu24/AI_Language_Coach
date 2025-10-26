import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from 'http';
import apiRoutes from './routes/openRouter.js';
import { setupWebSocket } from "./websocket.js";

dotenv.config();

const app = express();
const HTTP_PORT = 5001;
const WS_PORT = 5002;

// Middleware FIRST
app.use(cors());
app.use(express.json());

// Mount routes with /api/openrouter prefix
app.use("/api/openrouter", apiRoutes);

// HTTP server
app.listen(HTTP_PORT, () => {
  console.log(`🚀 HTTP Server: http://localhost:${HTTP_PORT}`);
  console.log(`📍 Routes available:`);
  console.log(`   - POST http://localhost:${HTTP_PORT}/api/openrouter/chat`);
  console.log(`   - POST http://localhost:${HTTP_PORT}/api/openrouter/generate-tts`);
  console.log(`   - GET  http://localhost:${HTTP_PORT}/api/openrouter/test`);
});

// WebSocket server (separate)
const wsServer = createServer();
setupWebSocket(wsServer);
wsServer.listen(WS_PORT, () => {
  console.log(`🔌 WebSocket Server: ws://localhost:${WS_PORT}/ws/transcribe`);
});