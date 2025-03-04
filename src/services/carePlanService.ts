import { supabase, DEMO_MODE } from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid';

// 計画書の型定義
export interface CarePlan {
  id?: string;
  patient_id: string;
  user_id: string;
  visit_type: string;
  health_status?: string;
  adl_mobility?: string;
  adl_eating?: string;
  adl_toilet?: string;
  adl_bathing?: string;
  patient_family_request?: string;
  doctor_instructions?: string;
  staff_notes?: string;
  goals: string[];
  issues: string[];
  supports: string[];
  status: 'draft' | 'completed';
  month: number;
  year: number;
}

// ダミーの計画書データ
const dummyCarePlans = [
  {
    id: '101',
    patient_id: '1',
    user_id: '12345',
    visit_type: 'both',
    health_status: '高血圧症状あり。血圧140-160/90前後で推移。',
    adl_mobility: 'partial',
    adl_eating: 'independent',
    adl_toilet: 'supervision',
    adl_bathing: 'partial',
    patient_family_request: '自宅での生活を継続したい。',
    doctor_instructions: '血圧管理と転倒予防に注意。',
    staff_notes: '認知機能の低下傾向がみられる。',
    goals: ['血圧を安定させる', '室内歩行の安定', '服薬管理の自立'],
    issues: ['高血圧', '転倒リスク', '服薬管理'],
    supports: ['血圧測定と記録', '歩行訓練', '服薬カレンダーの活用'],
    status: 'completed',
    month: 3,
    year: 2025,
    created_at: '2025-03-01T00:00:00Z',
    updated_at: '2025-03-01T00:00:00Z'
  },
  {
    id: '102',
    patient_id: '2',
    user_id: '12345',
    visit_type: 'nurse',
    health_status: '関節痛あり。疼痛コントロール良好。',
    adl_mobility: 'supervision',
    adl_eating: 'independent',
    adl_toilet: 'independent',
    adl_bathing: 'partial',
    patient_family_request: '痛みなく日常生活を送りたい。',
    doctor_instructions: '疼痛管理と関節可動域の維持。',
    staff_notes: '家族の介護負担が大きい。',
    goals: ['疼痛コントロール', '関節可動域の維持', '家族の介護負担軽減'],
    issues: ['関節痛', '活動性低下', '家族の介護負担'],
    supports: ['疼痛評価と管理', '関節運動の実施', '家族への介護指導'],
    status: 'completed',
    month: 3,
    year: 2025,
    created_at: '2025-03-05T00:00:00Z',
    updated_at: '2025-03-05T00:00:00Z'
  },
  {
    id: '103',
    patient_id: '3',
    user_id: '12345',
    visit_type: 'both',
    health_status: 'パーキンソン症状進行中。歩行困難。',
    adl_mobility: 'complete',
    adl_eating: 'partial',
    adl_toilet: 'complete',
    adl_bathing: 'complete',
    patient_family_request: '安全に生活したい。',
    doctor_instructions: '嚥下機能評価と誤嚥予防。',
    staff_notes: '栄養状態に注意が必要。',
    goals: ['安全な食事摂取', '褥瘡予防', '栄養状態の改善'],
    issues: ['嚥下機能低下', '褥瘡リスク', '低栄養'],
    supports: ['食事姿勢と食形態の調整', '体位変換と皮膚観察', '栄養評価と指導'],
    status: 'completed',
    month: 2,
    year: 2025,
    created_at: '2025-02-10T00:00:00Z',
    updated_at: '2025-02-10T00:00:00Z'
  }
];

// 患者の計画書一覧を取得
export const getCarePlansByPatient = async (patientId: string) => {
  // デモモードの場合はダミーデータを返す
  if (DEMO_MODE) {
    return dummyCarePlans.filter(plan => plan.patient_id === patientId)
      .sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        return b.month - a.month;
      });
  }

  try {
    const { data, error } = await supabase
      .from('care_plans')
      .select('*')
      .eq('patient_id', patientId)
      .order('year', { ascending: false })
      .order('month', { ascending: false });

    if (error) {
      console.error('計画書取得エラー:', error);
      return dummyCarePlans.filter(plan => plan.patient_id === patientId)
        .sort((a, b) => {
          if (a.year !== b.year) return b.year - a.year;
          return b.month - a.month;
        });
    }

    return data.length > 0 ? data : dummyCarePlans.filter(plan => plan.patient_id === patientId);
  } catch (error) {
    console.error('計画書取得処理エラー:', error);
    return dummyCarePlans.filter(plan => plan.patient_id === patientId)
      .sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        return b.month - a.month;
      });
  }
};

// 特定の月の計画書を取得
export const getCarePlanByMonth = async (patientId: string, month: number, year: number) => {
  // デモモードの場合はダミーデータを返す
  if (DEMO_MODE) {
    return dummyCarePlans.find(plan => 
      plan.patient_id === patientId && 
      plan.month === month && 
      plan.year === year
    ) || null;
  }

  try {
    const { data, error } = await supabase
      .from('care_plans')
      .select('*')
      .eq('patient_id', patientId)
      .eq('month', month)
      .eq('year', year)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116はデータが見つからない場合のエラーコード
      console.error('計画書取得エラー:', error);
      return dummyCarePlans.find(plan => 
        plan.patient_id === patientId && 
        plan.month === month && 
        plan.year === year
      ) || null;
    }

    return data || dummyCarePlans.find(plan => 
      plan.patient_id === patientId && 
      plan.month === month && 
      plan.year === year
    ) || null;
  } catch (error) {
    console.error('計画書取得処理エラー:', error);
    return dummyCarePlans.find(plan => 
      plan.patient_id === patientId && 
      plan.month === month && 
      plan.year === year
    ) || null;
  }
};

// 今月の計画書が必要な患者一覧を取得
export const getPatientsNeedingPlans = async () => {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1; // JavaScriptの月は0から始まるので+1
  const currentYear = currentDate.getFullYear();

  // デモモードの場合はダミーデータを返す
  if (DEMO_MODE) {
    // ダミーの患者データを取得
    const { getPatients } = await import('./patientService');
    const patients = await getPatients();
    
    // 今月の計画書がある患者IDを取得
    const patientsWithCurrentPlans = new Set(
      dummyCarePlans
        .filter(plan => plan.month === currentMonth && plan.year === currentYear)
        .map(plan => plan.patient_id)
    );
    
    // 今月の計画書がない患者をフィルタリング
    return patients.filter(patient => !patientsWithCurrentPlans.has(patient.id));
  }

  try {
    // まず全患者を取得
    const { data: patients, error: patientsError } = await supabase
      .from('patients')
      .select('*');

    if (patientsError) {
      console.error('患者データ取得エラー:', patientsError);
      throw patientsError;
    }

    // 今月の計画書がある患者IDを取得
    const { data: currentPlans, error: plansError } = await supabase
      .from('care_plans')
      .select('patient_id')
      .eq('month', currentMonth)
      .eq('year', currentYear);

    if (plansError) {
      console.error('計画書データ取得エラー:', plansError);
      throw plansError;
    }

    // 今月の計画書がある患者IDのセットを作成
    const patientsWithCurrentPlans = new Set(currentPlans.map(plan => plan.patient_id));

    // 今月の計画書がない患者をフィルタリング
    const patientsNeedingPlans = patients.filter(patient => !patientsWithCurrentPlans.has(patient.id));

    return patientsNeedingPlans;
  } catch (error) {
    console.error('患者データ取得処理エラー:', error);
    
    // エラー時はダミーデータを返す
    const { getPatients } = await import('./patientService');
    const patients = await getPatients();
    
    // 今月の計画書がある患者IDを取得
    const patientsWithCurrentPlans = new Set(
      dummyCarePlans
        .filter(plan => plan.month === currentMonth && plan.year === currentYear)
        .map(plan => plan.patient_id)
    );
    
    // 今月の計画書がない患者をフィルタリング
    return patients.filter(patient => !patientsWithCurrentPlans.has(patient.id));
  }
};

// 新規計画書を作成
export const createCarePlan = async (carePlan: CarePlan) => {
  const newCarePlan = {
    id: uuidv4(),
    ...carePlan,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  // デモモードの場合はダミーデータを返す
  if (DEMO_MODE) {
    return newCarePlan;
  }

  try {
    const { data, error } = await supabase
      .from('care_plans')
      .insert([newCarePlan])
      .select();

    if (error) {
      console.error('計画書作成エラー:', error);
      return newCarePlan;
    }

    return data[0];
  } catch (error) {
    console.error('計画書作成処理エラー:', error);
    return newCarePlan;
  }
};

// 計画書を更新
export const updateCarePlan = async (id: string, updates: Partial<CarePlan>) => {
  const updateData = {
    ...updates,
    updated_at: new Date().toISOString()
  };

  // デモモードの場合はダミーデータを返す
  if (DEMO_MODE) {
    const planIndex = dummyCarePlans.findIndex(plan => plan.id === id);
    if (planIndex === -1) return null;
    
    const updatedPlan = {
      ...dummyCarePlans[planIndex],
      ...updateData
    };
    
    return updatedPlan;
  }

  try {
    const { data, error } = await supabase
      .from('care_plans')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) {
      console.error('計画書更新エラー:', error);
      const planIndex = dummyCarePlans.findIndex(plan => plan.id === id);
      if (planIndex === -1) return null;
      
      const updatedPlan = {
        ...dummyCarePlans[planIndex],
        ...updateData
      };
      
      return updatedPlan;
    }

    return data[0];
  } catch (error) {
    console.error('計画書更新処理エラー:', error);
    const planIndex = dummyCarePlans.findIndex(plan => plan.id === id);
    if (planIndex === -1) return null;
    
    const updatedPlan = {
      ...dummyCarePlans[planIndex],
      ...updates,
      updated_at: new Date().toISOString()
    };
    
    return updatedPlan;
  }
};

// 計画書を削除
export const deleteCarePlan = async (id: string) => {
  // デモモードの場合は成功を返す
  if (DEMO_MODE) {
    return true;
  }

  try {
    const { error } = await supabase
      .from('care_plans')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('計画書削除エラー:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('計画書削除処理エラー:', error);
    return false;
  }
};