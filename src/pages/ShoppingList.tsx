import React from 'react';
import { useApp, ShoppingItem } from '../context/AppContext';
import { ShoppingBag, CheckSquare, Square, Info } from 'lucide-react';

export const ShoppingList: React.FC = () => {
  const { menuData, toggleShoppingItem } = useApp();

  if (!menuData || !menuData.shoppingList || menuData.shoppingList.length === 0) {
    return (
      <div className="space-y-6 pb-24">
        {/* ヘッダー */}
        <div className="border-b border-orange-200/50 pb-4 text-left">
          <h2 className="text-xl font-bold text-orange-900 font-serif flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-orange-600" />
            買い物リスト
          </h2>
          <p className="text-xs text-stone-500 mt-1">一週間分の必要な買い物をまとめて確認できます。</p>
        </div>

        {/* 未生成時の画面 */}
        <div className="glass-card rounded-3xl p-8 text-center max-w-md mx-auto space-y-4 border border-white/80">
          <div className="inline-flex items-center justify-center p-4 bg-orange-500/10 rounded-full">
            <ShoppingBag className="w-8 h-8 text-orange-600" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-stone-800 font-serif">まだ買い物リストがございません</h3>
            <p className="text-xs text-stone-500 leading-relaxed max-w-sm mx-auto">
              一週間の献立を提案してもらうと、その調理に必要な材料が自動的に集計され、ここに表示されます。
            </p>
          </div>
        </div>
      </div>
    );
  }

  // カテゴリごとに材料をグルーピング
  const groupedList = menuData.shoppingList.reduce((acc, item) => {
    const cat = item.category || 'その他';
    if (!acc[cat]) {
      acc[cat] = [];
    }
    acc[cat].push(item);
    return acc;
  }, {} as Record<string, ShoppingItem[]>);

  // 全体の購入進捗率
  const checkedCount = menuData.shoppingList.filter(item => item.checked).length;
  const totalCount = menuData.shoppingList.length;
  const progressPercent = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6 pb-24 animate-soft-fade">
      {/* ヘッダー */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-orange-200/50 pb-4 text-left">
        <div>
          <h2 className="text-xl font-bold text-orange-900 font-serif flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-orange-600" />
            買い物リスト
          </h2>
          <p className="text-xs text-stone-500 mt-1 font-serif">まかなひお薦めの一週間分の食材おまとめ書きでございます。</p>
        </div>

        {/* 進捗バー */}
        <div className="w-full sm:w-48 bg-stone-100 p-3 rounded-xl border border-stone-200/40">
          <div className="flex justify-between items-center text-[10px] text-stone-500 font-serif mb-1">
            <span>お買い物進捗</span>
            <span className="font-bold text-orange-800 font-sans">{checkedCount} / {totalCount} ({progressPercent}%)</span>
          </div>
          <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-emerald-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* 注意書き */}
      <div className="p-3.5 bg-orange-50/50 rounded-2xl border border-orange-200/30 flex items-start gap-2 text-left">
        <Info className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
        <p className="text-[11px] text-stone-500 leading-relaxed font-serif">
          ご家庭にある基本的な調味料（塩、コショウ、油、砂糖、味噌、醤油、酒、みりん、生姜、にんにくなど）は、すでにお持ちのものとして適宜ご調整くださいませ。
        </p>
      </div>

      {/* カテゴリごとのリスト */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(groupedList).map(([category, items]) => (
          <div key={category} className="glass-card p-5 rounded-2xl border border-stone-200/40 text-left space-y-3 flex flex-col justify-start">
            <h3 className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-lg inline-block self-start font-serif">
              {category}
            </h3>

            <ul className="divide-y divide-stone-100 flex-grow">
              {items.map((item) => (
                <li 
                  key={item.id} 
                  onClick={() => toggleShoppingItem(item.id)}
                  className="py-3 flex items-center justify-between gap-3 cursor-pointer group transition-all"
                >
                  <div className="flex items-center gap-2 text-left">
                    <span className="text-stone-400 group-hover:text-orange-500 transition-colors shrink-0">
                      {item.checked ? (
                        <CheckSquare className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Square className="w-4 h-4 text-stone-400" />
                      )}
                    </span>
                    <span 
                      className={`text-xs font-serif transition-all ${
                        item.checked 
                          ? 'line-through text-stone-400' 
                          : 'text-stone-700'
                      }`}
                    >
                      {item.name}
                    </span>
                  </div>
                  
                  <span 
                    className={`text-xs font-sans font-bold transition-all shrink-0 ${
                      item.checked ? 'text-stone-400' : 'text-stone-500'
                    }`}
                  >
                    {item.amount}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};