import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// 環境変数
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
export const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true' || !supabaseUrl || !supabaseAnonKey;
export const PARTIAL_DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'partial';

// デモモードの場合は警告を表示
if (DEMO_MODE) {
  console.info('デモモードで動作しています。Supabase接続は無効化されています。');
} else if (PARTIAL_DEMO_MODE) {
  console.info('部分的デモモードで動作しています。認証は実際のSupabaseを使用し、データはデモデータを使用します。');
}

// Supabaseクライアントの作成
// デモモードの場合はダミーのURLとキーを使用
export const supabase = createClient<Database>(
  supabaseUrl || 'https://example.supabase.co',
  supabaseAnonKey || 'dummy-key'
);

// モックSupabaseクライアント - デモモード用
class MockSupabaseClient {
  // このクラスはSupabaseクライアントのメソッドをモックするためのもの
  // 実際のAPIコールは行わず、常にダミーデータを返す
  
  // このメソッドは何も行わず、このクラス自身を返す
  // これにより、メソッドチェーンが可能になる
  from() {
    return this;
  }
  
  select() {
    return this;
  }
  
  eq() {
    return this;
  }
  
  order() {
    return this;
  }
  
  limit() {
    return this;
  }
  
  single() {
    return this;
  }
  
  insert() {
    return this;
  }
  
  update() {
    return this;
  }
  
  delete() {
    return this;
  }
  
  // 他のSupabaseメソッドも必要に応じて追加
}

// デモモード用のモックSupabaseクライアント
export const mockSupabase = new MockSupabaseClient();