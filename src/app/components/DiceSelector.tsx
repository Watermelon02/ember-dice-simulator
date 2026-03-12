import { Minus, Plus } from 'lucide-react';

interface DiceSelectorProps {
  label: string;
  count: number;
  onCountChange: (count: number) => void;
  color: string;
  disabled?: boolean;
  traslations: any;
}

export function DiceSelector({ label, count, onCountChange, color, disabled = false, traslations }: DiceSelectorProps) {
  const adjust = (val: number) => {
    if (!disabled) {
      const next = count + val;
      if (next >= 0 && next <= 15) onCountChange(next);
    }
  };

  // 外层容器的点击处理：重置为0
  const handleContainerClick = () => {
    if (!disabled && count !== 0) {
      onCountChange(0);
    }
  };

  return (
    <div 
      onClick={handleContainerClick}
      className={`flex items-center justify-between gap-2 p-1.5 rounded-xl bg-slate-100 shadow-[4px_4px_8px_#bebebe,-4px_-4px_8px_#ffffff] cursor-pointer ${disabled ? 'opacity-30' : ''}`}
    >
      <div className="flex items-center gap-1.5 pl-1">
        <div className={`w-3.5 h-3.5 rounded-sm ${color} shadow-inner border border-black/5`} />
        <span className="text-[11px] font-bold text-slate-600 truncate">{label}</span>
      </div>

      {/* 使用 stopPropagation 阻止点击按钮组时触发外层点击事件 */}
      <div 
        onClick={(e) => e.stopPropagation()}
        className="flex items-center bg-slate-200/50 rounded-lg p-0.5 shadow-inner"
      >
        <button
          onClick={() => adjust(-1)}
          disabled={disabled || count === 0}
          className="w-6 h-6 flex items-center justify-center rounded-md active:shadow-inner text-slate-500 disabled:opacity-0"
        >
          <Minus className="w-3 h-3" />
        </button>
        
        <span className="min-w-[18px] text-center text-[12px] font-black text-slate-700">
          {count}
        </span>

        <button
          onClick={() => adjust(1)}
          disabled={disabled || count >= 15}
          className="w-6 h-6 flex items-center justify-center rounded-md active:shadow-inner text-slate-500 disabled:opacity-0"
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}