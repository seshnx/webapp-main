/* prettier-ignore-start */

/* eslint-disable */
/**
 * Generated data model.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type { DataModelFromSchemaDefinition } from "convex/server";
import type { GenericId, Id } from "./server";
import type { DocumentByName, TableNames } from "./server";

/**
 * The names of all of your Convex tables.
 */
export type TableNames = "chatMembers" | "conversations" | "messages" | "presence" | "readReceipts";

/**
 * The type of a document stored in Convex.
 */
export type Doc<TableName extends TableNames> = DocumentByName<DataModel, TableName>;

/**
 * The type of a document ID.
 */
export type Id<TableName extends TableNames> = GenericId<TableName>;

/**
 * The type of your Convex data model.
 */
export type DataModel = DataModelFromSchemaDefinition<{
  chatMembers: {
    chatId: string;
    joinedAt: number;
    role: "admin" | "member";
    userId: string;
  };
  conversations: {
    chatId: string;
    chatName?: string;
    chatPhoto?: string;
    chatType: "direct" | "group";
    lastMessage?: string;
    lastMessageTime?: number;
    lastSenderId?: string;
    otherUserId?: string;
    unreadCount: number;
    userId: string;
  };
  messages: {
    chatId: string;
    content?: string;
    deleted?: boolean;
    deletedForAll?: boolean;
    edited?: boolean;
    editedAt?: number;
    media?: {
      thumbnail?: string;
      type: string;
      url: string;
    };
    reactions?: Record<string, string[]>;
    replyTo?: {
      messageId: string;
      sender: string;
      text: string;
    };
    senderId: string;
    senderName: string;
    senderPhoto?: string;
    timestamp: number;
  };
  presence: {
    lastSeen: number;
    online: boolean;
    userId: string;
  };
  readReceipts: {
    chatId: string;
    messageId: GenericId<"messages">;
    readAt: number;
    userId: string;
  };
}>;

/* prettier-ignore-end */

