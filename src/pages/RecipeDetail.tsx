import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  ChevronLeft, 
  Flame, 
  BookOpen, 
  Layers, 
  CheckCircle, 
  MessageSquare
} from 'lucide-react';

export const RecipeDetail: React.FC = () => {
  const { dayIndex } = useParams<{ dayIndex: string }>();
  const { menuData } = useApp();
  const navigate = useNavigate();

  if (!menuData) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-sm text-stone-500 font-serif">献立データが見つかりませんでした。</p>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-orange-600 text-white rounded-xl text-xs font-bold"
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
      <div className="text-center py-12 space-y-4">
        <p className="text-sm text-stone-500 font-serif">該当する日の献立が見つかりませんでした。</p>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-orange-600 text-white rounded-xl text-xs font-bold"
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

  return (
    <div className="space-y-6 pb-24 max-w-2xl mx-auto animate-soft-fade">
      {/* 戻るボタンとヘッダー */}
      <div className="flex items-center gap-2 border-b border-orange-200/50 pb-4">
        <button
          onClick={() => navigate('/')}
          className="p-2 hover:bg-orange-50/50 rounded-xl border border-stone-200 text-stone-600 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="text-left">
          <span className="text-xs font-bold text-orange-800 font-serif">{dayRecipe.dayName} の夕食</span>
          <h2 className="text-lg font-bold text-stone-800 font-serif leading-tight mt-0.5">{dayRecipe.dishName}</h2>
        </div>
      </div>

      {/* 基本情報（カロリー・メッセージ） */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* カロリー */}
        <div className="glass-card p-4 rounded-2xl flex flex-col justify-center items-center border border-stone-200/40">
          <Flame className="w-5 h-5 text-orange-600 mb-1" />
          <span className="text-[10px] text-stone-500 font-serif">推定夕食総カロリー</span>
          <span className="text-lg font-bold text-orange-800 font-sans mt-0.5">{dayRecipe.calories} <span className="text-xs font-serif font-normal">kcal</span></span>
          <span className="text-[9px] text-stone-400 mt-1">※ご家族全員分の合計目安</span>
        </div>

        {/* まかなひの言葉 */}
        <div className="md:col-span-2 glass-card p-4 rounded-2xl border border-stone-200/40 text-left flex gap-3">
          <MessageSquare className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="text-xs font-bold text-emerald-800 font-serif">料理人「まかなひ」の知恵</h3>
            <p className="text-xs text-stone-600 leading-relaxed font-serif">
              {dayRecipe.description}
            </p>
          </div>
        </div>
      </div>

      {/* 材料とお買い物 */}
      <div className="glass-card p-5 rounded-2xl border border-stone-200/40 text-left space-y-4">
        <h3 className="text-sm font-bold text-orange-900 border-b border-orange-100 pb-2 flex items-center gap-1.5 font-serif">
          <Layers className="w-4 h-4 text-orange-600" />
          ご用意いただく食材（家族全員分）
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Object.entries(groupedIngredients).map(([category, items]) => (
            <div key={category} className="space-y-2">
              <h4 className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-1 rounded border border-emerald-100/30 inline-block font-serif">
                {category}
              </h4>
              <ul className="divide-y divide-stone-100 text-xs text-stone-700">
                {items.map((ing) => (
                  <li key={ing.name} className="py-2 flex justify-between gap-2">
                    <span className="font-serif">{ing.name}</span>
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
        <h3 className="text-sm font-bold text-orange-900 border-b border-orange-100 pb-2 flex items-center gap-1.5 font-serif">
          <BookOpen className="w-4 h-4 text-orange-600" />
          こしらえ方（調理手順）
        </h3>

        <ol className="space-y-4">
          {dayRecipe.recipeSteps.map((step, idx) => (
            <li key={idx} className="flex gap-4 items-start text-xs text-stone-700 leading-relaxed">
              <div className="w-5 h-5 bg-orange-100 border border-orange-200 rounded-full flex items-center justify-center font-bold text-orange-700 shrink-0 mt-0.5 font-sans">
                {idx + 1}
              </div>
              <p className="font-serif pt-0.5">
                {step}
              </p>
            </li>
          ))}
        </ol>
      </div>

      {/* 食後チェック */}
      <div className="text-center">
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-xs font-bold text-white rounded-xl transition-all shadow-md shadow-orange-500/10 flex items-center gap-1.5 mx-auto"
        >
          <CheckCircle className="w-4 h-4" />
          献立一覧へ戻る
        </button>
      </div>
    </div>
  );
};