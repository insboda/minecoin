
import React, { useState, useEffect, useRef } from 'react';
import { Header, Footer, Modal } from './components/Layout';
import * as db from './services/storage';
import { User, UserRole, UserStatus, SiteConfig, Transaction, TransactionStatus, NewsItem } from './types';
import { 
  Users, CreditCard, FileText, Settings, ShieldCheck, CheckCircle, XCircle, 
  ChevronRight, Download, BarChart2, DollarSign, Wallet, Megaphone, Trash2, Plus, AlertCircle, RefreshCw, Loader2, AlertTriangle, UserPlus, Crown, EyeOff, RotateCcw, Edit3, Bell, Server, Volume2
} from 'lucide-react';

// --- AUDIO UTILS ---
// 브라우저 내장 Web Audio API를 사용하여 소리 재생 (외부 파일 의존성 제거)
const playNotificationSound = (count = 1) => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    
    const ctx = new AudioContext();

    const playBeep = (startTime: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        // 맑은 '딩' 소리 생성
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, startTime); // A5 (시작)
        osc.frequency.exponentialRampToValueAtTime(440, startTime + 0.4); // A4 (끝)
        
        gain.gain.setValueAtTime(0.2, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.4); // 페이드 아웃

        osc.start(startTime);
        osc.stop(startTime + 0.4);
    };

    const now = ctx.currentTime;
    // 지정된 횟수만큼 반복 재생 (0.6초 간격)
    for (let i = 0; i < count; i++) {
        playBeep(now + (i * 0.6));
    }
  } catch (e) {
    console.error("Audio playback failed:", e);
  }
};

// --- PAGE COMPONENTS ---

// 1. HOME PAGE
const Home: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  return (
    <div className="animate-fade-in">
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 to-slate-900"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-500/20 rounded-full blur-[120px]"></div>
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            The Future of <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 to-neon-text text-brand-400">Digital Assets</span>
          </h1>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            MineCoin과 함께 새로운 금융 혁명에 참여하세요. <br/>
            안전하고 투명한 블록체인 생태계를 제공합니다.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button 
              onClick={() => onNavigate('buy')} 
              className="bg-brand-500 hover:bg-brand-400 text-white text-lg font-bold px-8 py-4 rounded-full shadow-lg shadow-brand-500/30 transition transform hover:scale-105"
            >
              코인 구매하기
            </button>
            <button 
              onClick={() => onNavigate('about')}
              className="bg-white/10 hover:bg-white/20 text-white text-lg font-bold px-8 py-4 rounded-full backdrop-blur-sm border border-white/20 transition"
            >
              자세히 보기
            </button>
          </div>
        </div>
      </section>

      <section className="py-20 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-panel p-8 rounded-2xl border border-white/5 hover:border-brand-500/30 transition">
              <ShieldCheck className="w-12 h-12 text-brand-400 mb-4" />
              <h3 className="text-2xl font-bold text-white mb-3">강력한 보안</h3>
              <p className="text-gray-400">최신 암호화 기술과 분산 원장 기술을 통해 귀하의 자산을 안전하게 보호합니다.</p>
            </div>
            <div className="glass-panel p-8 rounded-2xl border border-white/5 hover:border-brand-500/30 transition">
              <BarChart2 className="w-12 h-12 text-brand-400 mb-4" />
              <h3 className="text-2xl font-bold text-white mb-3">높은 가치 성장</h3>
              <p className="text-gray-400">체계적인 소각 매커니즘과 생태계 확장을 통해 지속적인 가치 상승을 추구합니다.</p>
            </div>
            <div className="glass-panel p-8 rounded-2xl border border-white/5 hover:border-brand-500/30 transition">
              <Users className="w-12 h-12 text-brand-400 mb-4" />
              <h3 className="text-2xl font-bold text-white mb-3">커뮤니티 중심</h3>
              <p className="text-gray-400">DAO 시스템을 통해 홀더들이 직접 프로젝트의 방향성을 결정합니다.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

// 2. ABOUT PAGE
const About: React.FC<{ config: SiteConfig }> = ({ config }) => {
  return (
    <div className="pt-24 pb-20 max-w-7xl mx-auto px-4 animate-fade-in">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-bold text-white mb-4">MineCoin 소개</h2>
        <div className="h-1 w-20 bg-brand-500 mx-auto rounded-full"></div>
      </div>

      <div className="space-y-16">
        <div className="glass-panel p-8 md:p-12 rounded-2xl border border-white/10">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="bg-brand-900/50 p-4 rounded-xl">
              <Settings className="w-12 h-12 text-brand-400" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-4">기술 구조</h3>
              <p className="text-gray-300 whitespace-pre-line leading-relaxed">{config.techContent}</p>
            </div>
          </div>
        </div>

        <div className="glass-panel p-8 md:p-12 rounded-2xl border border-white/10">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="bg-blue-900/50 p-4 rounded-xl">
              <BarChart2 className="w-12 h-12 text-blue-400" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-4">로드맵</h3>
              <div className="space-y-4">
                {config.roadmapContent.split('\n').map((line, idx) => (
                   <div key={idx} className="flex items-start">
                     <CheckCircle className="w-5 h-5 text-brand-500 mr-3 mt-1 flex-shrink-0" />
                     <span className="text-gray-300">{line}</span>
                   </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="glass-panel p-8 md:p-12 rounded-2xl border border-white/10">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="bg-purple-900/50 p-4 rounded-xl">
              <Wallet className="w-12 h-12 text-purple-400" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-4">핵심 장점</h3>
              <p className="text-gray-300 whitespace-pre-line leading-relaxed">{config.benefitsContent}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 3. BUY PAGE
const BuyPage: React.FC<{ user: User; config: SiteConfig; onNavigate: (page: string) => void }> = ({ user, config, onNavigate }) => {
  const [amount, setAmount] = useState<number>(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const totalPrice = amount * (config.coinPrice || 10000);

  const handleBuy = async () => {
    if (!amount || amount <= 0) {
      alert("구매하실 코인 수량을 입력해주세요.");
      return;
    }

    if (!user || !user.id) {
      alert("로그인 정보가 유효하지 않습니다. 다시 로그인해주세요.");
      return;
    }

    setIsLoading(true);

    try {
      const tx = await db.createTransaction(user.id, amount, config.coinPrice);
      if (tx) {
        setIsSubmitted(true);
      } else {
        alert("구매 신청 처리 중 오류가 발생했습니다.");
      }
    } catch (e) {
      console.error("Buy Error:", e);
      alert("알 수 없는 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setAmount(0);
    setIsLoading(false);
  };

  return (
    <div className="pt-24 pb-20 max-w-4xl mx-auto px-4">
      <div className="glass-panel p-8 rounded-2xl border border-brand-500/30 shadow-2xl shadow-brand-900/20">
        <h2 className="text-3xl font-bold text-white mb-8 text-center">코인 구매 신청</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Left: Product Info */}
          <div className={isSubmitted ? 'opacity-50 pointer-events-none transition-opacity duration-300' : 'transition-opacity duration-300'}>
             <div className="bg-slate-800/50 rounded-xl p-6 mb-6">
                <p className="text-gray-400 text-sm mb-1">현재 코인 시세</p>
                <p className="text-3xl font-bold text-brand-400">{config.coinPrice.toLocaleString()} KRW</p>
                <p className="text-xs text-gray-500 mt-2">* 시세는 관리자 설정에 따라 변동될 수 있습니다.</p>
             </div>
             
             <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-300">구매 수량 (MC)</label>
                <div className="flex gap-2 mb-2 flex-wrap">
                   <button onClick={() => setAmount(prev => prev + 1)} className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-sm text-white">+1</button>
                   <button onClick={() => setAmount(prev => prev + 5)} className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-sm text-white">+5</button>
                   <button onClick={() => setAmount(prev => prev + 10)} className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-sm text-white">+10</button>
                   <button onClick={() => setAmount(prev => prev + 50)} className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-sm text-white">+50</button>
                   <button onClick={() => setAmount(prev => prev + 100)} className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-sm text-white">+100</button>
                   <button onClick={() => setAmount(0)} className="px-3 py-1 bg-red-900/50 hover:bg-red-900/70 rounded text-sm text-red-200 ml-auto">초기화</button>
                </div>
                <input 
                  type="text" 
                  inputMode="numeric"
                  value={amount === 0 ? '' : amount} 
                  onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, '');
                      const num = parseInt(val);
                      if (isNaN(num) || num < 0) setAmount(0);
                      else setAmount(num);
                  }}
                  className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-3 text-white text-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
                  placeholder="0"
                />
             </div>
          </div>

          {/* Right: Summary & Action */}
          <div className="flex flex-col justify-between">
             <div className="space-y-4 border-t border-b border-white/10 py-6 md:py-0 md:border-0 mb-8 md:mb-0">
                <div className="flex justify-between text-gray-400">
                  <span>주문 수량</span>
                  <span>{amount.toLocaleString()} MC</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>단가</span>
                  <span>{config.coinPrice.toLocaleString()} KRW</span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-white/10">
                  <span className="text-lg font-bold text-white">총 결제 금액</span>
                  <span className="text-2xl font-bold text-brand-400">{totalPrice.toLocaleString()} KRW</span>
                </div>
             </div>

             <div className="mt-4">
                 {isSubmitted ? (
                   <div className="animate-fade-in w-full">
                     <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl flex flex-col items-center justify-center text-green-400 font-bold text-center">
                        <div className="flex items-center mb-1">
                          <CheckCircle className="w-6 h-6 mr-2" />
                          <span className="text-lg">구매 신청 완료</span>
                        </div>
                        <p className="text-sm text-green-400/70 font-normal">아래 계좌로 입금해주세요.</p>
                     </div>

                     <div className="bg-gradient-to-b from-slate-800 to-slate-900 p-6 rounded-2xl border border-brand-500/20 mb-6 shadow-xl relative overflow-hidden">
                        <h3 className="text-gray-300 text-sm mb-6 font-bold flex items-center uppercase tracking-wider border-b border-white/10 pb-3">
                           <CreditCard className="w-4 h-4 mr-2 text-brand-400"/> 입금 계좌 정보
                        </h3>
                        
                        <div className="space-y-5 relative z-10">
                           <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                              <span className="text-gray-400 text-sm mb-1 md:mb-0">입금 은행</span>
                              <span className="text-lg font-bold text-white">{config.adminBankName || '은행 미설정'}</span>
                           </div>
                           <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-3 bg-slate-950/50 rounded-lg border border-white/5">
                              <span className="text-gray-400 text-sm mb-1 md:mb-0 self-center">계좌번호</span>
                              <span className="text-2xl font-bold text-yellow-400 font-mono tracking-wider break-all text-right w-full md:w-auto">
                                  {config.adminAccountNumber || '계좌번호 미설정'}
                              </span>
                           </div>
                           <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                              <span className="text-gray-400 text-sm mb-1 md:mb-0">예금주</span>
                              <span className="text-lg text-white">{config.adminAccountHolder || '예금주 미설정'}</span>
                           </div>
                           <div className="flex flex-col md:flex-row justify-between items-start md:items-center pt-2 border-t border-white/10">
                              <span className="text-gray-400 text-sm mb-1 md:mb-0">입금하실 금액</span>
                              <span className="text-xl font-bold text-brand-400">{totalPrice.toLocaleString()} KRW</span>
                           </div>
                        </div>
                     </div>

                     <div className="flex gap-3">
                       <button 
                          onClick={() => onNavigate('mypage')}
                          className="flex-1 bg-brand-600 hover:bg-brand-500 text-white font-bold py-4 rounded-xl transition shadow-lg shadow-brand-500/20 flex items-center justify-center text-sm md:text-base"
                       >
                          <FileText className="w-5 h-5 mr-2" />
                          신청내역 확인
                       </button>
                       <button 
                          onClick={handleReset}
                          className="px-6 bg-slate-700 hover:bg-slate-600 text-white font-bold py-4 rounded-xl transition flex items-center justify-center text-sm md:text-base"
                       >
                          <Plus className="w-5 h-5 mr-2" />
                          추가 구매
                       </button>
                     </div>
                   </div>
                 ) : (
                   <>
                     <button 
                        onClick={handleBuy}
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-bold py-4 rounded-xl shadow-lg shadow-brand-500/20 transition transform active:scale-95 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                     >
                        {isLoading ? <><Loader2 className="w-5 h-5 animate-spin mr-2"/> 처리중...</> : "구매 신청하기"}
                     </button>
                     <p className="text-center text-xs text-gray-500 mt-4">
                       * 구매 신청 후 안내되는 계좌로 입금해주시면 관리자 확인 후 승인됩니다.
                     </p>
                   </>
                 )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 4. AUTH PAGES
const Login: React.FC<{ onLogin: (u: User) => void; onNavigate: (p: string) => void }> = ({ onLogin, onNavigate }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const result = await db.loginUser(username, password);
    setIsLoading(false);
    
    if (result.user) {
      onLogin(result.user);
    } else {
      setError(result.error || '아이디 또는 비밀번호가 올바르지 않습니다.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center pt-20 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 glass-panel p-8 rounded-2xl border border-white/10">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">로그인</h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            MineCoin 서비스 이용을 위해 로그인해주세요.
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div className="mb-4">
              <input
                type="text"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-slate-600 placeholder-gray-500 text-gray-900 bg-slate-200 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                placeholder="아이디"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <input
                type="password"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-slate-600 placeholder-gray-500 text-gray-900 bg-slate-200 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                placeholder="비밀번호"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && <div className="text-red-400 text-sm text-center bg-red-900/10 py-2 rounded border border-red-500/20">{error}</div>}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition disabled:opacity-50"
            >
              {isLoading ? '로그인 중...' : '로그인'}
            </button>
          </div>
          <div className="text-center">
            <button type="button" onClick={() => onNavigate('signup')} className="text-sm text-brand-400 hover:text-brand-300">
              계정이 없으신가요? 회원가입
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Signup: React.FC<{ onNavigate: (p: string) => void }> = ({ onNavigate }) => {
  const [formData, setFormData] = useState({
    username: '', password: '', name: '', phone: '', bankName: '', accountNumber: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const result = await db.registerUser(formData);
    setIsLoading(false);
    
    if (result.success) {
      alert(result.message);
      onNavigate('login');
    } else {
      alert(result.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center pt-24 pb-12 px-4">
      <div className="max-w-lg w-full glass-panel p-8 rounded-2xl border border-white/10">
        <h2 className="text-center text-3xl font-extrabold text-white mb-8">회원가입 신청</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <input name="username" placeholder="아이디" required onChange={handleChange} className="w-full px-4 py-2 rounded bg-slate-800 border border-slate-600 text-white focus:ring-brand-500 focus:border-brand-500" />
             <input name="password" type="password" placeholder="비밀번호" required onChange={handleChange} className="w-full px-4 py-2 rounded bg-slate-800 border border-slate-600 text-white focus:ring-brand-500 focus:border-brand-500" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <input name="name" placeholder="이름" required onChange={handleChange} className="w-full px-4 py-2 rounded bg-slate-800 border border-slate-600 text-white focus:ring-brand-500 focus:border-brand-500" />
             <input name="phone" placeholder="연락처 (010-0000-0000)" required onChange={handleChange} className="w-full px-4 py-2 rounded bg-slate-800 border border-slate-600 text-white focus:ring-brand-500 focus:border-brand-500" />
          </div>
          <div className="pt-4 border-t border-white/10">
             <p className="text-sm text-gray-400 mb-2">환불 계좌 정보</p>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input name="bankName" placeholder="은행명" required onChange={handleChange} className="col-span-1 w-full px-4 py-2 rounded bg-slate-800 border border-slate-600 text-white focus:ring-brand-500 focus:border-brand-500" />
                <input name="accountNumber" placeholder="계좌번호" required onChange={handleChange} className="col-span-2 w-full px-4 py-2 rounded bg-slate-800 border border-slate-600 text-white focus:ring-brand-500 focus:border-brand-500" />
             </div>
          </div>
          <div className="p-4 bg-brand-500/10 border border-brand-500/20 rounded text-xs text-brand-300">
            * 회원가입 후 관리자가 가입 신청 내역을 확인하고 승인해야 로그인이 가능합니다.
          </div>
          <button type="submit" disabled={isLoading} className="w-full py-3 mt-6 bg-brand-600 text-white font-bold rounded hover:bg-brand-700 transition disabled:opacity-50">
             {isLoading ? '처리중...' : '가입 신청하기'}
          </button>
        </form>
      </div>
    </div>
  );
};

// 5. MY PAGE
const MyPage: React.FC<{ user: User; config: SiteConfig; onUpdateUser: (u: User) => void }> = ({ user, config, onUpdateUser }) => {
  const [activeTab, setActiveTab] = useState<'info' | 'history'>('history');
  // Need global state passed down or fetched here. For simplicity, we filter the global transactions prop if available, 
  // but since we are in a child component, let's fetch specific user data efficiently using the subscriptions.
  // Actually, for MyPage, we can just use the global data contexts if we hoisted them, but let's subscribe here.
  
  const [history, setHistory] = useState<Transaction[]>([]);
  const [editForm, setEditForm] = useState(user);

  useEffect(() => {
    // Subscribe to transactions to get user history
    const unsubscribe = db.subscribeToTransactions((txs) => {
        const myTxs = txs.filter(t => t.userId === user.id && !t.isDeleted);
        setHistory(myTxs);
    });
    setEditForm(user);
    return () => unsubscribe();
  }, [user]);

  const totalCoins = history
    .filter(tx => tx.status === TransactionStatus.APPROVED)
    .reduce((sum, tx) => sum + tx.amount, 0);

  const handleUpdateInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated = await db.updateUser(user.id, {
      password: editForm.password,
      phone: editForm.phone,
      bankName: editForm.bankName,
      accountNumber: editForm.accountNumber
    });
    if (updated) {
      onUpdateUser(updated);
      alert("정보가 수정되었습니다.");
    }
  };

  return (
    <div className="pt-24 pb-20 max-w-6xl mx-auto px-4">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
         <div>
            <h1 className="text-3xl font-bold text-white">마이페이지</h1>
            <p className="text-gray-400 mt-1">{user.name}님의 활동 내역입니다.</p>
         </div>
         <div className="bg-brand-900/40 px-6 py-4 rounded-xl border border-brand-500/30">
            <span className="text-gray-400 text-sm block">보유 자산</span>
            <span className="text-3xl font-bold text-brand-400">{totalCoins.toLocaleString()} MC</span>
         </div>
      </div>

      <div className="bg-slate-800/80 p-6 rounded-xl border border-brand-500/20 mb-8 flex flex-col md:flex-row justify-between items-center gap-4 shadow-lg">
        <div>
          <h3 className="text-lg font-bold text-brand-400 mb-2 flex items-center">
            <CreditCard className="w-5 h-5 mr-2" />
            무통장 입금 계좌 안내
          </h3>
          <p className="text-gray-300">
            <span className="text-gray-400 text-sm">은행명:</span> <span className="font-semibold text-white mr-4">{config.adminBankName}</span>
            <span className="text-gray-400 text-sm">계좌번호:</span> <span className="font-mono text-xl text-yellow-400 font-bold mr-4">{config.adminAccountNumber}</span>
            <span className="text-gray-400 text-sm">예금주:</span> <span className="text-white">{config.adminAccountHolder}</span>
          </p>
        </div>
        <div className="text-right hidden md:block border-l border-white/10 pl-6">
           <p className="text-xs text-gray-500 leading-relaxed">
             입금 시 신청자명과 입금자명이 동일해야<br/>
             빠른 승인 처리가 가능합니다.
           </p>
        </div>
      </div>

      <div className="flex space-x-4 mb-6 border-b border-gray-700">
        <button 
          onClick={() => setActiveTab('history')}
          className={`pb-3 px-2 ${activeTab === 'history' ? 'border-b-2 border-brand-400 text-brand-400 font-bold' : 'text-gray-400'}`}
        >
          구매 내역
        </button>
        <button 
          onClick={() => setActiveTab('info')}
          className={`pb-3 px-2 ${activeTab === 'info' ? 'border-b-2 border-brand-400 text-brand-400 font-bold' : 'text-gray-400'}`}
        >
          정보 수정
        </button>
      </div>

      {activeTab === 'history' && (
        <div className="glass-panel rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-gray-300">
              <thead className="bg-slate-800 text-gray-100 uppercase text-xs">
                <tr>
                  <th className="px-6 py-4">주문일시</th>
                  <th className="px-6 py-4">수량 (MC)</th>
                  <th className="px-6 py-4">구매 단가</th>
                  <th className="px-6 py-4">총 결제액</th>
                  <th className="px-6 py-4">상태</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {history.map((tx) => (
                  <tr key={tx.id} className="hover:bg-white/5">
                    <td className="px-6 py-4">{new Date(tx.date).toLocaleDateString()} {new Date(tx.date).toLocaleTimeString()}</td>
                    <td className="px-6 py-4 font-bold text-white">{tx.amount.toLocaleString()}</td>
                    <td className="px-6 py-4">{tx.priceAtPurchase.toLocaleString()}원</td>
                    <td className="px-6 py-4">{tx.totalCost.toLocaleString()}원</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold 
                        ${tx.status === TransactionStatus.APPROVED ? 'bg-green-900 text-green-300' : 
                          tx.status === TransactionStatus.REJECTED ? 'bg-red-900 text-red-300' : 'bg-yellow-900 text-yellow-300'}`}>
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {history.length === 0 && (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">구매 내역이 없습니다.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'info' && (
        <div className="glass-panel p-8 rounded-xl max-w-2xl">
          <form onSubmit={handleUpdateInfo} className="space-y-6">
             <div>
                <label className="block text-gray-400 mb-1 text-sm">아이디 (변경불가)</label>
                <input value={user.username} disabled className="w-full bg-slate-800 border border-slate-600 rounded px-4 py-2 text-gray-500 cursor-not-allowed" />
             </div>
             <div>
                <label className="block text-gray-400 mb-1 text-sm">이름 (변경불가)</label>
                <input value={user.name} disabled className="w-full bg-slate-800 border border-slate-600 rounded px-4 py-2 text-gray-500 cursor-not-allowed" />
             </div>
             <div>
                <label className="block text-gray-400 mb-1 text-sm">비밀번호</label>
                <input 
                  type="password"
                  value={editForm.password} 
                  onChange={(e) => setEditForm({...editForm, password: e.target.value})} 
                  className="w-full bg-slate-900 border border-slate-600 rounded px-4 py-2 text-white focus:border-brand-500"
                />
             </div>
             <div>
                <label className="block text-gray-400 mb-1 text-sm">연락처</label>
                <input 
                  value={editForm.phone} 
                  onChange={(e) => setEditForm({...editForm, phone: e.target.value})} 
                  className="w-full bg-slate-900 border border-slate-600 rounded px-4 py-2 text-white focus:border-brand-500"
                />
             </div>
             <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-gray-400 mb-1 text-sm">은행명</label>
                  <input 
                    value={editForm.bankName} 
                    onChange={(e) => setEditForm({...editForm, bankName: e.target.value})} 
                    className="w-full bg-slate-900 border border-slate-600 rounded px-4 py-2 text-white focus:border-brand-500"
                  />
               </div>
               <div>
                  <label className="block text-gray-400 mb-1 text-sm">계좌번호</label>
                  <input 
                    value={editForm.accountNumber} 
                    onChange={(e) => setEditForm({...editForm, accountNumber: e.target.value})} 
                    className="w-full bg-slate-900 border border-slate-600 rounded px-4 py-2 text-white focus:border-brand-500"
                  />
               </div>
             </div>
             <button type="submit" className="px-6 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded font-bold">저장하기</button>
          </form>
        </div>
      )}
    </div>
  );
};

// 6. ADMIN PAGE
const AdminDashboard: React.FC<{ 
  config: SiteConfig, 
  onUpdateConfig: (c: SiteConfig) => void,
  newsList: NewsItem[],
  onNewsUpdate: () => void,
  currentUser: User
}> = ({ config, onUpdateConfig, newsList, onNewsUpdate, currentUser }) => {
  const isMaster = currentUser.role === UserRole.MASTER;
  const [tab, setTab] = useState<'members' | 'admins' | 'transactions' | 'news' | 'site'>('members');
  const [users, setUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [saveMessage, setSaveMessage] = useState('');
  
  const [newsForm, setNewsForm] = useState({ title: '', content: '', category: 'NOTICE' as const });
  const [isAddingNews, setIsAddingNews] = useState(false);
  const [configForm, setConfigForm] = useState(config);
  const [isResetConfirming, setIsResetConfirming] = useState(false);
  const [editingPwId, setEditingPwId] = useState<string | null>(null);
  const [newPwInput, setNewPwInput] = useState('');
  const [confirmingTxId, setConfirmingTxId] = useState<string | null>(null);
  const [showDeletedTx, setShowDeletedTx] = useState(false);
  const [isAddingAdmin, setIsAddingAdmin] = useState(false);
  const [adminForm, setAdminForm] = useState({ username: '', password: '', name: '', phone: '' });

  // For Real-time notifications
  const lastPendingCountRef = useRef<number>(0);
  const isFirstLoadRef = useRef<boolean>(true); // Ref to track initial data load
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    setConfigForm(config);
  }, [config]);

  // Real-time Subscriptions for Admin
  useEffect(() => {
    const unsubUsers = db.subscribeToUsers((data) => setUsers(data));
    const unsubTxs = db.subscribeToTransactions((data) => {
        // Notification Logic
        const pending = data.filter(t => t.status === TransactionStatus.PENDING && !t.isDeleted).length;
        
        // Skip notification on the very first load
        if (isFirstLoadRef.current) {
           isFirstLoadRef.current = false;
           lastPendingCountRef.current = pending;
        } else {
           // If pending count increased, play sound
           if (pending > lastPendingCountRef.current) {
              playNotificationSound(5); // 5회 재생
              setNotification("새로운 구매 신청이 도착했습니다!");
              setTimeout(() => setNotification(null), 5000);
           }
           lastPendingCountRef.current = pending;
        }
        setTransactions(data);
    });

    return () => {
        unsubUsers();
        unsubTxs();
    };
  }, []);

  useEffect(() => {
    if (saveMessage) {
        setTimeout(() => setSaveMessage(''), 2000);
    }
  }, [saveMessage]);

  const testSound = () => {
    playNotificationSound(5); // 5회 재생
    alert("알림 소리가 5회 재생됩니다. (Web Audio API 사용)");
  };

  const handleUserStatus = async (userId: string, status: UserStatus) => {
    await db.updateUserStatus(userId, status);
  };

  const handleTxStatus = async (txId: string, status: TransactionStatus) => {
    try {
      await db.updateTransactionStatus(txId, status);
    } catch (e) {
      console.error(e);
      alert("상태 변경 중 오류가 발생했습니다.");
    }
  };

  const startPwChange = (userId: string) => {
    setEditingPwId(userId);
    setNewPwInput('');
  };

  const savePwChange = async (userId: string) => {
    if (!newPwInput.trim()) {
      alert("비밀번호를 입력해주세요.");
      return;
    }
    await db.updateUser(userId, { password: newPwInput });
    setEditingPwId(null);
    alert("비밀번호가 변경되었습니다.");
  };

  const handleDeleteMember = async (userId: string) => {
    if (window.confirm("정말 이 회원을 삭제하시겠습니까? 관련 모든 정보가 삭제됩니다.")) {
      const success = await db.deleteUser(userId);
      if (success) {
        alert("회원 정보가 삭제되었습니다.");
      } else {
        alert("삭제에 실패했거나 대상 회원을 찾을 수 없습니다.");
      }
    }
  };

  const handleDeleteTx = async (txId: string) => {
    if (confirmingTxId === txId) {
      await db.deleteTransaction(txId);
      setConfirmingTxId(null);
    } else {
      setConfirmingTxId(txId);
      setTimeout(() => setConfirmingTxId(null), 3000); 
    }
  };

  const handleRestoreTx = async (txId: string) => {
     await db.restoreTransaction(txId);
  };

  const saveConfig = async () => {
    const updated = await db.updateSiteConfig(configForm);
    onUpdateConfig(updated);
    setSaveMessage('사이트 설정이 성공적으로 저장되었습니다.');
  };

  const handleResetUserData = async () => {
    if (!isMaster) return;
    
    // 2-step confirmation logic
    if (!isResetConfirming) {
      setIsResetConfirming(true);
      setTimeout(() => setIsResetConfirming(false), 5000);
      return;
    }

    const result = await db.resetUserData();
    alert(`초기화가 완료되었습니다.\n\n- 삭제된 회원 수: ${result.deletedUsers}명\n- 삭제된 거래 내역: ${result.deletedTransactions}건`);
    window.location.reload();
  };

  const handleAddNews = async (e: React.FormEvent) => {
    e.preventDefault();
    await db.addNews(newsForm);
    setIsAddingNews(false);
    setNewsForm({ title: '', content: '', category: 'NOTICE' });
    onNewsUpdate();
    alert("공지사항이 등록되었습니다.");
  };

  const handleDeleteNews = async (id: string) => {
    if(!confirm("정말 삭제하시겠습니까?")) return;
    await db.deleteNews(id);
    onNewsUpdate();
  };
  
  const handleCreateAdmin = async (e: React.FormEvent) => {
     e.preventDefault();
     const result = await db.registerAdmin({...adminForm, bankName: '-', accountNumber: '-'});
     if(result.success) {
        alert(result.message);
        setIsAddingAdmin(false);
        setAdminForm({ username: '', password: '', name: '', phone: '' });
     } else {
        alert(result.message);
     }
  };

  const handleDeleteAdmin = async (id: string) => {
     if(!confirm("정말 이 관리자 계정을 삭제하시겠습니까?")) return;
     await db.deleteUser(id);
  };
  
  const getTotalCoinForUser = (uid: string) => {
    return transactions
      .filter(t => t.userId === uid && t.status === TransactionStatus.APPROVED && !t.isDeleted)
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const displayedTransactions = transactions.filter(tx => {
     if (isMaster && showDeletedTx) return true;
     return !tx.isDeleted;
  });

  return (
    <div className="pt-24 pb-20 max-w-7xl mx-auto px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className={`text-3xl font-bold flex items-center ${isMaster ? 'text-yellow-400' : 'text-brand-400'}`}>
           {isMaster ? <Crown className="mr-3 text-yellow-500" /> : <ShieldCheck className="mr-3" />} 
           {isMaster ? '최고 관리자 대시보드' : '관리자 대시보드'}
        </h1>
        <div className="flex items-center gap-3">
            <button 
              onClick={testSound} 
              className="flex items-center text-xs bg-slate-800 hover:bg-slate-700 text-gray-300 px-3 py-1.5 rounded-lg border border-slate-600 transition"
              title="브라우저 정책상 클릭해야 소리가 재생됩니다. 미리 테스트해보세요."
            >
              <Volume2 size={14} className="mr-1.5" /> 알림 테스트
            </button>
            <div className="text-xs text-gray-500 flex items-center bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
                <div className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></div>
                실시간 연동중
            </div>
        </div>
      </div>
      
      {saveMessage && (
         <div className="fixed top-20 right-4 z-50 animate-fade-in bg-green-900/90 border border-green-500 text-green-100 px-6 py-3 rounded-lg shadow-2xl flex items-center">
           <CheckCircle className="w-5 h-5 mr-2" />
           {saveMessage}
         </div>
      )}

      {notification && (
         <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-bounce bg-brand-500 text-white px-8 py-4 rounded-full shadow-2xl flex items-center border-4 border-white/20">
           <Bell className="w-6 h-6 mr-3 animate-pulse" />
           <span className="font-bold text-lg">{notification}</span>
         </div>
      )}

      <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
        <button onClick={() => setTab('members')} className={`px-4 py-2 rounded-lg font-bold whitespace-nowrap ${tab === 'members' ? 'bg-white/10 text-white' : 'bg-slate-800 text-gray-400'}`}>회원 관리</button>
        {isMaster && (
            <button onClick={() => setTab('admins')} className={`px-4 py-2 rounded-lg font-bold whitespace-nowrap flex items-center ${tab === 'admins' ? 'bg-yellow-500 text-black' : 'bg-slate-800 text-yellow-500'}`}>
                <Crown size={16} className="mr-2"/> 관리자 관리
            </button>
        )}
        <button onClick={() => setTab('transactions')} className={`px-4 py-2 rounded-lg font-bold whitespace-nowrap ${tab === 'transactions' ? 'bg-white/10 text-white' : 'bg-slate-800 text-gray-400'}`}>구매 신청 관리</button>
        <button onClick={() => setTab('news')} className={`px-4 py-2 rounded-lg font-bold whitespace-nowrap ${tab === 'news' ? 'bg-white/10 text-white' : 'bg-slate-800 text-gray-400'}`}>공지사항 관리</button>
        <button onClick={() => setTab('site')} className={`px-4 py-2 rounded-lg font-bold whitespace-nowrap ${tab === 'site' ? 'bg-white/10 text-white' : 'bg-slate-800 text-gray-400'}`}>사이트 설정</button>
      </div>

      <div className={`glass-panel p-6 rounded-xl ${isMaster ? 'border-yellow-500/30' : 'border-brand-500/20'}`}>
        {tab === 'members' && (
          <div className="overflow-x-auto">
             <table className="w-full text-left text-gray-300">
               <thead className="bg-slate-900 text-white">
                 <tr>
                   <th className="p-3">이름</th>
                   <th className="p-3">아이디</th>
                   <th className="p-3">연락처</th>
                   <th className="p-3">상태</th>
                   <th className="p-3">보유코인</th>
                   <th className="p-3">관리</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-gray-700">
                 {users.filter(u => u.role === UserRole.USER).map(u => (
                   <tr key={u.id} className={`hover:bg-white/5 ${u.status === UserStatus.PENDING ? 'bg-brand-500/5' : ''}`}>
                     <td className="p-3">
                        {u.name}
                        <div className="text-[10px] text-gray-500">{u.bankName} / {u.accountNumber}</div>
                     </td>
                     <td className="p-3">{u.username}</td>
                     <td className="p-3 text-sm">{u.phone}</td>
                     <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          u.status === UserStatus.APPROVED ? 'bg-green-900 text-green-300' : 
                          u.status === UserStatus.PENDING ? 'bg-yellow-900 text-yellow-300' : 
                          'bg-red-900 text-red-300'
                        }`}>{u.status}</span>
                     </td>
                     <td className="p-3 font-bold text-brand-400">{getTotalCoinForUser(u.id).toLocaleString()} MC</td>
                     <td className="p-3">
                       <div className="flex flex-col gap-1">
                        {u.status === UserStatus.PENDING && (
                           <div className="flex gap-1 mb-2">
                              <button onClick={() => handleUserStatus(u.id, UserStatus.APPROVED)} className="bg-green-600 text-white px-2 py-1 rounded text-[10px] font-bold hover:bg-green-500">승인</button>
                              <button onClick={() => handleUserStatus(u.id, UserStatus.REJECTED)} className="bg-red-600 text-white px-2 py-1 rounded text-[10px] font-bold hover:bg-red-500">거절</button>
                           </div>
                        )}
                        <div className="flex gap-1 items-center">
                          {editingPwId === u.id ? (
                            <div className="flex items-center gap-1">
                              <input 
                                type="text" 
                                value={newPwInput}
                                onChange={(e) => setNewPwInput(e.target.value)}
                                className="w-20 bg-slate-800 border border-slate-600 rounded px-2 py-1 text-[10px] text-white"
                                placeholder="비번"
                                autoFocus
                              />
                              <button onClick={() => savePwChange(u.id)} className="bg-blue-600 text-white px-2 py-1 rounded text-[10px] hover:bg-blue-500">저장</button>
                            </div>
                          ) : (
                            <button onClick={() => startPwChange(u.id)} className="px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded text-[10px] text-gray-200">비번변경</button>
                          )}
                          <button 
                            onClick={() => handleDeleteMember(u.id)} 
                            className="text-red-400 p-2 hover:bg-red-900/20 rounded transition transform active:scale-90"
                            title="회원 삭제"
                          >
                            <Trash2 size={16}/>
                          </button>
                        </div>
                       </div>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
          </div>
        )}

        {/* ... Rest of tabs remain similar but we ensure context is passed ... */}
        {tab === 'admins' && isMaster && (
            <div>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl text-yellow-400 font-bold">관리자 계정 목록</h3>
                    <button onClick={() => setIsAddingAdmin(!isAddingAdmin)} className="bg-yellow-600 hover:bg-yellow-500 text-black font-bold px-4 py-2 rounded-lg flex items-center">
                        {isAddingAdmin ? '취소' : <><UserPlus size={16} className="mr-2"/> 관리자 생성</>}
                    </button>
                </div>

                {isAddingAdmin && (
                    <form onSubmit={handleCreateAdmin} className="bg-slate-800/50 p-6 rounded-lg mb-8 border border-yellow-500/30">
                        <h4 className="text-white font-bold mb-4">새 관리자 정보 입력</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <input required placeholder="아이디" className="p-2 rounded bg-slate-900 border border-slate-600 text-white" value={adminForm.username} onChange={e => setAdminForm({...adminForm, username: e.target.value})} />
                            <input required type="password" placeholder="비밀번호" className="p-2 rounded bg-slate-900 border border-slate-600 text-white" value={adminForm.password} onChange={e => setAdminForm({...adminForm, password: e.target.value})} />
                            <input required placeholder="이름 (예: 관리자2)" className="p-2 rounded bg-slate-900 border border-slate-600 text-white" value={adminForm.name} onChange={e => setAdminForm({...adminForm, name: e.target.value})} />
                            <input required placeholder="연락처" className="p-2 rounded bg-slate-900 border border-slate-600 text-white" value={adminForm.phone} onChange={e => setAdminForm({...adminForm, phone: e.target.value})} />
                        </div>
                        <button type="submit" className="bg-yellow-500 text-black px-6 py-2 rounded font-bold hover:bg-yellow-400">생성하기</button>
                    </form>
                )}

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-gray-300">
                    <thead className="bg-slate-900 text-yellow-500">
                        <tr>
                        <th className="p-3">이름</th>
                        <th className="p-3">아이디</th>
                        <th className="p-3">연락처</th>
                        <th className="p-3">역할</th>
                        <th className="p-3 text-center">관리</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {users.filter(u => u.role === UserRole.ADMIN || u.role === UserRole.MASTER).map(u => (
                        <tr key={u.id} className="hover:bg-white/5">
                            <td className="p-3 font-bold">{u.name}</td>
                            <td className="p-3">{u.username}</td>
                            <td className="p-3">{u.phone}</td>
                            <td className="p-3">
                                <span className={`text-xs px-2 py-1 rounded font-bold ${u.role === UserRole.MASTER ? 'bg-yellow-500 text-black' : 'bg-slate-700 text-gray-300'}`}>
                                    {u.role}
                                </span>
                            </td>
                            <td className="p-3 text-center">
                                {u.role !== UserRole.MASTER && (
                                    <button onClick={() => handleDeleteMember(u.id)} className="text-red-400 p-2 hover:bg-red-900/20 rounded-full transition transform active:scale-90" title="관리자 삭제"><Trash2 size={20}/></button>
                                )}
                            </td>
                        </tr>
                        ))}
                    </tbody>
                    </table>
                </div>
            </div>
        )}

        {tab === 'transactions' && (
           <div className="overflow-x-auto">
            {isMaster && (
                <div className="mb-4 flex justify-end">
                    <label className="flex items-center cursor-pointer space-x-2 bg-slate-800 px-4 py-2 rounded-lg border border-slate-700 hover:bg-slate-700">
                        <input 
                            type="checkbox" 
                            checked={showDeletedTx} 
                            onChange={(e) => setShowDeletedTx(e.target.checked)}
                            className="form-checkbox h-4 w-4 text-brand-500 rounded border-gray-300 focus:ring-brand-500" 
                        />
                        <span className={`text-sm font-bold ${showDeletedTx ? 'text-red-400' : 'text-gray-400'}`}>
                            {showDeletedTx ? '삭제된 내역 숨기기' : '삭제된 내역 포함하여 보기 (최고관리자)'}
                        </span>
                    </label>
                </div>
            )}

            <table className="w-full text-left text-gray-300">
              <thead className="bg-slate-900 text-white">
                <tr>
                  <th className="p-3">신청일</th>
                  <th className="p-3">회원명(ID)</th>
                  <th className="p-3">수량</th>
                  <th className="p-3">금액</th>
                  <th className="p-3">상태</th>
                  <th className="p-3">동작</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {displayedTransactions.map(tx => {
                  const txUser = users.find(u => u.id === tx.userId);
                  const isDeleted = tx.isDeleted;
                  return (
                    <tr key={tx.id} className={`hover:bg-white/5 ${isDeleted ? 'bg-red-900/10 opacity-70' : ''}`}>
                      <td className="p-3 text-sm">
                        {new Date(tx.date).toLocaleDateString()}
                        {isDeleted && <span className="ml-2 text-xs bg-red-600 text-white px-1 rounded">DEL</span>}
                      </td>
                      <td className="p-3">
                        {txUser ? `${txUser.name} (${txUser.username})` : <span className="text-red-500 italic">삭제된 유저</span>}
                      </td>
                      <td className="p-3 font-bold text-white">{tx.amount.toLocaleString()}</td>
                      <td className="p-3">{tx.totalCost.toLocaleString()}</td>
                      <td className="p-3">
                         <span className={`px-2 py-1 rounded text-xs font-bold 
                        ${tx.status === TransactionStatus.APPROVED ? 'bg-green-900 text-green-300' : 
                          tx.status === TransactionStatus.REJECTED ? 'bg-red-900 text-red-300' : 'bg-yellow-900 text-yellow-300'}`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="p-3 flex gap-2 items-center">
                        {!isDeleted ? (
                            <>
                                {tx.status === TransactionStatus.PENDING && (
                                <>
                                    <button onClick={() => handleTxStatus(tx.id, TransactionStatus.APPROVED)} className="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-500">승인</button>
                                    <button onClick={() => handleTxStatus(tx.id, TransactionStatus.REJECTED)} className="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-500">반려</button>
                                </>
                                )}
                                <button 
                                onClick={() => handleDeleteTx(tx.id)} 
                                className={`ml-auto px-2 py-1 rounded flex items-center justify-center transition-all ${
                                    confirmingTxId === tx.id ? 'bg-red-600 text-white w-16' : 'bg-slate-800 text-red-400 hover:bg-slate-700 w-8'
                                }`}
                                title="거래 내역 삭제"
                                >
                                {confirmingTxId === tx.id ? <span className="text-xs font-bold">확인</span> : <Trash2 size={14} />}
                                </button>
                            </>
                        ) : (
                            isMaster && (
                                <button onClick={() => handleRestoreTx(tx.id)} className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-500 flex items-center">
                                    <RotateCcw size={12} className="mr-1"/> 복구
                                </button>
                            )
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
           </div>
        )}

        {tab === 'news' && (
           <div>
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl text-white font-bold">등록된 공지사항</h3>
                <button onClick={() => setIsAddingNews(!isAddingNews)} className="bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-lg flex items-center">
                  {isAddingNews ? '취소' : <><Plus size={16} className="mr-2"/> 공지사항 추가</>}
                </button>
             </div>

             {isAddingNews && (
               <form onSubmit={handleAddNews} className="bg-slate-800 p-6 rounded-lg mb-8 border border-slate-700">
                  <div className="grid grid-cols-1 md:col-span-4 gap-4 mb-4">
                    <div className="md:col-span-3">
                      <label className="block text-gray-400 text-sm mb-1">제목</label>
                      <input required className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white" 
                        value={newsForm.title} onChange={e => setNewsForm({...newsForm, title: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 text-sm mb-1">카테고리</label>
                      <select className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white"
                        value={newsForm.category} onChange={e => setNewsForm({...newsForm, category: e.target.value as any})}
                      >
                        <option value="NOTICE">공지 (NOTICE)</option>
                        <option value="EVENT">이벤트 (EVENT)</option>
                        <option value="UPDATE">업데이트 (UPDATE)</option>
                      </select>
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-400 text-sm mb-1">내용</label>
                    <textarea required rows={5} className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white"
                       value={newsForm.content} onChange={e => setNewsForm({...newsForm, content: e.target.value})}
                    />
                  </div>
                  <button type="submit" className="bg-brand-600 text-white px-6 py-2 rounded hover:bg-brand-500">등록하기</button>
               </form>
             )}

             <div className="space-y-4">
               {newsList.map(item => (
                 <div key={item.id} className="bg-slate-800 p-4 rounded-lg flex justify-between items-start border border-slate-700">
                    <div>
                       <div className="flex items-center gap-2 mb-1">
                         <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                           item.category === 'NOTICE' ? 'bg-red-900 text-red-200' :
                           item.category === 'EVENT' ? 'bg-yellow-900 text-yellow-200' : 'bg-blue-900 text-blue-200'
                         }`}>{item.category}</span>
                         <span className="text-gray-500 text-xs">{new Date(item.date).toLocaleDateString()}</span>
                       </div>
                       <h4 className="text-lg font-bold text-white">{item.title}</h4>
                       <p className="text-gray-400 text-sm mt-1 whitespace-pre-wrap">{item.content}</p>
                    </div>
                    <button onClick={() => handleDeleteNews(item.id)} className="text-red-400 hover:text-red-300 p-2">
                       <Trash2 size={18} />
                    </button>
                 </div>
               ))}
             </div>
           </div>
        )}

        {tab === 'site' && (
          <div className="space-y-6 max-w-4xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-800 p-4 rounded-lg">
                <h3 className="text-yellow-400 font-bold mb-4 flex items-center"><DollarSign size={16} className="mr-2"/> 코인 가격 설정</h3>
                <label className="block text-sm text-gray-400 mb-1">1 코인당 가격 (KRW)</label>
                <input 
                  type="text" 
                  inputMode="numeric"
                  value={configForm.coinPrice}
                  onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '');
                      setConfigForm({...configForm, coinPrice: parseInt(value) || 0})
                  }}
                  className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white"
                />
              </div>
              <div className="bg-slate-800 p-4 rounded-lg">
                <h3 className="text-yellow-400 font-bold mb-4 flex items-center"><CreditCard size={16} className="mr-2"/> 관리자 입금 계좌</h3>
                <div className="space-y-2">
                   <input 
                      placeholder="은행명"
                      value={configForm.adminBankName}
                      onChange={(e) => setConfigForm({...configForm, adminBankName: e.target.value})}
                      className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white text-sm"
                    />
                    <input 
                      placeholder="계좌번호"
                      value={configForm.adminAccountNumber}
                      onChange={(e) => setConfigForm({...configForm, adminAccountNumber: e.target.value})}
                      className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white text-sm"
                    />
                    <input 
                      placeholder="예금주"
                      value={configForm.adminAccountHolder}
                      onChange={(e) => setConfigForm({...configForm, adminAccountHolder: e.target.value})}
                      className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white text-sm"
                    />
                </div>
              </div>
            </div>

            {/* 코인 소개 페이지 내용 수정 섹션 추가 */}
            <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
               <h3 className="text-yellow-400 font-bold mb-6 flex items-center border-b border-white/10 pb-3">
                 <FileText size={18} className="mr-2"/> 코인 소개 페이지 내용 수정
               </h3>
               
               <div className="space-y-6">
                 <div>
                   <label className="block text-sm text-gray-400 mb-2 font-bold">기술 구조 (Technology)</label>
                   <textarea 
                     rows={4}
                     className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition"
                     value={configForm.techContent}
                     onChange={(e) => setConfigForm({...configForm, techContent: e.target.value})}
                     placeholder="기술 구조에 대한 설명을 입력하세요."
                   />
                 </div>

                 <div>
                   <label className="block text-sm text-gray-400 mb-2 font-bold">로드맵 (Roadmap)</label>
                   <p className="text-xs text-gray-500 mb-2">* 줄바꿈(Enter)을 기준으로 리스트가 생성됩니다.</p>
                   <textarea 
                     rows={5}
                     className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition"
                     value={configForm.roadmapContent}
                     onChange={(e) => setConfigForm({...configForm, roadmapContent: e.target.value})}
                     placeholder="예) 2024 Q1: 백서 공개 및 시드 세일"
                   />
                 </div>

                 <div>
                   <label className="block text-sm text-gray-400 mb-2 font-bold">핵심 장점 (Benefits)</label>
                   <textarea 
                     rows={4}
                     className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition"
                     value={configForm.benefitsContent}
                     onChange={(e) => setConfigForm({...configForm, benefitsContent: e.target.value})}
                     placeholder="프로젝트의 핵심 장점을 입력하세요."
                   />
                 </div>
               </div>
            </div>

            <div className="flex justify-end">
               <button onClick={saveConfig} className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-8 py-4 rounded-xl shadow-lg shadow-yellow-500/20 transition transform active:scale-95 flex items-center">
                 <CheckCircle size={20} className="mr-2"/> 설정 저장하기
               </button>
            </div>

            {/* 데이터 초기화 섹션 (최고관리자 전용) */}
            {isMaster && (
              <div className="bg-red-900/20 p-6 rounded-lg border border-red-500/50 mt-12">
                <h3 className="text-red-400 font-bold mb-4 flex items-center border-b border-red-500/30 pb-3">
                  <AlertTriangle className="mr-2" /> 데이터 초기화 (최고관리자 전용)
                </h3>
                <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                  <span className="text-red-400 font-bold">주의:</span> 이 작업을 수행하면 
                  <span className="text-white font-bold mx-1">모든 일반 회원 정보</span>와 
                  <span className="text-white font-bold mx-1">모든 거래 내역</span>이 영구적으로 삭제됩니다.<br/>
                  관리자 계정, 공지사항, 사이트 설정은 유지됩니다. 삭제된 데이터는 복구할 수 없습니다.
                </p>
                <div className="flex justify-end">
                  <button
                    onClick={handleResetUserData}
                    className={`${isResetConfirming ? 'bg-red-800 hover:bg-red-900 animate-pulse' : 'bg-red-600 hover:bg-red-500'} text-white font-bold px-6 py-3 rounded-lg flex items-center shadow-lg shadow-red-900/30 transition transform active:scale-95`}
                  >
                    <RotateCcw className="mr-2" size={18} /> 
                    {isResetConfirming ? "정말 삭제하시겠습니까? (클릭하여 확정)" : "회원 및 거래내역 초기화"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// 7. NEWS PAGE
const News: React.FC<{ newsList: NewsItem[] }> = ({ newsList }) => {
  return (
    <div className="pt-24 pb-20 max-w-4xl mx-auto px-4 animate-fade-in">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-bold text-white mb-4">공지사항</h2>
        <div className="h-1 w-20 bg-brand-500 mx-auto rounded-full"></div>
      </div>

      <div className="space-y-6">
        {newsList.length === 0 ? (
          <div className="text-center text-gray-400 py-20 bg-slate-800/50 rounded-xl border border-white/5">
            등록된 공지사항이 없습니다.
          </div>
        ) : (
          newsList.map((item) => (
            <div key={item.id} className="glass-panel p-6 md:p-8 rounded-2xl border border-white/5 hover:border-brand-500/20 transition">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-2">
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    item.category === 'NOTICE' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                    item.category === 'EVENT' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 
                    'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  }`}>
                    {item.category === 'NOTICE' ? '공지' : item.category === 'EVENT' ? '이벤트' : '업데이트'}
                  </span>
                  <span className="text-gray-500 text-sm">{new Date(item.date).toLocaleDateString()}</span>
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
              <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">{item.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const SESSION_KEY = 'minecoin_user_session';
  const LAST_PAGE_KEY = 'minecoin_last_page';

  // State initialization
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(SESSION_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [currentPage, setCurrentPage] = useState<string>(() => {
    return localStorage.getItem(LAST_PAGE_KEY) || 'home';
  });

  const [siteConfig, setSiteConfig] = useState<SiteConfig>({
      coinPrice: 0,
      adminBankName: '',
      adminAccountNumber: '',
      adminAccountHolder: '',
      techContent: '',
      roadmapContent: '',
      benefitsContent: ''
  });
  const [newsList, setNewsList] = useState<NewsItem[]>([]);

  // 1. Initialize Default Data (Master Admin) on Mount
  useEffect(() => {
    db.initializeSystem();
  }, []);

  // 2. Subscribe to Global Data (News & Config)
  useEffect(() => {
    const unsubNews = db.subscribeToNews((data) => setNewsList(data));
    const unsubConfig = db.subscribeToConfig((data) => setSiteConfig(data));
    
    return () => {
        unsubNews();
        unsubConfig();
    }
  }, []);

  const refreshNews = () => { /* Now auto-handled by subscription, but keeping function signature for prop compat */ };

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    localStorage.setItem(LAST_PAGE_KEY, page);
    window.scrollTo(0, 0);
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    
    const targetPage = (user.role === UserRole.ADMIN || user.role === UserRole.MASTER) ? 'admin' : 'home';
    handleNavigate(targetPage);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem(SESSION_KEY);
    handleNavigate('home');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home': return <Home onNavigate={handleNavigate} />;
      case 'about': return <About config={siteConfig} />;
      case 'news': return <News newsList={newsList} />;
      case 'login': return <Login onLogin={handleLogin} onNavigate={handleNavigate} />;
      case 'signup': return <Signup onNavigate={handleNavigate} />;
      case 'buy': return currentUser ? <BuyPage user={currentUser} config={siteConfig} onNavigate={handleNavigate} /> : <Login onLogin={handleLogin} onNavigate={handleNavigate} />;
      case 'mypage': return currentUser ? <MyPage user={currentUser} config={siteConfig} onUpdateUser={setCurrentUser} /> : <Login onLogin={handleLogin} onNavigate={handleNavigate} />;
      case 'admin': return (currentUser && (currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.MASTER)) ? <AdminDashboard config={siteConfig} onUpdateConfig={setSiteConfig} newsList={newsList} onNewsUpdate={refreshNews} currentUser={currentUser} /> : <div className="text-white pt-32 text-center">접근 권한이 없습니다.</div>;
      default: return <Home onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col font-sans text-slate-100 selection:bg-brand-500 selection:text-white">
      <Header currentUser={currentUser} onLogout={handleLogout} onNavigate={handleNavigate} currentPage={currentPage} />
      <main className="flex-grow pt-4">{renderPage()}</main>
      <Footer />
    </div>
  );
};

export default App;
