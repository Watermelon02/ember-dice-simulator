export const LOCATION_PART_IMAGES: Record<string, string> = {
  torso: `${import.meta.env.BASE_URL}part/torso.png`,
  chasis: `${import.meta.env.BASE_URL}part/chasis.png`,
  left: `${import.meta.env.BASE_URL}part/left.png`,
  right: `${import.meta.env.BASE_URL}part/right.png`,
  backpack: `${import.meta.env.BASE_URL}part/backpack.png`,
  any: `${import.meta.env.BASE_URL}part/any.png`
};

export const LOCATION_YELLOW_IMAGES: Record<string, string> = {
  eye: `${import.meta.env.BASE_URL}yellow/eye.png`,
  hollow_light: `${import.meta.env.BASE_URL}yellow/hollow-light.png`,
  double_light: `${import.meta.env.BASE_URL}yellow/double-light.png`,
  light: `${import.meta.env.BASE_URL}yellow/light.png`,
  lightning: `${import.meta.env.BASE_URL}yellow/lightning.png`,
  blank: `${import.meta.env.BASE_URL}yellow/blank.png`,
};

export const LOCATION_BLUE_IMAGES: Record<string, string> = {
  blank: `${import.meta.env.BASE_URL}blue/blank.png`,
  evade: `${import.meta.env.BASE_URL}blue/evade.png`,
  eye: `${import.meta.env.BASE_URL}blue/eye.png`,
  lightning: `${import.meta.env.BASE_URL}blue/lightning.png`,
};

export const LOCATION_RED_IMAGES: Record<string, string> = {   
    eye: `${import.meta.env.BASE_URL}red/eye.png`,
    heavy: `${import.meta.env.BASE_URL}red/heavy.png`,
    hollow_heavy: `${import.meta.env.BASE_URL}red/hollow-heavy.png`,
    hollow_light: `${import.meta.env.BASE_URL}red/hollow-light.png`,
    lightning: `${import.meta.env.BASE_URL}red/lightning.png`,
 }

 export const LOCATION_WHITE_IMAGES: Record<string, string> = { 
    blank: `${import.meta.env.BASE_URL}white/blank.png`,
    defense: `${import.meta.env.BASE_URL}white/defense.png`,
    evade: `${import.meta.env.BASE_URL}white/evade.png`,
    hollow_defense2: `${import.meta.env.BASE_URL}white/hollow-defense2.png`,
    eye: `${import.meta.env.BASE_URL}white/eye.png`,
    lightning: `${import.meta.env.BASE_URL}white/lightning.png`,
 };
export const getDiceImage = (
  color: 'yellow' | 'red' | 'white' | 'blue', 
  type: string, 
  value: number | string = 1 // 接收 value 参数
) => {
  const map: Record<string, string> = 
    color === 'yellow' ? LOCATION_YELLOW_IMAGES :
    color === 'red' ? LOCATION_RED_IMAGES :
    color === 'white' ? LOCATION_WHITE_IMAGES : LOCATION_BLUE_IMAGES;

  let key = type.replace(/-/g, '_');

  // 如果是 light 且 value 为 2，则强制修改 key 指向 double_light
  if (key === 'light' && value === 2) {
    key = 'double_light';
  }

  return map[key] || map['blank'] || '';
};