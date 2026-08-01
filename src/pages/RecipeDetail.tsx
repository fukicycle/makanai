import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  ChevronLeft, 
  Flame, 
  BookOpen, 
  Layers, 
  CheckCircle, 
  MessageSquare,
  Play,
  X,
  ChevronRight,
  Sparkles
} from 'lucide-react';

export const RecipeDetail: React.FC = () => {
  const { dayIndex } = useParams<{ dayIndex: string }>();
  const { menuData } = useApp();
  const navigate = useNavigate();

  // お料理開始モードの状態管理
  const [isCookingMode, setIsCookingMode] = useState(false);
  const [cookingType, setCookingType] = useState<'main' | 'soup'>('main');
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false); // 調理完了画面
  const [checkedIngredients, setCheckedIngredients] = useState<Record<string, boolean>>({});

  if (!menuData) {
    return (
      <div className="flex flex-col h-full overflow-hidden items-center justify-center p-4 text-center space-y-4 font-serif">
        <p className="text-sm text-stone-500">献立データが見つかりませんでした。</p>
        <button
          onClick={() => navigate('/')}
          className="px-5 py-2.5 bg-orange-600 text-white rounded-xl text-xs font-bold cursor-pointer"
        >
          ホームへ戻る
        </button>
      </div>
    );
  }

  const index = parseInt(dayIndex || '0', 10);
  const dayRecipe = menuData.days[index];

  if (!dayRecipe) {
    return (
      <div className="flex flex-col h-full overflow-hidden items-center justify-center p-4 text-center space-y-4 font-serif">
        <p className="text-sm text-stone-500 font-serif">該当する日の献立が見つかりませんでした。</p>
        <button
          onClick={() => navigate('/')}
          className="px-5 py-2.5 bg-orange-600 text-white rounded-xl text-xs font-bold cursor-pointer"
        >
          ホームへ戻る
        </button>
      </div>
    );
  }

  // 材料をカテゴリーごとにグルーピング
  const groupedIngredients = dayRecipe.ingredients.reduce((acc, item) => {
    const cat = item.category || 'その他';
    if (!acc[cat]) {
      acc[cat] = [];
    }
    acc[cat].push(item);
    return acc;
  }, {} as Record<string, typeof dayRecipe.ingredients>);

  // モーダル表示時に背後のスクロールを防ぐ
  useEffect(() => {
    if (isCookingMode) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isCookingMode]);

  // 調理するステップ配列の選定
  const hasSplitSteps = dayRecipe.mainDishSteps && dayRecipe.soupSteps;
  const activeSteps = cookingType === 'main' 
    ? (dayRecipe.mainDishSteps || dayRecipe.recipeSteps) 
    : (dayRecipe.soupSteps || dayRecipe.recipeSteps);

  const activeDishName = cookingType === 'main'
    ? (dayRecipe.mainDishName || '主菜（おかず）')
    : (dayRecipe.soupName || '汁物（お汁）');

  const handleStartCooking = (type: 'main' | 'soup') => {
    setCookingType(type);
    setCurrentStep(0);
    setIsCompleted(false);
    setIsCookingMode(true);
    setCheckedIngredients({});
  };

  const toggleIngredientCheck = (name: string) => {
    setCheckedIngredients(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  // お料理開始モード（ステップごとのアシスタントUI）
  if (isCookingMode) {
    if (isCompleted) {
      return (
        <div className="flex flex-col h-full overflow-hidden items-center justify-center p-6 text-center bg-gradient-to-br from-amber-50 to-orange-50 animate-soft-fade font-serif">
          <div className="glass-card rounded-3xl p-8 max-w-md w-full space-y-6 border border-white shadow-2xl flex flex-col items-center">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 shadow-lg shadow-orange-500/10 relative">
              <Sparkles className="w-10 h-10 animate-pulse" />
              <CheckCircle className="w-6 h-6 text-emerald-600 absolute bottom-1 right-1 bg-white rounded-full" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-orange-900">おいしくこしらえられました！</h2>
              <p className="text-sm text-stone-600 leading-relaxed pt-1">
                「{activeDishName}」の調理がすべて完了いたしました。温かいうちに、ぜひご家族でお囲みくださいませ。
              </p>
            </div>
            <button
              onClick={() => setIsCookingMode(false)}
              className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-sm font-bold text-white rounded-xl shadow-lg shadow-orange-500/10 transition-all cursor-pointer"
            >
              閉じて詳細画面へ戻る
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col h-full overflow-hidden bg-gradient-to-br from-stone-50 via-amber-50/10 to-orange-50/10 animate-soft-fade font-serif">
        
        {/* 上部固定ヘッダー */}
        <div className="p-4 border-b border-orange-200/40 shrink-0 bg-white/70 backdrop-blur-md flex items-center justify-between gap-4">
          <div className="text-left leading-tight">
            <span className="text-xs font-bold text-orange-800 bg-orange-100/50 px-2.5 py-0.5 rounded-full inline-block">
              お料理開始アシスタント
            </span>
            <h3 className="text-base font-bold text-stone-800 mt-1">
              {dayRecipe.dayName}：{activeDishName}
            </h3>
          </div>
          <button
            onClick={() => setIsCookingMode(false)}
            className="p-2 hover:bg-red-50 text-stone-400 hover:text-red-600 rounded-xl transition-all cursor-pointer"
            title="調理を中断する"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 上部プログレスバー */}
        <div className="w-full bg-stone-100 shrink-0 h-2 relative">
          <div 
            className="bg-orange-600 h-full transition-all duration-300 rounded-r-full"
            style={{ width: `${((currentStep + 1) / activeSteps.length) * 100}%` }}
          />
        </div>

        {/* スクロールするステップ詳細 ＆ 必要食材カード領域 */}
        <div className="flex-grow overflow-y-auto p-4 space-y-6 pb-28 text-left">
          
          {/* 現在のステップ詳細手順カード */}
          <div className="glass-card p-6 rounded-3xl border border-orange-200/50 bg-white/80 shadow-lg space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 bg-orange-600 rounded-full flex items-center justify-center font-bold text-white font-sans text-sm shadow-md shadow-orange-500/15">
                {currentStep + 1}
              </span>
              <span className="text-xs font-bold text-stone-400">調理手順の詳細</span>
            </div>

            {/* 超大文字手順表示 (視認性抜群！) */}
            <p className="text-lg md:text-xl font-bold text-stone-800 leading-relaxed pt-1">
              {activeSteps[currentStep]}
            </p>
          </div>

          {/* このステップで使う食材のおさらい prep checklist */}
          <div className="glass-card p-5 rounded-2xl border border-stone-200/30 bg-white/50 space-y-3">
            <h4 className="text-xs font-bold text-stone-500 flex items-center gap-1.5 border-b border-stone-200/40 pb-2">
              <Layers className="w-4 h-4 text-orange-600" />
              この段階で使う食材・調味料をチェック（おさらい）：
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {dayRecipe.ingredients.map((ing) => (
                <div 
                  key={ing.name}
                  onClick={() => toggleIngredientCheck(ing.name)}
                  className={`p-3 rounded-xl border flex items-center justify-between gap-2 cursor-pointer transition-all ${
                    checkedIngredients[ing.name]
                      ? 'bg-emerald-500/10 border-emerald-300 text-stone-400 shadow-inner'
                      : 'bg-white border-stone-200/60 text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      checked={!!checkedIngredients[ing.name]} 
                      onChange={() => {}} // click handler on div resolves this
                      className="w-4 h-4 accent-emerald-600 shrink-0 pointer-events-none"
                    />
                    <span className="text-sm font-serif">
                      {ing.name}
                    </span>
                  </div>
                  <span className="text-xs font-sans font-bold">{ing.amount}</span>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-stone-400 pt-1">
              ※主菜用と汁物用の調味料が混ざらないよう、上の手順文に指定された分量を計量してご利用くださいませ。
            </p>
          </div>
        </div>

        {/* 固定下部ボタンナビゲーション（絶対に位置がずれない固定アクションバー！） */}
        <div className="shrink-0 bg-white/90 backdrop-blur-md border-t border-stone-200/40 p-4 flex items-center justify-between gap-4 pb-[calc(env(safe-area-inset-bottom)+12px)]">
          <button
            type="button"
            onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
            disabled={currentStep === 0}
            className="py-2.5 px-5 bg-stone-100 disabled:bg-stone-50 border border-stone-200 hover:bg-stone-200 disabled:text-stone-300 text-stone-700 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            戻る
          </button>

          <span className="text-xs font-bold text-stone-500">
            {currentStep + 1} / {activeSteps.length}
          </span>

          {currentStep < activeSteps.length - 1 ? (
            <button
              type="button"
              onClick={() => setCurrentStep(prev => prev + 1)}
              className="py-2.5 px-6 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl shadow-md shadow-orange-500/10 transition-all flex items-center gap-1 cursor-pointer"
            >
              次へ
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsCompleted(true)}
              className="py-2.5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-500/10 transition-all flex items-center gap-1 cursor-pointer animate-bounce"
            >
              <CheckCircle className="w-4 h-4" />
              調理完了！
            </button>
          )}
        </div>
      </div>
    );
  }

  // 通常モード（従来の詳細表示画面）
  return (
    <div className="flex flex-col h-full overflow-hidden animate-soft-fade font-serif">
      {/* 固定上部ヘッダー（スクロールしない固定部） */}
      <div className="p-4 border-b border-orange-200/50 flex items-center gap-3 shrink-0 bg-gradient-to-b from-amber-50/10 to-transparent">
        <button
          onClick={() => navigate('/')}
          className="p-2.5 hover:bg-orange-50/50 rounded-xl border border-stone-200 text-stone-600 transition-colors shrink-0 cursor-pointer"
          title="献立一覧へ戻る"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="text-left space-y-1">
          <span className="text-xs font-bold text-orange-800">{dayRecipe.dayName} の夕食お品書き</span>
          {dayRecipe.mainDishName && dayRecipe.soupName ? (
            <div className="space-y-1">
              <h2 className="text-base font-bold text-stone-800 flex items-center gap-1.5 leading-tight">
                <span className="text-[9px] text-orange-700 bg-orange-50 px-1.5 py-0.5 rounded border border-orange-200/30 font-sans font-semibold shrink-0">主菜</span>
                <span>{dayRecipe.mainDishName}</span>
              </h2>
              <h2 className="text-base font-bold text-stone-700 flex items-center gap-1.5 leading-tight">
                <span className="text-[9px] text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/30 font-sans font-semibold shrink-0">汁物</span>
                <span>{dayRecipe.soupName}</span>
              </h2>
            </div>
          ) : (
            <h2 className="text-lg font-bold text-stone-800 leading-tight mt-0.5">{dayRecipe.dishName}</h2>
          )}
        </div>
      </div>

      {/* スクロール可能なレシピ詳細領域 */}
      <div className="flex-grow overflow-y-auto p-4 space-y-6 pb-24">
        
        {/* お料理開始ボタンエリア（お料理開始モードへの導線：主菜・汁物を選んで開始！） */}
        <div className="glass-card p-4 rounded-3xl border border-orange-200 bg-orange-50/15 text-left flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <span className="text-[10px] text-orange-800 font-bold bg-orange-100 px-2.5 py-0.5 rounded-full inline-block">
              こしらえ方アシスタント
            </span>
            <h3 className="text-sm font-bold text-stone-800">専用ステップアシストでお料理を開始します</h3>
            <p className="text-xs text-stone-500">ステップごとの詳細手順と必要な食材分量を1つずつ画面に表示します。</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto shrink-0">
            {hasSplitSteps ? (
              <>
                <button
                  onClick={() => handleStartCooking('main')}
                  className="flex-1 sm:flex-initial py-2.5 px-4 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-orange-500/10 flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5" />
                  主菜調理を開始
                </button>
                <button
                  onClick={() => handleStartCooking('soup')}
                  className="flex-1 sm:flex-initial py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-emerald-500/10 flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5" />
                  汁物調理を開始
                </button>
              </>
            ) : (
              <button
                onClick={() => handleStartCooking('main')}
                className="w-full sm:w-auto py-2.5 px-5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-orange-500/10 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Play className="w-4 h-4" />
                お料理を開始する
              </button>
            )}
          </div>
        </div>

        {/* 基本情報（カロリー・メッセージ） */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* カロリー */}
          <div className="glass-card p-4 rounded-2xl flex flex-col justify-center items-center border border-stone-200/40">
            <Flame className="w-5 h-5 text-orange-600 mb-1" />
            <span className="text-[10px] text-stone-500">推定夕食総カロリー</span>
            <span className="text-lg font-bold text-orange-800 font-sans mt-0.5">{dayRecipe.calories} <span className="text-xs font-normal">kcal</span></span>
            <span className="text-[9px] text-stone-400 mt-1">※ご家族全員分の合計目安</span>
          </div>

          {/* まかなひの言葉 */}
          <div className="md:col-span-2 glass-card p-4 rounded-2xl border border-stone-200/40 text-left flex gap-3">
            <MessageSquare className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div className="space-y-1 flex-grow">
              <h3 className="text-xs font-bold text-emerald-800">料理人「まかなひ」の知恵</h3>
              <p className="text-custom-readable text-stone-600 leading-relaxed">
                {dayRecipe.description}
              </p>
            </div>
          </div>
        </div>

        {/* 材料とお買い物 */}
        <div className="glass-card p-5 rounded-2xl border border-stone-200/40 text-left space-y-4">
          <h3 className="text-sm font-bold text-orange-900 border-b border-orange-100 pb-2 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-orange-600" />
            ご用意いただく食材（家族全員分）
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.entries(groupedIngredients).map(([category, items]) => (
              <div key={category} className="space-y-2">
                <h4 className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-1 rounded border border-emerald-100/30 inline-block">
                  {category}
                </h4>
                <ul className="divide-y divide-stone-100 text-custom-readable text-stone-700">
                  {items.map((ing) => (
                    <li key={ing.name} className="py-2 flex justify-between gap-2">
                      <span>{ing.name}</span>
                      <span className="font-bold text-stone-600 font-sans">{ing.amount}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* 調理手順 */}
        <div className="glass-card p-5 rounded-2xl border border-stone-200/40 text-left space-y-4">
          <h3 className="text-sm font-bold text-orange-900 border-b border-orange-100 pb-2 flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-orange-600" />
            こしらえ方（調理手順）
          </h3>

          {dayRecipe.mainDishSteps && dayRecipe.soupSteps ? (
            <div className="space-y-6">
              {/* 主菜の手順 */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-orange-800 bg-orange-50 px-2.5 py-1 rounded border border-orange-100/30 inline-block">
                  主菜：{dayRecipe.mainDishName || 'おかず'} のこしらえ方
                </h4>
                <ol className="space-y-4">
                  {dayRecipe.mainDishSteps.map((step, idx) => (
                    <li key={idx} className="flex gap-4 items-start text-custom-readable text-stone-700 leading-relaxed">
                      <div className="w-5 h-5 bg-orange-100 border border-orange-200 rounded-full flex items-center justify-center font-bold text-orange-700 shrink-0 mt-0.5 font-sans text-xs">
                        {idx + 1}
                      </div>
                      <p className="pt-0.5">{step}</p>
                    </li>
                  ))}
                </ol>
              </div>

              {/* 汁物の手順 */}
              <div className="space-y-3 border-t border-stone-100 pt-4">
                <h4 className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-100/30 inline-block">
                  汁物：{dayRecipe.soupName || 'お汁'} のこしらえ方
                </h4>
                <ol className="space-y-4">
                  {dayRecipe.soupSteps.map((step, idx) => (
                    <li key={idx} className="flex gap-4 items-start text-custom-readable text-stone-700 leading-relaxed">
                      <div className="w-5 h-5 bg-emerald-100 border border-emerald-200 rounded-full flex items-center justify-center font-bold text-emerald-700 shrink-0 mt-0.5 font-sans text-xs">
                        {idx + 1}
                      </div>
                      <p className="pt-0.5">{step}</p>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          ) : (
            <ol className="space-y-4">
              {dayRecipe.recipeSteps.map((step, idx) => (
                <li key={idx} className="flex gap-4 items-start text-custom-readable text-stone-700 leading-relaxed">
                  <div className="w-5 h-5 bg-orange-100 border border-orange-200 rounded-full flex items-center justify-center font-bold text-orange-700 shrink-0 mt-0.5 font-sans text-xs">
                    {idx + 1}
                  </div>
                  <p className="pt-0.5">{step}</p>
                </li>
              ))}
            </ol>
          )}
        </div>

        {/* こしらえ上の注意点・コツ */}
        {dayRecipe.notes && dayRecipe.notes.length > 0 && (
          <div className="glass-card p-5 rounded-2xl border border-orange-200/40 bg-orange-50/10 text-left space-y-3">
            <h3 className="text-sm font-bold text-orange-900 border-b border-orange-100 pb-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-orange-600 inline-block" />
              調理の際の注意点・おいしく作るコツ
            </h3>
            <ul className="space-y-2 text-custom-readable text-stone-700 leading-relaxed list-disc list-inside">
              {dayRecipe.notes.map((note, idx) => (
                <li key={idx}>
                  {note}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 食後チェック・ボタン */}
        <div className="text-center pt-2">
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-xs font-bold text-white rounded-xl transition-all shadow-md shadow-orange-500/10 flex items-center gap-1.5 mx-auto cursor-pointer"
          >
            <CheckCircle className="w-4 h-4" />
            献立一覧へ戻る
          </button>
        </div>
      </div>
    </div>
  );
};