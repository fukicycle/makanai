import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Utensils, 
  Calendar, 
  Sparkles, 
  ChevronRight, 
  Flame, 
  Clock, 
  Users,
  RotateCcw,
  ChefHat,
  ClipboardList
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';

export const Home: React.FC = () => {
  const { 
    menuData, 
    calculateTargetCalories,
    cookingEffort,
    generating,
    generationError,
    generateMenu,
    clearGenerationError
  } = useApp();

  const [showSideDishModal, setShowSideDishModal] = useState(false); // 常備菜モーダル
  const [showRegenerateModal, setShowRegenerateModal] = useState(false); // 再生成モーダル
  const [fridgeContents, setFridgeContents] = useState(''); // 冷蔵庫の余り物
  const [tempFridgeContents, setTempFridgeContents] = useState(''); // 再生成用の冷蔵庫の余り物一時保存
  const navigate = useNavigate();

  const targetCal = calculateTargetCalories();

  // モーダル表示時に背後のスクロールを防ぐ
  useEffect(() => {
    if (showSideDishModal || showRegenerateModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showSideDishModal, showRegenerateModal]);

  // よくある冷蔵庫の食材リスト
  const commonIngredients = {
    '肉類・魚介': ['豚肉', '鶏肉', '牛肉', 'ひき肉', '鮭', '鯖', 'ツナ缶'],
    'お野菜': ['キャベツ', '白菜', '人参', '大根', 'たまねぎ', 'じゃがいも', 'ねぎ', 'ナス', 'トマト', 'ほうれん草', 'キノコ'],
    '豆腐・その他': ['豆腐', '納豆', '卵', 'ちくわ', 'こんにゃく']
  };

  // カンマ区切りのテキストに対して、選択された食材をトグル追加・削除するヘルパー
  const handleToggleIngredientInText = (text: string, ingredient: string): string => {
    const currentItems = text
      .split(/[,、\s]+/)
      .map(item => item.trim())
      .filter(Boolean);

    const index = currentItems.indexOf(ingredient);
    if (index > -1) {
      currentItems.splice(index, 1);
    } else {
      currentItems.push(ingredient);
    }
    return currentItems.join('、');
  };

  const handleGenerateClick = () => {
    generateMenu(fridgeContents);
  };

  const handleRegenerateClick = () => {
    setFridgeContents(tempFridgeContents);
    setShowRegenerateModal(false);
    generateMenu(tempFridgeContents);
  };

  const dayOrderColors = [
    'border-l-orange-500 bg-orange-50/20', // 月
    'border-l-emerald-600 bg-emerald-50/20', // 火
    'border-l-amber-500 bg-amber-50/20', // 水
    'border-l-amber-600 bg-yellow-50/20', // 木
    'border-l-rose-500 bg-red-50/20', // 金
    'border-l-emerald-500 bg-green-50/20', // 土
    'border-l-orange-600 bg-orange-50/30' // 日
  ];

  return (
    <div className="relative flex flex-col h-full overflow-hidden animate-soft-fade">
      {/* 固定上部ヘッダー（スクロールしない固定部） */}
      <div className="p-4 border-b border-orange-200/50 flex items-center justify-between gap-4 shrink-0 bg-gradient-to-b from-amber-50/10 to-transparent">
        <div className="text-left">
          <h2 className="text-xl font-bold text-orange-900 font-serif flex items-center gap-2">
            <Utensils className="w-5 h-5 text-orange-600" />
            一週間の献立
          </h2>
          <p className="text-xs text-stone-500 mt-1 font-serif">ご家族の健康と団らんを支える一汁一菜でございます。</p>
        </div>

        {/* 家族カロリー概要 */}
        <div className="flex items-center gap-3 px-4 py-2 bg-orange-50/70 border border-orange-200/40 rounded-xl shrink-0">
          <Users className="w-4 h-4 text-orange-600" />
          <div className="text-left">
            <p className="text-[10px] text-stone-500 font-serif leading-none">推定必要カロリー</p>
            <p className="text-sm font-bold text-orange-800 font-sans mt-1">{targetCal} <span className="text-xs font-serif font-normal">kcal/日</span></p>
          </div>
        </div>
      </div>

      {/* スクロール可能なコンテンツエリア */}
      <div className="flex-grow overflow-y-auto p-4 space-y-6 pb-44">
        
        {/* 生成中ローディング */}
        {generating && (
          <div className="glass-card rounded-3xl p-10 text-center max-w-md mx-auto space-y-6 border border-white/80 min-h-[300px] flex flex-col justify-center items-center animate-soft-fade my-6">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 border-orange-200/50" />
              <div className="absolute inset-0 rounded-full border-4 border-t-orange-600 animate-spin" />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-bold text-orange-900 font-serif">まかなひが献立を思案中でございます...</p>
              <p className="text-xs text-stone-500 leading-relaxed">
                ご家族に必要なカロリーを計算し、<br />重複なく食材を使い回せる温かいお品書きを整えております。
              </p>
            </div>
            <p className="text-[10px] text-stone-400">※別の画面に移動してもバックグラウンドで引き続き作成いたします。</p>
          </div>
        )}

        {/* メニュー未生成時フォーム */}
        {!menuData && !generating && (
          <div className="space-y-6">
            <div className="glass-card rounded-3xl p-6 md:p-8 text-center max-w-md mx-auto space-y-6 border border-white/80 shadow-xl">
              <div className="inline-flex items-center justify-center p-4 bg-orange-500/10 rounded-full">
                <Sparkles className="w-8 h-8 text-orange-600" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-stone-800 font-serif">まだ献立がございません</h3>
                <p className="text-xs text-stone-500 leading-relaxed max-w-xs mx-auto">
                  ご入力いただいた家族構成に基づき、栄養に長けた1週間分の和風夕食をGeminiが提案いたします。
                </p>
              </div>

              {/* 現在のこしらえ加減の簡易インジケータ */}
              <div className="p-3.5 bg-stone-100/60 rounded-xl border border-stone-200/30 flex items-center justify-between text-left">
                <div className="flex items-center gap-2">
                  <ChefHat className="w-4 h-4 text-orange-600 shrink-0" />
                  <div className="leading-tight">
                    <span className="text-[10px] text-stone-400 block font-serif">現在のこしらえ加減</span>
                    <span className="text-xs font-bold font-serif text-stone-700">
                      {cookingEffort === 'quick' && 'さっと（時短）'}
                      {cookingEffort === 'easy' && 'かんたん（簡単）'}
                      {cookingEffort === 'normal' && 'いつもの（普通）'}
                      {cookingEffort === 'detailed' && 'ていねい（丁寧）'}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => navigate('/settings')} 
                  className="text-[10px] text-orange-600 hover:underline font-bold font-serif"
                >
                  設定で変更
                </button>
              </div>

              {/* 冷蔵庫ののぞき（余り物）入力欄（視認性向上・大きいフォントサイズ） */}
              <div className="space-y-3.5 text-left border-t border-stone-200/40 pt-4">
                <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5 font-serif">
                  <ClipboardList className="w-4 h-4 text-orange-600" />
                  冷蔵庫の余り物（優先使用・任意）
                </label>

                {/* 食材のクイック選択 - 視認性が高く押しやすいサイズへ変更 */}
                <div className="space-y-2 bg-stone-50/70 p-3 rounded-2xl border border-stone-200/30">
                  <p className="text-xs font-bold text-stone-600 font-serif">食材をぽちっと選択できます：</p>
                  <div className="space-y-2">
                    {Object.entries(commonIngredients).map(([category, items]) => (
                      <div key={category} className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-extrabold text-stone-500 font-serif w-16 shrink-0">{category}</span>
                        <div className="flex flex-wrap gap-1.5 flex-grow">
                          {items.map(item => {
                            const isSelected = fridgeContents
                              .split(/[,、\s]+/)
                              .map(i => i.trim())
                              .includes(item);
                            return (
                              <button
                                key={item}
                                type="button"
                                onClick={() => setFridgeContents(prev => handleToggleIngredientInText(prev, item))}
                                className={`px-2.5 py-1 rounded-full text-xs font-serif border transition-all cursor-pointer ${
                                  isSelected
                                    ? 'bg-orange-500/15 border-orange-400 text-orange-800 font-bold shadow-xs'
                                    : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-100 font-medium'
                                }`}
                              >
                                {item}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <textarea
                  rows={2}
                  placeholder="上のボタンで食材を選ぶか、ここへ直接ご入力ください（例：キャベツ半分、豆腐1丁、余った豚バラ肉など）"
                  value={fridgeContents}
                  onChange={(e) => setFridgeContents(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-stone-200 bg-white/70 focus:outline-none focus:ring-1 focus:ring-orange-500/50 font-serif leading-relaxed font-semibold text-stone-800"
                />
                <p className="text-[10px] text-stone-400 leading-normal font-serif">
                  ※入力された食材を、週の前半（月〜水曜日あたり）に優先的に組み込んで無駄なく使い切る献立にいたします。
                </p>
              </div>

              {generationError && (
                <div className="p-3 bg-red-50 text-red-600 border border-red-200 rounded-xl text-xs text-left font-serif flex items-center justify-between gap-1">
                  <span>{generationError}</span>
                  <button onClick={clearGenerationError} className="text-[10px] text-red-800 hover:underline font-bold">閉じる</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 献立リスト（生成済み） */}
        {menuData && !generating && (
          <div className="space-y-6">
            {/* 生成日時 */}
            <div className="flex justify-between items-center text-xs text-stone-400 font-sans px-1">
              <span className="flex items-center gap-1 font-serif">
                <Calendar className="w-3.5 h-3.5" />
                献立作成日: {new Date(menuData.generatedAt).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
              <button
                onClick={() => {
                  setTempFridgeContents(fridgeContents);
                  setShowRegenerateModal(true);
                }}
                className="flex items-center gap-1 text-orange-600 hover:text-orange-700 transition-colors font-bold font-serif cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                献立を作り直す
              </button>
            </div>

            {generationError && (
              <div className="p-3 bg-red-50 text-red-600 border border-red-200 rounded-xl text-xs text-left font-serif flex items-center justify-between gap-1">
                <span>{generationError}</span>
                <button onClick={clearGenerationError} className="text-[10px] text-red-800 hover:underline font-bold">閉じる</button>
              </div>
            )}

            {/* 今週のこしらえ作り置き（常備菜）カード */}
            {menuData.makeAheadSideDish && (
              <div
                onClick={() => setShowSideDishModal(true)}
                className="glass-card p-5 rounded-3xl border border-emerald-200/50 bg-emerald-50/10 text-left flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 cursor-pointer hover:shadow-lg transition-all transform hover:-translate-y-0.5 hover:scale-[1.005]"
              >
                <div className="flex gap-3 items-start">
                  <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-emerald-700 shrink-0">
                    <ChefHat className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-emerald-800 font-bold bg-emerald-100 px-2.5 py-0.5 rounded-full font-serif inline-block">今週のこしらえ作り置き（常備菜）</span>
                    <h3 className="text-base font-bold text-stone-800 font-serif mt-1">{menuData.makeAheadSideDish.dishName}</h3>
                    <p className="text-xs text-stone-500 line-clamp-1 leading-normal font-serif mt-0.5">{menuData.makeAheadSideDish.description}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowSideDishModal(true);
                  }}
                  className="w-full sm:w-auto py-2 px-5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-700/10 shrink-0 font-serif cursor-pointer"
                >
                  こしらえ方を見る
                </button>
              </div>
            )}

            {/* 曜日別カード */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {menuData.days.map((day, index) => (
                <div
                  key={day.dayName}
                  onClick={() => navigate(`/recipe/${index}`)}
                  className={`glass-card p-5 rounded-2xl border-l-4 ${dayOrderColors[index % 7]} text-left cursor-pointer flex flex-col justify-between hover:shadow-lg transition-all border border-stone-200/40 transform hover:-translate-y-0.5 hover:scale-[1.01]`}
                >
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-stone-700 font-serif">{day.dayName}</span>
                      <span className="text-xs text-stone-500 font-sans flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5 text-orange-500" />
                        {day.calories} kcal
                      </span>
                    </div>
                    {day.mainDishName && day.soupName ? (
                      <div className="space-y-1 my-1.5">
                        <div className="text-sm font-bold text-stone-800 font-serif leading-tight flex items-center gap-1.5">
                          <span className="text-[9px] text-orange-700 bg-orange-50 px-1.5 py-0.5 rounded border border-orange-200/30 shrink-0 font-sans">主菜</span>
                          <span className="line-clamp-1">{day.mainDishName}</span>
                        </div>
                        <div className="text-sm font-bold text-stone-700 font-serif leading-tight flex items-center gap-1.5">
                          <span className="text-[9px] text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/30 shrink-0 font-sans">汁物</span>
                          <span className="line-clamp-1">{day.soupName}</span>
                        </div>
                      </div>
                    ) : (
                      <h3 className="text-base font-bold text-stone-800 font-serif leading-snug line-clamp-2">
                        {day.dishName}
                      </h3>
                    )}
                    <p className="text-xs text-stone-500 mt-2 line-clamp-3 leading-relaxed">
                      {day.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-stone-200/20 flex justify-between items-center text-xs text-orange-700 font-bold font-serif">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      レシピとお品書きを見る
                    </span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 画面下部に浮き上がるFABスタイルの固定アクションピル（コンテナ底部からぴったり沿うように絶対配置し、PC・スマホ問わず理想的な操作位置に固定！） */}
      {!menuData && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40 w-full max-w-sm px-4">
          <button
            type="button"
            onClick={handleGenerateClick}
            disabled={generating}
            className="w-full py-3.5 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-sm font-bold text-white rounded-full shadow-2xl shadow-orange-500/30 hover:shadow-orange-500/40 transition-all flex items-center justify-center gap-2 cursor-pointer border border-white/20 transform hover:scale-[1.02] active:scale-95 duration-200"
          >
            {generating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                まかなひが献立を思案中でございます...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                一週間の献立を提案してもらう
              </>
            )}
          </button>
        </div>
      )}

      {/* 常備菜詳細モーダル */}
      {showSideDishModal && menuData && menuData.makeAheadSideDish && createPortal(
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-md animate-overlay-fade-in"
          onClick={() => setShowSideDishModal(false)}
        >
          <div
            className="w-full max-w-lg bg-white border border-stone-200/50 shadow-2xl rounded-3xl p-6 text-left space-y-4 max-h-[85vh] overflow-y-auto animate-modal-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 border-b border-emerald-200 pb-2">
              <ChefHat className="w-5 h-5 text-emerald-700" />
              <h3 className="text-base font-bold text-stone-800 font-serif">今週の作り置き常備菜（副菜）</h3>
            </div>

            <div className="space-y-4 text-xs text-stone-700 leading-relaxed">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-emerald-800 font-serif">{menuData.makeAheadSideDish.dishName}</h4>
                <p className="text-stone-500 font-serif leading-relaxed">{menuData.makeAheadSideDish.description}</p>
              </div>

              <div className="space-y-2 border-t border-stone-200/40 pt-3">
                <h5 className="font-bold text-emerald-800 font-serif">ご用意いただく食材（つくりやすい分量）</h5>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 list-disc list-inside bg-white/40 p-3 rounded-xl border border-stone-200/10">
                  {menuData.makeAheadSideDish.ingredients.map((ing, idx) => (
                    <li key={idx} className="font-serif text-stone-600">
                      <span className="font-bold text-stone-800">{ing.name}</span>: {ing.amount}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2 border-t border-stone-200/40 pt-3">
                <h5 className="font-bold text-emerald-800 font-serif">こしらえ方（調理手順）</h5>
                <ol className="space-y-3">
                  {menuData.makeAheadSideDish.recipeSteps.map((step, idx) => (
                    <li key={idx} className="flex gap-3 items-start font-serif">
                      <span className="w-5 h-5 bg-emerald-100 border border-emerald-200 rounded-full flex items-center justify-center font-bold text-emerald-700 shrink-0 font-sans text-[10px] mt-0.5">{idx + 1}</span>
                      <span className="pt-0.5">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            <div className="flex justify-end border-t border-stone-200/40 pt-3">
              <button
                type="button"
                onClick={() => setShowSideDishModal(false)}
                className="py-2.5 px-6 bg-emerald-700 hover:bg-emerald-800 text-xs font-bold text-white rounded-xl transition-all shadow-md shadow-emerald-700/10 cursor-pointer"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* 献立の再思案（冷蔵庫の余り物選択）モーダル */}
      {showRegenerateModal && createPortal(
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-md animate-overlay-fade-in"
          onClick={() => setShowRegenerateModal(false)}
        >
          <div
            className="w-full max-w-lg bg-white border border-stone-200/50 shadow-2xl rounded-3xl p-6 text-left space-y-4 max-h-[85vh] overflow-y-auto animate-modal-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 border-b border-orange-200 pb-2">
              <RotateCcw className="w-5 h-5 text-orange-700" />
              <h3 className="text-base font-bold text-stone-800 font-serif">献立の再思案（冷蔵庫の中身を選択）</h3>
            </div>

            <div className="space-y-4 text-xs text-stone-700 leading-relaxed">
              <p className="text-stone-500 font-serif leading-relaxed">
                冷蔵庫に余っている食材を指定して、まかなひに一週間分の献立を再び思案してもらうことができます。
              </p>

              {/* 食材のクイック選択 */}
              <div className="space-y-3 bg-stone-50/50 p-3 rounded-xl border border-stone-200/30">
                <p className="text-xs font-bold text-stone-600 font-serif">食材を選べます（ぽちっと押すと追加・削除されます）：</p>
                <div className="space-y-2">
                  {Object.entries(commonIngredients).map(([category, items]) => (
                    <div key={category} className="space-y-1">
                      <span className="text-[10px] font-bold text-stone-400 font-serif block">{category}</span>
                      <div className="flex flex-wrap gap-1.5">
                        {items.map(item => {
                          const isSelected = tempFridgeContents
                            .split(/[,、\s]+/)
                            .map(i => i.trim())
                            .includes(item);
                          return (
                            <button
                              key={item}
                              type="button"
                              onClick={() => setTempFridgeContents(prev => handleToggleIngredientInText(prev, item))}
                              className={`px-2.5 py-1 rounded-full text-xs font-serif border transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-orange-500/10 border-orange-400 text-orange-800 font-semibold'
                                  : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-100'
                              }`}
                            >
                              {item}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5 font-serif">
                  <ClipboardList className="w-3.5 h-3.5 text-orange-600" />
                  選択された余り物・食材詳細
                </label>
                <textarea
                  rows={3}
                  placeholder="上のボタンで食材を選ぶか、ここへ直接ご入力ください（例：大根半分、残りの牛肉など）"
                  value={tempFridgeContents}
                  onChange={(e) => setTempFridgeContents(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 bg-white/70 focus:outline-none focus:ring-1 focus:ring-orange-500/50 font-serif leading-relaxed"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-stone-200/40 pt-3">
              <button
                type="button"
                onClick={() => setShowRegenerateModal(false)}
                className="py-2.5 px-4 bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                閉じる
              </button>
              <button
                type="button"
                onClick={handleRegenerateClick}
                className="py-2.5 px-5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-orange-600/10 cursor-pointer flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                まかなひに再思案を頼む
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};