import React, { useState } from 'react';
import { useApp, FamilyMember } from '../context/AppContext';
import { 
  Heart, 
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
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';

export const Onboarding: React.FC = () => {
  const { saveApiKey, saveFamilyMembers, completeOnboarding } = useApp();
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

  // APIキーの簡易バリデーション
  const handleNextStepFromKey = () => {
    const trimmedKey = tempKey.trim();
    if (!trimmedKey) {
      setKeyError('APIキーの入力は必須でございます。');
      return;
    }
    if (!trimmedKey.startsWith('AQ.') && !trimmedKey.startsWith('AIza')) {
      setKeyError('APIキーの形式が正しくない可能性がございます（通常は「AQ.」または「AIza」から始まります）。コピー時に余分な文字が入っていないかご確認ください。');
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

  // ふんわりとしたアニメーション設定
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.4, ease: 'easeInOut' as any },
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
      transition: { duration: 0.3, ease: 'easeInOut' as any },
    }),
  };

  const [direction, setDirection] = useState(1);

  const navigateStep = (nextStep: number) => {
    setDirection(nextStep > step ? 1 : -1);
    setStep(nextStep);
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-amber-50 via-orange-100/40 to-green-50/50 overflow-hidden">
      {/* 背景のやわらかい和風の光の玉 */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-orange-200/40 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-emerald-100/40 blur-3xl pointer-events-none" />

      {/* オンボーディングカード (Glassmorphismベース) */}
      <div className="relative w-full max-w-lg glass rounded-3xl p-6 md:p-8 shadow-2xl border border-white/50 backdrop-blur-xl flex flex-col justify-between min-h-[550px]">
        
        {/* ロゴとタイトル */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center p-3 bg-orange-500/10 rounded-2xl mb-2 border border-orange-500/20">
            <Heart className="w-8 h-8 text-orange-600" />
          </div>
          <h1 className="text-2xl font-bold tracking-wider text-orange-800 font-serif">まかなひ</h1>
          <p className="text-xs text-stone-500 mt-1 font-serif">和みの献立と、健やかな食卓</p>
        </div>

        {/* コンテンツエリア */}
        <div className="flex-grow flex flex-col justify-center relative overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            {step === 1 && (
              <motion.div
                key="step1"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="space-y-4"
              >
                <div className="text-center space-y-3">
                  <h2 className="text-lg font-semibold text-stone-800 border-b border-orange-200 pb-2">ようこそ、まかなひへ</h2>
                  <p className="text-sm text-stone-600 leading-relaxed text-left">
                    「まかなひ」は、ご家族の健康と日々の団らんを支えるため、1週間分の夜ご飯の献立とレシピ、買い物リストを自動で提案する食卓支援アプリでございます。
                  </p>
                  <p className="text-sm text-stone-600 leading-relaxed text-left">
                    日々の「夕食作りの悩み」から解放され、バランスの良い美味しい食事をふんわりとお届けいたします。
                  </p>
                </div>

                <div className="p-4 bg-orange-50/60 rounded-2xl border border-orange-200/30 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="text-left">
                    <h3 className="text-xs font-bold text-stone-800">安全なデータ管理</h3>
                    <p className="text-xs text-stone-500 leading-relaxed mt-1">
                      ご入力いただくAPIキーやご家族の誕生日、生成されたレシピなどの個人情報は、すべてご利用者様のデバイス（LocalStorage）にのみ安全に保存されます。サーバーへ送信されることはございませんので、ご安心ください。
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200/30 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                  <div className="text-left">
                    <h3 className="text-xs font-bold text-stone-800">Googleアカウント必須の注意書き</h3>
                    <p className="text-xs text-stone-500 leading-relaxed mt-1">
                      このアプリでは、生成AI「Gemini」を利用するためにご自身のAPIキー（BYOK方式）を設定いただく必要がございます。このAPIキーを取得するには**Googleアカウント**が必須となりますので、あらかじめご用意をお願いいたします。
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="space-y-4"
              >
                <div className="text-center space-y-2">
                  <h2 className="text-lg font-semibold text-stone-800 border-b border-orange-200 pb-2">APIキー（Gemini）の設定</h2>
                  <p className="text-xs text-stone-600 leading-relaxed text-left">
                    本アプリは、Googleの最新AI「Gemini」を用いて献立を作ります。無料でも利用可能なご自身のAPIキーをご入力ください。
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-stone-700">Gemini APIキー</label>
                  <div className="relative">
                    <input
                      type="password"
                      placeholder="AQ.Ab8... または AIzaSy..."
                      value={tempKey}
                      onChange={(e) => setTempApiKey(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-white/70 focus:outline-none focus:ring-2 focus:ring-orange-500/50 text-sm font-sans"
                    />
                    <Key className="absolute right-3 top-3 w-5 h-5 text-stone-400" />
                  </div>
                  {keyError && <p className="text-xs text-red-600 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> {keyError}</p>}
                </div>

                <button
                  type="button"
                  onClick={() => setShowKeyInstructions(true)}
                  className="w-full py-2.5 px-4 bg-white/40 hover:bg-white/80 border border-stone-200 rounded-xl text-xs font-bold text-stone-700 flex items-center justify-center gap-2 transition-all"
                >
                  <BookOpen className="w-4 h-4 text-orange-600" />
                  APIキーの取得手順はこちら
                </button>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="space-y-4"
              >
                <div className="text-center space-y-2">
                  <h2 className="text-lg font-semibold text-stone-800 border-b border-orange-200 pb-2">ご家族の構成と誕生日</h2>
                  <p className="text-xs text-stone-600 leading-relaxed text-left">
                    ご入力いただいた生年月日から現在の年齢を算出し、厚生労働省の栄養摂取基準に沿って、ご家族に必要な夕食全体の目安カロリーを自動計算いたします。
                  </p>
                </div>

                <div className="max-h-56 overflow-y-auto pr-1 space-y-3">
                  {members.map((member, index) => (
                    <div key={member.id} className="p-3 bg-white/50 rounded-xl border border-orange-100 flex flex-col gap-2 relative">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-orange-800 flex items-center gap-1.5 font-serif">
                          <Users className="w-3.5 h-3.5 text-orange-600" />
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
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 下部ボタンエリア */}
        <div className="mt-6 pt-4 border-t border-stone-200/40 flex items-center justify-between">
          <div>
            {step > 1 ? (
              <button
                type="button"
                onClick={() => navigateStep(step - 1)}
                className="py-2.5 px-4 rounded-xl border border-stone-200 text-xs font-bold text-stone-600 hover:bg-white/50 flex items-center gap-1 transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
                戻る
              </button>
            ) : (
              <div className="w-10" />
            )}
          </div>

          {/* インジケータ */}
          <div className="flex gap-1.5">
            {[1, 2, 3].map((s) => (
              <span
                key={s}
                className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                  s === step ? 'bg-orange-500' : 'bg-stone-300'
                }`}
              />
            ))}
          </div>

          <div>
            {step === 1 && (
              <button
                type="button"
                onClick={() => navigateStep(2)}
                className="py-2.5 px-5 rounded-xl bg-orange-600 hover:bg-orange-700 text-xs font-bold text-white flex items-center gap-1.5 shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 transition-all"
              >
                始める
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
            {step === 2 && (
              <button
                type="button"
                onClick={handleNextStepFromKey}
                className="py-2.5 px-5 rounded-xl bg-orange-600 hover:bg-orange-700 text-xs font-bold text-white flex items-center gap-1.5 shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 transition-all"
              >
                次へ
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
            {step === 3 && (
              <button
                type="button"
                onClick={handleFinishOnboarding}
                className="py-2.5 px-5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-xs font-bold text-white flex items-center gap-1.5 shadow-lg shadow-emerald-700/20 hover:shadow-emerald-700/30 transition-all"
              >
                設定完了
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* APIキー発行手順説明モーダル (Glassmorphismベース) */}
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
                    画面上部にある「<span className="font-bold text-stone-800">Get API key</span>」というボタン, あるいは「Create API key」をクリックします。
                  </li>
                  <li>
                    プロジェクトを選択するか、新しくプロジェクトを作成して「<span className="font-bold text-stone-800">Create API Key</span>」を実行します。
                  </li>
                  <li>
                    発行された英数字の長いコード（「AQ.」または「AIza」から始まるもの）がAPIキーでございます。これをコピーし、本アプリの入力欄に貼り付けしてください。
                  </li>
                </ol>
                <p className="p-3 bg-stone-100 rounded-xl text-[11px] text-stone-500">
                  ヒント：Google AI StudioのAPIキーは無料枠が提供されております。1分間あたりのリクエスト数などの制限の範囲内であれば、料金は発生いたしませんので安心してご利用いただけます。
                </p>
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
            </motion.div>
          </motion.div>,
          document.body
        )}
      </AnimatePresence>
    </div>
  );
};