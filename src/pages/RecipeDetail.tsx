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
      <div className="flex flex-col h-full overflow-hidden items-center justify-center p-4 text-center space-y-4">
        <p className="text-sm text-stone-500 font-serif">献立データが見つかりませんでした。</p>
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
      <div className="flex flex-col h-full overflow-hidden items-center justify-center p-4 text-center space-y-4">
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

  return (
    <div className="flex flex-col h-full overflow-hidden animate-soft-fade">
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
          <span className="text-xs font-bold text-orange-800 font-serif">{dayRecipe.dayName} の夕食お品書き</span>
          {dayRecipe.mainDishName && dayRecipe.soupName ? (
            <div className="space-y-1">
              <h2 className="text-base font-bold text-stone-800 font-serif flex items-center gap-1.5 leading-tight">
                <span className="text-[9px] text-orange-700 bg-orange-50 px-1.5 py-0.5 rounded border border-orange-200/30 font-sans font-semibold shrink-0">主菜</span>
                <span>{dayRecipe.mainDishName}</span>
              </h2>
              <h2 className="text-base font-bold text-stone-700 font-serif flex items-center gap-1.5 leading-tight">
                <span className="text-[9px] text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/30 font-sans font-semibold shrink-0">汁物</span>
                <span>{dayRecipe.soupName}</span>
              </h2>
            </div>
          ) : (
            <h2 className="text-lg font-bold text-stone-800 font-serif leading-tight mt-0.5">{dayRecipe.dishName}</h2>
          )}
        </div>
      </div>

      {/* スクロール可能なレシピ詳細領域 */}
      <div className="flex-grow overflow-y-auto p-4 space-y-6 pb-24">
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
            <div className="space-y-1 flex-grow">
              <h3 className="text-xs font-bold text-emerald-800 font-serif">料理人「まかなひ」の知恵</h3>
              <p className="text-custom-readable text-stone-600 leading-relaxed font-serif">
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
                <ul className="divide-y divide-stone-100 text-custom-readable text-stone-700">
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

          {dayRecipe.mainDishSteps && dayRecipe.soupSteps ? (
            <div className="space-y-6">
              {/* 主菜の手順 */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-orange-800 bg-orange-50 px-2.5 py-1 rounded border border-orange-100/30 inline-block font-serif">
                  主菜：{dayRecipe.mainDishName || 'おかず'} のこしらえ方
                </h4>
                <ol className="space-y-4">
                  {dayRecipe.mainDishSteps.map((step, idx) => (
                    <li key={idx} className="flex gap-4 items-start text-custom-readable text-stone-700 leading-relaxed">
                      <div className="w-5 h-5 bg-orange-100 border border-orange-200 rounded-full flex items-center justify-center font-bold text-orange-700 shrink-0 mt-0.5 font-sans text-xs">
                        {idx + 1}
                      </div>
                      <p className="font-serif pt-0.5">{step}</p>
                    </li>
                  ))}
                </ol>
              </div>

              {/* 汁物の手順 */}
              <div className="space-y-3 border-t border-stone-100 pt-4">
                <h4 className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-100/30 inline-block font-serif">
                  汁物：{dayRecipe.soupName || 'お汁'} のこしらえ方
                </h4>
                <ol className="space-y-4">
                  {dayRecipe.soupSteps.map((step, idx) => (
                    <li key={idx} className="flex gap-4 items-start text-custom-readable text-stone-700 leading-relaxed">
                      <div className="w-5 h-5 bg-emerald-100 border border-emerald-200 rounded-full flex items-center justify-center font-bold text-emerald-700 shrink-0 mt-0.5 font-sans text-xs">
                        {idx + 1}
                      </div>
                      <p className="font-serif pt-0.5">{step}</p>
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
                  <p className="font-serif pt-0.5">{step}</p>
                </li>
              ))}
            </ol>
          )}
        </div>

        {/* こしらえ上の注意点・コツ */}
        {dayRecipe.notes && dayRecipe.notes.length > 0 && (
          <div className="glass-card p-5 rounded-2xl border border-orange-200/40 bg-orange-50/10 text-left space-y-3">
            <h3 className="text-sm font-bold text-orange-900 border-b border-orange-100 pb-2 flex items-center gap-1.5 font-serif">
              <span className="w-2 h-2 rounded-full bg-orange-600 inline-block" />
              調理の際の注意点・おいしく作るコツ
            </h3>
            <ul className="space-y-2 text-custom-readable text-stone-700 leading-relaxed list-disc list-inside">
              {dayRecipe.notes.map((note, idx) => (
                <li key={idx} className="font-serif">
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