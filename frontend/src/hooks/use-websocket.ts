
import { useEffect, useRef, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { Alert } from '@shared/schema';

export function useWebSocket() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const socketRef = useRef<WebSocket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // Determine the WebSocket URL
        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const wsUrl = `${protocol}//${window.location.host}/ws`;

        const connect = () => {
            const socket = new WebSocket(wsUrl);
            socketRef.current = socket;

            socket.onopen = () => {
                // console.log('WebSocket Connected');
                setIsConnected(true);
            };

            socket.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);

                    if (message.type === "NEW_ALERT") {
                        const alert = message.data as Alert;

                        // Show toast notification
                        toast({
                            title: `New ${alert.classification} Alert!`,
                            description: `Severity: ${alert.severity.toUpperCase()} - ${alert.attackType}`,
                            variant: "destructive",
                        });

                        // Update queries
                        queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
                        queryClient.invalidateQueries({ queryKey: ["/api/health"] });

                        // Optimistically update alerts cache if it exists
                        queryClient.setQueryData<Alert[]>(["/api/alerts"], (old) => {
                            if (old) {
                                return [alert, ...old];
                            }
                            return [alert];
                        });
                    }
                } catch (error) {
                    console.error("Error parsing WebSocket message", error);
                }
            };

            socket.onclose = () => {
                // console.log('WebSocket Disconnected');
                setIsConnected(false);
                // Attempt to reconnect after a delay
                setTimeout(connect, 3000);
            };

            socket.onerror = (error) => {
                console.error('WebSocket Error', error);
            };
        };

        connect();

        return () => {
            if (socketRef.current) {
                socketRef.current.close();
            }
        };
    }, [toast, queryClient]);

    return { isConnected };
}
