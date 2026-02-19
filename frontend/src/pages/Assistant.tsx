import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { AIChatbot } from "@/components/AIChatbot";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { ChatMessage } from "@shared/schema";

export default function Assistant() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const chatMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest("POST", "/api/chat", { message: content });
      return response.json();
    },
    onSuccess: (data) => {
      const assistantMessage: ChatMessage = {
        id: Date.now().toString(),
        userId: null,
        role: "assistant",
        content: data.response,
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to get response. Please try again.",
        variant: "destructive",
      });
      setMessages((prev) => prev.slice(0, -1));
    },
  });

  const handleSendMessage = (content: string) => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      userId: null,
      role: "user",
      content,
      createdAt: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    chatMutation.mutate(content);
  };

  return (
    <div className="p-4 h-full flex flex-col">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold">AI Threat Analyst</h1>
        <p className="text-sm text-muted-foreground">
          Ask questions about smart grid security, attack detection, and mitigation strategies
        </p>
      </div>

      <div className="flex-1 min-h-0">
        <AIChatbot
          messages={messages}
          onSendMessage={handleSendMessage}
          isLoading={chatMutation.isPending}
        />
      </div>
    </div>
  );
}
