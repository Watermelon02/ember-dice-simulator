import { useEffect, useState } from 'react';
import { DiceSelector } from './components/DiceSelector';
import { DiceResults } from './components/DiceResults';
import { StanceSelector } from './components/StanceSelector';
import { ElectronicWarfare } from './components/ElectronicWarfare';
import { Button } from './components/ui/button';
import { Card } from './components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Dices, Globe, Repeat, Repeat1, RotateCcw, Zap } from 'lucide-react';
import { LocationDice } from './components/LocationDice';
import { translations } from '../translations';

// 骰子面定义
const yellowDice = [
  { type: 'light', value: 2 },
  { type: 'light', value: 2 },
  { type: 'light', value: 1 },
  { type: 'light', value: 1 },
  { type: 'hollow-light', value: 1 },
  { type: 'lightning', value: 'lightning' },
  { type: 'eye', value: 'eye' },
  { type: 'blank', value: 'blank' }
];

const redDice = [
  { type: 'heavy', value: 1 },
  { type: 'heavy', value: 1 },
  { type: 'heavy', value: 1 },
  { type: 'heavy', value: 1 },
  { type: 'hollow-heavy', value: 1 },
  { type: 'hollow-light', value: 1 },
  { type: 'lightning', value: 'lightning' },
  { type: 'eye', value: 'eye' }
];

const whiteDice = [
  { type: 'defense', value: 1 },
  { type: 'hollow-defense2', value: 0 },
  { type: 'hollow-defense2', value: 0 },
  { type: 'evade', value: 1 },
  { type: 'lightning', value: 'lightning' },
  { type: 'lightning', value: 'lightning' },
  { type: 'eye', value: 'eye' },
  { type: 'blank', value: 'blank' }
];

const blueDice = [
  { type: 'evade', value: 1 },
  { type: 'evade', value: 1 },
  { type: 'eye', value: 'eye' },
  { type: 'eye', value: 'eye' },
  { type: 'lightning', value: 'lightning' },
  { type: 'blank', value: 'blank' },
  { type: 'blank', value: 'blank' },
  { type: 'blank', value: 'blank' }
];

export type DiceFace = {
  type: string;
  value: number | string;
};

export type DiceResult = {
  color: 'yellow' | 'red' | 'white' | 'blue';
  face: DiceFace;
  id: string;
};

export type DefenseStance = 'mobility' | '防御' | '宕机';
export type AttackStance = '攻击' | '宕机' | '非攻击';

function App() {
  const [mode, setMode] = useState<'combat' | 'electronic'>('combat');

  // 战斗模式状态
  const [yellowCount, setYellowCount] = useState(0);
  const [redCount, setRedCount] = useState(0);
  const [whiteCount, setWhiteCount] = useState(3);
  const [blueCount, setBlueCount] = useState(0);
  const [defenseStance, setDefenseStance] = useState<DefenseStance>('mobility');
  const [attackStance, setAttackStance] = useState<AttackStance>('宕机');
  const [results, setResults] = useState<DiceResult[]>([]);
  const [selectedDice, setSelectedDice] = useState<Set<string>>(new Set());
  const [hasRerolled, setHasRerolled] = useState(false);
  const [battleResult, setBattleResult] = useState<{
    attackLight: number;
    attackHeavy: number;
    defenseValue: number;
    evadeValue: number;
    remainingLight: number;
    remainingHeavy: number;
    isPenetrated: boolean;
    isHit: boolean;
  } | null>(null);
  const [lang, setLang] = useState<'zh' | 'en' | 'ja'>(() =>
    (localStorage.getItem('app-lang') as 'zh' | 'en' | 'ja') || 'zh'
  );
  const t = translations[lang];

  useEffect(() => {
    localStorage.setItem('app-lang', lang);
  }, [lang]);
  useEffect(() => {
    if (results.length > 0) {
      calculateBattleResult(results);
    }
  }, [defenseStance, attackStance]);
  // 只要姿态发生变化，且当前有结果，就会重新计算

  const rollDice = (diceTemplate: DiceFace[], color: 'yellow' | 'red' | 'white' | 'blue') => {
    const randomIndex = Math.floor(Math.random() * 8);
    return {
      color,
      face: diceTemplate[randomIndex],
      id: Math.random().toString(36).substr(2, 9)
    };
  };

  const handleRoll = () => {
    const newResults: DiceResult[] = [];

    // 投掷yellow骰子（攻击方）
    for (let i = 0; i < yellowCount; i++) {
      newResults.push(rollDice(yellowDice, 'yellow'));
    }

    // 投掷red骰子（攻击方）
    for (let i = 0; i < redCount; i++) {
      newResults.push(rollDice(redDice, 'red'));
    }

    // 投掷whiteDice（防御方）
    for (let i = 0; i < whiteCount; i++) {
      newResults.push(rollDice(whiteDice, 'white'));
    }

    // 只有在机动姿态才投blueDice（防御方）
    if (defenseStance === 'mobility') {
      for (let i = 0; i < blueCount; i++) {
        newResults.push(rollDice(blueDice, 'blue'));
      }
    }

    setResults(newResults);
    setSelectedDice(new Set());
    setHasRerolled(false);
    calculateBattleResult(newResults);
  };

  const handleReroll = () => {
    const newResults = results.map(result => {
      if (selectedDice.has(result.id)) {
        // 重投选中的骰子
        const template =
          result.color === 'yellow' ? yellowDice :
            result.color === 'red' ? redDice :
              result.color === 'white' ? whiteDice : blueDice;
        return rollDice(template, result.color);
      }
      return result;
    });

    setResults(newResults);
    setSelectedDice(new Set());
    setHasRerolled(true);
    calculateBattleResult(newResults);
  };

  const toggleDiceSelection = (diceId: string) => {
    if (hasRerolled) return; // 已经重投过，不能再选择

    const newSelection = new Set(selectedDice);
    if (newSelection.has(diceId)) {
      newSelection.delete(diceId);
    } else {
      newSelection.add(diceId);
    }
    setSelectedDice(newSelection);
  };

 const calculateBattleResult = (diceResults: DiceResult[]) => {
  let attackLight = 0;
  let attackHeavy = 0;
  let defenseValue = 0;
  let evadeValue = 0;

  diceResults.forEach(({ face, color }) => {
    if (color === 'blue' && defenseStance !== 'mobility') return;
    const val = Number(face.value) || 0; // 统一转数字
    switch (face.type) {
      case 'light': attackLight += val; break;
      case 'heavy': attackHeavy += val; break;
      case 'hollow-light': if (attackStance === '攻击') attackLight += val; break;
      case 'hollow-heavy': if (attackStance === '攻击') attackHeavy += val; break;
      case 'evade': evadeValue += val; break;
      case 'defense': defenseValue += val; break;
      case 'hollow-defense2':
        // 关键修复：空心防御在防御姿态下提供 2 点
        if (defenseStance === '防御') defenseValue += 2; 
        break;
    }
  });

  // --- 核心逻辑调整：闪避优先 ---
  let tempEvade = evadeValue;
  let tempHeavy = attackHeavy;
  let tempLight = attackLight;

  // 1. 闪避优先抵消重击
  const heavyEvaded = Math.min(tempHeavy, tempEvade);
  tempHeavy -= heavyEvaded;
  tempEvade -= heavyEvaded;

  // 2. 剩余闪避抵消轻击
  const lightEvaded = Math.min(tempLight, tempEvade);
  tempLight -= lightEvaded;
  tempEvade -= lightEvaded;

  // 3. 剩下的轻击再由防御抵消
  const lightBlockedByDefense = Math.min(tempLight, defenseValue);
  const remainingLight = tempLight - lightBlockedByDefense;
  const remainingHeavy = tempHeavy; // 重击不能被防御抵消

  const isPenetrated = remainingLight > 0 || remainingHeavy > 0;
  
  // 4. 判定命中：产生了穿透，或者攻击接触到了防御面（即闪避没开干净）
  const isHit = isPenetrated || (lightBlockedByDefense > 0);

  setBattleResult({
    attackLight, attackHeavy,
    defenseValue, evadeValue,
    remainingLight, remainingHeavy,
    isPenetrated, isHit
  });
};

  const handleReset = () => {
    setResults([]);
    setBattleResult(null);
    setSelectedDice(new Set());
    setHasRerolled(false);
    handleRoll(); // 重置时自动投掷一次，展示初始结果
  };

  return (
    <div className="min-h-screen bg-slate-200 text-slate-800 sm:p-6 font-sans">
      <div className="max-w-md mx-auto space-y-4">


        {/* 主卡片：拟物风格 */}
        <Card className="p-4 sm:p-6 bg-slate-100 rounded-[2rem] border-none shadow-[20px_20px_60px_#bebebe,-20px_-20px_60px_#ffffff]">
          <Tabs value={mode} onValueChange={(v) => { setMode(v as any); handleReset(); }}>
            <TabsList className="grid w-full grid-cols-2 bg-slate-200/50 p-1 rounded-xl shadow-inner mb-6">
              <TabsTrigger value="combat" className="rounded-lg data-[state=active]:bg-slate-100 data-[state=active]:shadow-md">
                {t.attack}
              </TabsTrigger>
              <TabsTrigger value="electronic" className="rounded-lg data-[state=active]:bg-slate-100 data-[state=active]:shadow-md">
                {t.electronic_warfare}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="combat" className="space-y-3">
              <LocationDice translations={t} />

              <StanceSelector
                defenseStance={defenseStance}
                attackStance={attackStance}
                onDefenseStanceChange={setDefenseStance}
                onAttackStanceChange={setAttackStance}
                translations={t}
              />

              {/* 骰子面板 */}
              <div className="grid grid-cols-2 gap-2 p-2 rounded-xl bg-slate-100 shadow-[inset_6px_6px_12px_#bebebe,inset_-6px_-6px_12px_#ffffff]">
                <div className="space-y-4">
                  {/* <p className="text-[10px] font-black text-red-400 uppercase tracking-tighter border-b border-red-100 pb-1">Attacker</p> */}
                  <DiceSelector label={t.light_attack} count={yellowCount} onCountChange={setYellowCount} color="bg-yellow-400" traslations={t} />
                  <DiceSelector label={t.heavy_attack} count={redCount} onCountChange={setRedCount} color="bg-red-500" traslations={t} />
                </div>
                <div className="space-y-4 border-l border-slate-200 pl-4 relative">
                  {/* <p className="text-[10px] font-black text-blue-400 uppercase tracking-tighter border-b border-blue-100 pb-1">Defender</p> */}
                  <DiceSelector label={t.defense_dice} count={whiteCount} onCountChange={setWhiteCount} color="bg-white" traslations={t} />
                  <div className="relative">
                    <DiceSelector label={t.evade_dice} count={blueCount} onCountChange={setBlueCount} color="bg-blue-500" disabled={defenseStance !== 'mobility'} traslations={t} />
                    {defenseStance !== 'mobility' && (
                      <span className="absolute -top-1 -right-1 text-[8px] bg-slate-300 text-slate-600 px-1 rounded shadow-sm">{t.mobility_label}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* 动作按钮区 */}
              <div className="flex gap-4">
                {results.length === 0 ? (
                  <button
                    onClick={handleRoll}
                    disabled={yellowCount + redCount + whiteCount + blueCount === 0}
                    className="flex-1 py-4 rounded-2xl bg-slate-100 text-slate-700 font-bold shadow-[6px_6px_12px_#bebebe,-6px_-6px_12px_#ffffff] active:shadow-inner disabled:opacity-30 flex items-center justify-center gap-2"
                  >
                    <Dices className="w-5 h-5" /> {t.roll}
                  </button>
                ) : (
                  <>
                    <button onClick={handleReroll} disabled={hasRerolled || selectedDice.size === 0}
                      className={`flex-1 py-4 rounded-2xl  font-bold shadow-[4px_4px_8px_#bebebe,-4px_-4px_8px_#ffffff] active:shadow-inner flex items-center justify-center gap-2 ${hasRerolled ? `bg-slate-100 text-slate-700` : `bg-orange-50 text-orange-700`} ${selectedDice.size === 0 ? 'opacity-30 cursor-not-allowed' : ''}`}>
                      {t.focus}
                    </button>

                    <button onClick={handleReset}
                      className=" p-4 rounded-2xl flex items-center justify-center bg-slate-100 text-slate-500 shadow-[4px_4px_8px_#bebebe,-4px_-4px_8px_#ffffff] active:shadow-inner">
                      <RotateCcw className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>

              {/* 结果显示 */}
              {results.length > 0 && (
                <div className="p-4 rounded-3xl bg-slate-100 shadow-[inset_4px_4px_8px_#bebebe,inset_-4px_-4px_8px_#ffffff]">
                  <DiceResults {...{ results, battleResult, defenseStance, attackStance, selectedDice, hasRerolled }} onDiceClick={toggleDiceSelection} translations={t} />
                </div>
              )}
            </TabsContent>
            {/* 电子战模式 */}
            <TabsContent value="electronic" className="mt-6">
              <ElectronicWarfare translations={t} />
            </TabsContent>
          </Tabs>
          {/* 语言切换 */}
          <div className="flex justify-start mb-2">
            <div className="flex items-center gap-2 bg-slate-100 p-2 rounded-2xl shadow-[4px_4px_8px_#bebebe,-4px_-4px_8px_#ffffff]">
              <Globe className="w-4 h-4 text-slate-400 ml-1" />
              <div className="flex gap-1">
                {(['zh', 'en', 'ja'] as const).map((l) => (
                  <button
                    key={l}
                    onClick={() => setLang(l)}
                    className={`px-3 py-1 text-[10px] font-black rounded-lg transition-all ${lang === l
                      ? 'bg-slate-200 shadow-[inset_2px_2px_4px_#bebebe,inset_-2px_-2px_4px_#ffffff] text-slate-700'
                      : 'text-slate-400 hover:text-slate-600'
                      }`}
                  >
                    {l === 'zh' ? '中' : l === 'en' ? 'EN' : '日'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>

      </div>
    </div>
  );
}

export default App;
