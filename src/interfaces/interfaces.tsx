export interface User {
  id: number;
  name: string;
  avatar: string | null;
}

export interface Chat {
  id: number;
  label: string;
  participants: User[];
  lastMessage: string;
  lastMessageAt: string; // ISO date string
  lastMessageBy?: number;
  isReaded: boolean;
  isGroup: boolean;
}

export interface Message {
  id: number;
  chatId: number;
  senderId?: number;
  body: string;
  createdAt: string; // ISO date string
  replyTo?: Message | number | null;
  isReaded: boolean;
}

export interface MessageAction {
  action: "edit" | "reply" | "share";
  title: string;
  body: string;
  relatedMessageId: number;
}