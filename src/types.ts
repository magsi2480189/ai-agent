export interface User {
  id: number;
  email: string;
  username: string;
  plan: 'FREE' | 'PRO ⭐' | 'ULTIMATE 👑';
  qa_count: number;
  total_messages: number;
  joined: string;
  premium_expiry?: string;
  is_premium: boolean;
  payment_status?: 'Pending Approval' | 'Approved' | 'Rejected' | 'None';
  subscription_status?: 'Active' | 'Inactive';
  rejection_reason?: string;
}

export interface Payment {
  id: number;
  user_id: number;
  user_email: string;
  user_name: string;
  user_whatsapp: string;
  plan_name: string;
  payment_method: 'JazzCash' | 'EasyPaisa' | 'Bank Transfer';
  account_name: string;
  payment_number: string;
  transaction_id: string;
  amount: number;
  payment_date: string;
  screenshot: string; // Base64 data URI of secure upload
  notes: string;
  status: 'Pending Approval' | 'Approved' | 'Rejected';
  rejection_reason?: string;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  phone: string;
  message: string;
  reply: string | null;
  status: 'answered' | 'ignored';
  time: string;
  timestamp: string;
}

export interface QAItem {
  question: string;
  answer: string;
}

export interface BusinessSetup {
  business_description: string;
  owner_number: string;
}
