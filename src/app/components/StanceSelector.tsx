import { Shield, Zap, Swords } from 'lucide-react';
import { DefenseStance, AttackStance } from '../App';

interface StanceSelectorProps {
  defenseStance: DefenseStance;
  attackStance: AttackStance;
  onDefenseStanceChange: (stance: DefenseStance) => void;
  onAttackStanceChange: (stance: AttackStance) => void;
  translations: any; // 语言包对象，包含翻译文本
}

export function StanceSelector({ defenseStance, attackStance, onDefenseStanceChange, onAttackStanceChange, translations }: StanceSelectorProps) {
  const btnClass = (active: boolean, activeColor: string) => `
    flex-1 py-2 rounded-xl transition-all flex flex-col items-center gap-1
    ${active 
      ? `${activeColor} shadow-[inset_4px_4px_8px_rgba(0,0,0,0.1)]` 
      : 'bg-slate-100 shadow-[4px_4px_8px_#bebebe,-4px_-4px_8px_#ffffff] hover:bg-slate-50'}
  `;

  return (
    <div className="flex gap-3">
      <div className="flex-[2] flex gap-2 p-1 bg-slate-200/50 rounded-2xl shadow-inner">
        <button onClick={() => onDefenseStanceChange(defenseStance === 'mobility' ? '宕机' : 'mobility')}
          className={btnClass(defenseStance === 'mobility', 'bg-blue-100')}>
          <Zap className={`w-4 h-4 ${defenseStance === 'mobility' ? 'text-blue-600' : 'text-slate-400'}`} />
          <span className={`text-[10px] font-bold ${defenseStance === 'mobility' ? 'text-blue-700' : 'text-slate-500'}`}>{translations.mobility_label}</span>
        </button>
        <button onClick={() => onDefenseStanceChange(defenseStance === '防御' ? '宕机' : '防御')}
          className={btnClass(defenseStance === '防御', 'bg-indigo-100')}>
          <Shield className={`w-4 h-4 ${defenseStance === '防御' ? 'text-indigo-600' : 'text-slate-400'}`} />
          <span className={`text-[10px] font-bold ${defenseStance === '防御' ? 'text-indigo-700' : 'text-slate-500'}`}>{translations.defense_label}</span>
        </button>
      </div>
      <div className="flex-[1] flex p-1 bg-slate-200/50 rounded-2xl shadow-inner">
        <button onClick={() => onAttackStanceChange(attackStance === '攻击' ? '宕机' : '攻击')}
          className={btnClass(attackStance === '攻击', 'bg-red-100')}>
          <Swords className={`w-4 h-4 ${attackStance === '攻击' ? 'text-red-600' : 'text-slate-400'}`} />
          <span className={`text-[10px] font-bold ${attackStance === '攻击' ? 'text-red-700' : 'text-slate-500'}`}>{translations.attack_label}</span>
        </button>
      </div>
    </div>
  );
}