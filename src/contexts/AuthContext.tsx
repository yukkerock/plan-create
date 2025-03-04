import React, { createContext, useContext, useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, DEMO_MODE } from '../lib/supabase';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: any | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // デモモードの場合は認証処理をスキップ
    if (DEMO_MODE) {
      setLoading(false);
      return;
    }

    // 現在のセッションを取得
    const getInitialSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setSession(data.session);
        setUser(data.session?.user ?? null);
        if (data.session?.user) {
          fetchProfile(data.session.user.id);
        }
      } catch (error) {
        console.error('セッション取得エラー:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // 認証状態の変更を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // ユーザープロファイルを取得
  const fetchProfile = async (userId: string) => {
    // デモモードの場合はダミーデータを返す
    if (DEMO_MODE) {
      setProfile({
        id: userId,
        full_name: '山田 花子',
        role: '看護師'
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('プロファイル取得エラー:', error);
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('プロファイル取得処理エラー:', error);
    }
  };

  // ログイン
  const signIn = async (email: string, password: string) => {
    try {
      // テスト用アカウントの場合、ダミーユーザーでログイン成功とする
      if (email === 'test@example.com' && password === 'password123') {
        // ダミーユーザーを設定
        const dummyUser = {
          id: '12345',
          email: 'test@example.com',
          user_metadata: {
            full_name: '山田 花子',
            role: '看護師'
          }
        };
        setUser(dummyUser as any);
        setProfile({
          id: '12345',
          full_name: '山田 花子',
          role: '看護師'
        });
        return { error: null };
      }
      
      // デモモード以外の場合はSupabaseの認証を使用
      if (!DEMO_MODE) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        return { error };
      }
      
      // デモモードでテスト用アカウント以外の場合はエラーを返す
      return { error: { message: '認証に失敗しました。テスト用アカウントを使用してください。' } };
    } catch (error) {
      console.error('ログイン処理エラー:', error);
      return { error };
    }
  };

  // ログアウト
  const signOut = async () => {
    try {
      if (!DEMO_MODE) {
        await supabase.auth.signOut();
      }
      setUser(null);
      setProfile(null);
      setSession(null);
    } catch (error) {
      console.error('ログアウト処理エラー:', error);
    }
  };

  const value = {
    session,
    user,
    profile,
    loading,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};