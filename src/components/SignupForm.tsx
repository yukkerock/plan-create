import React, { useState } from 'react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { supabase } from '../lib/supabase';

interface SignupFormProps {
  onSignup: () => void;
  onSwitchToLogin: () => void;
}

const SignupForm: React.FC<SignupFormProps> = ({ onSignup, onSwitchToLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 入力検証
    if (!email || !password || !confirmPassword || !fullName) {
      setError('すべての項目を入力してください');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('パスワードが一致しません');
      return;
    }
    
    if (password.length < 6) {
      setError('パスワードは6文字以上で入力してください');
      return;
    }
    
    setError('');
    setIsLoading(true);
    
    try {
      // Supabaseでユーザー登録
      const { data, error: signupError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      });
      
      if (signupError) {
        throw signupError;
      }
      
      // プロフィールテーブルにデータを追加
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: data.user.id,
              full_name: fullName,
              role: 'user'
            }
          ]);
          
        if (profileError) {
          console.error('プロフィール作成エラー:', profileError);
        }
      }
      
      setSuccessMessage('アカウントが作成されました。メールを確認してアカウントを有効化してください。');
      
      // 3秒後にログイン画面に戻る
      setTimeout(() => {
        onSignup();
      }, 3000);
      
    } catch (err: any) {
      console.error('サインアップエラー:', err);
      if (err.message === 'User already registered') {
        setError('このメールアドレスは既に登録されています');
      } else {
        setError('アカウント作成に失敗しました: ' + err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md p-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">アカウント登録</h1>
        <p className="text-gray-600 mt-2">新しいアカウントを作成してください</p>
      </div>
      
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 text-sm">
            {error}
          </div>
        )}
        
        {successMessage && (
          <div className="bg-green-50 text-green-600 p-3 rounded-md mb-4 text-sm">
            {successMessage}
          </div>
        )}
        
        <div className="space-y-4">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
              氏名
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="山田 花子"
              disabled={isLoading || !!successMessage}
            />
          </div>
          
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
              disabled={isLoading || !!successMessage}
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
              placeholder="6文字以上"
              disabled={isLoading || !!successMessage}
            />
          </div>
          
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              パスワード（確認）
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isLoading || !!successMessage}
            />
          </div>
          
          <Button type="submit" className="w-full" disabled={isLoading || !!successMessage}>
            {isLoading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>登録中...</span>
              </div>
            ) : (
              'アカウント登録'
            )}
          </Button>
        </div>
      </form>
      
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          すでにアカウントをお持ちですか？{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="font-medium text-blue-600 hover:text-blue-500"
            disabled={isLoading}
          >
            ログイン
          </button>
        </p>
      </div>
    </Card>
  );
};

export default SignupForm; 