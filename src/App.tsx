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
import { useAuth } from './contexts/AuthContext';
import { DEMO_MODE } from './lib/supabase';

function App() {
  // 初期状態をfalseに設定してログイン画面を表示
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedPatientId, setSelectedPatientId] = useState<string | undefined>(undefined);
  
  const { user, signIn, loading } = useAuth();

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
                  デモモードで動作しています。テスト用アカウント（test@example.com / password123）でログインしてください。
                </p>
              </div>
            </div>
          </div>
        )}
        <LoginForm onLogin={handleLogin} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'patients' && <PatientList onCreatePlan={navigateToPlanCreation} />}
          {activeTab === 'plan-creation' && <PlanCreation patientId={selectedPatientId} />}
          {activeTab === 'settings' && (
            <div className="space-y-4">
              <h1 className="text-2xl font-bold">設定</h1>
              {DEMO_MODE && (
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-md mb-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-blue-700">
                        デモモードで動作しています。データはローカルのみで保存され、サーバーには送信されません。
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">アプリケーション設定</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      テーマ
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <option>ライト</option>
                      <option>ダーク</option>
                      <option>システム設定に合わせる</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      言語
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <option>日本語</option>
                      <option>English</option>
                    </select>
                  </div>
                  
                  <div className="pt-4">
                    <Button>設定を保存</Button>
                  </div>
                </div>
              </Card>
            </div>
          )}
          {activeTab === 'help' && (
            <div className="space-y-4">
              <h1 className="text-2xl font-bold">ヘルプ</h1>
              
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">よくある質問</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-lg">計画書の作成方法は？</h3>
                    <p className="text-gray-600 mt-1">
                      患者一覧から対象の患者を選択し、「計画書作成」ボタンをクリックします。
                      基本情報、アセスメント情報を入力し、AI生成ボタンをクリックすると計画書の草案が生成されます。
                      内容を確認・編集後、保存ボタンをクリックすると計画書が保存されます。
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-lg">患者情報の編集方法は？</h3>
                    <p className="text-gray-600 mt-1">
                      患者一覧から対象の患者の「編集」ボタンをクリックすると、患者情報編集画面が表示されます。
                      情報を更新後、保存ボタンをクリックすると変更が反映されます。
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-lg">サポートが必要な場合は？</h3>
                    <p className="text-gray-600 mt-1">
                      support@careplan-app.example.com までメールでお問い合わせください。
                      平日9:00-17:00の間、通常24時間以内に返信いたします。
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;