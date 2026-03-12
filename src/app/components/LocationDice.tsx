import { RefreshCw, Target } from "lucide-react";
import { useState } from "react";
import { LOCATION_PART_IMAGES } from "../../ImageDice.tsx";
const LOCATIONS = ["torso", "chasis", "left", "right", "backpack", "any"];

interface LocationProps {
  translations: any; // 语言包对象，包含翻译文本
}

export function LocationDice({ translations }: LocationProps) {
  const [location, setLocation] = useState<string | null>(null);
  const [isRolling, setIsRolling] = useState(false);

  const roll = () => {
    setIsRolling(true);
    setTimeout(() => {
      // 随机获取部位
      const randomLoc = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
      setLocation(randomLoc);
      setIsRolling(false);
    }, 400);
  };

  return (
    <button
      onClick={roll}
      className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-100 shadow-[6px_6px_12px_#bebebe,-6px_-6px_12px_#ffffff] transition-all group"
    >
      <div className="flex items-center gap-4">
        {/* 图片展示区 */}
        <div className="w-8 h-8  bg-slate-200 shadow-inner flex items-center justify-center overflow-hidden">
          {location ? (
            <img
              src={LOCATION_PART_IMAGES[location]}
              alt={location}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <Target className="w-8 h-8 text-slate-400" />
          )}
        </div>

        <div className="text-left">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            {translations.determine_target_part}
          </p>
          <p className="text-sm font-black text-slate-700">
            {location ? translations[location] : translations.waiting_to_roll}
          </p>
        </div>
      </div>
      <RefreshCw className={`w-4 h-4 text-slate-400 ${isRolling ? 'animate-spin' : ''}`} />
    </button>
  );
}
