"use client";

import type { Message } from "@penntools/core/types";
import styles from "./MessageBubble.module.css";

export function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";

  return (
    <div className={[styles.row, isUser ? styles.rowUser : ""].join(" ")}>
      {!isUser && <div className={styles.avatar} aria-hidden>A</div>}
      <div className={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAssistant].join(" ")}>
        {message.toolId && (
          <div><span className={styles.toolBadge}>via {message.toolId}</span></div>
        )}
        <p className={styles.content}>{message.content}</p>
      </div>
    </div>
  );
}
