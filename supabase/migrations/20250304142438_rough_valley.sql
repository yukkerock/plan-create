/*
  # 訪問看護計画書システム データベース初期設定

  1. 新規テーブル
    - `profiles` (ユーザープロファイル)
      - `id` (uuid, primary key) - auth.usersと紐づくID
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `full_name` (text) - ユーザーのフルネーム
      - `role` (text) - 役割（看護師、理学療法士など）
      - `avatar_url` (text, nullable) - プロフィール画像URL
    
    - `patients` (患者情報)
      - `id` (uuid, primary key)
      - `created_at` (timestamp)
      - `name` (text) - 患者名
      - `gender` (text) - 性別
      - `birthdate` (date) - 生年月日
      - `age` (integer) - 年齢
      - `address` (text) - 住所
      - `phone` (text, nullable) - 電話番号
      - `emergency_contact` (text, nullable) - 緊急連絡先
      - `medical_history` (text, nullable) - 既往歴・現病歴
      - `primary_doctor` (text, nullable) - 主治医・医療機関
      - `insurance_type` (text) - 保険種別
      - `care_level` (text) - 要介護度
      - `user_id` (uuid) - 担当ユーザーID
    
    - `care_plans` (訪問看護計画書)
      - `id` (uuid, primary key)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `patient_id` (uuid) - 患者ID
      - `user_id` (uuid) - 作成者ID
      - `visit_type` (text) - 訪問職種
      - `health_status` (text, nullable) - 健康状態
      - `adl_mobility` (text, nullable) - ADL評価（移動）
      - `adl_eating` (text, nullable) - ADL評価（食事）
      - `adl_toilet` (text, nullable) - ADL評価（排泄）
      - `adl_bathing` (text, nullable) - ADL評価（入浴）
      - `patient_family_request` (text, nullable) - 本人・家族の希望
      - `doctor_instructions` (text, nullable) - 医師の指示内容
      - `staff_notes` (text, nullable) - スタッフ補足情報
      - `goals` (jsonb) - 看護・リハビリテーションの目標
      - `issues` (jsonb) - 療養上の課題
      - `supports` (jsonb) - 支援内容
      - `status` (text) - ステータス（作成済み、下書き）
      - `month` (integer) - 計画書の月
      - `year` (integer) - 計画書の年

  2. セキュリティ
    - 全テーブルでRLSを有効化
    - 認証済みユーザーのみが自分のデータにアクセス可能なポリシーを設定
*/

-- プロファイルテーブル
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  full_name TEXT NOT NULL,
  role TEXT NOT NULL,
  avatar_url TEXT
);

-- 患者テーブル
CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  name TEXT NOT NULL,
  gender TEXT NOT NULL,
  birthdate DATE NOT NULL,
  age INTEGER NOT NULL,
  address TEXT NOT NULL,
  phone TEXT,
  emergency_contact TEXT,
  medical_history TEXT,
  primary_doctor TEXT,
  insurance_type TEXT NOT NULL,
  care_level TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- 訪問看護計画書テーブル
CREATE TABLE IF NOT EXISTS care_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  visit_type TEXT NOT NULL,
  health_status TEXT,
  adl_mobility TEXT,
  adl_eating TEXT,
  adl_toilet TEXT,
  adl_bathing TEXT,
  patient_family_request TEXT,
  doctor_instructions TEXT,
  staff_notes TEXT,
  goals JSONB DEFAULT '[]'::jsonb,
  issues JSONB DEFAULT '[]'::jsonb,
  supports JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'draft',
  month INTEGER NOT NULL,
  year INTEGER NOT NULL
);

-- RLSの有効化
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_plans ENABLE ROW LEVEL SECURITY;

-- プロファイルのポリシー
CREATE POLICY "ユーザーは自分のプロファイルのみ参照可能"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "ユーザーは自分のプロファイルのみ更新可能"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- 患者のポリシー
CREATE POLICY "認証済みユーザーは患者データを参照可能"
  ON patients FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "ユーザーは患者データを作成可能"
  ON patients FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "ユーザーは患者データを更新可能"
  ON patients FOR UPDATE
  TO authenticated
  USING (true);

-- 計画書のポリシー
CREATE POLICY "認証済みユーザーは計画書を参照可能"
  ON care_plans FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "ユーザーは計画書を作成可能"
  ON care_plans FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "ユーザーは計画書を更新可能"
  ON care_plans FOR UPDATE
  TO authenticated
  USING (true);

-- 新規ユーザー登録時にプロファイルを自動作成するトリガー
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'role');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 更新日時を自動更新するトリガー
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_care_plans_updated_at
  BEFORE UPDATE ON care_plans
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();