
import { WebSocket, WebSocketServer } from "ws";
import { Server } from "http";
import { parse } from "url";

let wss: WebSocketServer | null = null;

export function setupWebSocket(server: Server) {
    wss = new WebSocketServer({ noServer: true });

    server.on("upgrade", (request, socket, head) => {
        const { pathname } = parse(request.url || "", true);

        if (pathname === "/ws") {
            wss?.handleUpgrade(request, socket, head, (ws) => {
                wss?.emit("connection", ws, request);
            });
        } else {
            socket.destroy();
        }
    });

    wss.on("connection", (ws) => {
        // console.log("New WebSocket connection");

        ws.on("message", (message) => {
            // Handle incoming messages if needed
            // console.log("Received:", message);
        });

        ws.on("close", () => {
            // console.log("WebSocket connection closed");
        });

        // Send a welcome message or initial state
        ws.send(JSON.stringify({ type: "CONNECTED", message: "Connected to Vertex Fusion Real-Time Stream" }));
    });
}

export function broadcast(type: string, data: any) {
    if (!wss) return;

    const message = JSON.stringify({ type, data });
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}
