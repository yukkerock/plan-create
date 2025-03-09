import React, { useRef } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { FileText, Download, Printer, X } from 'lucide-react';
import { usePDF } from 'react-to-pdf';

interface PlanViewerProps {
  plan: {
    patient?: {
      name: string;
      age: number;
      gender: string;
      address: string;
      phone: string;
      care_level?: string;
      primary_doctor?: string;
    };
    visitType: string;
    healthStatus: string;
    adlMobility: string;
    adlEating: string;
    adlToilet: string;
    adlBathing: string;
    patientFamilyRequest: string;
    doctorInstructions: string;
    staffNotes: string;
    goals: string[];
    issues: string[];
    supports: string[];
    month: number;
    year: number;
    createdAt?: string;
  };
  onClose: () => void;
}

const PlanViewer: React.FC<PlanViewerProps> = ({ plan, onClose }) => {
  const { toPDF, targetRef } = usePDF({
    filename: `訪問看護計画書_${plan.patient?.name || '患者'}_${plan.year}年${plan.month}月.pdf`,
  });

  // ADLの表示テキストを取得する関数
  const getAdlText = (adlValue: string) => {
    switch (adlValue) {
      case 'independent':
        return '自立';
      case 'partial':
        return '一部介助';
      case 'dependent':
        return '全介助';
      default:
        return '不明';
    }
  };

  // 訪問種別の表示テキストを取得する関数
  const getVisitTypeText = (visitType: string) => {
    switch (visitType) {
      case 'nurse':
        return '看護師のみ';
      case 'rehab':
        return 'リハビリ職員のみ';
      case 'both':
        return '両方';
      default:
        return '不明';
    }
  };

  // 印刷用関数
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white z-10 no-print">
          <h2 className="text-xl font-bold flex items-center">
            <FileText className="mr-2" size={20} />
            訪問看護計画書
          </h2>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center space-x-1"
              onClick={handlePrint}
            >
              <Printer size={16} />
              <span>印刷</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center space-x-1"
              onClick={() => toPDF()}
            >
              <Download size={16} />
              <span>PDF保存</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
            >
              <X size={18} />
            </Button>
          </div>
        </div>
        
        <div className="p-6 print-content" ref={targetRef}>
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold mb-2">訪問看護計画書</h1>
            <p className="text-gray-600">{plan.year}年{plan.month}月分</p>
            {plan.createdAt && (
              <p className="text-sm text-gray-500 mt-1">作成日: {new Date(plan.createdAt).toLocaleDateString('ja-JP')}</p>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-3 border-b pb-2">基本情報</h3>
              {plan.patient ? (
                <div className="space-y-2">
                  <div className="flex">
                    <span className="font-medium w-24">氏名:</span>
                    <span>{plan.patient.name}</span>
                  </div>
                  <div className="flex">
                    <span className="font-medium w-24">年齢/性別:</span>
                    <span>{plan.patient.age}歳 / {plan.patient.gender}</span>
                  </div>
                  <div className="flex">
                    <span className="font-medium w-24">住所:</span>
                    <span>{plan.patient.address}</span>
                  </div>
                  <div className="flex">
                    <span className="font-medium w-24">電話番号:</span>
                    <span>{plan.patient.phone}</span>
                  </div>
                  {plan.patient.care_level && (
                    <div className="flex">
                      <span className="font-medium w-24">要介護度:</span>
                      <span>{plan.patient.care_level}</span>
                    </div>
                  )}
                  {plan.patient.primary_doctor && (
                    <div className="flex">
                      <span className="font-medium w-24">主治医:</span>
                      <span>{plan.patient.primary_doctor}</span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 italic">患者情報が利用できません</p>
              )}
            </Card>
            
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-3 border-b pb-2">サービス情報</h3>
              <div className="space-y-2">
                <div className="flex">
                  <span className="font-medium w-24">訪問種別:</span>
                  <span>{getVisitTypeText(plan.visitType)}</span>
                </div>
                <div className="flex">
                  <span className="font-medium w-24">健康状態:</span>
                  <span>{plan.healthStatus || '記録なし'}</span>
                </div>
                <div className="flex">
                  <span className="font-medium w-24">移動:</span>
                  <span>{getAdlText(plan.adlMobility)}</span>
                </div>
                <div className="flex">
                  <span className="font-medium w-24">食事:</span>
                  <span>{getAdlText(plan.adlEating)}</span>
                </div>
                <div className="flex">
                  <span className="font-medium w-24">トイレ:</span>
                  <span>{getAdlText(plan.adlToilet)}</span>
                </div>
                <div className="flex">
                  <span className="font-medium w-24">入浴:</span>
                  <span>{getAdlText(plan.adlBathing)}</span>
                </div>
              </div>
            </Card>
          </div>
          
          <div className="space-y-6 mb-8">
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-3 border-b pb-2">要望・指示</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-700 mb-1">患者・家族の要望</h4>
                  <p className="bg-gray-50 p-3 rounded">{plan.patientFamilyRequest || '記録なし'}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-1">医師の指示</h4>
                  <p className="bg-gray-50 p-3 rounded">{plan.doctorInstructions || '記録なし'}</p>
                </div>
                {plan.staffNotes && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-1">スタッフ補足情報</h4>
                    <p className="bg-gray-50 p-3 rounded">{plan.staffNotes}</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
          
          <div className="space-y-6">
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-3 border-b pb-2">看護・リハビリテーションの目標</h3>
              <ul className="list-decimal pl-5 space-y-2">
                {plan.goals.map((goal, index) => (
                  <li key={index} className="pl-1">{goal}</li>
                ))}
              </ul>
            </Card>
            
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-3 border-b pb-2">療養上の課題</h3>
              <ul className="list-decimal pl-5 space-y-2">
                {plan.issues.map((issue, index) => (
                  <li key={index} className="pl-1">{issue}</li>
                ))}
              </ul>
            </Card>
            
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-3 border-b pb-2">支援内容</h3>
              <ul className="list-decimal pl-5 space-y-2">
                {plan.supports.map((support, index) => (
                  <li key={index} className="pl-1">{support}</li>
                ))}
              </ul>
            </Card>
          </div>
          
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>この計画書は訪問看護サービス提供のために作成されたものです。</p>
            <p>© {new Date().getFullYear()} 訪問看護ステーション</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanViewer; 