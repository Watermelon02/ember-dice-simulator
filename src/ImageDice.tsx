export const LOCATION_PART_IMAGES: Record<string, string> = {
  torso: '/part/torso.png',
  chasis: '/part/chasis.png',
  left: '/part/left.png',
  right: '/part/right.png',
  backpack: '/part/backpack.png',
  any: '/part/any.png'
};

export const LOCATION_YELLOW_IMAGES: Record<string, string> = {
  eye: '/yellow/eye.png',
  hollow_light: '/yellow/hollow-light.png',
  double_light: '/yellow/double-light.png',
  light: '/yellow/light.png',
  lightning: '/yellow/lightning.png',
  blank: '/yellow/blank.png',
};

export const LOCATION_BLUE_IMAGES: Record<string, string> = {
  blank: '/blue/blank.png',
  evade: '/blue/evade.png',
  eye: '/blue/eye.png',lightning: '/blue/lightning.png',
};

export const LOCATION_RED_IMAGES: Record<string, string> = {   
    eye: '/red/eye.png',
    heavy: '/red/heavy.png',
    hollow_heavy: '/red/hollow-heavy.png',
    hollow_light: '/red/hollow-light.png',
    lightning: '/red/lightning.png',
 }

 export const LOCATION_WHITE_IMAGES: Record<string, string> = { 
    blank: '/white/blank.png',
    defense: '/white/defense.png',
    evade: '/white/evade.png',
    hollow_defense2: '/white/hollow-defense2.png',
    eye: '/white/eye.png',
    lightning: '/white/lightning.png',
 };
export const getDiceImage = (color: 'yellow' | 'red' | 'white' | 'blue', type: string) => {
  console.log("color", color);
  // 1. 获取对应的图片对象
  const map: Record<string, string> = 
    color === 'yellow' ? LOCATION_YELLOW_IMAGES :
    color === 'red' ? LOCATION_RED_IMAGES :
    color === 'white' ? LOCATION_WHITE_IMAGES : LOCATION_BLUE_IMAGES;

  // 2. 将 type (如 hollow-light) 转换为匹配对象 key 的形式 (如 hollow_light)
  // 如果你的图片对象里本身就是下划线，这里需要转换
  const key = type.replace(/-/g, '_');
  console.log("key", key);
  console.log("map[key]", map[key]);  
  return map[key] || map['blank'] || '';
};