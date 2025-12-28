export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  MASTER = 'MASTER',
}

export enum TransactionStatus {
  PENDING = '승인 대기중',
  APPROVED = '구매 완료',
  REJECTED = '승인 반려',
}

export interface User {
  id: string;
  username: string; // ID
  password: string;
  name: string;
  phone: string;
  bankName: string;
  accountNumber: string;
  role: UserRole;
  createdAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number; // Coin count
  priceAtPurchase: number; // Price per coin at time of request
  totalCost: number;
  date: string;
  status: TransactionStatus;
  isDeleted?: boolean; // Soft delete flag
}

export interface NewsItem {
  id: string;
  title: string;
  category: 'NOTICE' | 'EVENT' | 'UPDATE';
  content: string;
  date: string;
}

export interface SiteConfig {
  coinPrice: number;
  adminBankName: string;
  adminAccountNumber: string;
  adminAccountHolder: string;
  techContent: string;
  roadmapContent: string;
  benefitsContent: string;
}

export interface SiteData {
  users: User[];
  transactions: Transaction[];
  news: NewsItem[];
  config: SiteConfig;
}