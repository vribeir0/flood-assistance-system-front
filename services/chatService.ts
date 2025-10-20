import { ChatResponse } from "@/types/chat";
import { api, createEventSource } from "./api";

export const chatService = {
  sendMessage: async (message: string): Promise<ChatResponse> => {
    try {
      const response = await api.post<ChatResponse>("/chat", {
        message,
      });
      return response.data;
    } catch (error) {
      throw new Error("Erro ao enviar mensagem para o backend");
    }
  },
  streamMessage: (message: string): EventSource => {
    const encodedMessage = encodeURIComponent(message);
    return createEventSource(encodedMessage);
  },
};
