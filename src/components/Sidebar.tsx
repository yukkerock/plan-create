import React from 'react';
import { Home, FileText, Users, Settings, HelpCircle, PlusCircle, X } from 'lucide-react';
import { Button } from './ui/Button';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isOpen, onClose }) => {
  const menuItems = [
    { id: 'dashboard', label: 'ホーム', icon: <Home size={20} /> },
    { id: 'patients', label: '患者一覧', icon: <Users size={20} /> },
    { id: 'plan-creation', label: '計画書作成', icon: <FileText size={20} /> },
    { id: 'settings', label: '設定', icon: <Settings size={20} /> },
    { id: 'help', label: 'ヘルプ', icon: <HelpCircle size={20} /> },
  ];

  const handleNewPlanClick = () => {
    setActiveTab('plan-creation');
    if (window.innerWidth < 768) {
      onClose();
    }
  };

  // モバイル表示用のクラス
  const mobileClasses = isOpen
    ? 'fixed inset-y-0 left-0 transform translate-x-0 transition ease-in-out duration-300 z-20'
    : 'fixed inset-y-0 left-0 transform -translate-x-full transition ease-in-out duration-300 z-20';

  // デスクトップ表示用のクラス
  const desktopClasses = 'hidden md:block';

  return (
    <>
      {/* デスクトップ表示用サイドバー */}
      <aside className={`w-64 bg-white border-r border-gray-200 ${desktopClasses}`}>
        <div className="p-4">
          <Button 
            className="w-full flex items-center justify-center gap-2"
            onClick={handleNewPlanClick}
          >
            <PlusCircle size={18} />
            <span>新規計画書作成</span>
          </Button>
        </div>
        
        <nav className="mt-2">
          <ul className="space-y-1 px-2">
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === item.id
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className={activeTab === item.id ? 'text-blue-600' : 'text-gray-500'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* モバイル表示用サイドバー */}
      <aside className={`w-64 bg-white border-r border-gray-200 ${mobileClasses} md:hidden`}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="font-semibold text-lg">メニュー</h2>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="p-1"
          >
            <X size={20} />
          </Button>
        </div>
        
        <div className="p-4">
          <Button 
            className="w-full flex items-center justify-center gap-2"
            onClick={handleNewPlanClick}
          >
            <PlusCircle size={18} />
            <span>新規計画書作成</span>
          </Button>
        </div>
        
        <nav className="mt-2">
          <ul className="space-y-1 px-2">
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === item.id
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className={activeTab === item.id ? 'text-blue-600' : 'text-gray-500'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;