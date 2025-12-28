import { SiteData, User, Transaction, SiteConfig, UserRole, TransactionStatus, NewsItem } from '../types';

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

// Robust InitDB
const initDB = (): SiteData => {
  const stored = localStorage.getItem(STORAGE_KEY);
  let data: any = null;
  let isDirty = false;

  // 1. Try Parse
  if (stored) {
    try {
      data = JSON.parse(stored);
    } catch (e) {
      console.warn("Storage corrupted, resetting.");
      data = null;
    }
  }

  // 2. Initialize Structure if missing
  if (!data || typeof data !== 'object') {
    data = {
      users: [DEFAULT_MASTER, DEFAULT_ADMIN],
      transactions: [],
      news: DEFAULT_NEWS,
      config: DEFAULT_CONFIG
    };
    isDirty = true;
  }

  // 3. Check & Fix Arrays
  if (!Array.isArray(data.users)) { data.users = [DEFAULT_MASTER, DEFAULT_ADMIN]; isDirty = true; }
  if (!Array.isArray(data.transactions)) { data.transactions = []; isDirty = true; }
  if (!Array.isArray(data.news)) { data.news = DEFAULT_NEWS; isDirty = true; }

  // 4. Ensure Master Exists
  if (!data.users.find((u: User) => u.role === UserRole.MASTER)) {
    data.users.unshift(DEFAULT_MASTER);
    isDirty = true;
  }

  // 5. Check & Fix Config
  if (!data.config || typeof data.config !== 'object') {
    data.config = DEFAULT_CONFIG;
    isDirty = true;
  } else {
    const merged = { ...DEFAULT_CONFIG, ...data.config };
    if (JSON.stringify(merged) !== JSON.stringify(data.config)) {
      data.config = merged;
      isDirty = true;
    }
  }

  if (isDirty) {
    saveDB(data);
  }

  return data as SiteData;
};

export const getDB = (): SiteData => initDB();

// New: Reset DB function
export const resetDB = () => {
  localStorage.removeItem(STORAGE_KEY);
  initDB();
  window.location.reload();
};

// --- Services ---

export const registerUser = (user: Omit<User, 'id' | 'role' | 'createdAt'>): { success: boolean; message: string } => {
  const db = getDB();
  if (db.users.find((u) => u.username === user.username)) {
    return { success: false, message: '이미 존재하는 아이디입니다.' };
  }
  db.users.push({
    ...user,
    id: generateUUID(),
    role: UserRole.USER,
    createdAt: new Date().toISOString(),
  });
  saveDB(db);
  return { success: true, message: '회원가입이 완료되었습니다.' };
};

// New: Register Admin
export const registerAdmin = (user: Omit<User, 'id' | 'role' | 'createdAt'>): { success: boolean; message: string } => {
  const db = getDB();
  if (db.users.find((u) => u.username === user.username)) {
    return { success: false, message: '이미 존재하는 아이디입니다.' };
  }
  db.users.push({
    ...user,
    id: generateUUID(),
    role: UserRole.ADMIN,
    createdAt: new Date().toISOString(),
  });
  saveDB(db);
  return { success: true, message: '관리자 계정이 생성되었습니다.' };
};

export const loginUser = (username: string, password: string): User | null => {
  const db = getDB();
  return db.users.find((u) => u.username === username && u.password === password) || null;
};

export const updateUser = (userId: string, updates: Partial<User>): User | null => {
  const db = getDB();
  const idx = db.users.findIndex((u) => u.id === userId);
  if (idx === -1) return null;
  db.users[idx] = { ...db.users[idx], ...updates };
  saveDB(db);
  return db.users[idx];
};

export const deleteUser = (userId: string) => {
  const db = getDB();
  db.users = db.users.filter(u => u.id !== userId);
  saveDB(db);
};

export const getAllUsers = () => getDB().users;

export const createTransaction = (userId: string, amount: number): Transaction | null => {
  try {
    const db = getDB();
    if (!db.transactions) db.transactions = [];
    if (!db.config) db.config = DEFAULT_CONFIG;
    const price = typeof db.config.coinPrice === 'number' ? db.config.coinPrice : 10000;
    
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
    console.error("Transaction Error:", e);
    return null;
  }
};

export const getUserTransactions = (userId: string) => {
  // Only show non-deleted transactions to users
  return getDB().transactions
    .filter((tx) => tx.userId === userId && !tx.isDeleted)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const getAllTransactions = () => {
  // Return ALL transactions (deletion filtering handled by UI based on role)
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
  // Changed to Soft Delete
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