-- patientsテーブルにupdated_atカラムを追加
ALTER TABLE patients 
ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- created_atカラムが存在しない場合は追加
ALTER TABLE patients 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 自動的にupdated_atを更新するトリガーを作成
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 既存のトリガーを削除（存在する場合）
DROP TRIGGER IF EXISTS update_patients_updated_at ON patients;

-- 新しいトリガーを作成
CREATE TRIGGER update_patients_updated_at
BEFORE UPDATE ON patients
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column(); 