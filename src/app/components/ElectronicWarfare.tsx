import { useState } from 'react';
import { DiceSelector } from './DiceSelector';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Dices, Zap, Target, RotateCcw } from 'lucide-react';
import { motion } from 'motion/react';
import { AttackStance } from '../App';
import { getDiceImage } from '../../ImageDice';

type DiceFace = {
  type: string;
  value: number | string;
};

type DiceResult = {
  face: DiceFace;
  id: string;
};

const 黄骰子 = [
  { type: 'light', value: 2 },
  { type: 'light', value: 2 },
  { type: 'light', value: 1 },
  { type: 'light', value: 1 },
  { type: 'hollow-light', value: 1 },
  { type: 'lightning', value: 'lightning' },
  { type: 'eye', value: 'eye' },
  { type: 'blank', value: 'blank' }
];

export interface ElectronicWarfareProps {
  translations: any; // 语言包对象，包含翻译文本
}

export function ElectronicWarfare({ translations }: ElectronicWarfareProps) {
  const [initiatorCount, setInitiatorCount] = useState(0);
  const [responderCount, setResponderCount] = useState(0);
  const [initiatorResults, setInitiatorResults] = useState<DiceResult[]>([]);
  const [responderResults, setResponderResults] = useState<DiceResult[]>([]);
  const [selectedInitiatorDice, setSelectedInitiatorDice] = useState<Set<string>>(new Set());
  const [selectedResponderDice, setSelectedResponderDice] = useState<Set<string>>(new Set());
  const [hasRerolled, setHasRerolled] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [stats, setStats] = useState<{
    initiatorLightning: number;
    initiatorLight: number;
    responderLightning: number;
    responderLight: number;
  } | null>(null);
  const [initiatorStance, setInitiatorStance] = useState<AttackStance>('宕机');
  const [responderStance, setResponderStance] = useState<AttackStance>('宕机');

  const rollDice = () => {
    const randomIndex = Math.floor(Math.random() * 8);
    return {
      face: 黄骰子[randomIndex],
      id: Math.random().toString(36).substr(2, 9)
    };
  };

  const handleRoll = () => {
    // 投掷发起方骰子
    const newInitiatorResults: DiceResult[] = [];
    for (let i = 0; i < initiatorCount; i++) {
      newInitiatorResults.push(rollDice());
    }

    // 投掷响应方骰子
    const newResponderResults: DiceResult[] = [];
    for (let i = 0; i < responderCount; i++) {
      newResponderResults.push(rollDice());
    }

    setInitiatorResults(newInitiatorResults);
    setResponderResults(newResponderResults);
    setSelectedInitiatorDice(new Set());
    setSelectedResponderDice(new Set());
    setHasRerolled(false);

    // 计算结果
    calculateWinner(newInitiatorResults, newResponderResults);
  };

  const handleReroll = () => {
    // 重投选中的骰子
    const newInitiatorResults = initiatorResults.map(result => {
      if (selectedInitiatorDice.has(result.id)) {
        return rollDice();
      }
      return result;
    });

    const newResponderResults = responderResults.map(result => {
      if (selectedResponderDice.has(result.id)) {
        return rollDice();
      }
      return result;
    });

    setInitiatorResults(newInitiatorResults);
    setResponderResults(newResponderResults);
    setSelectedInitiatorDice(new Set());
    setSelectedResponderDice(new Set());
    setHasRerolled(true);

    // 重新计算结果
    calculateWinner(newInitiatorResults, newResponderResults);
  };

  const toggleInitiatorDiceSelection = (diceId: string) => {
    if (hasRerolled) return;

    const newSelection = new Set(selectedInitiatorDice);
    if (newSelection.has(diceId)) {
      newSelection.delete(diceId);
    } else {
      newSelection.add(diceId);
    }
    setSelectedInitiatorDice(newSelection);
  };

  const toggleResponderDiceSelection = (diceId: string) => {
    if (hasRerolled) return;

    const newSelection = new Set(selectedResponderDice);
    if (newSelection.has(diceId)) {
      newSelection.delete(diceId);
    } else {
      newSelection.add(diceId);
    }
    setSelectedResponderDice(newSelection);
  };

  const calculateWinner = (initiator: DiceResult[], responder: DiceResult[]) => {
    // 统计闪电和轻击
    let initiatorLightning = 0;
    let initiatorLight = 0;
    let responderLightning = 0;
    let responderLight = 0;

    const processDice = (results: DiceResult[], stance: AttackStance) => {
      let lightning = 0;
      let light = 0;
      results.forEach(({ face }) => {
        if (face.type === 'lightning') lightning++;
        if (face.type === 'light') light += typeof face.value === 'number' ? face.value : 0;
        // 关键逻辑：如果处于攻击姿态，空心轻击生效
        if (stance === '攻击' && face.type === 'hollow-light') {
          light += typeof face.value === 'number' ? face.value : 0;
        }
      });
      return { lightning, light };
    };

    const iStats = processDice(initiator, initiatorStance);
    const rStats = processDice(responder, responderStance);

    setStats({
      initiatorLightning: iStats.lightning,
      initiatorLight: iStats.light,
      responderLightning: rStats.lightning,
      responderLight: rStats.light
    });

    // 判定胜者
    if (iStats.lightning > rStats.lightning) {
      setWinner(translations.initiator);
    } else if (rStats.lightning > iStats.lightning) {
      setWinner(translations.responder);
    } else {
      // 闪电数量相同，比较轻击
      if (iStats.light > rStats.light) {
        setWinner(translations.initiator);
      } else if (rStats.light > iStats.light) {
        setWinner(translations.responder);
      } else {
        // 闪电和轻击都相同，发起方胜
        setWinner(translations.initiator);
      }
    }
  };

  const handleReset = () => {
    setInitiatorResults([]);
    setResponderResults([]);
    setSelectedInitiatorDice(new Set());
    setSelectedResponderDice(new Set());
    setHasRerolled(false);
    setWinner(null);
    setStats(null);
  };



  // 拟物风格配置
  const neumorphicBox = "bg-slate-100 rounded-3xl shadow-[inset_4px_4px_8px_#bebebe,inset_-4px_-4px_8px_#ffffff] p-5";
  const diceButtonStyle = (isSelected: boolean) => `
    relative p-3 rounded-2xl flex flex-col items-center justify-center transition-all 
    ${isSelected
      ? 'bg-slate-200 shadow-[inset_4px_4px_8px_#bebebe,inset_-4px_-4px_8px_#ffffff] ring-2 ring-purple-400'
      : 'bg-slate-100 shadow-[6px_6px_12px_#bebebe,-6px_-6px_12px_#ffffff] hover:scale-105'}
  `;

  return (
    <div className="space-y-6">


      {/* 姿态切换区域 */}
      <div className="grid grid-cols-2 gap-4 ">
        <div className="space-y-2">
          <label className="text-[9px] font-black text-slate-500 uppercase">{translations.initiator}</label>
          <div className="flex bg-slate-200 p-1 rounded-xl shadow-inner">
            <button
              onClick={() => setInitiatorStance(initiatorStance === '攻击' ? '宕机' : '攻击')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${initiatorStance === '攻击' ? 'bg-red-100 shadow-md text-red-600' : 'text-slate-400'
                }`}
            >
              {initiatorStance === '攻击' ? translations.attack_label : translations.non_attack_label}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[9px] font-black text-slate-500 uppercase">{translations.responder}</label>
          <div className="flex bg-slate-200 p-1 rounded-xl shadow-inner">
            <button
              onClick={() => setResponderStance(responderStance === '攻击' ? '宕机' : '攻击')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${responderStance === '攻击' ? 'bg-red-100 shadow-md text-red-600' : 'text-slate-400'
                }`}
            >
              {responderStance === '攻击' ? translations.attack_label : translations.non_attack_label}
            </button>
          </div>
        </div>
      </div>

      {/* 骰子计数器 */}
      <div className="grid grid-cols-2 gap-4">
        <DiceSelector label={translations.initiator} count={initiatorCount} onCountChange={setInitiatorCount} color="bg-yellow-400" traslations={translations} />
        <DiceSelector label={translations.responder} count={responderCount} onCountChange={setResponderCount} color="bg-yellow-400" traslations={translations} />
      </div>



      {/* 动作按钮 */}
      <div className="flex gap-3">
        {initiatorResults.length === 0 ? (
          <button
            onClick={handleRoll}
            className="flex-1 py-4 rounded-2xl bg-slate-100 shadow-[6px_6px_12px_#bebebe,-6px_-6px_12px_#ffffff] font-bold text-slate-700 active:shadow-inner flex items-center justify-center gap-2"
          >
            <Dices className="w-5 h-5" /> {translations.roll}
          </button>
        ) : (
          <>
            {/* 只有在没有重投过，且选择了至少一个骰子时，才显示重投按钮 */}
            {!hasRerolled && (selectedInitiatorDice.size > 0 || selectedResponderDice.size > 0) && (
              <button
                onClick={handleReroll}
                className="flex-1 py-4 rounded-2xl bg-orange-50 shadow-[4px_4px_8px_#bebebe,-4px_-4px_8px_#ffffff] font-bold text-orange-700 active:shadow-inner flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-5 h-5" /> {translations.reroll || "重投"}
              </button>
            )}

            {/* 重置按钮 */}
            <button
              onClick={handleReset}
              className="p-4 rounded-2xl bg-slate-100 shadow-[4px_4px_8px_#bebebe,-4px_-4px_8px_#ffffff] text-slate-500 active:shadow-inner"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* 结果显示区域 */}
      {initiatorResults.length > 0 && (
        <div className="space-y-4">
          <div className={neumorphicBox}>
            <h3 className="text-xs font-black text-slate-500 uppercase mb-3">{translations.initiator}</h3>
            <div className="flex flex-wrap gap-2">
              {initiatorResults.map((res) => (
                <button
                  key={res.id}
                  onClick={() => toggleInitiatorDiceSelection(res.id)}
                  className={diceButtonStyle(selectedInitiatorDice.has(res.id))}
                >
                  {/* 替换 Zap 图标为图片 */}
                  <img
                    src={getDiceImage('yellow', res.face.type)}
                    alt={res.face.type}
                    className="w-8 h-8 object-contain"
                    loading='lazy'
                    onError={(e) => { (e.target as HTMLImageElement).src = '/yellow/blank-yellow.png'; }}
                  />
                  {/* 类型名称可以保留或根据需要隐藏 */}
                  <span className="text-[9px] font-bold mt-1 text-slate-600">{res.face.type}</span>
                </button>
              ))}
            </div>
          </div>

          <div className={neumorphicBox}>
            <h3 className="text-xs font-black text-slate-500 uppercase mb-3">{translations.responder}</h3>
            <div className="flex flex-wrap gap-2">
              {responderResults.map((res) => (
                <button
                  key={res.id}
                  onClick={() => toggleInitiatorDiceSelection(res.id)}
                  className={diceButtonStyle(selectedInitiatorDice.has(res.id))}
                >
                  {/* 替换 Zap 图标为图片 */}
                  <img
                    src={getDiceImage('yellow', res.face.type)}
                    alt={res.face.type}
                    className="w-8 h-8 object-contain"
                    loading='lazy'
                    onError={(e) => { (e.target as HTMLImageElement).src = '/yellow/blank-yellow.png'; }}
                  />
                  {/* 类型名称可以保留或根据需要隐藏 */}
                  <span className="text-[9px] font-bold mt-1 text-slate-600">{res.face.type}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 胜负结果展示 */}
      {winner && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`${neumorphicBox} border-2 border-yellow-400`}>
          <div className="text-center font-black text-lg text-slate-700 mb-2">{winner} {translations.win}！</div>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="bg-white/50 p-2 rounded-lg">⚡ {translations.initiator}: {stats?.initiatorLightning} {translations.lightning}</div>
            <div className="bg-white/50 p-2 rounded-lg">⚡ {translations.responder}: {stats?.responderLightning} {translations.lightning}</div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
