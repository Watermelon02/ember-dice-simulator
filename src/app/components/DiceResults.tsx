import { getDiceImage } from '../../ImageDice';
import { DiceResult, DefenseStance, AttackStance } from '../App';
import { Card } from './ui/card';
import { Shield, ShieldAlert, Zap, Eye, Circle, Target, Check, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';

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
  const getDiceIcon = (type: string, value: number | string) => {
    switch (type) {
      case 'light':
        return (
          <div className="flex items-center gap-1">
            <Target className="w-4 h-4" />
            {typeof value === 'number' && value > 1 && <span className="text-xs">×{value}</span>}
          </div>
        );
      case 'heavy':
        return (
          <div className="flex items-center gap-1">
            <Target className="w-5 h-5" />
            <Target className="w-3 h-3 -ml-2" />
          </div>
        );
      case 'hollow-light':
        return (
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 border-2 border-current rounded-full" />
            <Target className="w-3 h-3 -ml-3" />
          </div>
        );
      case 'hollow-heavy':
        return (
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 border-2 border-current rounded-full" />
            <Target className="w-4 h-4 -ml-2" />
          </div>
        );
      case 'defense':
        return <Shield className="w-5 h-5" />;
      case 'hollow-defense2':
        return (
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 border-2 border-current rounded-full" />
            <Shield className="w-3 h-3 -ml-3" />
            <Shield className="w-3 h-3 -ml-2" />
          </div>
        );
      case 'evade':
        return <ShieldAlert className="w-5 h-5" />;
      case 'lightning':
        return <Zap className="w-5 h-5" />;
      case 'eye':
        return <Eye className="w-5 h-5" />;
      case 'blank':
        return <Circle className="w-5 h-5" />;
      default:
        return <Circle className="w-5 h-5" />;
    }
  };

  const getFaceLabel = (type: string, value: number | string) => {
    switch (type) {
      case 'light':
        return `轻击${typeof value === 'number' && value > 1 ? '×' + value : ''}`;
      case 'heavy':
        return '重击';
      case 'hollow-light':
        return '空心轻击';
      case 'hollow-heavy':
        return '空心重击';
      case 'defense':
        return '防御';
      case 'hollow-defense2':
        return '空心2盾';
      case 'evade':
        return '闪避';
      case 'lightning':
        return '闪电';
      case 'eye':
        return '眼睛';
      case 'blank':
        return '空白';
      default:
        return '未知';
    }
  };

  const getDiceStyle = (color: 'yellow' | 'red' | 'white' | 'blue', isSelected: boolean, isEffective: boolean) => {
    const base = "flex flex-col items-center justify-center p-2 rounded-2xl cursor-pointer transition-all border-2";
    const colors = {
      'yellow': 'bg-yellow-100 border-yellow-300 text-yellow-800',
      'red': 'bg-red-100 border-red-300 text-red-800',
      'white': 'bg-slate-50 border-slate-200 text-slate-700',
      'blue': 'bg-blue-100 border-blue-300 text-blue-800'
    };
    const activeState = isSelected ? "ring-2 ring-slate-800 scale-105 shadow-md" : "hover:scale-105";
    const inactiveState = !isEffective ? "opacity-40 grayscale" : "";
    return `${base} ${colors[color]} ${activeState} ${inactiveState}`;
  };

  const isEffective = (result: DiceResult) => {
    const { type, color } = result.face;
    if (type === 'hollow-defense2' && defenseStance !== '防御') return false;
    if ((type === 'hollow-light' || type === 'hollow-heavy') && attackStance !== '攻击') return false;
    return true;
  };


  return (
    <div className="space-y-4">
      {/* 骰子区域 */}
      <div className="grid grid-cols-1 gap-3">
        {[translations.attacker, translations.defender].map((side, i) => {
          const sideDice = i === 0
            ? results.filter(r => r.color === 'yellow' || r.color === 'red')
            : results.filter(r => r.color === 'white' || r.color === 'blue');

          if (sideDice.length === 0) return null;

          return (
            <div key={side} className="bg-slate-200/30 p-3 rounded-2xl">
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">{side}</h3>
              <div className="flex flex-wrap gap-2">
                {sideDice.map((result) => (
                  <button
                    key={result.id}
                    onClick={() => !hasRerolled && onDiceClick(result.id)}
                    className={getDiceStyle(result.color, selectedDice.has(result.id), isEffective(result))}
                  >
                    {/* 替换原有的 getDiceIcon，直接渲染图片 */}
                    <img
                      src={getDiceImage(result.color, result.face.type)}
                      alt={result.face.type}
                      className="w-8 h-8 object-contain transition-transform"
                      onError={(e) => {
                        console.error("图片加载失败，实际路径:", (e.target as HTMLImageElement).src);
                        (e.target as HTMLImageElement).src = '/fallback.png'; // 如果 fallback.png 也在 public 里，路径也要去掉 /public
                      }}
                      loading='lazy'
                    />



                    {selectedDice.has(result.id) && (
                      <div className="absolute -top-1 -right-1 bg-slate-800 text-white rounded-full p-0.5">
                        <Check size={10} />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
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

          {/* 穿透结果 */}
          <div className="p-4 rounded-2xl bg-slate-100 shadow-[4px_4px_8px_#bebebe,-4px_-4px_8px_#ffffff] border border-white">
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

        </motion.div>
      )}
    </div>
  );

}