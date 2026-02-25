"use client";

import { useEffect, useRef } from "react";
import type { Message } from "@penntools/core/types";
import { MessageBubble } from "./MessageBubble";
import styles from "./ChatThread.module.css";

interface ChatThreadProps {
  messages: Message[];
  isLoading: boolean;
}

export function ChatThread({ messages, isLoading }: ChatThreadProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, isLoading]);

  return (
    <div className={styles.thread}>
      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} />
      ))}

      {isLoading && (
        <div className={styles.thinking}>
          <span className={styles.dot} />
          <span className={styles.dot} />
          <span className={styles.dot} />
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
