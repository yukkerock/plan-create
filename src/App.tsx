import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/Tabs';
import { Button } from './components/ui/Button';
import { Card } from './components/ui/Card';
import { Home, FileText, Users, Settings, HelpCircle } from 'lucide-react';
import Dashboard from './components/Dashboard';
import PatientList from './components/PatientList';
import PlanCreation from './components/PlanCreation';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import LoginForm from './components/LoginForm';
import SignupForm from './components/SignupForm';
import SettingsComponent from './components/Settings';
import HelpComponent from './components/Help';
import { useAuth } from './contexts/AuthContext';
import { DEMO_MODE, PARTIAL_DEMO_MODE } from './lib/supabase';

function App() {
  // 初期状態をfalseに設定してログイン画面を表示
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedPatientId, setSelectedPatientId] = useState<string | undefined>(undefined);
  const [showSignup, setShowSignup] = useState(false);
  // サイドバーの表示状態を管理
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const { user, signIn, loading } = useAuth();

  // ウィンドウサイズが変更されたときにサイドバーの表示状態を更新
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) { // md breakpoint
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // 認証状態が読み込まれたら、ログイン状態を更新
    if (!loading) {
      setIsLoggedIn(!!user);
    }
  }, [user, loading]);

  const handleLogin = async (email: string, password: string) => {
    try {
      const { error } = await signIn(email, password);
      if (error) {
        console.error('ログインエラー:', error.message);
        return;
      }
      setIsLoggedIn(true);
    } catch (error) {
      console.error('ログイン処理エラー:', error);
    }
  };

  // 計画書作成画面に移動する関数
  const navigateToPlanCreation = (patientId?: string) => {
    setSelectedPatientId(patientId);
    setActiveTab('plan-creation');
  };

  // サイドバーの表示・非表示を切り替える関数
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // モバイル表示時にサイドバーを閉じる関数
  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  // ローディング中は何も表示しない
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        {DEMO_MODE && (
          <div className="absolute top-4 left-4 right-4 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  {PARTIAL_DEMO_MODE 
                    ? 'デモモード（部分的）で動作しています。実際のアカウントでログインするか、新規アカウントを作成してください。'
                    : 'デモモードで動作しています。テスト用アカウント（test@example.com / password123）でログインしてください。'
                  }
                </p>
              </div>
            </div>
          </div>
        )}
        
        {showSignup ? (
          <SignupForm 
            onSignup={() => setShowSignup(false)} 
            onSwitchToLogin={() => setShowSignup(false)} 
          />
        ) : (
          <LoginForm 
            onLogin={handleLogin} 
            onSwitchToSignup={() => setShowSignup(true)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header toggleSidebar={toggleSidebar} />
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={(tab) => {
            setActiveTab(tab);
            closeSidebar();
          }} 
          isOpen={sidebarOpen}
          onClose={closeSidebar}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'patients' && <PatientList onCreatePlan={navigateToPlanCreation} />}
          {activeTab === 'plan-creation' && <PlanCreation patientId={selectedPatientId} />}
          {activeTab === 'settings' && <SettingsComponent />}
          {activeTab === 'help' && <HelpComponent />}
        </main>
        
        {/* モバイル表示時のオーバーレイ */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden"
            onClick={closeSidebar}
          ></div>
        )}
      </div>
    </div>
  );
}

export default App;