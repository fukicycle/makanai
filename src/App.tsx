import React from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { Onboarding } from './pages/Onboarding';
import { Home } from './pages/Home';
import { RecipeDetail } from './pages/RecipeDetail';
import { ShoppingList } from './pages/ShoppingList';
import { Settings } from './pages/Settings';
import { 
  Calendar, 
  ShoppingBag, 
  Settings as SettingsIcon, 
  Heart 
} from 'lucide-react';

const NavigationShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: '献立', icon: Calendar },
    { path: '/shopping', label: '買物', icon: ShoppingBag },
    { path: '/settings', label: '設定', icon: SettingsIcon },
  ];

  return (
    <div className="fixed inset-0 flex flex-col h-screen overflow-hidden bg-gradient-to-br from-amber-50/40 via-orange-50/20 to-emerald-50/30 text-stone-800 antialiased font-serif">
      
      {/* 上部ヘッダー */}
      <header className="w-full glass border-b border-orange-100/60 shadow-sm backdrop-blur-md shrink-0">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-orange-800 hover:opacity-90 transition-opacity">
            <Heart className="w-5 h-5 text-orange-600 fill-orange-500/20" />
            <h1 className="text-lg font-bold tracking-wider font-serif">まかなひ</h1>
          </Link>
          <div className="text-[10px] text-stone-400 font-sans tracking-wide">
            和みと健康の夕食こしらえ
          </div>
        </div>
      </header>

      {/* メインコンテンツ表示域（独立スクロール） */}
      <main className="flex-grow overflow-y-auto max-w-4xl w-full mx-auto px-4 pt-4 pb-6">
        {children}
      </main>

      {/* 下部ナビゲーション（PWAセーフエリア/iPhone Safe Areaを考慮） */}
      <nav className="bg-white/90 backdrop-blur-md border-t border-stone-200/50 pb-safe shadow-[0_-4px_24px_rgba(0,0,0,0.04)] shrink-0">
        <div className="max-w-md mx-auto px-6 py-2 flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            // 詳細ルート（/recipe/:dayIndex）の時は「献立(/)」をアクティブにする
            const isActive = item.path === '/' 
              ? location.pathname === '/' || location.pathname.startsWith('/recipe/')
              : location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-0.5 py-1 px-4 rounded-xl transition-all duration-300 ${
                  isActive 
                    ? 'text-orange-600 font-bold bg-orange-50/60' 
                    : 'text-stone-400 hover:text-stone-600'
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110' : ''}`} />
                <span className="text-[9px] tracking-wider font-serif font-semibold">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

const AppContent: React.FC = () => {
  const { isOnboarded } = useApp();

  if (!isOnboarded) {
    return <Onboarding />;
  }

  return (
    <HashRouter>
      <NavigationShell>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/recipe/:dayIndex" element={<RecipeDetail />} />
          <Route path="/shopping" element={<ShoppingList />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </NavigationShell>
    </HashRouter>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;