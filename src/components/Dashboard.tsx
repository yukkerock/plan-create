import React, { useState, useEffect } from 'react';
import { Card } from './ui/Card';
import { FileText, Users, Clock, CheckCircle, AlertTriangle, Info, Bell, ArrowRight } from 'lucide-react';
import { getPatients } from '../services/patientService';
import { getPatientsNeedingPlans, getCarePlansByPatient } from '../services/carePlanService';
import { DEMO_MODE, PARTIAL_DEMO_MODE } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    patientCount: 0,
    completedPlansCount: 0,
    needingPlansCount: 0
  });
  const [recentPatients, setRecentPatients] = useState<any[]>([]);
  const [recentPlans, setRecentPlans] = useState<any[]>([]);
  const [patientsNeedingPlans, setPatientsNeedingPlans] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const { user } = useAuth();
  const { isDarkMode } = useTheme();

  // 現在の日付を取得
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  const daysLeft = daysInMonth - currentDate.getDate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // 患者データを取得
        const patientsData = await getPatients();
        
        // 今月の計画書が必要な患者を取得
        const needingPlansData = await getPatientsNeedingPlans();
        
        // 最近の計画書を取得
        const recentPlansData: any[] = [];
        let completedPlansCount = 0;
        
        // 各患者の最新の計画書を取得
        for (const patient of patientsData.slice(0, 5)) {
          const plans = await getCarePlansByPatient(patient.id);
          if (plans && plans.length > 0) {
            const latestPlan = plans[0];
            recentPlansData.push({
              id: latestPlan.id,
              patientName: patient.name,
              createdAt: new Date(latestPlan.created_at).toLocaleDateString('ja-JP'),
              updatedAt: new Date(latestPlan.updated_at).toLocaleDateString('ja-JP'),
              lastMonthUpdated: latestPlan.month,
              status: latestPlan.status
            });
            
            // 今月の完了した計画書をカウント
            if (latestPlan.month === currentMonth && latestPlan.year === currentYear && latestPlan.status === 'completed') {
              completedPlansCount++;
            }
          }
        }
        
        // 統計情報を設定
        setStats({
          patientCount: patientsData.length,
          completedPlansCount,
          needingPlansCount: needingPlansData.length
        });
        
        // 最近の患者を設定
        setRecentPatients(patientsData.slice(0, 5).map((patient: any) => ({
          id: patient.id,
          name: patient.name,
          age: patient.age
        })));
        
        // 最近の計画書を設定
        setRecentPlans(recentPlansData.slice(0, 3));
        
        // 計画書が必要な患者を設定
        setPatientsNeedingPlans(needingPlansData.slice(0, 5).map((patient: any) => {
          // 最後の計画書の月を取得
          const lastPlanMonth = patient.lastPlanMonth || null;
          return {
            id: patient.id,
            name: patient.name,
            age: patient.age,
            lastPlanMonth
          };
        }));
        
        // お知らせを設定
        const notificationsData = [];
        
        // 月末が近い場合のお知らせ
        if (daysLeft <= 7) {
          notificationsData.push({
            id: 'month-end',
            type: 'warning',
            title: '月末が近づいています',
            message: `今月の計画書作成期限まであと${daysLeft}日です。未作成の計画書を確認してください。`,
            icon: <Clock size={18} className="text-amber-600" />,
            bgColor: 'bg-amber-50'
          });
        }
        
        // 未作成計画書のお知らせ
        if (needingPlansData.length > 0) {
          notificationsData.push({
            id: 'needing-plans',
            type: 'alert',
            title: '未作成の計画書があります',
            message: `${needingPlansData.length}人の患者の今月の計画書が未作成です。`,
            icon: <AlertTriangle size={18} className="text-red-600" />,
            bgColor: 'bg-red-50'
          });
        }
        
        // システム情報のお知らせ
        notificationsData.push({
          id: 'system-update',
          type: 'info',
          title: 'Gemini API連携機能が追加されました',
          message: '計画書作成時にAIによる自動生成機能が利用できるようになりました。',
          icon: <Info size={18} className="text-blue-600" />,
          bgColor: 'bg-blue-50'
        });
        
        // 新機能のお知らせ
        notificationsData.push({
          id: 'new-feature',
          type: 'success',
          title: '計画書のPDF出力機能が追加されました',
          message: '計画書詳細画面からPDFとして保存できるようになりました。',
          icon: <Bell size={18} className="text-green-600" />,
          bgColor: 'bg-green-50'
        });
        
        setNotifications(notificationsData);
        setLoading(false);
      } catch (error) {
        console.error('ホームデータ取得エラー:', error);
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">ホーム</h1>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">データを読み込み中...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">ホーム</h1>
      
      {DEMO_MODE && (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-md mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                {PARTIAL_DEMO_MODE 
                  ? 'デモモード（部分的）で動作しています。認証情報は実際のものですが、一部のデータはデモ用です。'
                  : 'デモモードで動作しています。データはローカルのみで保存され、サーバーには送信されません。'
                }
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* 月末アラート - 月末が近い場合に表示 */}
      {daysLeft <= 7 && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-md">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-amber-800">月末が近づいています</h3>
              <div className="mt-1 text-sm text-amber-700">
                <p>今月の計画書作成期限まであと{daysLeft}日です。未作成の計画書を確認してください。</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">担当患者数</p>
              <p className="text-2xl font-bold mt-1">{stats.patientCount}</p>
            </div>
            <div><Users size={24} className="text-blue-500" /></div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">作成済み計画書</p>
              <p className="text-2xl font-bold mt-1">{stats.completedPlansCount}</p>
            </div>
            <div><FileText size={24} className="text-green-500" /></div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">未作成計画書</p>
              <p className="text-2xl font-bold mt-1">{stats.needingPlansCount}</p>
            </div>
            <div><AlertTriangle size={24} className="text-red-500" /></div>
          </div>
        </Card>
      </div>
      
      {/* 未作成計画書アラート */}
      <Card className={`overflow-hidden ${isDarkMode ? 'border-red-800' : 'bg-red-50 border-red-200'}`}>
        <div className={`px-4 py-3 border-b ${isDarkMode ? 'bg-red-900 border-red-800' : 'bg-red-100 border-red-200'}`}>
          <h2 className="font-medium flex items-center">
            <AlertTriangle size={18} className={`mr-2 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} />
            <span className={isDarkMode ? 'text-red-100' : ''}>今月の計画書が未作成の患者</span>
          </h2>
        </div>
        <div className={`divide-y ${isDarkMode ? 'divide-red-800' : 'divide-red-200'}`}>
          {patientsNeedingPlans.length > 0 ? (
            patientsNeedingPlans.map((patient) => (
              <div 
                key={patient.id} 
                className={`px-4 py-3 transition-colors ${
                  isDarkMode 
                    ? 'hover:bg-red-900' 
                    : 'hover:bg-red-100'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className={`font-medium ${isDarkMode ? 'text-red-100' : ''}`}>{patient.name}</p>
                    <p className={`text-sm ${isDarkMode ? 'text-red-200' : 'text-gray-700'}`}>{patient.age}歳</p>
                  </div>
                  <div>
                    {patient.lastPlanMonth === null ? (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        isDarkMode 
                          ? 'bg-red-800 text-red-100' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        計画書未作成
                      </span>
                    ) : (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        isDarkMode 
                          ? 'bg-amber-800 text-amber-100' 
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        最終更新: {patient.lastPlanMonth}月
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className={`px-4 py-6 text-center ${isDarkMode ? 'text-red-200' : 'text-gray-500'}`}>
              すべての患者の今月の計画書が作成済みです
            </div>
          )}
        </div>
        <div className={`px-4 py-2 border-t flex items-center justify-between ${
          isDarkMode ? 'bg-red-900 border-red-800' : 'bg-red-100 border-red-200'
        }`}>
          <a 
            href="#plan-creation" 
            onClick={() => document.getElementById('plan-creation')?.click()}
            className={`text-sm font-medium flex items-center ${
              isDarkMode ? 'text-red-100 hover:text-white' : 'text-red-700 hover:text-red-900'
            }`}
          >
            計画書作成画面へ
            <ArrowRight size={16} className="ml-1" />
          </a>
        </div>
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 最近の患者 */}
        <Card className="overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <h2 className="font-medium">最近の患者</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {recentPatients.map((patient) => (
              <div key={patient.id} className="px-4 py-3 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{patient.name}</p>
                    <p className="text-sm text-gray-500">{patient.age}歳</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-gray-50 px-4 py-2 border-t border-gray-200">
            <a href="#" className="text-sm text-blue-600 hover:text-blue-800">すべての患者を表示</a>
          </div>
        </Card>
        
        {/* 最近の計画書 */}
        <Card className="overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <h2 className="font-medium">最近の計画書</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {recentPlans.map((plan) => (
              <div key={plan.id} className="px-4 py-3 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{plan.patientName}</p>
                    <p className="text-sm text-gray-500">
                      作成日: {plan.createdAt} | 最終更新日: {plan.updatedAt}
                    </p>
                  </div>
                  <div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      plan.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {plan.status === 'completed' ? '作成済み' : '下書き'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-gray-50 px-4 py-2 border-t border-gray-200">
            <a href="#" className="text-sm text-blue-600 hover:text-blue-800">すべての計画書を表示</a>
          </div>
        </Card>
      </div>
      
      {/* 通知セクション */}
      <Card className="p-4">
        <h2 className="font-medium mb-3">お知らせ</h2>
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div key={notification.id} className={`flex items-start space-x-3 p-3 ${notification.bgColor} rounded-md`}>
              <div className="flex-shrink-0 mt-0.5">
                {notification.icon}
              </div>
              <div>
                <p className="text-sm font-medium">{notification.title}</p>
                <p className="text-sm text-gray-600">{notification.message}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;