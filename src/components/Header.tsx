import React from 'react';
import { Bell, HelpCircle, User } from 'lucide-react';
import { Button } from './ui/Button';

const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center">
          <h1 className="text-xl font-bold text-blue-600">訪問看護計画書自動作成システム</h1>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" className="relative">
            <Bell size={20} />
            <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
          </Button>
          
          <Button variant="ghost" size="sm">
            <HelpCircle size={20} />
          </Button>
          
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
              <User size={18} className="text-blue-600" />
            </div>
            <div className="text-sm">
              <p className="font-medium text-gray-700">山田 花子</p>
              <p className="text-gray-500 text-xs">看護師</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;