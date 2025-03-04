import React, { useState, useEffect } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { X, Edit, FileText, ArrowLeft } from 'lucide-react';
import { getPatientById } from '../services/patientService';
import { getCarePlansByPatient } from '../services/carePlanService';

interface PatientDetailProps {
  patientId: string;
  onClose: () => void;
  onEdit: (patientId: string) => void;
  onCreatePlan: (patientId: string) => void;
}

const PatientDetail: React.FC<PatientDetailProps> = ({ 
  patientId, 
  onClose, 
  onEdit,
  onCreatePlan
}) => {
  const [patient, setPatient] = useState<any>(null);
  const [carePlans, setCarePlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        setLoading(true);
        const patientData = await getPatientById(patientId);
        setPatient(patientData);
        
        const plansData = await getCarePlansByPatient(patientId);
        setCarePlans(plansData || []);
        
        setLoading(false);
      } catch (error) {
        console.error('患者データ取得エラー:', error);
        setLoading(false);
      }
    };
    
    fetchPatientData();
  }, [patientId]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6">
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">患者データを読み込み中...</p>
          </div>
        </Card>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">エラー</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X size={20} />
            </Button>
          </div>
          <p className="text-red-500">患者データが見つかりませんでした。</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={onClose} className="mr-2">
                <ArrowLeft size={20} />
              </Button>
              <h2 className="text-xl font-bold">{patient.name}さんの詳細情報</h2>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X size={20} />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <Card className="p-4 h-full">
                <h3 className="text-lg font-semibold mb-4 border-b pb-2">基本情報</h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-gray-500">氏名</span>
                    <span className="col-span-2 font-medium">{patient.name}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-gray-500">性別</span>
                    <span className="col-span-2">{patient.gender}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-gray-500">生年月日</span>
                    <span className="col-span-2">{patient.birthdate} ({patient.age}歳)</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-gray-500">住所</span>
                    <span className="col-span-2">{patient.address}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-gray-500">電話番号</span>
                    <span className="col-span-2">{patient.phone}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-gray-500">緊急連絡先</span>
                    <span className="col-span-2">{patient.emergency_contact}</span>
                  </div>
                </div>
              </Card>
            </div>
            
            <div>
              <Card className="p-4 h-full">
                <h3 className="text-lg font-semibold mb-4 border-b pb-2">医療・介護情報</h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-gray-500">主治医・医療機関</span>
                    <span className="col-span-2">{patient.primary_doctor}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-gray-500">既往歴</span>
                    <span className="col-span-2">{patient.medical_history}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-gray-500">保険種別</span>
                    <span className="col-span-2">{patient.insurance_type}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-gray-500">要介護度</span>
                    <span className="col-span-2">{patient.care_level}</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
          
          <div className="mb-6">
            <Card className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">計画書履歴</h3>
                <Button 
                  className="flex items-center gap-2"
                  onClick={() => onCreatePlan(patientId)}
                >
                  <FileText size={16} />
                  <span>新規計画書作成</span>
                </Button>
              </div>
              
              {carePlans.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          作成日
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          対象月
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          訪問タイプ
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ステータス
                        </th>
                        <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          操作
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {carePlans.map((plan) => (
                        <tr key={plan.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {new Date(plan.created_at).toLocaleDateString('ja-JP')}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {plan.year}年{plan.month}月
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {plan.visit_type === 'nurse' ? '看護師' : 
                             plan.visit_type === 'care' ? '介護士' : '両方'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              plan.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {plan.status === 'completed' ? '完了' : '下書き'}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                            <Button variant="ghost" size="sm" className="text-blue-600">
                              <FileText size={16} />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center py-4 text-gray-500">計画書の履歴がありません</p>
              )}
            </Card>
          </div>
          
          <div className="flex justify-between">
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => onEdit(patientId)}
            >
              <Edit size={16} />
              <span>患者情報を編集</span>
            </Button>
            
            <Button 
              variant="default" 
              className="flex items-center gap-2"
              onClick={() => onCreatePlan(patientId)}
            >
              <FileText size={16} />
              <span>新規計画書作成</span>
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PatientDetail; 