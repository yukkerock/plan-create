import React, { createContext, useContext, useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, DEMO_MODE, PARTIAL_DEMO_MODE } from '../lib/supabase';

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
    // 完全なデモモードの場合は認証処理をスキップ
    if (DEMO_MODE && !PARTIAL_DEMO_MODE) {
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
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      // 部分的デモモードでも実際のプロフィールデータを取得
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('プロフィール取得エラー:', error);
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error('プロフィール取得処理エラー:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // 完全なデモモードの場合はダミーの認証を返す
      if (DEMO_MODE && !PARTIAL_DEMO_MODE) {
        // デモモードではダミーのユーザー情報を設定
        const dummyUser = {
          id: '12345',
          email: email,
          user_metadata: {
            full_name: 'デモユーザー'
          }
        };
        setUser(dummyUser as any);
        setProfile({
          id: '12345',
          full_name: 'デモユーザー',
          role: 'user'
        });
        return { error: null };
      }

      // 実際の認証処理
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      return { error };
    } catch (error) {
      console.error('ログインエラー:', error);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      // 完全なデモモードの場合は単にステートをクリア
      if (DEMO_MODE && !PARTIAL_DEMO_MODE) {
        setUser(null);
        setProfile(null);
        setSession(null);
        return;
      }

      // 実際のログアウト処理
      await supabase.auth.signOut();
    } catch (error) {
      console.error('ログアウトエラー:', error);
    }
  };

  const value = {
    session,
    user,
    profile,
    loading,
    signIn,
    signOut
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