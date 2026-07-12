import { Conversation, QAItem, User } from "./types";

export const INITIAL_QA: QAItem[] = [];

export const INITIAL_CONVERSATIONS: Conversation[] = [];

export const INITIAL_USERS: User[] = [
  {
    id: 1,
    email: "magsi2480189@gmail.com",
    username: "magsi",
    plan: "FREE",
    qa_count: 0,
    total_messages: 0,
    joined: "2026-07-10",
    is_premium: false
  }
];
