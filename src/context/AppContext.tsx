import React, { createContext, useContext, useState, useEffect } from 'react';

// 家族メンバーの定義
export interface FamilyMember {
  id: string;
  name: string;
  birthDate: string; // YYYY-MM-DD
  gender: 'male' | 'female';
}

// 献立（1日分）の定義
export interface DailyMenu {
  dayName: string; // 例: "月曜日", "火曜日"
  dishName: string; // 主菜名
  calories: number; // この日の夕食の推定総カロリー（家族全員分）
  description: string; // メニューの説明、なぜバランスが良いかなど
  ingredients: {
    name: string;
    amount: string; // 例: "200g", "2片"
    category: string; // 例: "野菜", "肉類", "調味料"
  }[];
  recipeSteps: string[]; // 調理手順の配列
}

// 買い物リストの項目定義
export interface ShoppingItem {
  id: string;
  name: string;
  amount: string;
  category: string;
  checked: boolean;
}

// 作り置き副菜（常備菜）の定義
export interface MakeAheadSideDish {
  dishName: string; // 常備菜名（例: ひじきの五目煮、彩り野菜の甘酢漬け）
  description: string; // なぜ1週間使い回せるか、保存のコツなど
  ingredients: {
    name: string;
    amount: string;
    category: string;
  }[];
  recipeSteps: string[]; // 作り置きの手順
}

// 1週間分の献立データの定義
export interface MenuData {
  days: DailyMenu[];
  makeAheadSideDish: MakeAheadSideDish; // 今週の作り置き常備菜
  shoppingList: ShoppingItem[];
  generatedAt: string; // 生成日時のISO文字列
}

// 調理の手間・こしらえ加減の定義
export type CookingEffort = 'quick' | 'easy' | 'normal' | 'detailed';

// アプリケーション全体のコンテキスト型
interface AppContextType {
  apiKey: string;
  familyMembers: FamilyMember[];
  cookingEffort: CookingEffort; // こしらえ加減
  menuData: MenuData | null;
  isOnboarded: boolean;
  saveApiKey: (key: string) => void;
  saveFamilyMembers: (members: FamilyMember[]) => void;
  saveCookingEffort: (effort: CookingEffort) => void; // こしらえ加減の保存
  saveMenuData: (data: MenuData | null) => void;
  toggleShoppingItem: (id: string) => void;
  completeOnboarding: () => void;
  resetApp: () => void;
  calculateTargetCalories: () => number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// ローカルストレージキーの定数
const KEYS = {
  API_KEY: 'makanai_api_key',
  FAMILY_MEMBERS: 'makanai_family_members',
  COOKING_EFFORT: 'makanai_cooking_effort',
  MENU_DATA: 'makanai_menu_data',
  IS_ONBOARDED: 'makanai_is_onboarded',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [apiKey, setApiKey] = useState<string>(() => localStorage.getItem(KEYS.API_KEY) || '');
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(() => {
    const saved = localStorage.getItem(KEYS.FAMILY_MEMBERS);
    return saved ? JSON.parse(saved) : [];
  });
  const [cookingEffort, setCookingEffort] = useState<CookingEffort>(() => {
    return (localStorage.getItem(KEYS.COOKING_EFFORT) as CookingEffort) || 'normal';
  });
  const [menuData, setMenuData] = useState<MenuData | null>(() => {
    const saved = localStorage.getItem(KEYS.MENU_DATA);
    return saved ? JSON.parse(saved) : null;
  });
  const [isOnboarded, setIsOnboarded] = useState<boolean>(() => {
    return localStorage.getItem(KEYS.IS_ONBOARDED) === 'true';
  });

  // 状態の変更をローカルストレージに同期する効果
  useEffect(() => {
    localStorage.setItem(KEYS.API_KEY, apiKey);
  }, [apiKey]);

  useEffect(() => {
    localStorage.setItem(KEYS.FAMILY_MEMBERS, JSON.stringify(familyMembers));
  }, [familyMembers]);

  useEffect(() => {
    localStorage.setItem(KEYS.COOKING_EFFORT, cookingEffort);
  }, [cookingEffort]);

  useEffect(() => {
    if (menuData) {
      localStorage.setItem(KEYS.MENU_DATA, JSON.stringify(menuData));
    } else {
      localStorage.removeItem(KEYS.MENU_DATA);
    }
  }, [menuData]);

  useEffect(() => {
    localStorage.setItem(KEYS.IS_ONBOARDED, String(isOnboarded));
  }, [isOnboarded]);

  // 各種更新アクション
  const saveApiKey = (key: string) => setApiKey(key.trim());
  const saveFamilyMembers = (members: FamilyMember[]) => setFamilyMembers(members);
  const saveCookingEffort = (effort: CookingEffort) => setCookingEffort(effort);
  const saveMenuData = (data: MenuData | null) => setMenuData(data);
  const completeOnboarding = () => setIsOnboarded(true);

  // 買い物リストのチェック状態をトグルする関数
  const toggleShoppingItem = (id: string) => {
    if (!menuData) return;
    const updatedList = menuData.shoppingList.map((item) =>
      item.id === id ? { ...item, checked: !item.checked } : item
    );
    setMenuData({ ...menuData, shoppingList: updatedList });
  };

  // アプリ全体の初期化
  const resetApp = () => {
    localStorage.clear();
    setApiKey('');
    setFamilyMembers([]);
    setMenuData(null);
    setIsOnboarded(false);
  };

  // 年齢計算ヘルパー
  const calculateAge = (birthDateString: string): number => {
    const today = new Date();
    const birthDate = new Date(birthDateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // 家族の構成から、1日（夕食のみ）に必要な推定総カロリーを算出
  // 厚生労働省「日本人の食事摂取基準」の概算をベースに、夕食を1日の約35〜40%として計算
  const calculateTargetCalories = (): number => {
    if (familyMembers.length === 0) return 650; // デフォルト（単身基準）

    return familyMembers.reduce((total, member) => {
      const age = calculateAge(member.birthDate);
      let dinnerCalorie = 650; // デフォルト値

      if (age <= 2) {
        dinnerCalorie = 350; // 乳幼児
      } else if (age <= 5) {
        dinnerCalorie = 450; // 幼児
      } else if (age <= 11) {
        dinnerCalorie = 600; // 小学生
      } else if (age <= 17) {
        // 中高生
        dinnerCalorie = member.gender === 'male' ? 950 : 800;
      } else if (age <= 69) {
        // 成人
        dinnerCalorie = member.gender === 'male' ? 850 : 700;
      } else {
        // 高齢者
        dinnerCalorie = member.gender === 'male' ? 750 : 600;
      }

      return total + dinnerCalorie;
    }, 0);
  };

  return (
    <AppContext.Provider
      value={{
        apiKey,
        familyMembers,
        cookingEffort,
        menuData,
        isOnboarded,
        saveApiKey,
        saveFamilyMembers,
        saveCookingEffort,
        saveMenuData,
        toggleShoppingItem,
        completeOnboarding,
        resetApp,
        calculateTargetCalories,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};