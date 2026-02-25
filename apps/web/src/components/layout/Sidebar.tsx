"use client";

import type { Chat } from "@penntools/core/types";
import styles from "./Sidebar.module.css";

interface SidebarProps {
  chats: Chat[];
  activeChatId: string | null;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
}

function IconNewChat() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function IconSearch() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
    </svg>
  );
}

function IconChat() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function IconGrid() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  );
}

export function Sidebar({ chats, activeChatId, onSelectChat, onNewChat }: SidebarProps) {
  return (
    <aside className={styles.sidebar}>
      {/* Top nav */}
      <nav className={styles.topNav}>
        <button className={styles.newChat} onClick={onNewChat}>
          <IconNewChat />
          <span>New chat</span>
        </button>
        <button className={styles.navItem} disabled>
          <IconSearch />
          <span>Search chats</span>
        </button>
        <button className={styles.navItem} disabled>
          <IconGrid />
          <span>Dashboard</span>
        </button>
      </nav>

      {/* Tools section */}
      <div className={styles.section}>
        <p className={styles.sectionLabel}>Tools</p>
        <button className={styles.navItem} disabled>
          <span className={styles.toolIcon}>🎓</span>
          <span>Course Finder</span>
        </button>
        <button className={styles.navItem} disabled>
          <span className={styles.toolIcon}>🔍</span>
          <span>Explore Tools</span>
        </button>
      </div>

      {/* Chats section */}
      <div className={styles.section}>
        {chats.length > 0 && <p className={styles.sectionLabel}>Chats</p>}
        <div className={styles.chatList}>
          {chats.map((chat) => (
            <button
              key={chat.id}
              className={[styles.chatItem, chat.id === activeChatId ? styles.active : ""].join(" ")}
              onClick={() => onSelectChat(chat.id)}
            >
              <IconChat />
              <span className={styles.chatTitle}>{chat.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Bottom: user */}
      <div className={styles.userRow}>
        <div className={styles.avatar}>A</div>
        <div className={styles.userInfo}>
          <span className={styles.userName}>Anonymous</span>
        </div>
      </div>
    </aside>
  );
}
