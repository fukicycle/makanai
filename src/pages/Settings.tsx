import React, { useState } from 'react';
import { useApp, FamilyMember, CookingEffort } from '../context/AppContext';
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
  ChefHat
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';

export const Settings: React.FC = () => {
  const { 
    apiKey, 
    familyMembers, 
    cookingEffort,
    saveApiKey, 
    saveFamilyMembers, 
    saveCookingEffort,
    resetApp
  } = useApp();

  const [tempKey, setTempKey] = useState(apiKey);
  const [tempEffort, setTempEffort] = useState<CookingEffort>(cookingEffort);
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
    saveFamilyMembers(members);
    
    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 800);
  };

  return (
    <div className="space-y-6 pb-24 max-w-2xl mx-auto animate-soft-fade">
      {/* ヘッダー */}
      <div className="border-b border-orange-200/50 pb-4 text-left">
        <h2 className="text-xl font-bold text-orange-900 font-serif flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-orange-600" />
          設定
        </h2>
        <p className="text-xs text-stone-500 mt-1">APIキーやご家族の情報などを変更できます。</p>
      </div>

      {/* APIキーの設定 */}
      <div className="glass-card p-5 rounded-2xl border border-stone-200/40 text-left space-y-4">
        <h3 className="text-sm font-bold text-orange-900 border-b border-orange-100 pb-2 flex items-center gap-1.5 font-serif">
          <Key className="w-4 h-4 text-orange-600" />
          Gemini APIキー設定 (BYOK)
        </h3>

        <div className="space-y-2">
          <label className="block text-xs font-bold text-stone-700">APIキー</label>
          <input
            type="password"
            placeholder="AQ.Ab8... または AIzaSy..."
            value={tempKey}
            onChange={(e) => setTempKey(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-white/70 focus:outline-none focus:ring-2 focus:ring-orange-500/50 text-sm font-sans"
          />
        </div>

        <button
          type="button"
          onClick={() => setShowKeyInstructions(true)}
          className="w-full py-2 px-4 bg-stone-100 hover:bg-stone-200 border border-stone-200 rounded-xl text-xs font-bold text-stone-700 flex items-center justify-center gap-1.5 transition-colors"
        >
          <BookOpen className="w-4 h-4 text-orange-600" />
          APIキー取得手順をみる
        </button>
      </div>

      {/* 調理の手間・こしらえ加減設定 */}
      <div className="glass-card p-5 rounded-2xl border border-stone-200/40 text-left space-y-4">
        <h3 className="text-sm font-bold text-orange-900 border-b border-orange-100 pb-2 flex items-center gap-1.5 font-serif">
          <ChefHat className="w-4 h-4 text-orange-600" />
          こしらえ加減（調理の手間）
        </h3>
        <p className="text-xs text-stone-500 leading-relaxed font-serif">
          献立を作る際の調理の複雑さを選びます。ご家庭の忙しさや好みに合わせて「まかなひ」が手加減をいたします。
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { id: 'quick', label: 'さっと（時短）', desc: '15分調理。レンジ等を駆使した爆速メニュー' },
            { id: 'easy', label: 'かんたん（簡単）', desc: '工程3つ以内。材料・調味料少なめの簡単ごはん' },
            { id: 'normal', label: 'いつもの（普通）', desc: 'バランスに長けた一般的な和風家庭料理' },
            { id: 'detailed', label: 'ていねい（丁寧）', desc: 'ひと手間加え、出汁から引いて味わうこだわり献立' }
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

      {/* 家族設定 */}
      <div className="glass-card p-5 rounded-2xl border border-stone-200/40 text-left space-y-4">
        <h3 className="text-sm font-bold text-orange-900 border-b border-orange-100 pb-2 flex items-center gap-1.5 font-serif">
          <Users className="w-4 h-4 text-orange-600" />
          ご家族の情報設定
        </h3>

        <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
          {members.map((member, index) => (
            <div key={member.id} className="p-3 bg-white/50 rounded-xl border border-orange-100 flex flex-col gap-2 relative">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-orange-800 flex items-center gap-1.5 font-serif">
                  家族メンバー #{index + 1}
                </span>
                {members.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveMember(member.id)}
                    className="p-1 text-stone-400 hover:text-red-600 transition-colors"
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
          className="w-full py-2 bg-stone-100 hover:bg-stone-200 rounded-xl text-xs font-bold text-stone-700 flex items-center justify-center gap-1.5 border border-stone-200/50 transition-colors"
        >
          <Plus className="w-4 h-4 text-orange-600" />
          家族を追加する
        </button>
      </div>

      {/* アクションボタン */}
      <div className="flex gap-4">
        <button
          type="button"
          onClick={handleSave}
          disabled={saveStatus === 'saving'}
          className="flex-1 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-xs font-bold text-white rounded-xl shadow-lg shadow-orange-500/10 transition-all flex items-center justify-center gap-1.5"
        >
          {saveStatus === 'saving' ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              保存中でございます...
            </>
          ) : saveStatus === 'saved' ? (
            <>
              <Save className="w-4 h-4 text-orange-200" />
              保存いたしました
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              設定を保存する
            </>
          )}
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
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-xs font-bold text-white rounded-lg transition-colors"
              >
                はい、すべて削除します
              </button>
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-xs font-bold text-stone-700 rounded-lg transition-colors"
              >
                いいえ、やめます
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="py-2.5 px-4 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200/50 rounded-xl text-xs font-bold transition-all"
          >
            アプリデータを完全に初期化する
          </button>
        )}
      </div>

      {/* APIキー発行手順説明モーダル (設定画面用) */}
      <AnimatePresence>
        {showKeyInstructions && createPortal(
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-md"
            onClick={() => setShowKeyInstructions(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.4 }}
              className="w-full max-w-md glass rounded-3xl p-6 shadow-2xl border border-white/60 text-left space-y-4 max-h-[85vh] overflow-y-auto"
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
            </motion.div>
          </motion.div>,
          document.body
        )}
      </AnimatePresence>
    </div>
  );
};