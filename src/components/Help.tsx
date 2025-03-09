import React, { useState } from 'react';
import { Card } from './ui/Card';
import { ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from './ui/Button';

interface FAQItem {
  question: string;
  answer: React.ReactNode;
}

const Help: React.FC = () => {
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    if (expandedFAQ === index) {
      setExpandedFAQ(null);
    } else {
      setExpandedFAQ(index);
    }
  };

  const faqItems: FAQItem[] = [
    {
      question: '計画書の作成方法は？',
      answer: (
        <div className="space-y-2">
          <p>計画書は以下の手順で作成できます：</p>
          <ol className="list-decimal pl-5 space-y-1">
            <li>サイドバーから「計画書作成」を選択するか、患者詳細画面から「新規計画書作成」ボタンをクリックします。</li>
            <li>患者を選択し、基本情報を入力します。</li>
            <li>アセスメント情報を入力します。</li>
            <li>「AI計画書を生成」ボタンをクリックすると、入力情報に基づいて計画書の草案が生成されます。</li>
            <li>生成された内容を確認・編集し、「保存」ボタンをクリックして計画書を保存します。</li>
          </ol>
        </div>
      )
    },
    {
      question: '患者情報の編集方法は？',
      answer: (
        <div className="space-y-2">
          <p>患者情報は以下の手順で編集できます：</p>
          <ol className="list-decimal pl-5 space-y-1">
            <li>サイドバーから「患者一覧」を選択します。</li>
            <li>患者リストから対象の患者の「編集」ボタンをクリックします。</li>
            <li>患者情報編集フォームが表示されます。</li>
            <li>情報を更新後、「保存」ボタンをクリックすると変更が反映されます。</li>
          </ol>
        </div>
      )
    },
    {
      question: 'AI機能はどのように活用できますか？',
      answer: (
        <div className="space-y-2">
          <p>本システムはGemini APIを活用して、患者データと基本情報から適切な計画書の内容を自動生成します。</p>
          <p>生成される内容には以下が含まれます：</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>看護・リハビリテーションの目標</li>
            <li>療養上の課題</li>
            <li>支援内容</li>
          </ul>
          <p className="text-red-600 font-medium">※ AIが生成した内容は必ず確認し、必要に応じて編集してください。</p>
        </div>
      )
    },
    {
      question: '計画書のPDF出力方法は？',
      answer: (
        <div className="space-y-2">
          <p>計画書のPDF出力は以下の手順で行えます：</p>
          <ol className="list-decimal pl-5 space-y-1">
            <li>患者詳細画面または計画書一覧から対象の計画書を表示します。</li>
            <li>計画書詳細画面の右上にある「PDF出力」ボタンをクリックします。</li>
            <li>PDF形式で計画書がダウンロードされます。</li>
          </ol>
          <p>※ PDF出力された計画書は印刷用に最適化されています。</p>
        </div>
      )
    },
    {
      question: 'サポートが必要な場合は？',
      answer: (
        <div className="space-y-2">
          <p>以下の方法でサポートを受けることができます：</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <span>メールでのお問い合わせ：</span>
              <a href="mailto:support@careplan-app.example.com" className="text-blue-600 hover:underline flex items-center inline-flex">
                support@careplan-app.example.com
                <ExternalLink size={14} className="ml-1" />
              </a>
            </li>
            <li>平日9:00-17:00の間、通常24時間以内に返信いたします。</li>
            <li>緊急の場合は、03-XXXX-XXXX（サポートセンター）までお電話ください。</li>
          </ul>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">ヘルプ</h1>
      
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">システム概要</h2>
        <div className="space-y-4">
          <p>
            訪問看護計画書自動作成システムは、訪問看護師の業務効率化を目的としたアプリケーションです。
            患者情報の管理、計画書の作成・管理、AIによる計画書の自動生成などの機能を提供します。
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="bg-blue-50 p-4 rounded-md">
              <h3 className="font-medium text-blue-700 mb-2">患者管理</h3>
              <p className="text-sm">患者情報の登録・編集・削除、検索機能</p>
            </div>
            <div className="bg-green-50 p-4 rounded-md">
              <h3 className="font-medium text-green-700 mb-2">計画書作成</h3>
              <p className="text-sm">AI支援による計画書の自動生成、編集、PDF出力</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-md">
              <h3 className="font-medium text-purple-700 mb-2">データ分析</h3>
              <p className="text-sm">患者データの統計、計画書の更新時期の通知</p>
            </div>
          </div>
        </div>
      </Card>
      
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">よくある質問</h2>
        <div className="space-y-2 divide-y divide-gray-200">
          {faqItems.map((item, index) => (
            <div key={index} className="pt-2">
              <button
                className="w-full flex justify-between items-center py-2 text-left font-medium text-gray-800 hover:text-blue-600 focus:outline-none"
                onClick={() => toggleFAQ(index)}
              >
                <span>{item.question}</span>
                {expandedFAQ === index ? (
                  <ChevronUp size={20} className="text-gray-500" />
                ) : (
                  <ChevronDown size={20} className="text-gray-500" />
                )}
              </button>
              {expandedFAQ === index && (
                <div className="pb-4 text-gray-600">
                  {item.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>
      
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">ビデオチュートリアル</h2>
        <div className="space-y-4">
          <div className="border border-gray-200 rounded-md p-4">
            <h3 className="font-medium mb-2">基本操作ガイド</h3>
            <p className="text-gray-600 mb-3">システムの基本的な使い方を解説したビデオです。</p>
            <div className="bg-gray-100 h-40 flex items-center justify-center rounded-md">
              <p className="text-gray-500">ビデオプレビュー（実際の環境では動画が表示されます）</p>
            </div>
            <Button className="mt-3" variant="outline" size="sm">
              <ExternalLink size={16} className="mr-2" />
              ビデオを見る
            </Button>
          </div>
          
          <div className="border border-gray-200 rounded-md p-4">
            <h3 className="font-medium mb-2">AI計画書作成ガイド</h3>
            <p className="text-gray-600 mb-3">AI機能を活用した計画書作成の手順を解説したビデオです。</p>
            <div className="bg-gray-100 h-40 flex items-center justify-center rounded-md">
              <p className="text-gray-500">ビデオプレビュー（実際の環境では動画が表示されます）</p>
            </div>
            <Button className="mt-3" variant="outline" size="sm">
              <ExternalLink size={16} className="mr-2" />
              ビデオを見る
            </Button>
          </div>
        </div>
      </Card>
      
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">お問い合わせ</h2>
        <div className="space-y-4">
          <p className="text-gray-600">
            システムに関するご質問やお問い合わせは、以下のメールアドレスまでお願いします：
          </p>
          <a href="mailto:support@careplan-app.example.com" className="text-blue-600 hover:underline flex items-center">
            support@careplan-app.example.com
            <ExternalLink size={16} className="ml-1" />
          </a>
          <p className="text-gray-600">
            平日9:00-17:00の間、通常24時間以内に返信いたします。<br />
            緊急の場合は、03-XXXX-XXXX（サポートセンター）までお電話ください。
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Help; 