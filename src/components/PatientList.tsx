import React, { useState, useEffect } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Search, Filter, Plus, Edit, Trash2, FileText, AlertTriangle, Eye } from 'lucide-react';
import NewPatientForm, { PatientData } from './NewPatientForm';
import PatientDetail from './PatientDetail';
import { getPatients, createPatient, deletePatient, updatePatient } from '../services/patientService';
import { getCarePlanByMonth, getCarePlansByPatient } from '../services/carePlanService';
import { useAuth } from '../contexts/AuthContext';
import { DEMO_MODE } from '../lib/supabase';

interface PatientListProps {
  onCreatePlan?: (patientId: string) => void;
}

const PatientList: React.FC<PatientListProps> = ({ onCreatePlan }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showNewPatientForm, setShowNewPatientForm] = useState(false);
  const [patients, setPatients] = useState<any[]>([]);
  const [patientPlans, setPatientPlans] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [showPatientDetail, setShowPatientDetail] = useState(false);
  const [editingPatient, setEditingPatient] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  
  const { user } = useAuth();
  
  // 現在の日付を取得
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1; // JavaScriptの月は0から始まるので+1
  const currentYear = currentDate.getFullYear();
  
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // 患者データを取得
      const patientsData = await getPatients();
      setPatients(patientsData);
      
      // 各患者の今月の計画書を確認
      const plansData: Record<string, any> = {};
      
      for (const patient of patientsData) {
        const plan = await getCarePlanByMonth(patient.id, currentMonth, currentYear);
        if (plan) {
          plansData[patient.id] = {
            lastUpdated: new Date(plan.updated_at).toLocaleDateString('ja-JP'),
            month: currentMonth,
            year: currentYear
          };
        } else {
          // 最新の計画書を探す
          const latestPlans = await getCarePlansByPatient(patient.id);
          
          if (latestPlans && latestPlans.length > 0) {
            const latestPlan = latestPlans[0];
            plansData[patient.id] = {
              lastUpdated: new Date(latestPlan.updated_at).toLocaleDateString('ja-JP'),
              month: latestPlan.month,
              year: latestPlan.year
            };
          }
        }
      }
      
      setPatientPlans(plansData);
      setLoading(false);
    } catch (error) {
      console.error('データ取得エラー:', error);
      setLoading(false);
    }
  };

  // 今月の計画書が必要かどうかを判定する関数
  const needsMonthlyPlan = (patientId: string) => {
    if (!patientPlans[patientId]) return true; // 計画書がない場合
    
    // 今月の計画書があるかチェック
    return !(patientPlans[patientId].month === currentMonth && 
             patientPlans[patientId].year === currentYear);
  };

  // 新規患者を追加する関数
  const handleAddPatient = async (patientData: PatientData) => {
    if (!user) return;
    
    try {
      const newPatient = await createPatient(patientData, user.id);
      setPatients([...patients, newPatient]);
      setShowNewPatientForm(false);
    } catch (error) {
      console.error('患者登録エラー:', error);
    }
  };

  // 患者を編集する関数
  const handleEditPatient = async (patientId: string, patientData: PatientData) => {
    if (!user) return;
    
    try {
      const updatedPatient = await updatePatient(patientId, patientData);
      if (updatedPatient) {
        setPatients(patients.map(p => p.id === patientId ? updatedPatient : p));
        setEditingPatient(null);
      }
    } catch (error) {
      console.error('患者編集エラー:', error);
    }
  };

  // 患者を削除する関数
  const handleDeletePatient = async (patientId: string) => {
    try {
      const result = await deletePatient(patientId);
      if (result.success) {
        setPatients(patients.filter(p => p.id !== patientId));
        setShowDeleteConfirm(null);
      } else {
        console.error('患者削除エラー:', result.error);
      }
    } catch (error) {
      console.error('患者削除処理エラー:', error);
    }
  };

  // ソート関数
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // 計画書作成ページへ移動
  const handleCreatePlan = (patientId: string) => {
    if (onCreatePlan) {
      onCreatePlan(patientId);
    } else {
      console.log('計画書作成:', patientId);
    }
  };

  // フィルタリングされた患者リスト
  let filteredPatients = patients.filter(patient => 
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // フィルタータイプに基づいてさらにフィルタリング
  if (filterType === 'needs-plan') {
    filteredPatients = filteredPatients.filter(patient => needsMonthlyPlan(patient.id));
  } else if (filterType === 'has-plan') {
    filteredPatients = filteredPatients.filter(patient => 
      patientPlans[patient.id] && 
      patientPlans[patient.id].month === currentMonth && 
      patientPlans[patient.id].year === currentYear
    );
  }

  // ソート
  filteredPatients.sort((a, b) => {
    let comparison = 0;
    
    if (sortField === 'name') {
      comparison = a.name.localeCompare(b.name, 'ja');
    } else if (sortField === 'age') {
      comparison = a.age - b.age;
    } else if (sortField === 'updated') {
      const aDate = patientPlans[a.id] ? new Date(patientPlans[a.id].lastUpdated) : new Date(0);
      const bDate = patientPlans[b.id] ? new Date(patientPlans[b.id].lastUpdated) : new Date(0);
      comparison = aDate.getTime() - bDate.getTime();
    }
    
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  // ページネーション
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPatients.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);

  // ページ変更ハンドラ
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">患者一覧</h1>
        <Button 
          className="flex items-center gap-2"
          onClick={() => setShowNewPatientForm(true)}
        >
          <Plus size={18} />
          <span>新規患者登録</span>
        </Button>
      </div>
      
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
                デモモードで動作しています。データはローカルのみで保存され、サーバーには送信されません。
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* 検索・フィルターセクション */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="患者名、住所で検索..."
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" className="flex items-center gap-2">
              <Filter size={18} />
              <span>フィルター</span>
            </Button>
            <select 
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">すべての患者</option>
              <option value="needs-plan">今月の計画書が必要</option>
              <option value="has-plan">今月の計画書あり</option>
            </select>
          </div>
        </div>
      </Card>
      
      {/* 患者リスト */}
      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">患者データを読み込み中...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center">
                        患者名
                        {sortField === 'name' && (
                          <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('age')}
                    >
                      <div className="flex items-center">
                        年齢/性別
                        {sortField === 'age' && (
                          <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      住所
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('updated')}
                    >
                      <div className="flex items-center">
                        計画書最終更新日
                        {sortField === 'updated' && (
                          <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentItems.length > 0 ? (
                    currentItems.map((patient) => (
                      <tr key={patient.id} className={needsMonthlyPlan(patient.id) ? "bg-red-50 hover:bg-red-100" : "hover:bg-gray-50"}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">{patient.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{patient.age}歳 / {patient.gender}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{patient.address}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {patientPlans[patient.id] ? (
                            <div className="flex items-center">
                              <span className="text-gray-500">{patientPlans[patient.id].lastUpdated}</span>
                              {needsMonthlyPlan(patient.id) && (
                                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                  <AlertTriangle size={12} className="mr-1" />
                                  今月分未作成
                                </span>
                              )}
                            </div>
                          ) : (
                            <div className="flex items-center">
                              <span className="text-gray-400">未作成</span>
                              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                <AlertTriangle size={12} className="mr-1" />
                                計画書必要
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-blue-600"
                              onClick={() => {
                                setSelectedPatient(patient.id);
                                setShowPatientDetail(true);
                              }}
                            >
                              <Eye size={18} />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-blue-600"
                              onClick={() => handleCreatePlan(patient.id)}
                            >
                              <FileText size={18} />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-gray-600"
                              onClick={() => setEditingPatient(patient.id)}
                            >
                              <Edit size={18} />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-red-600"
                              onClick={() => setShowDeleteConfirm(patient.id)}
                            >
                              <Trash2 size={18} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                        {searchTerm || filterType !== 'all' ? (
                          <p>検索条件に一致する患者が見つかりません</p>
                        ) : (
                          <p>患者データがありません。新規患者を登録してください。</p>
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* ページネーション */}
            {filteredPatients.length > itemsPerPage && (
              <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      全 <span className="font-medium">{filteredPatients.length}</span> 件中 
                      <span className="font-medium"> {indexOfFirstItem + 1}</span> から 
                      <span className="font-medium"> {Math.min(indexOfLastItem, filteredPatients.length)}</span> 件を表示
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        <span className="sr-only">前へ</span>
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                      
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium ${
                            currentPage === page
                              ? 'bg-blue-50 text-blue-600'
                              : 'bg-white text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                      
                      <button
                        onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        <span className="sr-only">次へ</span>
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
      
      {/* 新規患者登録フォーム */}
      {showNewPatientForm && (
        <NewPatientForm 
          onClose={() => setShowNewPatientForm(false)} 
          onSave={handleAddPatient}
        />
      )}

      {/* 患者編集フォーム */}
      {editingPatient && (
        <NewPatientForm 
          patientId={editingPatient}
          onClose={() => setEditingPatient(null)} 
          onSave={(data) => handleEditPatient(editingPatient, data)}
        />
      )}

      {/* 患者詳細表示 */}
      {showPatientDetail && selectedPatient && (
        <PatientDetail 
          patientId={selectedPatient}
          onClose={() => {
            setShowPatientDetail(false);
            setSelectedPatient(null);
          }}
          onEdit={(id) => {
            setShowPatientDetail(false);
            setEditingPatient(id);
          }}
          onCreatePlan={handleCreatePlan}
        />
      )}

      {/* 削除確認ダイアログ */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">患者データの削除</h2>
            <p className="mb-6">
              この患者データを削除してもよろしいですか？この操作は取り消せません。
            </p>
            <div className="flex justify-end space-x-3">
              <Button 
                variant="outline" 
                onClick={() => setShowDeleteConfirm(null)}
              >
                キャンセル
              </Button>
              <Button 
                variant="primary" 
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={() => handleDeletePatient(showDeleteConfirm)}
              >
                削除する
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default PatientList;