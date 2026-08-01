import { GoogleGenAI } from '@google/genai';
import { MenuData, FamilyMember, CookingEffort } from '../context/AppContext';

/**
 * ユーザーの家族構成、目標カロリー、こしらえ加減（調理の手間）、
 * および冷蔵庫の余り物に基づいて、Gemini API（gemini-3.5-flash）を呼び出し、
 * 毎日「主菜＋汁物」の一汁一菜構成および「1週間分の作り置き常備菜（副菜）」、
 * そして食材使い切り（もったいないの心）に配慮した夕食献立データを生成します。
 */
export async function generateWeeklyMenu(
  apiKey: string,
  familyMembers: FamilyMember[],
  targetCalories: number,
  cookingEffort: CookingEffort,
  fridgeContents?: string
): Promise<MenuData> {
  if (!apiKey) {
    throw new Error('APIキーが設定されていません。設定画面で登録してください。');
  }

  // 家族のプロフィールをテキスト化（プライバシー保護のため、名前や誕生日などの直接の個人情報は一切含めず、年齢と性別のみを匿名で指定します）
  const familyDescription = familyMembers
    .map((m, index) => {
      const age = new Date().getFullYear() - new Date(m.birthDate).getFullYear();
      const genderStr = m.gender === 'male' ? '男性' : '女性';
      return `家族メンバー${index + 1}(年齢: ${age}歳、性別: ${genderStr})`;
    })
    .join('、');

  // 調理の手間（こしらえ加減）に応じたプロンプト指示
  let effortInstruction = '';
  switch (cookingEffort) {
    case 'quick':
      effortInstruction = `
- **調理の手間の加減**: 「さっと（時短）」モードでございます。
- **レシピ仕様**: 調理時間を15〜20分前後で完了する、時間のない日に助かる超スピーディな料理にしてください。
- **技法・手順**: 電子レンジを駆使する、フライパン1つだけで完結する（ワンパン料理）、あるいは市販のカット野菜や豆腐、大豆缶、ツナ缶などを活用して、切る・洗うなどの下準備を極限まで省いた手順にしてください。手順（recipeSteps）は主菜と汁物を合わせても、最大で4〜5ステップ以内に制限してください。
`;
      break;
    case 'easy':
      effortInstruction = `
- **調理の手間の加減**: 「かんたん（簡単）」モードでございます。
- **レシピ仕様**: 特別な調理技術がなくても、料理初心者や不慣れな方でも失敗せず絶対に美味しく作れる簡単な料理にしてください。
- **技法・手順**: 使う材料を最小限に絞り込み、使う調味料を少なく（例：めんつゆ、マヨネーズ、味噌、醤油、だしの素などの基本調味料に完結）してください。手順は3〜4ステップ程度で、簡潔に分かりやすく記載してください。
`;
      break;
    case 'normal':
      effortInstruction = `
- **調理の手間の加減**: 「いつもの（普通）」モードでございます。
- **レシピ仕様**: バランスと美味しさを両立させた、標準的な家庭の和風メニューにしてください。
- **技法・手順**: 家庭料理で一般的な手順（炒める、煮る、焼く、和えるなど）をベースに、普段の献立として飽きが来ず、栄養バランスに長けたレシピにしてください。手順は5ステップ前後です。
`;
      break;
    case 'detailed':
      effortInstruction = `
- **調理の手間の加減**: 「ていねい（丁寧）」モードでございます。
- **レシピ仕様**: ほんの少し時間をかけたり、丁寧な手仕事を加えることで、心が満たされるこだわりのおもてなし和食メニューにしてください。
- **技法・手順**: 昆布と鰹節からお出汁をじっくり引いて使用する、合わせ調味料を独自にブレンドする、じっくりコトコト煮込んで味を染み込ませるなど、少し手間を楽しむ本格和食レシピにしてください。日本の四季を感じる繊浅な味わいと手順にし、ステップ数の上限はありません。
`;
      break;
  }

  // 毎日必ず「主菜」と「汁物」をセットにすることの義務化
  const structureInstruction = `
- **「一汁一菜（主菜＋汁物）」の必須化**: 毎日の夕食（daysの各要素）は、必ず【主菜：〇〇（お肉、お魚、お豆腐などのメインおかず）】と【汁物：〇〇（お味噌汁、おすまし、和風スープなど）】の両方をセットにした献立（dishName）にしてください。
- 時短モード（さっと）や簡単モードであっても、手間のかからないお汁（例：乾燥わかめとネギの即席すまし汁、レンジで作るキャベツのお味噌汁など）を必ず汁物として添え、メイン1品だけで終わらせず、バランスの取れた温かい食事を構成してください。
- **主菜と汁物の分離**: 主菜名のみ（例: "カレイの煮付け"）を \`mainDishName\` に、汁物名のみ（例: "具沢山の豚汁"）を \`soupName\` に分けて格納してください。
- **調理手順の分離**: 主菜の作り方手順を \`mainDishSteps\` に、汁物の作り方手順を \`soupSteps\` にそれぞれ分けて記述（配列）してください。（全体の一括手順は \`recipeSteps\` に格納してください）
- **注意点の記述**: レシピには必ず調理上の注意点やコツ、アレルギーや火加減などの配慮事項（例: 「煮崩れしやすいので、あまり触らないこと」「味噌を溶いた後は沸騰させない」など）を2〜3項目ほど、\`notes\`（文字列の配列）に含めてください。
`;

  // 1週間使い回せる「作り置き常備菜（副菜）」の義務化
  const sideDishInstruction = `
- **1週間使える「作り置き常備菜（副菜）」の提案**: 毎日の夕食とは別に、週末や週の初めに作って1週間冷蔵庫で日持ちする「和風作り置き常備菜（副菜）」（例：きんぴらごぼう、ひじきの五目煮、切り干し大根の煮物、ピクルス、大根皮の甘酢漬け、ナスの揚げ浸しなど）を1品考案してください。
- この常備菜のレシピデータは、返却するJSONの \`makeAheadSideDish\` フィールドに格納してください。
- また、この常備菜を作るために必要なすべての材料（野菜、調味料など）も、自動的に全体の買い物リスト（shoppingList）に合流させ、過不足なくまとめ買いできるように集計してください。
`;

  // 食材を使い切るもったいないの心（週を通しての使い回し）
  const wasteInstruction = `
- **もったいないの心（食材使い切り）**: 1週間分（月曜日〜日曜日）の献立は、食材を使い切ることを前提として綿密に計画してください。
- 例えば、週の前半に大容量の野菜（キャベツ1玉、大根、白菜、玉ねぎネットなど）や多めのお肉・魚、そして上記「作り置き常備菜」の材料を購入した場合、それらを数日間にわたって形や調理法を変えて（月曜：メイン肉野菜炒め、水曜：お味噌汁の具、金曜：和え物・ナムル など）段階的に使い回してください。日曜日の時点で余計な残り食材が出ず、スッキリと使い切れる、ゼロ・ウェイストな買い物リストと献立の連動にしてください。
`;

  // 冷蔵庫の余り物の最優先使用（オプション）
  const fridgeInstruction = fridgeContents?.trim()
    ? `
- **冷蔵庫にある余り物の最優先使用**: 現在、冷蔵庫に以下の食材が余っております：【 ${fridgeContents.trim()} 】。これらの食材を、週の前半（月曜日〜水曜日あたり）の献立、もしくは上記の「作り置き常備菜（副菜）」の材料として最優先で組み込み、無駄にせずスッキリと使い切る（あるいは大幅に消費できる）レシピに仕上げてください。
`
    : '';

  const systemInstruction = `
あなたは日本の古き良き伝統的な食卓を支える、温かみのある凄腕の料理人「まかなひ」です。
ユーザーの家族構成や必要な摂取カロリー、栄養バランス、そして「和の心」を大切にした健康的で美味しい1週間分の夕食の献立、レシピ、およびまとめ買いリストを作成してください。

【キャラクター設定と語り口】
- 丁寧で、温かみがあり、どこか懐かしい和風の語り口で説明してください（例：「〜でございます」「〜に仕上げました」など）。
- 絵文字は一切使用しないでください。
- カロリーや栄養のバランスを考慮しつつ、日々の忙しさを軽減する優しい献立を心がけてください。

【技術的要件】
- 返すデータは厳密に指定されたJSONフォーマットに従ってください。
- カロリーは、家族全員分（合計）の目安を算出して含めてください。目標カロリーは夕食の合計目安です。
- 買い物リスト（shoppingList）は、1週間分の全レシピで重複する材料を集計し、カテゴリごとに整理・統合されたリストにしてください。
- 買い物リストの各項目には、ランダムで一意な短いID（例: "item_01", "item_02"など）を付与し、checkedはすべてfalseにしてください。
`;

  const prompt = `
以下の条件に合わせて、1週間分（月曜日から日曜日までの7日間）の夕食の献立、詳細なレシピ、およびまとめ買い買い物リストをJSON形式で作成してください。

【条件】
- 対象: 夕食（夜ご飯）のみ
- 家族構成: ${familyDescription}
- 家族全員分の夕食目標総カロリー: 1日あたり約 ${targetCalories} kcal
- 献立コンセプト: 日本の家庭的な味わいでバランスが良く、心が温まる食事。
- 禁止事項: 返却するJSONデータの中に絵文字（表情、食材、記号などすべての絵文字）を含めてはいけません。

【調理手加減および食材消費ルール】
${effortInstruction}
${structureInstruction}
${sideDishInstruction}
${wasteInstruction}
${fridgeInstruction}

【返却するJSONのスキーマ】
以下のJSON構造で必ず出力してください（不要な解説テキストや、JSONの外側のコードブロックマーク \`\`\`json などのマークアップは一切含めず、純粋なJSON文字列として返却してください）。

{
  "days": [
    {
      "dayName": "月曜日",
      "dishName": "主菜：〇〇 ＆ 汁物：〇〇（例: 主菜：カレイの煮付け ＆ 汁物：具沢山の豚汁）",
      "mainDishName": "カレイの煮付け",
      "soupName": "具沢山の豚汁",
      "calories": 2100,
      "description": "献立の説明や温かいメッセージ（和風の優しいトーンで、なぜこの家族構成に適しているか、栄養バランスのポイントなどを解説。こしらえ加減に合わせた工夫も添えてください）",
      "ingredients": [
        {
          "name": "カレイの切り身",
          "amount": "4切れ",
          "category": "海鮮"
        },
        {
          "name": "醤油",
          "amount": "大さじ3",
          "category": "調味料"
        }
      ],
      "recipeSteps": [
        "鍋に醤油、みりん、酒、水、生姜スライスを入れて一煮立ちさせます。",
        "カレイを並べ、落とし蓋をして弱火で約12分煮込みます。",
        "お椀にお味噌汁を用意し、温かく盛り付けた煮付けとともに食卓に運びます。"
      ],
      "mainDishSteps": [
        "カレイをお鍋に入れて、落とし蓋をして弱火でじっくり12分煮込みます。",
        "身が煮崩れないように、優しく煮汁を回しかけながら仕上げます。"
      ],
      "soupSteps": [
        "煮干しで出汁を引き、大根と人参を柔らかく煮ます。",
        "豚肉を加え、最後に味噌を溶き入れて火を止めます。"
      ],
      "notes": [
        "カレイの身は崩れやすいので、落とし蓋をし、極力箸で触れずに煮るのが綺麗に仕上げるコツです。",
        "お味噌の風味を損なわないよう、味噌を溶いた後は沸騰させないことが肝要でございます。"
      ]
    }
    // 火曜日から日曜日まで同様に計7日分を記述
  ],
  "makeAheadSideDish": {
    "dishName": "作り置き常備菜・副菜名（例: ひじきと大豆の五目甘辛煮）",
    "description": "常備菜の説明（1週間日持ちさせる保存のコツや、毎日の食卓での合わせ方などのアドバイスを和風トーンで記述）",
    "ingredients": [
      {
        "name": "乾燥ひじき",
        "amount": "30g",
        "category": "その他"
      },
      {
        "name": "大豆の煮物缶",
        "amount": "1缶",
        "category": "その他"
      }
    ],
    "recipeSteps": [
      "ひじきを水で戻し、よく洗って水気を切ります。",
      "鍋にごま油を熱し、ひじきと大豆を炒め、醤油・みりん・酒・砂糖で汁気がなくなるまで煮詰めます。"
    ]
  },
  "shoppingList": [
    {
      "id": "item_01",
      "name": "カレイの切り身",
      "amount": "4切れ",
      "category": "海鮮",
      "checked": false
    },
    {
      "id": "item_02",
      "name": "醤油",
      "amount": "大さじ5",
      "category": "調味料",
      "checked": false
    }
    // 1週間分のすべての材料（常備菜の材料もマージして含む）をカテゴリ別に重複なくマージ・集計してリスト化。
    // カテゴリは「野菜」「肉類」「海鮮」「調味料」「豆腐・大豆製品」「その他」などに分類してください。
  ]
}
`;

  try {
    // SDKの初期化（タイムアウト時間を十分（120秒）に長くとり、エラーによる中断を防ぎます）
    const ai = new GoogleGenAI({ 
      apiKey,
      httpOptions: {
        timeout: 120000 // 120秒（ミリ秒単位）
      }
    });

    // gemini-3.5-flashモデルを使用
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction,
        // JSON形式での出力を保証
        responseMimeType: 'application/json',
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error('Geminiからの応答が空でした。再度お試しください。');
    }

    // パース
    const parsedData = JSON.parse(text) as MenuData;

    // バリデーションと微調整
    if (!parsedData.days || !Array.isArray(parsedData.days) || parsedData.days.length === 0) {
      throw new Error('献立データのフォーマットが正しくありません。');
    }

    if (!parsedData.makeAheadSideDish || !parsedData.makeAheadSideDish.dishName) {
      throw new Error('常備菜（作り置き副菜）のデータが正しく生成されませんでした。');
    }

    // 生成日時を追加
    parsedData.generatedAt = new Date().toISOString();

    // shoppingListの各項目にIDがない、またはcheckedがない場合のフォールバック補正
    if (parsedData.shoppingList && Array.isArray(parsedData.shoppingList)) {
      parsedData.shoppingList = parsedData.shoppingList.map((item, index) => ({
        ...item,
        id: item.id || `item_${index}_${Math.random().toString(36).substr(2, 5)}`,
        checked: typeof item.checked === 'boolean' ? item.checked : false,
      }));
    } else {
      parsedData.shoppingList = [];
    }

    return parsedData;
  } catch (err: unknown) {
    console.error('Gemini API Error:', err);
    if (err instanceof Error) {
      if (err.message.includes('API_KEY_INVALID') || err.message.includes('API key not valid')) {
        throw new Error('APIキーが無効です。設定画面で正しいAPIキーを入力してください。');
      }
      throw new Error(`献立の作成に失敗しました：${err.message}`);
    }
    throw new Error('献立の作成中に予期せぬエラーが発生しました。インターネット接続とAPIキーをご確認ください。');
  }
}