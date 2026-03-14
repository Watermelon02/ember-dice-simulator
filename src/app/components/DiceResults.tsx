import { useMemo, useState } from 'react';
import { getDiceImage } from '../../ImageDice';
import { DiceResult, DefenseStance, AttackStance } from '../App';
import { Card } from './ui/card';
import { Shield, ShieldAlert, Zap, Eye, Circle, Target, Check, AlertTriangle, XCircle, ArrowDownUp } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

interface DiceResultsProps {
  results: DiceResult[];
  battleResult: {
    attackLight: number;
    attackHeavy: number;
    defenseValue: number;
    evadeValue: number;
    remainingLight: number;
    remainingHeavy: number;
    isPenetrated: boolean;
    isHit: boolean;
  } | null;
  defenseStance: DefenseStance;
  attackStance: AttackStance;
  selectedDice: Set<string>;
  onDiceClick: (diceId: string) => void;
  hasRerolled: boolean;
  translations: any; // 语言包对象，包含翻译文本
}

export function DiceResults({
  results,
  battleResult,
  defenseStance,
  attackStance,
  selectedDice,
  onDiceClick,
  hasRerolled,
  translations
}: DiceResultsProps) {

  // 控制是否显示抵消后的状态
  const [isOffsetActive, setIsOffsetActive] = useState(false);

  const getDiceStyle = (result: DiceResult, isSelected: boolean, isCancelled: boolean) => {
    const effective = isEffective(result);

    const base = "relative flex flex-col items-center justify-center p-0 rounded-2xl cursor-pointer transition-all border-2";
    const colors = {
      'yellow': 'bg-yellow-100 border-yellow-300 text-yellow-800',
      'red': 'bg-red-100 border-red-300 text-red-800',
      'white': 'bg-slate-50 border-slate-200 text-slate-700',
      'blue': 'bg-blue-100 border-blue-300 text-blue-800'
    };

    const activeState = isSelected ? "ring-2 ring-slate-800 scale-105 shadow-md" : "hover:scale-105";

    // 无效状态 vs 被抵消状态
    let extraStyle = "";
    if (!effective) {
      extraStyle = "opacity-30 border-dashed border-slate-400 grayscale";
    } else if (isCancelled) {
      extraStyle = "opacity-20 scale-90 saturate-0 border-slate-300 shadow-inner";
    }

    return `${base} ${colors[result.color]} ${activeState} ${extraStyle}`;
  };

  const colorOrder: Record<string, number> = {
    'yellow': 1,
    'red': 2,
    'white': 3,
    'blue': 4
  };

  // 2. 定义红黄骰子（攻击方）的面类型优先级
  const attackerTypeRank: Record<string, number> = {
    'heavy': 1,
    'hollow-heavy': 1,
    'light': 2,
    'hollow-light': 2,
    'eye': 3,
    'lightning': 4,
    'blank': 5
  };

  // 3. 定义蓝白骰子（防御方）的面类型优先级
  const defenderTypeRank: Record<string, number> = {
    'evade': 1,
    'defense': 2,
    'hollow-defense2': 2,
    'eye': 3,
    'lightning': 4,
    'blank': 5
  };

  const isEffective = (result: DiceResult) => {
    const { type } = result.face;
    if (result.color === 'blue' && defenseStance !== 'mobility') return false
    // 1. 任何空白面直接视为无效
    if (type === 'blank') return false;

    // 2. 根据姿态判断空心面的有效性
    if (type === 'hollow-defense2' && defenseStance !== '防御') return false;
    if ((type === 'hollow-light' || type === 'hollow-heavy') && attackStance !== '攻击') return false;

    return true;
  };

  const isLightAttack = (type: string) => type === 'light' || type === 'hollow-light';

  // --- 性能优化：将排序操作提取到 useMemo，避免在每次渲染时重复进行大量的数组排序 ---
  const { sortedAttackerDice, sortedDefenderDice } = useMemo(() => {
    const attackers = results.filter(r => r.color === 'yellow' || r.color === 'red');
    const defenders = results.filter(r => r.color === 'white' || r.color === 'blue');

    const sortDice = (a: DiceResult, b: DiceResult, rankMap: Record<string, number>) => {
      const aEff = isEffective(a);
      const bEff = isEffective(b);
      if (aEff !== bEff) return aEff ? -1 : 1;

      const rankA = rankMap[a.face.type] || 99;
      const rankB = rankMap[b.face.type] || 99;
      if (rankA !== rankB) return rankA - rankB;

      const colorDiff = (colorOrder[a.color] || 99) - (colorOrder[b.color] || 99);
      if (colorDiff !== 0) return colorDiff;

      return (Number(b.face.value) || 0) - (Number(a.face.value) || 0);
    };

    return {
      sortedAttackerDice: attackers.sort((a, b) => sortDice(a, b, attackerTypeRank)),
      sortedDefenderDice: defenders.sort((a, b) => sortDice(a, b, defenderTypeRank))
    };
  }, [results, attackStance, defenseStance]); // 仅在数据或姿态变更时重新排序

  // --- 核心计算：计算哪些骰子被抵消了 ---
  const { cancelledDiceIds, partialOffsets } = useMemo(() => {
    if (!isOffsetActive || !battleResult) {
      return { cancelledDiceIds: new Set<string>(), partialOffsets: {} as Record<string, number> };
    }

    const cancelled = new Set<string>();
    const partials: Record<string, number> = {};

    // 1. 获取所有有效的攻击骰子（重击和轻击）
    const activeAttackers = results
      .filter(r => (r.color === 'red' || r.color === 'yellow') && isEffective(r))
      .sort((a, b) => (attackerTypeRank[a.face.type] || 0) - (attackerTypeRank[b.face.type] || 0));

    // 2. 建立伤害池
    let currentEvade = Number(battleResult.evadeValue) || 0;
    let currentDefense = Number(battleResult.defenseValue) || 0;

    // 分离重击和轻击，保证重击优先结算
    const heavyAttackers = activeAttackers.filter(r => r.face.type.includes('heavy'));
    const lightAttackers = activeAttackers.filter(r => isLightAttack(r.face.type));

    // A. 处理重击 (只能被闪避抵消)
    heavyAttackers.forEach(dice => {
      const val = Number(dice.face.value) || 0;
      if (currentEvade >= val) {
        currentEvade -= val;
        cancelled.add(dice.id);
      }
    });

    // B. 处理轻击 (先被闪避，后被防御)
    lightAttackers.forEach(dice => {
      let r = Number(dice.face.value) || 0;

      // 先扣除剩余闪避
      const fromEvade = Math.min(r, currentEvade);
      r -= fromEvade;
      currentEvade -= fromEvade;

      // 再扣除防御
      const fromDef = Math.min(r, currentDefense);
      r -= fromDef;
      currentDefense -= fromDef;

      if (r === 0) {
        cancelled.add(dice.id);
      } else if (r < Number(dice.face.value)) {
        partials[dice.id] = r;
      }
    });

    // 3. 计算防御方骰子的消耗（标记哪些被打叉）
    // 逻辑：防御骰子是否打叉，取决于该防御骰子是否真正抵消了伤害
    // 我们重新模拟一遍消耗，如果骰子数值被用掉了，就打叉
    let remainingHeavy = Number(battleResult.attackHeavy);
    let remainingLight = Number(battleResult.attackLight);
    let tempEvade = Number(battleResult.evadeValue);
    let tempDef = Number(battleResult.defenseValue);

    // 重新排序防御方骰子：闪避面优先
    const activeDefenders = results
      .filter(r => (r.color === 'white' || r.color === 'blue') && isEffective(r))
      .sort((a, b) => (defenderTypeRank[a.face.type] || 0) - (defenderTypeRank[b.face.type] || 0));

    activeDefenders.forEach(dice => {
      let val = Number(dice.face.value) || 0;
      if (dice.face.type === 'hollow-defense2' && defenseStance === '防御') val = 2;

      if (dice.face.type === 'evade' && tempEvade > 0) {
        // 该闪避骰子是否参与了抵消？
        // 这里简化：只要还有伤害未抵消，且该骰子是闪避，就判定其消耗
        if (remainingHeavy > 0 || remainingLight > 0) {
          const consume = Math.min(tempEvade, val);
          tempEvade -= consume;
          cancelled.add(dice.id);

          // 减去伤害池
          const heavyBlocked = Math.min(remainingHeavy, consume);
          remainingHeavy -= heavyBlocked;
          remainingLight -= Math.max(0, consume - heavyBlocked);
        }
      } else if (dice.face.type.includes('defense') && tempDef > 0) {
        if (remainingLight > 0) {
          tempDef -= Math.min(tempDef, val);
          remainingLight -= Math.min(remainingLight, val);
          cancelled.add(dice.id);
        }
      }
    });

    return { cancelledDiceIds: cancelled, partialOffsets: partials };
  }, [isOffsetActive, results, battleResult, defenseStance, attackStance]);

  const renderSide = (sideIndex: number) => {
    // 渲染时直接使用预先排序好的数组
    const sideDice = sideIndex === 0 ? sortedAttackerDice : sortedDefenderDice;

    if (sideDice.length === 0) return null;

    return (
      <div className="bg-slate-200/30 p-3 rounded-2xl min-h-[80px]">
        <div className="flex flex-wrap gap-2">
          <AnimatePresence mode="popLayout">
            {sideDice.map((result) => {
              const partialValue = partialOffsets[result.id];
              const isCancelled = cancelledDiceIds.has(result.id);
              // 如果开启了抵消且该骰子被抵消，则不渲染（触发 exit 动画）
              if (isOffsetActive && isCancelled) return null;

              const displayValue = partialValue !== undefined ? partialValue : result.face.value;
              const displayType = (partialValue !== undefined) ? 'light' : result.face.type;

              return (
                <motion.div
                  key={result.id}
                  layout // 核心：layout 允许 Framer Motion 自动处理位移和大小变化
                  initial={{ opacity: 0, scale: 0.3 }}
                  animate={{
                    opacity: isOffsetActive && isCancelled ? 0.3 : 1,
                    scale: isOffsetActive && isCancelled ? 0.9 : 1,
                    filter: isOffsetActive && isCancelled ? "grayscale(1) saturate(0)" : "none"
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  will-change="transform"
                >
                  <button
                    onClick={() => !hasRerolled && onDiceClick(result.id)}
                    className={getDiceStyle(result, selectedDice.has(result.id), isCancelled)}
                  >
                    <img
                      src={getDiceImage(result.color, displayType, displayValue)}
                      alt={result.face.type}
                      loading='lazy'
                      className={`w-7 h-7 object-contain ${isOffsetActive && isCancelled ? 'opacity-50' : ''}`}
                    />
                    {/* 如果被抵消，可以叠加一个叉号标记 */}
                    {isOffsetActive && isCancelled && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <XCircle className="text-red-500 w-8 h-8 opacity-80" />
                      </div>
                    )}
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* 穿透结果 */}
      {battleResult && (<div>
        <div >
          <div className="flex justify-around">
            <div className="flex gap-2">
              {battleResult.isPenetrated ? (
                <div className="px-3 py-1 rounded-full bg-red-100 text-red-600 shadow-[2px_2px_4px_#bebebe] text-[10px] font-bold flex items-center gap-1">
                  <AlertTriangle size={10} /> {translations.penetration}
                </div>
              ) : (
                <div className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-600 shadow-[2px_2px_4px_#bebebe] text-[10px] font-bold">
                  🛡️ {translations.non_penetration}
                </div>
              )}
            </div>
            <div>{battleResult.isHit ?
              <div className="px-3 py-1 rounded-full bg-red-100 text-red-600 shadow-[2px_2px_4px_#bebebe] text-[10px] font-bold flex items-center gap-1">
                🎯 {translations.effect}
              </div> : <div className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-600 shadow-[2px_2px_4px_#bebebe] text-[10px] font-bold">
                {translations.non_effect}
              </div>
            }</div>
          </div>
        </div>
      </div>)}
      {/* 骰子区域 */}
      <div className="flex flex-col ">
        {renderSide(0)} {/* 攻击方 */}

        {/* 抵消切换按钮 */}
        {results.length > 0 && (
          <div className="relative flex items-center justify-center ">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-300 border-dashed"></div>
            </div>
            <button
              onClick={() => setIsOffsetActive(!isOffsetActive)}
              className={`relative px-4 py-1.5 rounded-full text-[10px] font-black flex items-center gap-2 transition-all shadow-md active:scale-95 ${isOffsetActive
                ? 'bg-slate-700 text-white ring-4 ring-slate-200'
                : 'bg-white text-slate-500 hover:bg-slate-50'
                }`}
            >
              <ArrowDownUp size={12} className={isOffsetActive ? "rotate-180 transition-transform" : ""} />
              {isOffsetActive ? translations.show_all : translations.simulate_offset}
            </button>
          </div>
        )}

        {renderSide(1)} {/* 防御方 */}
      </div>


      {/* 详细战斗结算看板 */}
      {battleResult && (
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className={`bg-slate-100 rounded-3xl shadow-[inset_4px_4px_8px_#bebebe,inset_-4px_-4px_8px_#ffffff] p-5 space-y-4`}
        >


          {/* 数据统计网格 */}
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="bg-slate-200/50 p-3 rounded-2xl shadow-inner">
              <p className="text-[10px] text-slate-500 font-bold mb-1">{translations.attack_statistics}</p>
              <p className="text-sm font-bold text-slate-700">{translations.light_attack}: {battleResult.attackLight} | {translations.heavy_attack}: {battleResult.attackHeavy}</p>
            </div>
            <div className="bg-slate-200/50 p-3 rounded-2xl shadow-inner">
              <p className="text-[10px] text-slate-500 font-bold mb-1">{translations.defense_statistics}</p>
              <p className="text-sm font-bold text-slate-700">{translations.defense_dice}: {battleResult.defenseValue} | {translations.evade_dice}: {battleResult.evadeValue}</p>
            </div>
          </div>



        </motion.div>
      )}
    </div>
  );

}