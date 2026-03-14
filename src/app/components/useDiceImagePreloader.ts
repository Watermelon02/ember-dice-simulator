import { useEffect } from 'react';
import { getDiceImage } from '../../ImageDice';

// 预定义所有可能的骰子类型，根据你的业务需求修改
const DICE_TYPES = ['heavy', 'hollow-heavy', 'light', 'hollow-light', 'eye', 'lightning', 'blank', 'evade', 'defense', 'hollow-defense2'];
const COLORS = ['yellow', 'red', 'white', 'blue'];

export function useDiceImagePreloader() {
  useEffect(() => {
    // 只有在浏览器环境下才执行
    if (typeof window !== 'undefined') {
      const preload = () => {
        COLORS.forEach(color => {
          DICE_TYPES.forEach(type => {
            // 假设数值 1-6，预加载常用面值
            for (let value = 1; value <= 6; value++) {
              const src = getDiceImage(color, type, value);
              const img = new Image();
              img.src = src;
            }
          });
        });
      };
      
      // 延迟加载，不阻塞首屏交互
      const timer = setTimeout(preload, 1);
      return () => clearTimeout(timer);
    }
  }, []);
}