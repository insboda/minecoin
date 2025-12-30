
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, collection, doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc, 
  onSnapshot, query, orderBy, where, serverTimestamp, writeBatch 
} from 'firebase/firestore';
import { User, Transaction, SiteConfig, UserRole, UserStatus, TransactionStatus, NewsItem } from '../types';

// --- Firebase Configuration ---
const firebaseConfig = {
  apiKey: "AIzaSyBDAU7boPmK8slanyEAT8tROO-6jOI5p5Y",
  authDomain: "minecoin-59b63.firebaseapp.com",
  projectId: "minecoin-59b63",
  storageBucket: "minecoin-59b63.firebasestorage.app",
  messagingSenderId: "671370090108",
  appId: "1:671370090108:web:aa399314846babffd01bf9",
  measurementId: "G-Z2R6HB9EXN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Collection References
const USERS_COL = 'users';
const TX_COL = 'transactions';
const NEWS_COL = 'news';
const CONFIG_COL = 'system';
const CONFIG_DOC_ID = 'siteConfig';

// --- Defaults ---
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

// --- Helper Functions ---
const generateUUID = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    try { return crypto.randomUUID(); } catch (e) {}
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// --- Initialization ---
export const initializeSystem = async () => {
  try {
    // 1. Check & Create Config
    const configRef = doc(db, CONFIG_COL, CONFIG_DOC_ID);
    const configSnap = await getDoc(configRef);
    if (!configSnap.exists()) {
      await setDoc(configRef, DEFAULT_CONFIG);
      console.log("Default Config initialized");
    }

    // 2. Check & Create Master Admin
    // We query to see if ANY master exists, to avoid overwriting if ID changed manually
    const q = query(collection(db, USERS_COL), where("role", "==", UserRole.MASTER));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      await setDoc(doc(db, USERS_COL, DEFAULT_MASTER.id), DEFAULT_MASTER);
      // Create a default sub-admin too
      await setDoc(doc(db, USERS_COL, DEFAULT_ADMIN.id), DEFAULT_ADMIN);
      console.log("Default Admins initialized");
    }

  } catch (error) {
    console.error("Initialization Error:", error);
  }
};

// --- Real-time Subscriptions (Listeners) ---

export const subscribeToUsers = (callback: (users: User[]) => void) => {
  const q = query(collection(db, USERS_COL), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snapshot) => {
    const users = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as User));
    callback(users);
  });
};

export const subscribeToTransactions = (callback: (txs: Transaction[]) => void) => {
  const q = query(collection(db, TX_COL)); // Ordering handled in client or simple query
  return onSnapshot(q, (snapshot) => {
    let txs = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Transaction));
    // Client-side sort because 'date' string sorting in Firestore requires index management
    txs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    callback(txs);
  });
};

export const subscribeToNews = (callback: (news: NewsItem[]) => void) => {
  const q = query(collection(db, NEWS_COL));
  return onSnapshot(q, (snapshot) => {
    let news = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as NewsItem));
    news.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    callback(news);
  });
};

export const subscribeToConfig = (callback: (config: SiteConfig) => void) => {
  const docRef = doc(db, CONFIG_COL, CONFIG_DOC_ID);
  return onSnapshot(docRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.data() as SiteConfig);
    } else {
      callback(DEFAULT_CONFIG);
    }
  });
};

// --- Actions (Async) ---

export const registerUser = async (user: Omit<User, 'id' | 'role' | 'createdAt' | 'status'>): Promise<{ success: boolean; message: string }> => {
  try {
    // Check username uniqueness
    const q = query(collection(db, USERS_COL), where("username", "==", user.username));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return { success: false, message: '이미 존재하는 아이디입니다.' };
    }

    const newId = generateUUID();
    const newUser: User = {
      ...user,
      id: newId,
      role: UserRole.USER,
      status: UserStatus.PENDING,
      createdAt: new Date().toISOString()
    };

    await setDoc(doc(db, USERS_COL, newId), newUser);
    return { success: true, message: '회원가입 신청이 완료되었습니다. 관리자 승인 후 로그인이 가능합니다.' };
  } catch (e) {
    console.error(e);
    return { success: false, message: '가입 처리 중 오류가 발생했습니다.' };
  }
};

export const registerAdmin = async (user: Omit<User, 'id' | 'role' | 'createdAt' | 'status'>): Promise<{ success: boolean; message: string }> => {
  try {
    const q = query(collection(db, USERS_COL), where("username", "==", user.username));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return { success: false, message: '이미 존재하는 아이디입니다.' };
    }

    const newId = generateUUID();
    const newUser: User = {
      ...user,
      id: newId,
      role: UserRole.ADMIN,
      status: UserStatus.APPROVED,
      createdAt: new Date().toISOString()
    };

    await setDoc(doc(db, USERS_COL, newId), newUser);
    return { success: true, message: '관리자 계정이 생성되었습니다.' };
  } catch (e) {
    return { success: false, message: '오류가 발생했습니다.' };
  }
};

export const loginUser = async (username: string, password: string): Promise<{ user: User | null; error?: string }> => {
  try {
    // Note: In a real production app, use Firebase Auth. Here we query Firestore as requested for "custom auth".
    const q = query(collection(db, USERS_COL), where("username", "==", username), where("password", "==", password));
    const snap = await getDocs(q);

    if (snap.empty) {
      return { user: null, error: '아이디 또는 비밀번호가 올바르지 않습니다.' };
    }

    const user = { ...snap.docs[0].data(), id: snap.docs[0].id } as User;

    if (user.status === UserStatus.PENDING) {
      return { user: null, error: '가입 승인 대기 중입니다. 관리자 승인 후 이용 가능합니다.' };
    }
    
    if (user.status === UserStatus.REJECTED) {
      return { user: null, error: '가입 신청이 거절되었습니다. 관리자에게 문의하세요.' };
    }

    return { user };
  } catch (e) {
    console.error(e);
    return { user: null, error: '로그인 처리 중 오류가 발생했습니다.' };
  }
};

export const updateUserStatus = async (userId: string, status: UserStatus) => {
  await updateDoc(doc(db, USERS_COL, userId), { status });
};

export const updateUser = async (userId: string, updates: Partial<User>): Promise<User | null> => {
  try {
    const userRef = doc(db, USERS_COL, userId);
    await updateDoc(userRef, updates);
    // Return updated user for session state update
    const snap = await getDoc(userRef);
    return { ...snap.data(), id: snap.id } as User;
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const deleteUser = async (userId: string): Promise<boolean> => {
  try {
    const userRef = doc(db, USERS_COL, userId);
    const snap = await getDoc(userRef);
    if (snap.exists() && snap.data().role === UserRole.MASTER) return false;

    await deleteDoc(userRef);
    return true;
  } catch (e) {
    return false;
  }
};

export const createTransaction = async (userId: string, amount: number, currentPrice: number): Promise<Transaction | null> => {
  try {
    const newId = generateUUID();
    const newTx: Transaction = {
      id: newId,
      userId,
      amount,
      priceAtPurchase: currentPrice,
      totalCost: amount * currentPrice,
      date: new Date().toISOString(),
      status: TransactionStatus.PENDING,
      isDeleted: false
    };
    await setDoc(doc(db, TX_COL, newId), newTx);
    return newTx;
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const updateTransactionStatus = async (txId: string, status: TransactionStatus) => {
  await updateDoc(doc(db, TX_COL, txId), { status });
};

export const deleteTransaction = async (txId: string) => {
  await updateDoc(doc(db, TX_COL, txId), { isDeleted: true });
};

export const restoreTransaction = async (txId: string) => {
  await updateDoc(doc(db, TX_COL, txId), { isDeleted: false });
};

export const addNews = async (news: Omit<NewsItem, 'id' | 'date'>) => {
  const newId = generateUUID();
  const newItem = { 
    ...news, 
    id: newId, 
    date: new Date().toISOString() 
  };
  await setDoc(doc(db, NEWS_COL, newId), newItem);
};

export const deleteNews = async (id: string) => {
  await deleteDoc(doc(db, NEWS_COL, id));
};

export const updateSiteConfig = async (updates: Partial<SiteConfig>) => {
  await updateDoc(doc(db, CONFIG_COL, CONFIG_DOC_ID), updates);
  return { ...DEFAULT_CONFIG, ...updates }; // Optimistic return
};

export const resetUserData = async (): Promise<{ deletedUsers: number, deletedTransactions: number }> => {
  // Batch delete is complex in client SDK for massive data, but doing simple loop for now
  // 1. Delete Non-Master Users
  const userQ = query(collection(db, USERS_COL), where("role", "!=", UserRole.MASTER));
  const userSnap = await getDocs(userQ);
  let deletedUsers = 0;
  
  const batch1 = writeBatch(db);
  userSnap.forEach((d) => {
    batch1.delete(d.ref);
    deletedUsers++;
  });
  await batch1.commit();

  // 2. Delete All Transactions
  const txQ = query(collection(db, TX_COL));
  const txSnap = await getDocs(txQ);
  let deletedTransactions = 0;

  const batch2 = writeBatch(db);
  txSnap.forEach((d) => {
    batch2.delete(d.ref);
    deletedTransactions++;
  });
  await batch2.commit();

  return { deletedUsers, deletedTransactions };
};
