import React, { useState } from 'react';
import { useApp, FamilyMember } from '../context/AppContext';
import { 
  ShieldCheck, 
  Key, 
  Users, 
  Plus, 
  Trash2, 
  ChevronRight, 
  ChevronLeft, 
  AlertCircle, 
  ExternalLink,
  BookOpen
} from 'lucide-react';
import { createPortal } from 'react-dom';

export const Onboarding: React.FC = () => {
  const { saveApiKey, saveFamilyMembers, completeOnboarding, fontSize, saveFontSize } = useApp();
  const [step, setStep] = useState(1);
  const [tempKey, setTempApiKey] = useState('');
  const [members, setMembers] = useState<FamilyMember[]>([
    { id: '1', name: '自分', birthDate: '1995-01-01', gender: 'female' }
  ]);
  const [showKeyInstructions, setShowKeyInstructions] = useState(false);
  const [keyError, setKeyError] = useState('');

  // 家族メンバーの追加・削除・変更
  const handleAddMember = () => {
    const id = Date.now().toString();
    setMembers([...members, { id, name: `家族${members.length + 1}`, birthDate: '1995-01-01', gender: 'male' }]);
  };

  const handleRemoveMember = (id: string) => {
    if (members.length === 1) return; // 最小1人
    setMembers(members.filter((m) => m.id !== id));
  };

  const handleMemberChange = (id: string, field: keyof FamilyMember, value: string) => {
    setMembers(
      members.map((m) => {
        if (m.id === id) {
          return { ...m, [field]: value };
        }
        return m;
      })
    );
  };

  // バリデーションして次へ進む
  const handleNextStep1 = () => {
    setStep(2);
  };

  const handleNextStep2 = () => {
    const trimmedKey = tempKey.trim();
    if (!trimmedKey) {
      setKeyError('キーを入力してください。');
      return;
    }
    setKeyError('');
    saveApiKey(trimmedKey);
    setStep(3);
  };

  const handleFinishOnboarding = () => {
    // 家族情報と完了フラグの保存
    saveFamilyMembers(members);
    completeOnboarding();
  };

  const navigateStep = (nextStep: number) => {
    setStep(nextStep);
  };

  return (
    <div className={`relative min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-amber-50 via-orange-100/40 to-green-50/50 overflow-hidden app-font-${fontSize} font-serif`}>
      {/* 背景のやわらかい和風の光の玉 */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-orange-200/40 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-emerald-100/40 blur-3xl pointer-events-none" />

      {/* オンボーディングカード (高さを画面比率80%に合わせ、ボタン固定位置を担保しつつ不要なスクロールバーを完全に排除します) */}
      <div className="relative w-full max-w-lg h-[80vh] min-h-[500px] max-h-[680px] glass rounded-3xl p-6 md:p-8 shadow-2xl border border-white/50 backdrop-blur-xl flex flex-col justify-between overflow-hidden">
        
        {/* 固定ロゴとタイトル (shrink-0) */}
        <div className="text-center mb-4 shrink-0">
          <div className="inline-flex items-center justify-center p-2.5 bg-orange-500/10 rounded-2xl mb-1.5 border border-orange-500/20">
            <img src="favicon.svg" alt="まかなひ" className="w-9 h-9 object-contain" />
          </div>
          <h1 className="text-xl font-bold tracking-wider text-orange-800">まかなひ</h1>
          <p className="text-xs text-stone-500 mt-0.5">和みの献立と、健やかな食卓</p>
        </div>

        {/* コンテンツエリア (大画面では自動拡張しスクロールバーが出ないようフレキシブル化！) */}
        <div className="flex-grow overflow-y-auto pr-1 pb-4 text-left">
          {step === 1 && (
            <div className="space-y-4 animate-soft-fade">
              <div className="text-center space-y-3">
                <h2 className="text-lg font-bold text-stone-800 border-b border-orange-200 pb-2">ようこそ、まかなひへ</h2>
                <p className="text-sm text-stone-600 leading-relaxed">
                  「まかなひ」は、ご家族の健康と日々の団らんを支えるため、1週間分の和風夕食の献立、レシピ、買い物リストを自動で提案するアプリでございます。
                </p>
              </div>

              {/* 文字の大きさ選択 */}
              <div className="p-3.5 bg-white/70 rounded-2xl border border-orange-200/30 space-y-2">
                <label className="text-xs font-bold text-stone-700 block">まずは「文字の大きさ」をお選びください：</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'small', label: '小さめ' },
                    { id: 'normal', label: '普通（推奨）' },
                    { id: 'large', label: '大きめ' }
                  ].map((opt) => {
                    const isSelected = fontSize === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => saveFontSize(opt.id as any)}
                        className={`py-2 px-1 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'border-orange-500 bg-orange-500/10 text-orange-800 shadow-sm'
                            : 'border-stone-200 bg-white/40 hover:bg-white/80 text-stone-600'
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="p-3 bg-orange-50/60 rounded-xl border border-orange-200/20 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-left">
                  <h3 className="text-xs font-bold text-stone-800">安全なデータ管理</h3>
                  <p className="text-xs text-stone-500 leading-normal mt-0.5">
                    接続キーやご家族の情報は、すべてお使いのスマートフォンやパソコン（ブラウザやアプリ）の中だけに安全に保存されます。
                  </p>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-soft-fade">
              <div className="text-center space-y-2">
                <h2 className="text-lg font-bold text-stone-800 border-b border-orange-200 pb-2">Geminiキーの設定</h2>
                <p className="text-xs text-stone-600 leading-relaxed">
                  「まかなひ」が献立を考えるために、AI（Gemini）への接続キーを設定します。無料枠があり、安全にお使いいただけます。
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-stone-700">Geminiの接続キー</label>
                <div className="relative">
                  <input
                    type="password"
                    placeholder="ここに貼り付けしてください"
                    value={tempKey}
                    onChange={(e) => setTempApiKey(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-white/70 focus:outline-none focus:ring-2 focus:ring-orange-500/50 text-sm font-sans"
                  />
                  <Key className="absolute right-3 top-3.5 w-5 h-5 text-stone-400" />
                </div>
                {keyError && <p className="text-xs text-red-600 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> {keyError}</p>}
              </div>

              <button
                type="button"
                onClick={() => setShowKeyInstructions(true)}
                className="w-full py-2 px-4 bg-white/40 hover:bg-white/80 border border-stone-200 rounded-xl text-xs font-bold text-stone-700 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-orange-600" />
                キーの取得手順はこちら
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-soft-fade">
              <div className="text-center space-y-2">
                <h2 className="text-lg font-bold text-stone-800 border-b border-orange-200 pb-2">ご家族の年齢と性別</h2>
                <p className="text-xs text-stone-600 leading-relaxed">
                  必要な夕食目標摂取カロリーを自動計算し、最適な献立をご提案するために、ご家族の情報をお教えください。
                </p>
              </div>

              <div className="space-y-3">
                {members.map((member, index) => (
                  <div key={member.id} className="p-3 bg-white/50 rounded-xl border border-orange-100 flex flex-col gap-2 relative">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-orange-800 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-orange-600" />
                        メンバー #{index + 1}
                      </span>
                      {members.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMember(member.id)}
                          className="p-1 text-stone-400 hover:text-red-600 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-12 gap-2">
                      <div className="col-span-4">
                        <input
                          type="text"
                          placeholder="お名前（例: 自分）"
                          value={member.name}
                          onChange={(e) => handleMemberChange(member.id, 'name', e.target.value)}
                          className="w-full px-2 py-1.5 rounded-lg border border-stone-200 bg-white/80 focus:outline-none focus:ring-1 focus:ring-orange-500 text-xs"
                        />
                      </div>
                      <div className="col-span-5">
                        <input
                          type="date"
                          value={member.birthDate}
                          onChange={(e) => handleMemberChange(member.id, 'birthDate', e.target.value)}
                          className="w-full px-2 py-1.5 rounded-lg border border-stone-200 bg-white/80 focus:outline-none focus:ring-1 focus:ring-orange-500 text-xs font-sans"
                        />
                      </div>
                      <div className="col-span-3">
                        <select
                          value={member.gender}
                          onChange={(e) => handleMemberChange(member.id, 'gender', e.target.value as 'male' | 'female')}
                          className="w-full px-2 py-1.5 rounded-lg border border-stone-200 bg-white/80 focus:outline-none focus:ring-1 focus:ring-orange-500 text-xs"
                        >
                          <option value="female">女性</option>
                          <option value="male">男性</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={handleAddMember}
                className="w-full py-2 bg-stone-100 hover:bg-stone-200 rounded-xl text-xs font-bold text-stone-700 flex items-center justify-center gap-1.5 border border-stone-200/50 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4 text-orange-600" />
                家族を追加する
              </button>
            </div>
          )}
        </div>

        {/* 固定下部ボタンエリア (shrink-0 - 常に同じ場所に完全に固定！) */}
        <div className="shrink-0 pt-3 border-t border-stone-200/40 flex items-center justify-between mt-auto">
          <div>
            {step > 1 ? (
              <button
                type="button"
                onClick={() => navigateStep(step - 1)}
                className="py-2.5 px-4 rounded-xl border border-stone-200 text-xs font-bold text-stone-600 hover:bg-stone-50 flex items-center gap-1 transition-all cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                戻る
              </button>
            ) : (
              <div className="w-16" />
            )}
          </div>

          {/* ページインジケータ（お団子） */}
          <div className="flex gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  step === s ? 'w-5 bg-orange-600' : 'bg-stone-300'
                }`}
              />
            ))}
          </div>

          <div>
            {step === 1 && (
              <button
                type="button"
                onClick={handleNextStep1}
                className="py-2.5 px-5 bg-orange-600 hover:bg-orange-700 text-xs font-bold text-white rounded-xl flex items-center gap-1 shadow-lg shadow-orange-500/15 cursor-pointer"
              >
                次へ
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
            {step === 2 && (
              <button
                type="button"
                onClick={handleNextStep2}
                className="py-2.5 px-5 bg-orange-600 hover:bg-orange-700 text-xs font-bold text-white rounded-xl flex items-center gap-1 shadow-lg shadow-orange-500/15 cursor-pointer"
              >
                次へ
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
            {step === 3 && (
              <button
                type="button"
                onClick={handleFinishOnboarding}
                className="py-2.5 px-5 bg-orange-600 hover:bg-orange-700 text-xs font-bold text-white rounded-xl flex items-center gap-1 shadow-lg shadow-orange-500/15 cursor-pointer"
              >
                始める
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* APIキー発行手順説明モーダル (Glassmorphismベース) */}
      {showKeyInstructions && createPortal(
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-md animate-overlay-fade-in"
          onClick={() => setShowKeyInstructions(false)}
        >
          <div
            className="w-full max-w-md glass rounded-3xl p-6 shadow-2xl border border-white/60 text-left space-y-4 max-h-[85vh] overflow-y-auto animate-modal-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 border-b border-orange-200 pb-2">
              <Key className="w-5 h-5 text-orange-600" />
              <h3 className="text-base font-bold text-stone-800 font-serif">APIキーの取得手順について</h3>
            </div>

            <div className="text-xs text-stone-600 space-y-3 leading-relaxed font-serif">
              <p className="font-bold text-red-600">
                ※重要：キーを取得するためにはGoogleアカウント（無料）が必要です。
              </p>
              <ol className="list-decimal list-inside space-y-2">
                <li>
                  <span className="font-bold">Google AI Studio</span>を開きます。
                  <a
                    href="https://aistudio.google.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-orange-600 hover:underline font-bold ml-1"
                  >
                    AI Studioを開く <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
                <li>
                  規約同意をして進めてください。
                </li>
                <li>
                  上部にある「<span className="font-bold text-stone-800">Get API key</span>」ボタンをクリックします。
                </li>
                <li>
                  「<span className="font-bold text-stone-800">Create API Key</span>」を実行します。
                </li>
                <li>
                  発行されたコードをコピーし、入力欄に貼り付けしてください。
                </li>
              </ol>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowKeyInstructions(false)}
                className="py-2 px-5 bg-orange-600 hover:bg-orange-700 text-xs font-bold text-white rounded-xl transition-all shadow-md shadow-orange-500/10 cursor-pointer"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};