"use client";

import { useState, useEffect, useCallback } from "react";
import type { Message, Chat } from "@penntools/core/types";

interface UseChatOptions {
  userId: string | null;
  chatId: string | null;
}

interface UseChatResult {
  messages: Message[];
  chats: Chat[];
  isLoading: boolean;
  sendMessage: (content: string) => Promise<void>;
  startNewChat: () => Promise<string | null>;
}

export function useChat({ userId, chatId }: UseChatOptions): UseChatResult {
  const [messages, setMessages] = useState<Message[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load chat list.
  useEffect(() => {
    if (!userId) return;
    fetch("/api/chats")
      .then((r) => r.json())
      .then((data: { chats: Chat[] }) => setChats(data.chats))
      .catch(console.error);
  }, [userId]);

  // Load messages when active chat changes.
  useEffect(() => {
    if (!chatId) {
      setMessages([]);
      return;
    }
    setIsLoading(true);
    fetch(`/api/chats/${chatId}`)
      .then((r) => r.json())
      .then((data: { messages: Message[] }) => setMessages(data.messages))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [chatId]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!chatId) return;
      setIsLoading(true);

      // Optimistic user message (no id yet).
      const optimistic: Message = {
        id: `optimistic-${Date.now()}`,
        chatId,
        userId: userId ?? "",
        role: "user",
        content,
        toolId: null,
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, optimistic]);

      try {
        const apiKey = typeof window !== "undefined"
          ? (localStorage.getItem("penntools_api_key") ?? "")
          : "";
        const res = await fetch("/api/chat/send", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(apiKey ? { "X-Api-Key": apiKey } : {}),
          },
          body: JSON.stringify({ chatId, content }),
        });
        const data = (await res.json()) as {
          userMessage: Message;
          assistantMessage: Message;
        };

        // Replace the optimistic message with the real one.
        setMessages((prev) => [
          ...prev.filter((m) => m.id !== optimistic.id),
          data.userMessage,
          data.assistantMessage,
        ]);

        // Refresh chat list to update title / ordering.
        const chatsRes = await fetch("/api/chats");
        const chatsData = (await chatsRes.json()) as { chats: Chat[] };
        setChats(chatsData.chats);
      } catch (err) {
        console.error(err);
        // Remove the optimistic message on error.
        setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      } finally {
        setIsLoading(false);
      }
    },
    [chatId, userId]
  );

  const startNewChat = useCallback(async (): Promise<string | null> => {
    try {
      const res = await fetch("/api/chats/new", { method: "POST" });
      const data = (await res.json()) as { chat: Chat };
      setChats((prev) => [data.chat, ...prev]);
      return data.chat.id;
    } catch (err) {
      console.error(err);
      return null;
    }
  }, []);

  return { messages, chats, isLoading, sendMessage, startNewChat };
}
