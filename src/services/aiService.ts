import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// APIキーを設定
const API_KEY = 'AIzaSyDjf8_ZvX9QzBJkUO-EZ9VNfS74uu83NGs';

// Gemini APIのモデル名
const MODEL_NAME = 'gemini-1.5-pro';

// GoogleGenerativeAIのインスタンスを作成
const genAI = new GoogleGenerativeAI(API_KEY);

// 安全性設定
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

// モデルの取得
const model = genAI.getGenerativeModel({
  model: MODEL_NAME,
  safetySettings,
});

/**
 * 患者データと基本情報から計画書の内容を生成する
 * @param patientData 患者データ
 * @param basicInfo 基本情報（健康状態、ADL、要望など）
 * @returns 生成された計画書の内容
 */
export const generateCarePlan = async (patientData: any, basicInfo: any) => {
  try {
    // プロンプトの作成
    const prompt = `
    あなたは訪問看護計画書を作成する専門家です。以下の患者情報と基本情報から、適切な訪問看護計画書を作成してください。
    
    ## 患者情報
    - 氏名: ${patientData.name}
    - 年齢: ${patientData.age}歳
    - 性別: ${patientData.gender}
    - 住所: ${patientData.address}
    - 主治医・医療機関: ${patientData.primary_doctor || '情報なし'}
    - 既往歴: ${patientData.medical_history || '情報なし'}
    - 保険種別: ${patientData.insurance_type || '介護保険'}
    - 要介護度: ${patientData.care_level || '要介護1'}
    
    ## 基本情報
    - 健康状態: ${basicInfo.healthStatus || '情報なし'}
    - 移動ADL: ${basicInfo.adlMobility || '自立'}
    - 食事ADL: ${basicInfo.adlEating || '自立'}
    - トイレADL: ${basicInfo.adlToilet || '自立'}
    - 入浴ADL: ${basicInfo.adlBathing || '自立'}
    - 本人・家族の要望: ${basicInfo.patientFamilyRequest || '情報なし'}
    - 医師の指示: ${basicInfo.doctorInstructions || '情報なし'}
    - スタッフ所見: ${basicInfo.staffNotes || '情報なし'}
    
    ## 出力形式
    以下の形式でJSON形式で出力してください。
    {
      "goals": ["目標1", "目標2", "目標3"],
      "issues": ["問題点1", "問題点2", "問題点3"],
      "supports": ["支援内容1", "支援内容2", "支援内容3"]
    }
    
    目標、問題点、支援内容はそれぞれ3〜5項目程度で、具体的かつ患者の状態に合わせた内容にしてください。
    `;

    // Gemini APIを呼び出し
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // JSONをパース
    try {
      // テキストからJSON部分を抽出
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const jsonText = jsonMatch[0];
        const parsedData = JSON.parse(jsonText);
        return parsedData;
      } else {
        throw new Error('JSONデータが見つかりませんでした');
      }
    } catch (parseError) {
      console.error('JSONパースエラー:', parseError);
      // フォールバック: テキストを解析して構造化
      const fallbackData = {
        goals: extractItems(text, 'goals', '目標'),
        issues: extractItems(text, 'issues', '問題点'),
        supports: extractItems(text, 'supports', '支援内容')
      };
      return fallbackData;
    }
  } catch (error) {
    console.error('Gemini API呼び出しエラー:', error);
    // エラー時のデフォルト値
    return {
      goals: ['患者の状態を安定させる', '日常生活の自立度を向上させる', '生活の質を向上させる'],
      issues: ['健康状態の管理', '日常生活動作の制限', '社会的孤立のリスク'],
      supports: ['定期的な健康チェック', '日常生活動作の支援', '社会資源の活用支援']
    };
  }
};

/**
 * テキストから特定のセクションの項目を抽出するヘルパー関数
 */
const extractItems = (text: string, sectionName: string, fallbackPrefix: string): string[] => {
  // セクション名で検索
  const sectionRegex = new RegExp(`"${sectionName}"\\s*:\\s*\\[(.*?)\\]`, 's');
  const sectionMatch = text.match(sectionRegex);
  
  if (sectionMatch && sectionMatch[1]) {
    // 配列内の項目を抽出
    const itemsText = sectionMatch[1];
    const items = itemsText.split(',')
      .map(item => item.trim().replace(/^"/, '').replace(/"$/, ''))
      .filter(item => item.length > 0);
    
    if (items.length > 0) {
      return items;
    }
  }
  
  // フォールバック: 行ごとに検索
  const lines = text.split('\n');
  const items = lines
    .filter(line => line.includes(fallbackPrefix) || line.includes('-'))
    .map(line => line.replace(/^[•\-\*]\s*/, '').trim())
    .filter(item => item.length > 0)
    .slice(0, 5);
  
  return items.length > 0 ? items : [`${fallbackPrefix}1`, `${fallbackPrefix}2`, `${fallbackPrefix}3`];
}; 