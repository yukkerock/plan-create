import React, { useState } from 'react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { DEMO_MODE, PARTIAL_DEMO_MODE } from '../lib/supabase';
import { supabase } from '../lib/supabase';
import { X } from 'lucide-react';

interface LoginFormProps {
  onLogin: (email: string, password: string) => void;
  onSwitchToSignup?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin, onSwitchToSignup }) => {
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('メールアドレスとパスワードを入力してください');
      return;
    }
    
    setError('');
    setIsLoading(true);
    
    try {
      await onLogin(email, password);
    } catch (err) {
      setError('ログインに失敗しました。認証情報を確認してください。');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      setResetError('メールアドレスを入力してください');
      return;
    }
    
    setResetError('');
    setResetLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: window.location.origin + '/reset-password',
      });
      
      if (error) {
        throw error;
      }
      
      setResetSuccess(true);
    } catch (err: any) {
      setResetError('パスワードリセットメールの送信に失敗しました: ' + err.message);
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md p-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">訪問看護計画書自動作成システム</h1>
        <p className="text-gray-600 mt-2">アカウント情報でログインしてください</p>
      </div>
      
      {!showForgotPassword ? (
        // ログインフォーム
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 text-sm">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                メールアドレス
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="example@example.com"
                disabled={isLoading}
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                パスワード
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isLoading}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  ログイン状態を保存
                </label>
              </div>
              
              <div className="text-sm">
                <button 
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  パスワードをお忘れですか？
                </button>
              </div>
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>ログイン中...</span>
                </div>
              ) : (
                'ログイン'
              )}
            </Button>
          </div>
        </form>
      ) : (
        // パスワードリセットフォーム
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">パスワードをリセット</h2>
            <button 
              onClick={() => setShowForgotPassword(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
          </div>
          
          {resetSuccess ? (
            <div className="bg-green-50 text-green-600 p-4 rounded-md mb-4">
              <p>パスワードリセットのメールを送信しました。メールの指示に従ってパスワードをリセットしてください。</p>
              <button 
                onClick={() => {
                  setShowForgotPassword(false);
                  setResetSuccess(false);
                  setResetEmail('');
                }}
                className="mt-3 text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                ログイン画面に戻る
              </button>
            </div>
          ) : (
            <form onSubmit={handleResetPassword}>
              {resetError && (
                <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 text-sm">
                  {resetError}
                </div>
              )}
              
              <p className="text-sm text-gray-600 mb-4">
                アカウントに登録されているメールアドレスを入力してください。パスワードリセットのリンクをメールで送信します。
              </p>
              
              <div className="mb-4">
                <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700 mb-1">
                  メールアドレス
                </label>
                <input
                  id="reset-email"
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="example@example.com"
                  disabled={resetLoading}
                />
              </div>
              
              <div className="flex space-x-3">
                <Button 
                  type="submit" 
                  className="flex-1"
                  disabled={resetLoading}
                >
                  {resetLoading ? '送信中...' : 'リセットリンクを送信'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setShowForgotPassword(false)}
                  disabled={resetLoading}
                >
                  キャンセル
                </Button>
              </div>
            </form>
          )}
        </div>
      )}
      
      {/* アカウント登録リンク */}
      {!showForgotPassword && (
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            アカウントをお持ちでないですか？{' '}
            {onSwitchToSignup && PARTIAL_DEMO_MODE ? (
              <button
                type="button"
                onClick={onSwitchToSignup}
                className="font-medium text-blue-600 hover:text-blue-500"
                disabled={isLoading}
              >
                新規登録
              </button>
            ) : (
              <span className="text-gray-500">
                システム管理者にお問い合わせください
              </span>
            )}
          </p>
        </div>
      )}
      
      {/* テスト用アカウント情報 */}
      {DEMO_MODE && !showForgotPassword && (
        <div className="mt-6 p-3 bg-gray-50 rounded-md border border-gray-200">
          <p className="text-sm text-gray-600 font-medium">テスト用アカウント</p>
          <p className="text-sm text-gray-500 mt-1">Email: test@example.com</p>
          <p className="text-sm text-gray-500">Password: password123</p>
        </div>
      )}
    </Card>
  );
};

export default LoginForm;