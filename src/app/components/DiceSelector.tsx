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
 const adjust = (e: React.MouseEvent, val: number) => {
    e.stopPropagation(); // 【关键点】阻止冒泡，防止触发容器的重置
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
      className={`flex items-center justify-between gap-2 py-1.5 px-2 rounded-xl bg-slate-100 shadow-[4px_4px_8px_#bebebe,-4px_-4px_8px_#ffffff] cursor-pointer ${disabled ? 'opacity-30' : ''}`}
    >
      <div
        onClick={() => !disabled && onCountChange(0)}
        className="flex items-center gap-3 cursor-pointer select-none"
      >
        <div className="relative w-8 h-8 flex items-center justify-center">
          {/* 颜色背景块 */}
          <div className={`w-8 h-8 rounded-lg ${color} shadow-inner border border-black/10`} />
          {/* 覆盖在上面的数字 */}
          <span className={`absolute text-[13px] font-black ${color.includes('white') ? 'text-black' : 'text-white'} `}>
            {count}
          </span>
        </div>

      </div>

      {/* 使用 stopPropagation 阻止点击按钮组时触发外层点击事件 */}
      <div className="flex items-center bg-slate-200/50 rounded-lg p-0.5 shadow-inner ">
        <button
          onClick={(e) => adjust(e, -1)}
          disabled={disabled || count === 0}
          className="w-10 h-9 flex items-center justify-center rounded-md active:shadow-inner text-slate-500 disabled:opacity-0"
        >
          <Minus className="w-5 h-5" />
        </button>

        <button
          onClick={(e) => adjust(e, 1)}
          disabled={disabled || count >= 15}
          className="w-10 h-9 flex items-center justify-center rounded-md active:shadow-inner text-slate-500 disabled:opacity-0"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}