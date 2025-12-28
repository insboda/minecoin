import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { Menu, X, Coins, User as UserIcon, LogOut, LayoutDashboard, History, ShoppingCart } from 'lucide-react';

interface HeaderProps {
  currentUser: User | null;
  onLogout: () => void;
  onNavigate: (page: string) => void;
  currentPage: string;
}

export const Header: React.FC<HeaderProps> = ({ currentUser, onLogout, onNavigate, currentPage }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItemClass = (page: string) =>
    `cursor-pointer px-4 py-2 rounded-lg transition-colors duration-200 ${
      currentPage === page ? 'text-brand-400 font-bold bg-white/10' : 'text-gray-300 hover:text-white hover:bg-white/5'
    }`;

  const handleNav = (page: string) => {
    onNavigate(page);
    setMobileMenuOpen(false);
  };

  const isAdminOrMaster = currentUser && (currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.MASTER);

  return (
    <header className="fixed top-0 w-full z-50 glass-panel border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center cursor-pointer" onClick={() => handleNav('home')}>
            <Coins className="h-8 w-8 text-brand-400 mr-2" />
            <span className="text-2xl font-bold tracking-tight text-white">
              Mine<span className="text-brand-400">Coin</span>
            </span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex space-x-2 items-center">
            <a onClick={() => handleNav('home')} className={navItemClass('home')}>홈</a>
            <a onClick={() => handleNav('about')} className={navItemClass('about')}>코인 소개</a>
            <a onClick={() => handleNav('news')} className={navItemClass('news')}>공지사항</a>
            
            {currentUser && currentUser.role === UserRole.USER && (
               <>
                <a onClick={() => handleNav('buy')} className={navItemClass('buy')}>구매신청</a>
                <a onClick={() => handleNav('mypage')} className={navItemClass('mypage')}>마이페이지</a>
               </>
            )}

            {isAdminOrMaster && (
               <a onClick={() => handleNav('admin')} className={`${navItemClass('admin')} text-yellow-400`}>관리자 페이지</a>
            )}
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {currentUser ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-400">
                  <span className={`font-semibold ${currentUser.role === UserRole.MASTER ? 'text-yellow-400' : 'text-white'}`}>{currentUser.name}</span>님
                </span>
                <button
                  onClick={onLogout}
                  className="flex items-center px-4 py-2 border border-red-500/50 text-red-400 rounded-lg hover:bg-red-500/10 transition"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  로그아웃
                </button>
              </div>
            ) : (
              <>
                <button onClick={() => handleNav('login')} className="text-gray-300 hover:text-white font-medium">
                  로그인
                </button>
                <button
                  onClick={() => handleNav('signup')}
                  className="bg-brand-600 hover:bg-brand-500 text-white px-5 py-2 rounded-full font-bold shadow-lg shadow-brand-500/20 transition transform hover:scale-105"
                >
                  회원가입
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-gray-300 hover:text-white">
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-panel border-t border-white/10 absolute w-full">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <button onClick={() => handleNav('home')} className={`block w-full text-left ${navItemClass('home')}`}>홈</button>
            <button onClick={() => handleNav('about')} className={`block w-full text-left ${navItemClass('about')}`}>코인 소개</button>
            <button onClick={() => handleNav('news')} className={`block w-full text-left ${navItemClass('news')}`}>공지사항</button>
            
            {currentUser && currentUser.role === UserRole.USER && (
              <>
                <button onClick={() => handleNav('buy')} className={`block w-full text-left ${navItemClass('buy')}`}>구매신청</button>
                <button onClick={() => handleNav('mypage')} className={`block w-full text-left ${navItemClass('mypage')}`}>마이페이지</button>
              </>
            )}
            
            {isAdminOrMaster && (
              <button onClick={() => handleNav('admin')} className={`block w-full text-left ${navItemClass('admin')} text-yellow-400`}>관리자 페이지</button>
            )}

            <div className="border-t border-gray-700 pt-4 mt-4">
              {currentUser ? (
                <div className="flex flex-col gap-2">
                  <span className="px-4 text-gray-400">{currentUser.name}님 환영합니다</span>
                  <button onClick={onLogout} className="mx-4 px-4 py-2 border border-red-500/50 text-red-400 rounded-lg">로그아웃</button>
                </div>
              ) : (
                <div className="flex flex-col gap-2 px-4">
                   <button onClick={() => handleNav('login')} className="w-full text-center py-2 text-gray-300 border border-gray-600 rounded-lg">로그인</button>
                   <button onClick={() => handleNav('signup')} className="w-full text-center py-2 bg-brand-600 text-white rounded-lg">회원가입</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export const Footer: React.FC = () => (
  <footer className="bg-slate-950 py-12 border-t border-white/5 mt-auto">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="col-span-1 md:col-span-2">
          <div className="flex items-center mb-4">
            <Coins className="h-6 w-6 text-brand-400 mr-2" />
            <span className="text-xl font-bold text-white">MineCoin</span>
          </div>
          <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
            블록체인의 미래를 선도하는 MineCoin. <br/>
            안전하고 빠른 거래, 그리고 투명한 생태계를 만들어갑니다.
          </p>
        </div>
        <div>
          <h3 className="text-white font-bold mb-4">Menu</h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li><a href="#" className="hover:text-brand-400">소개</a></li>
            <li><a href="#" className="hover:text-brand-400">로드맵</a></li>
            <li><a href="#" className="hover:text-brand-400">백서</a></li>
          </ul>
        </div>
        <div>
          <h3 className="text-white font-bold mb-4">Contact</h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>support@minecoin.io</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 mt-12 pt-8 text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} MineCoin Foundation. All rights reserved.
      </div>
    </div>
  </footer>
);

export const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-black bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div className="inline-block align-bottom glass-panel rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full border border-gray-600">
          <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <h3 className="text-lg leading-6 font-medium text-white mb-4" id="modal-title">{title}</h3>
            <div className="mt-2 text-gray-300">
              {children}
            </div>
          </div>
          <div className="px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse bg-white/5">
            <button type="button" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-brand-600 text-base font-medium text-white hover:bg-brand-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm" onClick={onClose}>
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};