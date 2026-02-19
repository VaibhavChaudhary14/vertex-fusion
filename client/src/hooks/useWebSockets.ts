import { useEffect, useCallback } from "react";
import { useToast } from "./use-toast";
import { useQueryClient } from "@tanstack/react-query";

export const useWebSockets = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data);
      console.log("WebSocket message received:", data);

      switch (data.type) {
        case "NEW_ALERT":
          toast({
            title: "Security Alert Detected",
            description: `${data.alert.attackType} attack on nodes: ${data.alert.affectedNodes.join(", ")}`,
            variant: "destructive",
          });
          queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
          break;
        case "SIMULATION_STARTED":
          toast({
            title: "Simulation Started",
            description: `Simulation "${data.simulation.name}" is now running.`,
          });
          queryClient.invalidateQueries({ queryKey: ["/api/simulations"] });
          break;
        default:
          break;
      }
    } catch (e) {
      console.error("Error parsing WebSocket message:", e);
    }
  }, [toast, queryClient]);

  useEffect(() => {
    // Avoid connecting to WebSockets during SSR or if window is not defined
    if (typeof window === "undefined") return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    // Replit uses a proxy, so we often need to ensure the host is correct
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/ws`;
    
    console.log("Connecting to WebSocket at:", wsUrl);
    const socket = new WebSocket(wsUrl);

    socket.onmessage = handleMessage;

    socket.onopen = () => {
      console.log("WebSocket connection opened");
    };

    socket.onclose = () => {
      console.log("WebSocket connection closed");
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => {
      socket.close();
    };
  }, [handleMessage]);
};
