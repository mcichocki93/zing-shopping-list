// PixelIcon.tsx — gotowy komponent ikon pixel-art dla React Native.
// Wymaga: react-native-svg  (npx expo install react-native-svg)
//
// Użycie:
//   import { PixelIcon } from './PixelIcon';
//   <PixelIcon name="cart" size={20} color="#120E22" />
//
// Siatka 16×16. Każda ikona to lista prostokątów [x, y, w, h].
// Wartości przeniesione 1:1 z makiety (visual-reference.html → PxIcon).

import React from 'react';
import Svg, { Rect } from 'react-native-svg';

type Rectangle = [number, number, number, number];

const GLYPHS: Record<string, Rectangle[]> = {
  cart: [[2,4,2,2],[4,5,2,2],[6,5,8,2],[13,6,1,4],[5,10,8,2],[5,12,1,2],[11,12,1,2]],
  check: [[3,7,2,2],[5,9,2,2],[7,11,2,2],[9,9,2,2],[11,7,2,2],[13,5,2,2]],
  plus: [[7,3,2,10],[3,7,10,2]],
  apple: [[6,2,2,2],[4,5,8,2],[3,7,10,4],[4,11,8,2],[6,13,4,1]],
  milk: [[5,2,6,2],[5,4,1,2],[10,4,1,2],[4,6,8,8]],
  bread: [[3,5,10,2],[2,7,12,4],[3,11,10,2]],
  drink: [[5,2,6,1],[5,3,1,11],[10,3,1,11],[6,13,4,1]],
  logo: [[3,3,10,2],[3,5,2,2],[5,7,2,2],[7,9,2,2],[9,11,2,2],[3,13,10,2]],
  share: [[7,2,2,2],[6,4,4,2],[5,6,6,2],[7,8,2,3],[3,11,2,3],[11,11,2,3],[3,13,10,2]],
  gear: [[7,2,2,2],[7,12,2,2],[2,7,2,2],[12,7,2,2],[4,4,2,2],[10,4,2,2],[4,10,2,2],[10,10,2,2],[6,6,4,4]],
  edit: [[6,2,4,2],[6,4,4,8],[7,12,2,2],[8,14,1,1]],
  drag: [[4,4,2,2],[10,4,2,2],[4,8,2,2],[10,8,2,2],[4,12,2,2],[10,12,2,2]],
  mic: [[6,2,4,6],[3,9,10,1],[7,11,2,3]],
  sparkle: [[7,2,2,4],[7,10,2,4],[2,7,4,2],[10,7,4,2]],
  chevronL: [[10,4,2,2],[8,6,2,2],[6,8,2,2],[8,10,2,2],[10,12,2,2]],
  chevron: [[6,4,2,2],[8,6,2,2],[10,8,2,2],[8,10,2,2],[6,12,2,2]],
  menu: [[2,4,12,2],[2,8,12,2],[2,12,12,2]],
  user: [[6,2,4,4],[3,8,10,7]],
  template: [[3,2,10,12],[5,4,6,1],[5,6,6,1],[5,8,4,1]],
  heart: [[3,4,4,2],[9,4,4,2],[2,6,12,2],[3,8,10,2],[5,10,6,2],[6,12,4,1]],
  trash: [[3,3,10,1],[5,2,6,1],[4,5,8,10]],
  star: [[7,2,2,2],[5,4,6,2],[3,6,10,2],[5,8,2,2],[9,8,2,2]],
  search: [[3,3,6,2],[3,7,6,2],[3,5,2,2],[7,5,2,2],[9,9,2,2],[11,11,2,2]],
};

export type PixelIconName = keyof typeof GLYPHS;

interface PixelIconProps {
  name: PixelIconName | string;
  size?: number;
  color?: string;
}

export function PixelIcon({ name, size = 16, color = '#120E22' }: PixelIconProps) {
  const rects = GLYPHS[name] ?? [];
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16">
      {rects.map(([x, y, w, h], i) => (
        <Rect key={i} x={x} y={y} width={w} height={h} fill={color} />
      ))}
    </Svg>
  );
}

export default PixelIcon;
