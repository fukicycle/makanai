import React, { useState, useEffect } from 'react';
import { useApp, FamilyMember, CookingEffort, FontSize } from '../context/AppContext';
import { 
  Settings as SettingsIcon, 
  Key, 
  Users, 
  Trash2, 
  Plus, 
  RefreshCw, 
  Save, 
  ShieldAlert,
  ExternalLink,
  BookOpen,
  ChefHat,
  Type
} from 'lucide-react';
import { createPortal } from 'react-dom';

export const Settings: React.FC = () => {
  const { 
    apiKey, 
    familyMembers, 
    cookingEffort,
    fontSize,
    saveApiKey, 
    saveFamilyMembers, 
    saveCookingEffort,
    saveFontSize,
    resetApp
  } = useApp();

  const [tempKey, setTempKey] = useState(apiKey);
  const [tempEffort, setTempEffort] = useState<CookingEffort>(cookingEffort);
  const [tempFontSize, setTempFontSize] = useState<FontSize>(fontSize);
  const [members, setMembers] = useState<FamilyMember[]>(familyMembers);
  const [showKeyInstructions, setShowKeyInstructions] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  // 家族メンバーの追加・削除
  const handleAddMember = () => {
    const id = Date.now().toString();
    setMembers([
      ...members, 
      { id, name: `家族${members.length + 1}`, birthDate: '1995-01-01', gender: 'male' }
    ]);
  };

  const handleRemoveMember = (id: string) => {
    if (members.length === 1) return; // 最小1名
    setMembers(members.filter(m => m.id !== id));
  };

  const handleMemberChange = (id: string, field: keyof FamilyMember, value: string) => {
    setMembers(
      members.map(m => m.id === id ? { ...m, [field]: value } : m)
    );
  };

  // 設定の保存
  const handleSave = () => {
    setSaveStatus('saving');
    saveApiKey(tempKey);
    saveCookingEffort(tempEffort);
    saveFontSize(tempFontSize);
    saveFamilyMembers(members);
    
    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 800);
  };

  // モーダル表示時に背後のスクロールを防ぐ
  useEffect(() => {
    if (showKeyInstructions) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showKeyInstructions]);

  return (
    <div className="relative flex flex-col h-full overflow-hidden animate-soft-fade">
      {/* 固定ヘッダー */}
      <div className="p-4 border-b border-orange-200/50 text-left bg-gradient-to-b from-amber-50/10 to-transparent shrink-0">
        <h2 className="text-xl font-bold text-orange-900 font-serif flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-orange-600" />
          設定
        </h2>
        <p className="text-xs text-stone-500 mt-1 font-serif">アプリの接続キー、家族構成、文字サイズ、調理の手間などの各種設定を行います。</p>
      </div>

      {/* スクロールする設定領域 */}
      <div className="flex-grow overflow-y-auto p-4 space-y-6 pb-44">
        {/* Gemini APIキー設定 */}
        <div className="glass-card p-5 rounded-2xl border border-stone-200/40 text-left space-y-4">
          <h3 className="text-sm font-bold text-orange-900 border-b border-orange-100 pb-2 flex items-center gap-1.5 font-serif">
            <Key className="w-4 h-4 text-orange-600" />
            Gemini APIキー設定
          </h3>
          <p className="text-xs text-stone-500 leading-relaxed font-serif">
            献立生成機能を利用するためにご自身のGemini APIキーを設定してください。キーは安全にお使いのデバイスのみに保存されます。
          </p>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-stone-700">APIキー</label>
            <div className="relative">
              <input
                type="password"
                placeholder={apiKey ? "••••••••••••••••" : "キーが未設定でございます"}
                value={tempKey}
                onChange={(e) => setTempKey(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white/50 focus:outline-none focus:ring-1 focus:ring-orange-500 text-sm font-sans"
              />
              <Key className="absolute right-3 top-3.5 w-4 h-4 text-stone-400" />
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowKeyInstructions(true)}
            className="w-full py-2.5 px-4 bg-stone-100/60 hover:bg-stone-100 border border-stone-200/50 rounded-xl text-xs font-bold text-stone-700 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-orange-600" />
            APIキーの取得手順はこちら
          </button>
        </div>

        {/* 調理の手間・こしらえ加減設定 */}
        <div className="glass-card p-5 rounded-2xl border border-stone-200/40 text-left space-y-4">
          <h3 className="text-sm font-bold text-orange-900 border-b border-orange-100 pb-2 flex items-center gap-1.5 font-serif">
            <ChefHat className="w-4 h-4 text-orange-600" />
            調理の手間（こしらえ加減）設定
          </h3>
          <p className="text-xs text-stone-500 leading-relaxed font-serif">
            毎日の夕食づくりの状況に合わせ、AIが提案するレシピの細かさや調理手順の難易度を調整できます。
          </p>

          <div className="grid grid-cols-2 gap-3">
            {[
              { id: 'quick', label: 'さっと（時短）', desc: '電子レンジやフライパン1つ、市販品等を活用。15分前後でスピーディに完了する手順。' },
              { id: 'easy', label: 'かんたん（簡単）', desc: '初心者でも失敗のない基本の調味料とシンプル手順。3〜4ステップ以内。' },
              { id: 'normal', label: 'いつもの（普通）', desc: 'バランス良く飽きのこない標準的な家庭の和風メニュー。5ステップ前後。' },
              { id: 'detailed', label: 'ていねい（丁寧）', desc: '出汁からじっくり引くなど手間を楽しむこだわり和食。本格的な味わい。' }
            ].map((opt) => {
              const isSelected = tempEffort === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setTempEffort(opt.id as CookingEffort)}
                  className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                    isSelected
                      ? 'border-orange-500 bg-orange-50/40 shadow-sm'
                      : 'border-stone-200 bg-white/40 hover:bg-white/80'
                  }`}
                >
                  <span className={`text-xs font-bold font-serif ${isSelected ? 'text-orange-800' : 'text-stone-700'}`}>
                    {opt.label}
                  </span>
                  <span className="text-[10px] text-stone-500 leading-normal mt-1.5">
                    {opt.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 文字の大きさ設定 */}
        <div className="glass-card p-5 rounded-2xl border border-stone-200/40 text-left space-y-4">
          <h3 className="text-sm font-bold text-orange-900 border-b border-orange-100 pb-2 flex items-center gap-1.5 font-serif">
            <Type className="w-4 h-4 text-orange-600" />
            文字の大きさ設定
          </h3>
          <p className="text-xs text-stone-500 leading-relaxed font-serif">
            アプリ全体の文字の大きさを選べます。読みやすさを考慮し、「普通」を選択した場合でも、レシピなどの重要な文字は16px以上の大きさで表示いたします。
          </p>

          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'small', label: '小さめ', desc: '詳細をコンパクトに' },
              { id: 'normal', label: '普通（推奨）', desc: '16px基準の標準サイズ' },
              { id: 'large', label: '大きめ', desc: '視認重視の大きな文字' }
            ].map((opt) => {
              const isSelected = tempFontSize === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setTempFontSize(opt.id as FontSize)}
                  className={`p-3 rounded-2xl border text-center flex flex-col justify-between transition-all cursor-pointer ${
                    isSelected
                      ? 'border-orange-500 bg-orange-50/40 shadow-sm'
                      : 'border-stone-200 bg-white/40 hover:bg-white/80'
                  }`}
                >
                  <span className={`text-xs font-bold font-serif mx-auto ${isSelected ? 'text-orange-800' : 'text-stone-700'}`}>
                    {opt.label}
                  </span>
                  <span className="text-[9px] text-stone-500 leading-normal mt-1 mx-auto">
                    {opt.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 家族設定 */}
        <div className="glass-card p-5 rounded-2xl border border-stone-200/40 text-left space-y-4">
          <h3 className="text-sm font-bold text-orange-900 border-b border-orange-100 pb-2 flex items-center gap-1.5 font-serif">
            <Users className="w-4 h-4 text-orange-600" />
            ご家族の情報設定
          </h3>
          <p className="text-xs text-stone-500 leading-relaxed font-serif">
            年齢や性別に応じて必要な夕食目標摂取カロリーを自動計算し、栄養バランスの良い献立作成に役立てます。
          </p>

          <div className="space-y-3">
            {members.map((member, index) => (
              <div key={member.id} className="p-3 bg-stone-50/50 rounded-xl border border-stone-200/30 flex flex-col gap-2 relative">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-orange-800 flex items-center gap-1.5 font-serif">
                    家族メンバー #{index + 1}
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

        {/* 危険ゾーン (アプリ初期化) */}
        <div className="p-5 border border-red-200/60 rounded-2xl bg-red-50/20 text-left space-y-4">
          <h3 className="text-xs font-bold text-red-800 flex items-center gap-1.5 font-serif">
            <ShieldAlert className="w-4 h-4 text-red-600" />
            危険区域（データの管理）
          </h3>
          <p className="text-[11px] text-stone-500 leading-relaxed font-serif">
            「まかなひ」のデータをすべて初期化します。登録したAPIキー、ご家族情報、作成された1週間分のすべての献立とレシピ、買い物リストのチェックが、デバイス上から完全に消去されます。この操作は元に戻せません。
          </p>

          {showResetConfirm ? (
            <div className="p-3 bg-red-50 rounded-xl border border-red-200 space-y-3">
              <p className="text-[11px] font-bold text-red-700 font-serif">本当に「まかなひ」のデータをすべて削除し、初期状態に戻してもよろしいでしょうか？</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={resetApp}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-xs font-bold text-white rounded-lg transition-colors cursor-pointer"
                >
                  はい、すべて削除します
                </button>
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(false)}
                  className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-xs font-bold text-stone-700 rounded-lg transition-colors cursor-pointer"
                >
                  いいえ、やめます
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="py-2.5 px-4 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200/50 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              アプリデータを完全に初期化する
            </button>
          )}
        </div>
      </div>

      {/* 画面下部に浮き上がるFABスタイルの固定アクションピル（コンテナ底部からぴったり沿うように絶対配置し、PC・スマホ問わず理想的な操作位置に固定！） */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40 w-full max-w-sm px-4">
        <button
          type="button"
          onClick={handleSave}
          disabled={saveStatus === 'saving'}
          className="w-full py-3.5 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-sm font-bold text-white rounded-full shadow-2xl shadow-orange-500/30 hover:shadow-orange-500/40 transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-white/20 transform hover:scale-[1.02] active:scale-95 duration-200 animate-soft-fade"
        >
          {saveStatus === 'saving' ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              設定を保存中でございます...
            </>
          ) : saveStatus === 'saved' ? (
            <>
              <Save className="w-4 h-4 text-orange-200 animate-bounce" />
              設定を保存いたしました
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              設定を保存する
            </>
          )}
        </button>
      </div>

      {/* APIキー発行手順説明モーダル (設定画面用) */}
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

            <div className="text-xs text-stone-600 space-y-3 leading-relaxed">
              <p className="font-bold text-red-600">
                ※重要：APIキーを取得するためにはGoogleアカウント（無料）が必要になります。あらかじめログイン可能なアカウントをご用意ください。
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
                  利用規約などの確認が出た場合は、内容に同意をして進めてください。
                </li>
                <li>
                  画面上部にある「<span className="font-bold text-stone-800">Get API key</span>」というボタン、あるいは「Create API key」をクリックします。
                </li>
                <li>
                  プロジェクトを選択するか、新しくプロジェクトを作成して「<span className="font-bold text-stone-800">Create API Key</span>」を実行します。
                </li>
                <li>
                  発行された英数字の長いコード（「AQ.」または「AIza」から始まるもの）がAPIキーでございます。これをコピーし、本アプリの入力欄に貼り付けしてください。
                </li>
              </ol>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowKeyInstructions(false)}
                className="py-2 px-5 bg-orange-600 hover:bg-orange-700 text-xs font-bold text-white rounded-xl transition-all cursor-pointer"
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