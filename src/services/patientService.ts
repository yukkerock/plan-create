import { supabase, DEMO_MODE } from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import { PatientData } from '../components/NewPatientForm';

// ダミーの患者データ
const dummyPatients = [
  {
    id: '1',
    name: '鈴木 一郎',
    gender: '男性',
    birthdate: '1945-05-15',
    age: 80,
    address: '東京都新宿区西新宿1-1-1',
    phone: '03-1234-5678',
    emergency_contact: '鈴木花子（娘）090-1234-5678',
    medical_history: '高血圧、糖尿病、脳梗塞後遺症',
    primary_doctor: '佐藤医師・東京中央病院',
    insurance_type: '介護保険',
    care_level: '要介護2',
    user_id: '12345',
    created_at: '2025-01-15T00:00:00Z'
  },
  {
    id: '2',
    name: '田中 花子',
    gender: '女性',
    birthdate: '1950-10-20',
    age: 75,
    address: '東京都渋谷区渋谷2-2-2',
    phone: '03-2345-6789',
    emergency_contact: '田中太郎（息子）090-2345-6789',
    medical_history: '関節リウマチ、骨粗鬆症',
    primary_doctor: '高橋医師・渋谷総合病院',
    insurance_type: '介護保険',
    care_level: '要介護1',
    user_id: '12345',
    created_at: '2025-02-01T00:00:00Z'
  },
  {
    id: '3',
    name: '佐藤 健太',
    gender: '男性',
    birthdate: '1940-03-10',
    age: 85,
    address: '東京都品川区大崎3-3-3',
    phone: '03-3456-7890',
    emergency_contact: '佐藤美香（妻）03-3456-7890',
    medical_history: 'パーキンソン病、心不全',
    primary_doctor: '伊藤医師・品川医療センター',
    insurance_type: '介護保険',
    care_level: '要介護3',
    user_id: '12345',
    created_at: '2025-02-15T00:00:00Z'
  }
];

// 患者一覧を取得
export const getPatients = async () => {
  // デモモードの場合はダミーデータを返す
  if (DEMO_MODE) {
    return dummyPatients;
  }

  try {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('患者データ取得エラー:', error);
      return dummyPatients;
    }

    return data.length > 0 ? data : dummyPatients;
  } catch (error) {
    console.error('患者データ取得処理エラー:', error);
    return dummyPatients;
  }
};

// 患者詳細を取得
export const getPatientById = async (id: string) => {
  // デモモードの場合はダミーデータを返す
  if (DEMO_MODE) {
    return dummyPatients.find(patient => patient.id === id) || null;
  }

  try {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('患者詳細取得エラー:', error);
      return dummyPatients.find(patient => patient.id === id) || null;
    }

    return data;
  } catch (error) {
    console.error('患者詳細取得処理エラー:', error);
    return dummyPatients.find(patient => patient.id === id) || null;
  }
};

// 新規患者を登録
export const createPatient = async (patientData: PatientData, userId: string) => {
  const newPatient = {
    id: uuidv4(),
    name: patientData.name,
    gender: patientData.gender,
    birthdate: patientData.birthdate,
    age: patientData.age,
    address: patientData.address,
    phone: patientData.phone || null,
    emergency_contact: patientData.emergencyContact || null,
    medical_history: patientData.medicalHistory || null,
    primary_doctor: patientData.primaryDoctor || null,
    insurance_type: patientData.insuranceType,
    care_level: patientData.careLevel,
    user_id: userId,
    created_at: new Date().toISOString()
  };

  // デモモードの場合はダミーデータを返す
  if (DEMO_MODE) {
    return newPatient;
  }

  try {
    const { data, error } = await supabase
      .from('patients')
      .insert([newPatient])
      .select();

    if (error) {
      console.error('患者登録エラー:', error);
      return newPatient;
    }

    return data[0];
  } catch (error) {
    console.error('患者登録処理エラー:', error);
    return newPatient;
  }
};

// 患者情報を更新
export const updatePatient = async (id: string, patientData: Partial<PatientData>) => {
  const updates = {
    name: patientData.name,
    gender: patientData.gender,
    birthdate: patientData.birthdate,
    age: patientData.age,
    address: patientData.address,
    phone: patientData.phone || null,
    emergency_contact: patientData.emergencyContact || null,
    medical_history: patientData.medicalHistory || null,
    primary_doctor: patientData.primaryDoctor || null,
    insurance_type: patientData.insuranceType,
    care_level: patientData.careLevel
  };

  // デモモードの場合はダミーデータを返す
  if (DEMO_MODE) {
    const patient = dummyPatients.find(p => p.id === id);
    if (!patient) return null;
    return { ...patient, ...updates };
  }

  try {
    const { data, error } = await supabase
      .from('patients')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) {
      console.error('患者情報更新エラー:', error);
      const patient = dummyPatients.find(p => p.id === id);
      if (!patient) return null;
      return { ...patient, ...updates };
    }

    return data[0];
  } catch (error) {
    console.error('患者情報更新処理エラー:', error);
    const patient = dummyPatients.find(p => p.id === id);
    if (!patient) return null;
    return { ...patient, ...updates };
  }
};

// 患者を削除
export const deletePatient = async (id: string) => {
  // デモモードの場合は成功を返す
  if (DEMO_MODE) {
    return true;
  }

  try {
    const { error } = await supabase
      .from('patients')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('患者削除エラー:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('患者削除処理エラー:', error);
    return false;
  }
};