import React, { useState, useEffect } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { X } from 'lucide-react';
import { getPatientById } from '../services/patientService';

interface NewPatientFormProps {
  patientId?: string;
  onClose: () => void;
  onSave: (patientData: PatientData) => void;
}

export interface PatientData {
  name: string;
  age: number;
  gender: string;
  birthdate: string; // UIでの表示・入力用に残す
  address: string;
  phone: string;
  emergencyContact: string;
  medicalHistory: string;
  primaryDoctor: string;
  insuranceType: string;
  careLevel: string;
}

const NewPatientForm: React.FC<NewPatientFormProps> = ({ patientId, onClose, onSave }) => {
  const [formData, setFormData] = useState<PatientData>({
    name: '',
    age: 0,
    gender: '',
    birthdate: '',
    address: '',
    phone: '',
    emergencyContact: '',
    medicalHistory: '',
    primaryDoctor: '',
    insuranceType: '介護保険',
    careLevel: '要介護1',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const isEditMode = !!patientId;

  useEffect(() => {
    // 編集モードの場合、患者データを取得
    if (patientId) {
      const fetchPatientData = async () => {
        setLoading(true);
        try {
          const patientData = await getPatientById(patientId);
          if (patientData) {
            setFormData({
              name: patientData.name,
              age: patientData.age,
              gender: patientData.gender,
              birthdate: patientData.birthdate,
              address: patientData.address,
              phone: patientData.phone,
              emergencyContact: patientData.emergency_contact,
              medicalHistory: patientData.medical_history,
              primaryDoctor: patientData.primary_doctor,
              insuranceType: patientData.insurance_type,
              careLevel: patientData.care_level,
            });
          }
        } catch (error) {
          console.error('患者データ取得エラー:', error);
        } finally {
          setLoading(false);
        }
      };
      
      fetchPatientData();
    }
  }, [patientId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // エラーをクリア
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const calculateAge = (birthdate: string): number => {
    if (!birthdate) return 0;
    
    const today = new Date();
    const birthDate = new Date(birthdate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const handleBirthdateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const birthdate = e.target.value;
    const age = calculateAge(birthdate);
    
    setFormData(prev => ({
      ...prev,
      birthdate,
      age
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = '患者名を入力してください';
    }
    
    if (!formData.birthdate) {
      newErrors.birthdate = '生年月日を入力してください';
    }
    
    if (!formData.gender) {
      newErrors.gender = '性別を選択してください';
    }
    
    if (!formData.address.trim()) {
      newErrors.address = '住所を入力してください';
    }
    
    // 電話番号が入力されている場合のみ形式をチェック
    if (formData.phone.trim() && !/^\d{2,4}-?\d{2,4}-?\d{3,4}$/.test(formData.phone.trim())) {
      newErrors.phone = '正しい電話番号の形式で入力してください';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // birthdateはフォームでは使用するが、データベースには保存しない
    // 年齢計算などの処理はフロントエンドで行う
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">{isEditMode ? '患者情報の編集' : '新規患者登録'}</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X size={20} />
            </Button>
          </div>
          
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">患者データを読み込み中...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 基本情報セクション */}
                <div className="md:col-span-2">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">基本情報</h3>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                          患者名 <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className={`w-full px-3 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                          placeholder="例: 山田 太郎"
                        />
                        {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                      </div>
                      
                      <div>
                        <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                          性別 <span className="text-red-500">*</span>
                        </label>
                        <select
                          id="gender"
                          name="gender"
                          value={formData.gender}
                          onChange={handleChange}
                          className={`w-full px-3 py-2 border ${errors.gender ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                        >
                          <option value="">選択してください</option>
                          <option value="男性">男性</option>
                          <option value="女性">女性</option>
                          <option value="その他">その他</option>
                        </select>
                        {errors.gender && <p className="mt-1 text-sm text-red-500">{errors.gender}</p>}
                      </div>
                      
                      <div>
                        <label htmlFor="birthdate" className="block text-sm font-medium text-gray-700 mb-1">
                          生年月日 <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          id="birthdate"
                          name="birthdate"
                          value={formData.birthdate}
                          onChange={handleBirthdateChange}
                          className={`w-full px-3 py-2 border ${errors.birthdate ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                        />
                        {errors.birthdate && <p className="mt-1 text-sm text-red-500">{errors.birthdate}</p>}
                      </div>
                      
                      <div>
                        <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
                          年齢
                        </label>
                        <input
                          type="number"
                          id="age"
                          name="age"
                          value={formData.age}
                          readOnly
                          className="w-full px-3 py-2 border border-gray-300 bg-gray-100 rounded-md focus:outline-none"
                        />
                        <p className="mt-1 text-xs text-gray-500">生年月日から自動計算されます</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* 連絡先情報セクション */}
                <div className="md:col-span-2">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">連絡先情報</h3>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                          住所 <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="address"
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          className={`w-full px-3 py-2 border ${errors.address ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                          placeholder="例: 東京都新宿区西新宿1-1-1"
                        />
                        {errors.address && <p className="mt-1 text-sm text-red-500">{errors.address}</p>}
                      </div>
                      
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                          電話番号
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className={`w-full px-3 py-2 border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                          placeholder="例: 03-1234-5678"
                        />
                        {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
                      </div>
                      
                      <div>
                        <label htmlFor="emergencyContact" className="block text-sm font-medium text-gray-700 mb-1">
                          緊急連絡先
                        </label>
                        <input
                          type="text"
                          id="emergencyContact"
                          name="emergencyContact"
                          value={formData.emergencyContact}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="例: 山田花子（娘）090-1234-5678"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* 医療情報セクション */}
                <div className="md:col-span-2">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">医療・介護情報</h3>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="primaryDoctor" className="block text-sm font-medium text-gray-700 mb-1">
                          主治医・医療機関
                        </label>
                        <input
                          type="text"
                          id="primaryDoctor"
                          name="primaryDoctor"
                          value={formData.primaryDoctor}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="例: 鈴木医師・東京中央病院"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="insuranceType" className="block text-sm font-medium text-gray-700 mb-1">
                          保険種別
                        </label>
                        <select
                          id="insuranceType"
                          name="insuranceType"
                          value={formData.insuranceType}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="介護保険">介護保険</option>
                          <option value="医療保険">医療保険</option>
                          <option value="自費">自費</option>
                          <option value="その他">その他</option>
                        </select>
                      </div>
                      
                      <div>
                        <label htmlFor="careLevel" className="block text-sm font-medium text-gray-700 mb-1">
                          要介護度
                        </label>
                        <select
                          id="careLevel"
                          name="careLevel"
                          value={formData.careLevel}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="自立">自立</option>
                          <option value="要支援1">要支援1</option>
                          <option value="要支援2">要支援2</option>
                          <option value="要介護1">要介護1</option>
                          <option value="要介護2">要介護2</option>
                          <option value="要介護3">要介護3</option>
                          <option value="要介護4">要介護4</option>
                          <option value="要介護5">要介護5</option>
                          <option value="未申請">未申請</option>
                        </select>
                      </div>
                      
                      <div className="md:col-span-2">
                        <label htmlFor="medicalHistory" className="block text-sm font-medium text-gray-700 mb-1">
                          既往歴・現病歴
                        </label>
                        <textarea
                          id="medicalHistory"
                          name="medicalHistory"
                          value={formData.medicalHistory}
                          onChange={handleChange}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="例: 高血圧、糖尿病、脳梗塞後遺症など"
                        ></textarea>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 flex justify-end space-x-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onClose}
                >
                  キャンセル
                </Button>
                <Button 
                  type="submit"
                >
                  登録する
                </Button>
              </div>
            </form>
          )}
        </div>
      </Card>
    </div>
  );
};

export default NewPatientForm;