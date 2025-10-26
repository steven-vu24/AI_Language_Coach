import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import openRouterRoutes from "./routes/openRouter.js";
import { setupWebSocket } from "./websocket.js";
import apiRoutes from './routes/openRouter.js';

dotenv.config();

const app = express();
const HTTP_PORT = 5001;
const WS_PORT = 5002;

app.use('/api', apiRoutes);
app.use(cors());
app.use(express.json());
app.use("/api/openrouter", openRouterRoutes);

// HTTP server
app.listen(HTTP_PORT, () => {
  console.log(`🚀 HTTP Server: http://localhost:${HTTP_PORT}`);
});

// WebSocket server (separate)
const wsServer = createServer();
setupWebSocket(wsServer);
wsServer.listen(WS_PORT, () => {
  console.log(`🔌 WebSocket Server: ws://localhost:${WS_PORT}/ws/transcribe`);
});