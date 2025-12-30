
import { SiteData, User, Transaction, SiteConfig, UserRole, UserStatus, TransactionStatus, NewsItem } from '../types';

const STORAGE_KEY = 'minecoin_db_v1';

const DEFAULT_CONFIG: SiteConfig = {
  coinPrice: 10000,
  adminBankName: '국민은행',
  adminAccountNumber: '123-456-789012',
  adminAccountHolder: '마인코인(주)',
  techContent: 'MineCoin은 차세대 블록체인 기술인 PoS 3.0을 기반으로 하여, 초당 100,000건의 트랜잭션을 처리할 수 있는 확장성을 가집니다. 레이어 2 솔루션을 기본 탑재하여 가스비를 최소화했습니다.',
  roadmapContent: '2024 Q1: 백서 공개 및 시드 세일\n2024 Q2: 메인넷 런칭 및 지갑 출시\n2024 Q3: 글로벌 거래소 상장\n2024 Q4: NFT 마켓플레이스 오픈',
  benefitsContent: '보유만 해도 이자가 쌓이는 스테이킹 시스템, 거버넌스 투표권 제공, 생태계 내 수수료 할인 혜택 등 다양한 홀더 친화적 정책을 운영합니다.',
};

const DEFAULT_MASTER: User = {
  id: 'master-001',
  username: 'master',
  password: 'master1234',
  name: '최고관리자',
  phone: '010-1111-2222',
  bankName: '-',
  accountNumber: '-',
  role: UserRole.MASTER,
  status: UserStatus.APPROVED,
  createdAt: new Date().toISOString(),
};

const DEFAULT_ADMIN: User = {
  id: 'admin-001',
  username: 'coinmaster',
  password: '1234', 
  name: '일반관리자',
  phone: '010-0000-0000',
  bankName: '-',
  accountNumber: '-',
  role: UserRole.ADMIN,
  status: UserStatus.APPROVED,
  createdAt: new Date().toISOString(),
};

const DEFAULT_NEWS: NewsItem[] = [
  {
    id: 'news-1',
    title: 'MineCoin 글로벌 거래소 상장 예정 안내',
    category: 'NOTICE',
    content: '2024년 4분기, 글로벌 Top 10 거래소 상장이 확정되었습니다. 자세한 일정은 추후 공지됩니다.',
    date: '2024-10-25T09:00:00.000Z'
  },
];

const generateUUID = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    try { return crypto.randomUUID(); } catch (e) {}
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const saveDB = (data: SiteData) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Storage Save Error:", e);
    alert("데이터 저장 실패: 브라우저 용량을 확인해주세요.");
  }
};

const initDB = (): SiteData => {
  const stored = localStorage.getItem(STORAGE_KEY);
  let data: any = null;
  let isDirty = false;

  if (stored) {
    try {
      data = JSON.parse(stored);
    } catch (e) {
      data = null;
    }
  }

  if (!data || typeof data !== 'object') {
    data = {
      users: [DEFAULT_MASTER, DEFAULT_ADMIN],
      transactions: [],
      news: DEFAULT_NEWS,
      config: DEFAULT_CONFIG
    };
    isDirty = true;
  }

  if (!Array.isArray(data.users)) { data.users = [DEFAULT_MASTER, DEFAULT_ADMIN]; isDirty = true; }
  
  // Migration: Ensure all users have a status
  data.users = data.users.map((u: any) => ({
    ...u,
    status: u.status || UserStatus.APPROVED
  }));

  if (!Array.isArray(data.transactions)) { data.transactions = []; isDirty = true; }
  if (!Array.isArray(data.news)) { data.news = DEFAULT_NEWS; isDirty = true; }

  if (!data.users.find((u: User) => u.role === UserRole.MASTER)) {
    data.users.unshift(DEFAULT_MASTER);
    isDirty = true;
  }

  if (!data.config || typeof data.config !== 'object') {
    data.config = DEFAULT_CONFIG;
    isDirty = true;
  }

  if (isDirty) saveDB(data);
  return data as SiteData;
};

export const getDB = (): SiteData => initDB();

export const resetDB = () => {
  localStorage.removeItem(STORAGE_KEY);
  initDB();
  window.location.reload();
};

export const resetUserData = (): { deletedUsers: number, deletedTransactions: number } => {
  const db = getDB();
  
  const initialUserCount = db.users.length;
  
  // 최고관리자(MASTER)를 제외한 모든 계정(일반관리자 포함)과 거래내역을 삭제합니다.
  db.users = db.users.filter(u => u.role === UserRole.MASTER);
  
  const deletedUsers = initialUserCount - db.users.length;

  const deletedTransactions = db.transactions.length;
  // 모든 거래 내역 삭제
  db.transactions = [];
  
  saveDB(db);
  
  return { deletedUsers, deletedTransactions };
};

export const registerUser = (user: Omit<User, 'id' | 'role' | 'createdAt' | 'status'>): { success: boolean; message: string } => {
  const db = getDB();
  if (db.users.find((u) => u.username === user.username)) {
    return { success: false, message: '이미 존재하는 아이디입니다.' };
  }
  db.users.push({
    ...user,
    id: generateUUID(),
    role: UserRole.USER,
    status: UserStatus.PENDING, // New users are pending
    createdAt: new Date().toISOString(),
  });
  saveDB(db);
  return { success: true, message: '회원가입 신청이 완료되었습니다. 관리자 승인 후 로그인이 가능합니다.' };
};

export const registerAdmin = (user: Omit<User, 'id' | 'role' | 'createdAt' | 'status'>): { success: boolean; message: string } => {
  const db = getDB();
  if (db.users.find((u) => u.username === user.username)) {
    return { success: false, message: '이미 존재하는 아이디입니다.' };
  }
  db.users.push({
    ...user,
    id: generateUUID(),
    role: UserRole.ADMIN,
    status: UserStatus.APPROVED, // Admins created by admin are approved
    createdAt: new Date().toISOString(),
  });
  saveDB(db);
  return { success: true, message: '관리자 계정이 생성되었습니다.' };
};

export const loginUser = (username: string, password: string): { user: User | null; error?: string } => {
  const db = getDB();
  const user = db.users.find((u) => u.username === username && u.password === password);
  
  if (!user) return { user: null, error: '아이디 또는 비밀번호가 올바르지 않습니다.' };
  
  if (user.status === UserStatus.PENDING) {
    return { user: null, error: '가입 승인 대기 중입니다. 관리자 승인 후 이용 가능합니다.' };
  }
  
  if (user.status === UserStatus.REJECTED) {
    return { user: null, error: '가입 신청이 거절되었습니다. 관리자에게 문의하세요.' };
  }

  return { user };
};

export const updateUserStatus = (userId: string, status: UserStatus) => {
  const db = getDB();
  const user = db.users.find(u => u.id === userId);
  if (user) {
    user.status = status;
    saveDB(db);
  }
};

export const updateUser = (userId: string, updates: Partial<User>): User | null => {
  const db = getDB();
  const idx = db.users.findIndex((u) => u.id === userId);
  if (idx === -1) return null;
  db.users[idx] = { ...db.users[idx], ...updates };
  saveDB(db);
  return db.users[idx];
};

export const deleteUser = (userId: string): boolean => {
  const db = getDB();
  const originalLength = db.users.length;
  // Protect Master
  const userToDelete = db.users.find(u => u.id === userId);
  if (userToDelete?.role === UserRole.MASTER) return false;

  db.users = db.users.filter(u => u.id !== userId);
  if (db.users.length < originalLength) {
    saveDB(db);
    return true;
  }
  return false;
};

export const getAllUsers = () => getDB().users;

export const createTransaction = (userId: string, amount: number): Transaction | null => {
  try {
    const db = getDB();
    const price = db.config.coinPrice || 10000;
    const newTx: Transaction = {
      id: generateUUID(),
      userId,
      amount,
      priceAtPurchase: price,
      totalCost: amount * price,
      date: new Date().toISOString(),
      status: TransactionStatus.PENDING,
      isDeleted: false
    };
    db.transactions.push(newTx);
    saveDB(db);
    return newTx;
  } catch (e) {
    return null;
  }
};

export const getUserTransactions = (userId: string) => {
  return getDB().transactions
    .filter((tx) => tx.userId === userId && !tx.isDeleted)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const getAllTransactions = () => {
  return getDB().transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const updateTransactionStatus = (txId: string, status: TransactionStatus) => {
  const db = getDB();
  const tx = db.transactions.find((t) => t.id === txId);
  if (tx) {
    tx.status = status;
    saveDB(db);
  }
};

export const deleteTransaction = (txId: string) => {
  const db = getDB();
  const tx = db.transactions.find((t) => t.id === txId);
  if (tx) {
    tx.isDeleted = true;
    saveDB(db);
  }
};

export const restoreTransaction = (txId: string) => {
  const db = getDB();
  const tx = db.transactions.find((t) => t.id === txId);
  if (tx) {
    tx.isDeleted = false;
    saveDB(db);
  }
};

export const getUserApprovedCoinTotal = (userId: string) => {
  return getDB().transactions
    .filter((tx) => tx.userId === userId && tx.status === TransactionStatus.APPROVED && !tx.isDeleted)
    .reduce((sum, tx) => sum + tx.amount, 0);
};

export const getNews = () => getDB().news.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

export const addNews = (news: Omit<NewsItem, 'id' | 'date'>) => {
  const db = getDB();
  const newItem = { ...news, id: generateUUID(), date: new Date().toISOString() };
  db.news.push(newItem);
  saveDB(db);
};

export const deleteNews = (id: string) => {
  const db = getDB();
  db.news = db.news.filter(n => n.id !== id);
  saveDB(db);
};

export const getSiteConfig = () => getDB().config;

export const updateSiteConfig = (updates: Partial<SiteConfig>) => {
  const db = getDB();
  db.config = { ...db.config, ...updates };
  saveDB(db);
  return db.config;
};
