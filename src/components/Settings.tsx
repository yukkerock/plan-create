import React, { useState, useEffect } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { DEMO_MODE, PARTIAL_DEMO_MODE, supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { X, Eye, EyeOff, Save, User, Moon, Sun, Monitor } from 'lucide-react';

interface ProfileFormData {
  full_name: string;
  role: string;
  phone?: string;
  organization?: string;
  position?: string;
}

const Settings: React.FC = () => {
  const { user, profile } = useAuth();
  const { theme, fontSize, setTheme, setFontSize } = useTheme();
  const [saveMessage, setSaveMessage] = useState('');
  
  // プロフィール編集用の状態
  const [profileData, setProfileData] = useState<ProfileFormData>({
    full_name: '',
    role: '',
    phone: '',
    organization: '',
    position: ''
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  
  // パスワード変更用の状態
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordChanging, setPasswordChanging] = useState(false);

  // プロフィールデータの初期化
  useEffect(() => {
    if (profile) {
      setProfileData({
        full_name: profile.full_name || '',
        role: profile.role || '',
        phone: profile.phone || '',
        organization: profile.organization || '',
        position: profile.position || ''
      });
    }
  }, [profile]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async () => {
    if (!user || !profile) return;
    
    setProfileError('');
    setProfileSuccess('');
    setProfileSaving(true);
    
    try {
      // デモモードの場合は保存をシミュレート
      if (DEMO_MODE && !PARTIAL_DEMO_MODE) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setProfileSuccess('プロフィールが更新されました（デモモード）');
        setIsEditingProfile(false);
        setProfileSaving(false);
        return;
      }
      
      // Supabaseにプロフィールを更新
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profileData.full_name,
          role: profileData.role,
          phone: profileData.phone,
          organization: profileData.organization,
          position: profileData.position,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
      
      if (error) throw error;
      
      setProfileSuccess('プロフィールが更新されました');
      setIsEditingProfile(false);
    } catch (error: any) {
      setProfileError('プロフィールの更新に失敗しました: ' + error.message);
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 入力検証
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('すべての項目を入力してください');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError('新しいパスワードが一致しません');
      return;
    }
    
    if (newPassword.length < 6) {
      setPasswordError('パスワードは6文字以上で入力してください');
      return;
    }
    
    setPasswordError('');
    setPasswordSuccess('');
    setPasswordChanging(true);
    
    try {
      // デモモードの場合は変更をシミュレート
      if (DEMO_MODE) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setPasswordSuccess('パスワードが変更されました（デモモード）');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setPasswordChanging(false);
        return;
      }
      
      // Supabaseでパスワードを変更
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      
      setPasswordSuccess('パスワードが変更されました');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      // 3秒後にモーダルを閉じる
      setTimeout(() => {
        if (passwordSuccess) {
          setShowPasswordModal(false);
          setPasswordSuccess('');
        }
      }, 3000);
    } catch (error: any) {
      setPasswordError('パスワードの変更に失敗しました: ' + error.message);
    } finally {
      setPasswordChanging(false);
    }
  };

  // テーマ選択のアイコンを取得
  const getThemeIcon = (themeType: string) => {
    switch (themeType) {
      case 'light':
        return <Sun size={20} />;
      case 'dark':
        return <Moon size={20} />;
      case 'system':
        return <Monitor size={20} />;
      default:
        return <Sun size={20} />;
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">設定</h1>
      
      {(DEMO_MODE || PARTIAL_DEMO_MODE) && (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                {PARTIAL_DEMO_MODE 
                  ? '部分的デモモードで動作しています。一部の設定は実際に反映されます。'
                  : 'デモモードで動作しています。設定はローカルのみで保存され、サーバーには送信されません。'
                }
              </p>
            </div>
          </div>
        </div>
      )}
      
      {saveMessage && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">{saveMessage}</p>
            </div>
          </div>
        </div>
      )}
      
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">アプリケーション設定</h2>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              テーマ
            </label>
            <div className="grid grid-cols-3 gap-4">
              <button
                onClick={() => setTheme('light')}
                className={`flex flex-col items-center justify-center p-4 rounded-md border ${
                  theme === 'light' 
                    ? 'border-blue-500 bg-blue-50 text-blue-600' 
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <Sun size={24} className={theme === 'light' ? 'text-blue-500' : 'text-gray-500'} />
                <span className="mt-2 text-sm">ライト</span>
              </button>
              
              <button
                onClick={() => setTheme('dark')}
                className={`flex flex-col items-center justify-center p-4 rounded-md border ${
                  theme === 'dark' 
                    ? 'border-blue-500 bg-blue-50 text-blue-600' 
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <Moon size={24} className={theme === 'dark' ? 'text-blue-500' : 'text-gray-500'} />
                <span className="mt-2 text-sm">ダーク</span>
              </button>
              
              <button
                onClick={() => setTheme('system')}
                className={`flex flex-col items-center justify-center p-4 rounded-md border ${
                  theme === 'system' 
                    ? 'border-blue-500 bg-blue-50 text-blue-600' 
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <Monitor size={24} className={theme === 'system' ? 'text-blue-500' : 'text-gray-500'} />
                <span className="mt-2 text-sm">システム設定</span>
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              文字サイズ
            </label>
            <div className="flex space-x-4">
              <button
                onClick={() => setFontSize('small')}
                className={`flex-1 py-2 px-4 rounded-md border ${
                  fontSize === 'small' 
                    ? 'border-blue-500 bg-blue-50 text-blue-600' 
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <span className="text-xs">小</span>
              </button>
              
              <button
                onClick={() => setFontSize('medium')}
                className={`flex-1 py-2 px-4 rounded-md border ${
                  fontSize === 'medium' 
                    ? 'border-blue-500 bg-blue-50 text-blue-600' 
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <span className="text-sm">中</span>
              </button>
              
              <button
                onClick={() => setFontSize('large')}
                className={`flex-1 py-2 px-4 rounded-md border ${
                  fontSize === 'large' 
                    ? 'border-blue-500 bg-blue-50 text-blue-600' 
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <span className="text-base">大</span>
              </button>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              文字サイズの変更はすぐに反映されます
            </p>
          </div>
        </div>
      </Card>
      
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">アカウント情報</h2>
          {!isEditingProfile ? (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsEditingProfile(true)}
              disabled={!user}
            >
              編集
            </Button>
          ) : (
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsEditingProfile(false)}
                disabled={profileSaving}
              >
                キャンセル
              </Button>
              <Button 
                size="sm"
                onClick={handleSaveProfile}
                disabled={profileSaving}
              >
                {profileSaving ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>保存中...</span>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Save size={16} className="mr-1" />
                    <span>保存</span>
                  </div>
                )}
              </Button>
            </div>
          )}
        </div>
        
        {profileError && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 text-sm">
            {profileError}
          </div>
        )}
        
        {profileSuccess && (
          <div className="bg-green-50 text-green-600 p-3 rounded-md mb-4 text-sm">
            {profileSuccess}
          </div>
        )}
        
        <div className="space-y-4">
          {!profile && !user ? (
            <div className="text-center py-4">
              <User size={48} className="mx-auto text-gray-300 mb-2" />
              <p className="text-gray-500">ユーザー情報を読み込み中...</p>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  メールアドレス
                </label>
                <input 
                  type="email" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 focus:outline-none"
                  value={user?.email || ''}
                  disabled
                />
                <p className="mt-1 text-xs text-gray-500">メールアドレスの変更は管理者にお問い合わせください</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  氏名
                </label>
                {isEditingProfile ? (
                  <input 
                    type="text" 
                    name="full_name"
                    value={profileData.full_name}
                    onChange={handleProfileChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="山田 太郎"
                    disabled={profileSaving}
                  />
                ) : (
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 focus:outline-none"
                    value={profile?.full_name || user?.user_metadata?.full_name || '未設定'}
                    disabled
                  />
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  役職
                </label>
                {isEditingProfile ? (
                  <input 
                    type="text" 
                    name="position"
                    value={profileData.position || ''}
                    onChange={handleProfileChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="看護師長"
                    disabled={profileSaving}
                  />
                ) : (
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 focus:outline-none"
                    value={profile?.position || '未設定'}
                    disabled
                  />
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  所属組織
                </label>
                {isEditingProfile ? (
                  <input 
                    type="text" 
                    name="organization"
                    value={profileData.organization || ''}
                    onChange={handleProfileChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="〇〇訪問看護ステーション"
                    disabled={profileSaving}
                  />
                ) : (
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 focus:outline-none"
                    value={profile?.organization || '未設定'}
                    disabled
                  />
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  電話番号
                </label>
                {isEditingProfile ? (
                  <input 
                    type="tel" 
                    name="phone"
                    value={profileData.phone || ''}
                    onChange={handleProfileChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="090-1234-5678"
                    disabled={profileSaving}
                  />
                ) : (
                  <input 
                    type="tel" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 focus:outline-none"
                    value={profile?.phone || '未設定'}
                    disabled
                  />
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ユーザー権限
                </label>
                {isEditingProfile ? (
                  <select 
                    name="role"
                    value={profileData.role}
                    onChange={(e) => setProfileData(prev => ({ ...prev, role: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={profileSaving || DEMO_MODE}
                  >
                    <option value="user">一般ユーザー</option>
                    <option value="admin">管理者</option>
                  </select>
                ) : (
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 focus:outline-none"
                    value={profile?.role === 'admin' ? '管理者' : '一般ユーザー'}
                    disabled
                  />
                )}
                {isEditingProfile && DEMO_MODE && (
                  <p className="mt-1 text-xs text-gray-500">デモモードでは権限の変更はできません</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  パスワード
                </label>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowPasswordModal(true)}
                >
                  パスワードを変更
                </Button>
              </div>
            </>
          )}
        </div>
      </Card>
      
      {/* パスワード変更モーダル */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-medium">パスワードを変更</h2>
              <button 
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordError('');
                  setPasswordSuccess('');
                  setCurrentPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                }}
                className="text-gray-500 hover:text-gray-700"
                disabled={passwordChanging}
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleChangePassword} className="p-6">
              {passwordError && (
                <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 text-sm">
                  {passwordError}
                </div>
              )}
              
              {passwordSuccess && (
                <div className="bg-green-50 text-green-600 p-3 rounded-md mb-4 text-sm">
                  {passwordSuccess}
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="current-password" className="block text-sm font-medium text-gray-700 mb-1">
                    現在のパスワード
                  </label>
                  <div className="relative">
                    <input
                      id="current-password"
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={passwordChanging}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? (
                        <EyeOff size={18} className="text-gray-500" />
                      ) : (
                        <Eye size={18} className="text-gray-500" />
                      )}
                    </button>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-1">
                    新しいパスワード
                  </label>
                  <div className="relative">
                    <input
                      id="new-password"
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={passwordChanging}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? (
                        <EyeOff size={18} className="text-gray-500" />
                      ) : (
                        <Eye size={18} className="text-gray-500" />
                      )}
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">6文字以上で入力してください</p>
                </div>
                
                <div>
                  <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
                    新しいパスワード（確認）
                  </label>
                  <input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={passwordChanging}
                  />
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordError('');
                    setPasswordSuccess('');
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                  }}
                  disabled={passwordChanging}
                >
                  キャンセル
                </Button>
                <Button
                  type="submit"
                  disabled={passwordChanging || passwordSuccess !== ''}
                >
                  {passwordChanging ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>変更中...</span>
                    </div>
                  ) : (
                    'パスワードを変更'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings; 