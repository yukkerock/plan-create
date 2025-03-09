import React, { useState } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { DEMO_MODE, PARTIAL_DEMO_MODE } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const Settings: React.FC = () => {
  const { user } = useAuth();
  const [theme, setTheme] = useState('light');
  const [language, setLanguage] = useState('ja');
  const [fontSize, setFontSize] = useState('medium');
  const [notificationEnabled, setNotificationEnabled] = useState(true);
  const [saveMessage, setSaveMessage] = useState('');

  const handleSaveSettings = () => {
    // 設定を保存する処理（実際にはローカルストレージやデータベースに保存）
    localStorage.setItem('userSettings', JSON.stringify({
      theme,
      language,
      fontSize,
      notificationEnabled
    }));
    
    setSaveMessage('設定が保存されました');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">設定</h1>
      
      {(DEMO_MODE || PARTIAL_DEMO_MODE) && (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                {PARTIAL_DEMO_MODE 
                  ? '部分的デモモードで動作しています。一部の設定は実際に反映されます。'
                  : 'デモモードで動作しています。設定はローカルのみで保存され、サーバーには送信されません。'
                }
              </p>
            </div>
          </div>
        </div>
      )}
      
      {saveMessage && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">{saveMessage}</p>
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
            <select 
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
            >
              <option value="light">ライト</option>
              <option value="dark">ダーク</option>
              <option value="system">システム設定に合わせる</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              言語
            </label>
            <select 
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="ja">日本語</option>
              <option value="en">English</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              文字サイズ
            </label>
            <select 
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={fontSize}
              onChange={(e) => setFontSize(e.target.value)}
            >
              <option value="small">小</option>
              <option value="medium">中</option>
              <option value="large">大</option>
            </select>
          </div>
          
          <div className="flex items-center">
            <input 
              type="checkbox" 
              id="notifications" 
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              checked={notificationEnabled}
              onChange={(e) => setNotificationEnabled(e.target.checked)}
            />
            <label htmlFor="notifications" className="ml-2 block text-sm text-gray-700">
              通知を有効にする
            </label>
          </div>
          
          <div className="pt-4">
            <Button onClick={handleSaveSettings}>設定を保存</Button>
          </div>
        </div>
      </Card>
      
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">アカウント情報</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              メールアドレス
            </label>
            <input 
              type="email" 
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 focus:outline-none"
              value={user?.email || ''}
              disabled
            />
            <p className="mt-1 text-xs text-gray-500">メールアドレスの変更は管理者にお問い合わせください</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              パスワード
            </label>
            <Button variant="outline" size="sm">
              パスワードを変更
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Settings; 