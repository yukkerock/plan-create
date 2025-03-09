import React, { createContext, useContext, useState, useEffect } from 'react';

type ThemeType = 'light' | 'dark' | 'system';
type FontSizeType = 'small' | 'medium' | 'large';

interface ThemeContextType {
  theme: ThemeType;
  fontSize: FontSizeType;
  setTheme: (theme: ThemeType) => void;
  setFontSize: (fontSize: FontSizeType) => void;
  isDarkMode: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeType>('system');
  const [fontSize, setFontSizeState] = useState<FontSizeType>('medium');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // ローカルストレージから設定を読み込む
  useEffect(() => {
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        if (settings.theme) {
          setThemeState(settings.theme);
        }
        if (settings.fontSize) {
          setFontSizeState(settings.fontSize);
        }
      } catch (error) {
        console.error('設定の読み込みエラー:', error);
      }
    }
  }, []);

  // テーマの変更を監視して適用
  useEffect(() => {
    const applyTheme = () => {
      const root = window.document.documentElement;
      
      // 以前のテーマクラスをすべて削除
      root.classList.remove('light-theme', 'dark-theme');
      
      let effectiveTheme = theme;
      
      // システムテーマの場合はOSの設定を使用
      if (theme === 'system') {
        effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      
      // テーマクラスを適用
      root.classList.add(`${effectiveTheme}-theme`);
      
      // ダークモードフラグを設定
      setIsDarkMode(effectiveTheme === 'dark');
    };
    
    applyTheme();
    
    // システムテーマの変更を監視
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        applyTheme();
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  // 文字サイズの変更を監視して適用
  useEffect(() => {
    const root = window.document.documentElement;
    
    // 以前の文字サイズクラスをすべて削除
    root.classList.remove('text-small', 'text-medium', 'text-large');
    
    // 文字サイズクラスを適用
    root.classList.add(`text-${fontSize}`);
  }, [fontSize]);

  // 設定を変更する関数
  const setTheme = (newTheme: ThemeType) => {
    setThemeState(newTheme);
    saveSettings({ theme: newTheme, fontSize });
  };

  const setFontSize = (newFontSize: FontSizeType) => {
    setFontSizeState(newFontSize);
    saveSettings({ theme, fontSize: newFontSize });
  };

  // 設定をローカルストレージに保存
  const saveSettings = (settings: { theme: ThemeType; fontSize: FontSizeType }) => {
    localStorage.setItem('userSettings', JSON.stringify(settings));
  };

  return (
    <ThemeContext.Provider value={{ theme, fontSize, setTheme, setFontSize, isDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}; 