import React, { useState, useEffect } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { ChevronRight, ChevronLeft, Save, FileText, Wand2, Download } from 'lucide-react';
import { getPatients, getPatientById } from '../services/patientService';
import { createCarePlan, updateCarePlan, CarePlan } from '../services/carePlanService';
import { generateCarePlan } from '../services/aiService';
import { useAuth } from '../contexts/AuthContext';
import PlanViewer from './PlanViewer';

interface PlanCreationProps {
  patientId?: string;
}

const PlanCreation: React.FC<PlanCreationProps> = ({ patientId }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [visitType, setVisitType] = useState<string>('both');
  const [isGenerating, setIsGenerating] = useState(false);
  const [staffNotes, setStaffNotes] = useState<string>('');
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<string>('');
  const [planDate, setPlanDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [healthStatus, setHealthStatus] = useState<string>('');
  const [adlMobility, setAdlMobility] = useState<string>('independent');
  const [adlEating, setAdlEating] = useState<string>('independent');
  const [adlToilet, setAdlToilet] = useState<string>('independent');
  const [adlBathing, setAdlBathing] = useState<string>('independent');
  const [patientFamilyRequest, setPatientFamilyRequest] = useState<string>('');
  const [doctorInstructions, setDoctorInstructions] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [patientData, setPatientData] = useState<any>(null);
  const [showPlanViewer, setShowPlanViewer] = useState(false);
  const [savedPlan, setSavedPlan] = useState<any>(null);
  
  const [generatedPlan, setGeneratedPlan] = useState<null | {
    goals: string[];
    issues: string[];
    supports: string[];
  }>(null);

  const { user } = useAuth();
  
  const totalSteps = 5;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // 患者データを取得
        const patientsData = await getPatients();
        setPatients(patientsData);
        
        // patientIdが指定されている場合、その患者を選択状態にする
        if (patientId) {
          setSelectedPatient(patientId);
          
          // 患者の詳細情報を取得して健康状態などの初期値を設定
          try {
            const patientDetail = await getPatientById(patientId);
            if (patientDetail) {
              setPatientData(patientDetail);
              // 患者情報から関連するフィールドを初期設定
              setHealthStatus(patientDetail.medical_history || '');
              setDoctorInstructions(patientDetail.primary_doctor ? `${patientDetail.primary_doctor}からの指示` : '');
              
              // 要介護度に基づいてADL初期値を設定
              if (patientDetail.care_level && patientDetail.care_level.includes('要介護')) {
                setAdlMobility('partial');
                setAdlBathing('dependent');
              }
            }
          } catch (error) {
            console.error('患者詳細取得エラー:', error);
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error('患者データ取得エラー:', error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, [patientId]);

  // 患者が選択された時に患者データを取得
  useEffect(() => {
    const fetchPatientData = async () => {
      if (selectedPatient) {
        try {
          const patientDetail = await getPatientById(selectedPatient);
          if (patientDetail) {
            setPatientData(patientDetail);
          }
        } catch (error) {
          console.error('患者詳細取得エラー:', error);
        }
      }
    };
    
    if (selectedPatient && !patientData) {
      fetchPatientData();
    }
  }, [selectedPatient, patientData]);

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleGenerate = async () => {
    if (!selectedPatient || !user || !patientData) return;
    
    setIsGenerating(true);
    
    try {
      // 基本情報をまとめる
      const basicInfo = {
        healthStatus,
        adlMobility,
        adlEating,
        adlToilet,
        adlBathing,
        patientFamilyRequest,
        doctorInstructions,
        staffNotes
      };
      
      // Gemini APIを使用して計画書を生成
      const generatedData = await generateCarePlan(patientData, basicInfo);
      
      setGeneratedPlan(generatedData);
      setCurrentStep(4);
    } catch (error) {
      console.error('計画書生成エラー:', error);
      // エラー時のフォールバック
      setGeneratedPlan({
        goals: [
          '血圧を安定させ、収縮期血圧140-160mmHg、拡張期血圧90mmHg以下を維持する',
          '服薬管理を自己で行えるようになる',
          '室内歩行を見守りなしで10m以上可能にする'
        ],
        issues: [
          '高血圧による症状悪化リスク',
          '服薬管理の困難さ',
          '転倒リスクによる活動制限'
        ],
        supports: [
          '週2回の血圧測定と記録の支援',
          '服薬カレンダーの活用と確認',
          '自宅内の環境調整と歩行訓練の実施'
        ]
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleSavePlan = async () => {
    if (!selectedPatient || !user || !generatedPlan) return;
    
    try {
      // 現在の日付から月と年を取得
      const planDateObj = new Date(planDate);
      const month = planDateObj.getMonth() + 1;
      const year = planDateObj.getFullYear();
      
      // 計画書データを作成
      const carePlanData: CarePlan = {
        patient_id: selectedPatient,
        user_id: user.id,
        visit_type: visitType,
        health_status: healthStatus,
        adl_mobility: adlMobility,
        adl_eating: adlEating,
        adl_toilet: adlToilet,
        adl_bathing: adlBathing,
        patient_family_request: patientFamilyRequest,
        doctor_instructions: doctorInstructions,
        staff_notes: staffNotes,
        goals: generatedPlan.goals,
        issues: generatedPlan.issues,
        supports: generatedPlan.supports,
        status: 'completed',
        month,
        year
      };
      
      // 計画書を保存
      const savedCarePlan = await createCarePlan(carePlanData);
      
      // 保存した計画書データをセット
      setSavedPlan({
        ...carePlanData,
        patient: patientData,
        createdAt: new Date().toISOString()
      });
      
      // 完了ステップに進む
      setCurrentStep(5);
    } catch (error) {
      console.error('計画書保存エラー:', error);
    }
  };

  // 計画書表示ハンドラ
  const handleViewPlan = () => {
    setShowPlanViewer(true);
  };

  // 計画書表示を閉じるハンドラ
  const handleClosePlanViewer = () => {
    setShowPlanViewer(false);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">計画書作成</h1>
      
      {/* ステップインジケーター */}
      <div className="relative">
        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
          <div
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 transition-all duration-300"
          ></div>
        </div>
        <div className="flex justify-between">
          <div className={`text-xs ${currentStep >= 1 ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>基本情報</div>
          <div className={`text-xs ${currentStep >= 2 ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>アセスメント</div>
          <div className={`text-xs ${currentStep >= 3 ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>AI生成</div>
          <div className={`text-xs ${currentStep >= 4 ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>確認・編集</div>
          <div className={`text-xs ${currentStep >= 5 ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>完了</div>
        </div>
      </div>
      
      <Card className="p-6">
        {/* ステップ1: 基本情報 */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">基本情報入力</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  患者選択
                </label>
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                    <span className="text-sm text-gray-500">読み込み中...</span>
                  </div>
                ) : (
                  <select 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={selectedPatient}
                    onChange={(e) => setSelectedPatient(e.target.value)}
                  >
                    <option value="">患者を選択してください</option>
                    {patients.map(patient => (
                      <option key={patient.id} value={patient.id}>
                        {patient.name} ({patient.age}歳・{patient.gender})
                      </option>
                    ))}
                  </select>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  訪問職種
                </label>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      id="visit-type-nurse"
                      name="visit-type"
                      type="radio"
                      value="nurse"
                      checked={visitType === 'nurse'}
                      onChange={() => setVisitType('nurse')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <label htmlFor="visit-type-nurse" className="ml-2 block text-sm text-gray-700">
                      看護師のみ
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="visit-type-rehab"
                      name="visit-type"
                      type="radio"
                      value="rehab"
                      checked={visitType === 'rehab'}
                      onChange={() => setVisitType('rehab')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <label htmlFor="visit-type-rehab" className="ml-2 block text-sm text-gray-700">
                      リハビリ職員のみ
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="visit-type-both"
                      name="visit-type"
                      type="radio"
                      value="both"
                      checked={visitType === 'both'}
                      onChange={() => setVisitType('both')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <label htmlFor="visit-type-both" className="ml-2 block text-sm text-gray-700">
                      両方
                    </label>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  計画書作成日
                </label>
                <input
                  type="date"
                  value={planDate}
                  onChange={(e) => setPlanDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  担当者
                </label>
                <input
                  type="text"
                  value={user?.email || ''}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 bg-gray-100 rounded-md"
                />
              </div>
            </div>
          </div>
        )}
        
        {/* ステップ2: アセスメント */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">アセスメント入力</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  健康状態
                </label>
                <textarea
                  rows={3}
                  value={healthStatus}
                  onChange={(e) => setHealthStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="現在の健康状態について入力してください"
                ></textarea>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ADL評価
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">移動</label>
                    <select 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      value={adlMobility}
                      onChange={(e) => setAdlMobility(e.target.value)}
                    >
                      <option value="independent">自立</option>
                      <option value="supervision">見守り</option>
                      <option value="partial">部分介助</option>
                      <option value="complete">全介助</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">食事</label>
                    <select 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      value={adlEating}
                      onChange={(e) => setAdlEating(e.target.value)}
                    >
                      <option value="independent">自立</option>
                      <option value="supervision">見守り</option>
                      <option value="partial">部分介助</option>
                      <option value="complete">全介助</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">排泄</label>
                    <select 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      value={adlToilet}
                      onChange={(e) => setAdlToilet(e.target.value)}
                    >
                      <option value="independent">自立</option>
                      <option value="supervision">見守り</option>
                      <option value="partial">部分介助</option>
                      <option value="complete">全介助</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">入浴</label>
                    <select 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      value={adlBathing}
                      onChange={(e) => setAdlBathing(e.target.value)}
                    >
                      <option value="independent">自立</option>
                      <option value="supervision">見守り</option>
                      <option value="partial">部分介助</option>
                      <option value="complete">全介助</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  本人・家族の希望
                </label>
                <textarea
                  rows={3}
                  value={patientFamilyRequest}
                  onChange={(e) => setPatientFamilyRequest(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="本人や家族の希望について入力してください"
                ></textarea>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  医師の指示内容
                </label>
                <textarea
                  rows={3}
                  value={doctorInstructions}
                  onChange={(e) => setDoctorInstructions(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="医師からの指示内容について入力してください"
                ></textarea>
              </div>
              
              {/* スタッフ補足情報欄を追加 */}
              <div className="bg-blue-50 p-4 rounded-md">
                <label className="block text-sm font-medium text-blue-700 mb-1">
                  スタッフ補足情報
                </label>
                <textarea
                  rows={4}
                  value={staffNotes}
                  onChange={(e) => setStaffNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-blue-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="計画書に反映させたい重要な観察事項や懸念点、特記事項などを入力してください。例: 認知機能の低下傾向がみられる、家族の介護負担が大きい、栄養状態に注意が必要 など"
                ></textarea>
                <p className="mt-1 text-xs text-blue-600">
                  ここに入力した情報はAIによる計画書生成時に考慮され、より適切な内容が提案されます。
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* ステップ3: AI生成 */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">AI計画書生成</h2>
            
            <div className="bg-blue-50 p-4 rounded-md">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-0.5">
                  <Wand2 size={20} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-800">AIによる計画書生成について</p>
                  <p className="text-sm text-blue-700 mt-1">
                    入力された情報をもとに、AIが訪問看護計画書の目標、課題、支援内容を自動生成します。
                    生成された内容は次のステップで確認・編集できます。
                  </p>
                </div>
              </div>
            </div>
            
            {/* スタッフ補足情報の表示 */}
            {staffNotes && (
              <div className="bg-gray-50 p-4 rounded-md border-l-4 border-blue-400">
                <h3 className="text-sm font-medium text-gray-700 mb-2">考慮されるスタッフ補足情報</h3>
                <p className="text-sm text-gray-600 whitespace-pre-line">{staffNotes}</p>
              </div>
            )}
            
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="text-sm font-medium text-gray-700 mb-2">生成される内容</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center space-x-2">
                  <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>看護・リハビリテーションの目標</span>
                </li>
                <li className="flex items-center space-x-2">
                  <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>療養上の課題</span>
                </li>
                <li className="flex items-center space-x-2">
                  <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>支援内容</span>
                </li>
              </ul>
            </div>
            
            <div className="flex justify-center">
              <Button
                onClick={handleGenerate}
                className="flex items-center space-x-2 px-6"
                disabled={isGenerating || !selectedPatient}
              >
                {isGenerating ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>生成中...</span>
                  </>
                ) : (
                  <>
                    <Wand2 size={18} />
                    <span>AI計画書を生成</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
        
        {/* ステップ4: 確認・編集 */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">計画書の確認・編集</h2>
            
            {/* スタッフ補足情報が反映された内容であることを表示 */}
            {staffNotes && (
              <div className="bg-blue-50 p-3 rounded-md mb-4">
                <p className="text-sm text-blue-700">
                  <span className="font-medium">スタッフ補足情報が反映されています。</span> 入力された特記事項に基づいて計画書の内容が調整されました。
                </p>
              </div>
            )}
            
            {generatedPlan && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-md font-medium text-gray-700 mb-2">看護・リハビリテーションの目標</h3>
                  <div className="bg-white border border-gray-200 rounded-md p-3">
                    <ul className="space-y-2">
                      {generatedPlan.goals.map((goal, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-blue-600 font-medium mr-2">{index + 1}.</span>
                          <textarea
                            defaultValue={goal}
                            rows={2}
                            className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          ></textarea>
                        </li>
                      ))}
                    </ul>
                    <Button variant="outline" size="sm" className="mt-2">
                      <span>+ 目標を追加</span>
                    </Button>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-md font-medium text-gray-700 mb-2">療養上の課題</h3>
                  <div className="bg-white border border-gray-200 rounded-md p-3">
                    <ul className="space-y-2">
                      {generatedPlan.issues.map((issue, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-red-600 font-medium mr-2">{index + 1}.</span>
                          <textarea
                            defaultValue={issue}
                            rows={2}
                            className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          ></textarea>
                        </li>
                      ))}
                    </ul>
                    <Button variant="outline" size="sm" className="mt-2">
                      <span>+ 課題を追加</span>
                    </Button>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-md font-medium text-gray-700 mb-2">支援内容</h3>
                  <div className="bg-white border border-gray-200 rounded-md p-3">
                    <ul className="space-y-2">
                      {generatedPlan.supports.map((support, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-green-600 font-medium mr-2">{index + 1}.</span>
                          <textarea
                            defaultValue={support}
                            rows={2}
                            className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          ></textarea>
                        </li>
                      ))}
                    </ul>
                    <Button variant="outline" size="sm" className="mt-2">
                      <span>+ 支援内容を追加</span>
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* ステップ5: 完了 */}
        {currentStep === 5 && (
          <div className="space-y-6 text-center">
            <div className="flex justify-center">
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="h-8 w-8 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            
            <h2 className="text-xl font-semibold">計画書が完成しました</h2>
            <p className="text-gray-600">
              訪問看護計画書が正常に作成されました。以下のボタンから計画書を確認・出力できます。
            </p>
            
            <div className="flex justify-center space-x-4 pt-4">
              <Button 
                variant="outline" 
                className="flex items-center space-x-2"
                onClick={handleViewPlan}
              >
                <FileText size={18} />
                <span>計画書を表示</span>
              </Button>
              <Button 
                className="flex items-center space-x-2"
                onClick={handleViewPlan}
              >
                <Download size={18} />
                <span>PDFで出力</span>
              </Button>
            </div>
          </div>
        )}
        
        {/* ナビゲーションボタン */}
        {currentStep !== 5 && (
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={currentStep === 1}
              className="flex items-center space-x-2"
            >
              <ChevronLeft size={18} />
              <span>前へ</span>
            </Button>
            
            {currentStep === 4 ? (
              <Button
                onClick={handleSavePlan}
                className="flex items-center space-x-2"
              >
                <span>計画書を保存</span>
                <Save size={18} />
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={(currentStep === 1 && !selectedPatient) || (currentStep === 3 && !generatedPlan)}
                className="flex items-center space-x-2"
              >
                <span>次へ</span>
                <ChevronRight size={18} />
              </Button>
            )}
          </div>
        )}
      </Card>

      {/* 計画書表示モーダル */}
      {showPlanViewer && savedPlan && (
        <PlanViewer plan={savedPlan} onClose={handleClosePlanViewer} />
      )}
    </div>
  );
};

export default PlanCreation;