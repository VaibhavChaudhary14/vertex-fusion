import { WebSocketServer, WebSocket } from "ws";
import type { Server } from "http";
import { log } from "./index";

export function setupWebSockets(server: Server) {
  const wss = new WebSocketServer({ server, path: "/ws" });

  wss.on("connection", (ws) => {
    log("New WebSocket connection established", "websocket");

    ws.on("message", (message) => {
      try {
        const data = JSON.parse(message.toString());
        log(`Received WS message: ${JSON.stringify(data)}`, "websocket");
      } catch (e) {
        log("Error parsing WS message", "error");
      }
    });

    ws.on("close", () => {
      log("WebSocket connection closed", "websocket");
    });

    ws.on("error", (error) => {
      log(`WebSocket error: ${error.message}`, "error");
    });
  });

  return wss;
}

export const broadcast = (wss: WebSocketServer, message: any) => {
  const data = JSON.stringify(message);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
};
