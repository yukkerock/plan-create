import React, { useState } from 'react';
import { Bell, User, LogOut, X, Menu } from 'lucide-react';
import { Button } from './ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { Card } from './ui/Card';

interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: 'info' | 'warning' | 'success' | 'error';
}

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const { user, profile, signOut } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  // 通知のサンプルデータ
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: '計画書の更新時期',
      message: '鈴木一郎さんの計画書は5日以内に更新が必要です。',
      date: '2025-03-08 10:30',
      read: false,
      type: 'warning'
    },
    {
      id: '2',
      title: 'システムアップデート',
      message: '2025年4月15日にシステムのアップデートが予定されています。',
      date: '2025-03-07 15:45',
      read: true,
      type: 'info'
    },
    {
      id: '3',
      title: 'Gemini API連携機能',
      message: '計画書作成時にAIによる自動生成機能が利用できるようになりました。',
      date: '2025-03-06 09:15',
      read: true,
      type: 'success'
    }
  ]);

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('ログアウトエラー:', error);
    }
  };

  // 通知を既読にする
  const markAsRead = (id: string) => {
    setNotifications(notifications.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    ));
  };

  // 未読通知の数を取得
  const unreadCount = notifications.filter(notification => !notification.read).length;

  // ユーザー名を取得
  const userName = profile?.full_name || user?.email?.split('@')[0] || 'ユーザー';
  // ユーザーロールを取得
  const userRole = profile?.role || '一般ユーザー';

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-3">
          {/* ハンバーガーメニューボタン（モバイル表示時のみ） */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="md:hidden"
            onClick={toggleSidebar}
          >
            <Menu size={24} />
          </Button>
          
          <h1 className="text-xl font-bold text-blue-600">訪問看護計画書自動作成システム</h1>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* 通知ボタン */}
          <div className="relative">
            <Button 
              variant="ghost" 
              size="sm" 
              className="relative"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-red-500 flex items-center justify-center text-white text-xs">
                  {unreadCount}
                </span>
              )}
            </Button>
            
            {/* 通知ドロップダウン */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-20">
                <Card className="p-0">
                  <div className="p-3 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="font-medium text-sm">通知</h3>
                    <button 
                      className="text-gray-400 hover:text-gray-500"
                      onClick={() => setShowNotifications(false)}
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length > 0 ? (
                      <div className="divide-y divide-gray-200">
                        {notifications.map((notification) => (
                          <div 
                            key={notification.id} 
                            className={`p-3 hover:bg-gray-50 ${!notification.read ? 'bg-blue-50' : ''}`}
                            onClick={() => markAsRead(notification.id)}
                          >
                            <div className="flex justify-between">
                              <p className="font-medium text-sm">{notification.title}</p>
                              <span className="text-xs text-gray-500">{notification.date}</span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                            {!notification.read && (
                              <span className="inline-block mt-1 text-xs font-medium text-blue-600">未読</span>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-gray-500">
                        通知はありません
                      </div>
                    )}
                  </div>
                  {notifications.length > 0 && (
                    <div className="p-2 border-t border-gray-200 text-center">
                      <button className="text-sm text-blue-600 hover:text-blue-800">
                        すべての通知を見る
                      </button>
                    </div>
                  )}
                </Card>
              </div>
            )}
          </div>
          
          {/* ユーザーメニュー */}
          <div className="relative">
            <button 
              className="flex items-center space-x-2 focus:outline-none"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <User size={18} className="text-blue-600" />
              </div>
              <div className="text-sm hidden sm:block">
                <p className="font-medium text-gray-700">{userName}</p>
                <p className="text-gray-500 text-xs">{userRole}</p>
              </div>
            </button>
            
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20">
                <Card className="p-0">
                  <div className="p-3 border-b border-gray-200">
                    <p className="font-medium text-sm">{userName}</p>
                    <p className="text-gray-500 text-xs">{user?.email}</p>
                  </div>
                  <div className="p-2">
                    <button 
                      className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-left text-gray-700 hover:bg-gray-100 rounded-md"
                      onClick={handleLogout}
                    >
                      <LogOut size={16} />
                      <span>ログアウト</span>
                    </button>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;